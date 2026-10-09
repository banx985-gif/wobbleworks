import { RuntimeWorld } from "../physics/RuntimeWorld.js";
/**
 * Test replay (M25).
 *
 * The simulation is deterministic: the same build and the same taps always give the same run. So a recording keeps
 * only the build, every tap made during the TEST (buttons, switches, valves) with the tick it happened on, and a small
 * per-tick fingerprint of what happened (every body's position and every recorded event, from every system).
 * Playback runs the build again from the start, repeating the taps on the same ticks, and checks each tick against the
 * fingerprint — so a replay can never quietly show something different from what really happened.
 *
 * Playback is forward only: restart, pause, slow motion (a slower clock, never a bigger or smaller physics step) and
 * "jump to the problem" (fast-forward from the start). Replays are watch-only: they never complete missions,
 * earn discoveries or change records.
 *
 * Arbitrary backwards scrubbing is NOT enabled in 1.0 (see REVERSE_SCRUB): the systems don't yet save and restore
 * their full state, and going back by re-running from the start costs far more than one frame at the part cap.
 */
export const REPLAY_HZ = 60;
/** Bounded window: the first 60 seconds of a TEST are kept. */
export const REPLAY_MAX_TICKS = 60 * REPLAY_HZ;
/** Memory a recording may use (fingerprints + taps), checked at the Everything Lab cap in tests. */
export const REPLAY_MEMORY_BUDGET_BYTES = 256 * 1024;
/** "Jump to the problem" fast-forwards at most this many ticks, and at most this many milliseconds, per frame (keeps the screen responsive, even at the part cap where one tick can take several ms). */
export const FAST_FORWARD_TICKS_PER_FRAME = 240;
export const FAST_FORWARD_BUDGET_MS = 10;
/** The performance gate for reverse scrubbing, decided by measurement (docs/status/M25_STATUS.md). */
export const REVERSE_SCRUB = Object.freeze({ enabled: false, reason: "Systems can't save and restore their whole state yet, and re-running a full-size build from the start to go back takes far longer than one frame on the baseline tablet." });
/** Plain-words failure points, taken from the events the systems really record. */
export const FAILURE_EVENTS = {
    STRUCTURE_BROKE: "A beam broke here", STRUCT_BREAK: "A beam broke here", STRUCT_COLLAPSE: "It started to fall down here", STRUCT_UNSUPPORTED: "Nothing was holding this up",
    WINCH_UNSUPPORTED: "Nothing was holding this up", OBJECT_BROKE: "Something broke here", SHORT_CIRCUIT: "A short circuit happened here", BREAKER_TRIPPED: "The safety breaker switched off",
    BATTERY_EMPTY: "The battery ran out here", GEAR_JAMMED: "The gears jammed here", GEAR_STALLED: "The gears got stuck here", ROBOT_CRASH: "The robot crashed here", ROBOT_BUMP: "The robot bumped into something",
    TRAVELLER_FELL: "Bolt fell here", TRAVELLER_BLOCKED: "Bolt got stuck here", WATER_SPILL: "Water spilled here", WATER_AIRLOCK: "Air blocked the pipe here",
    CRAFT_TUMBLE: "It started to tumble here", ROCKET_TUMBLE: "The rocket started to tumble", WING_STALL: "The wing stalled here", ROVER_SLIP: "The wheels slipped here",
    ROVER_NO_POWER: "The rover had no power", ROVER_NO_WHEELS: "The rover had no wheels", PARACHUTE_NO_AIR: "No air here for the parachute", NO_AIR_TO_FLOAT: "No air here to float in", PRESS_MISSED: "The press missed"
};
export const MAX_MARKERS = 6;
/** One number per tick that changes if any body moves differently. */
export function bodyFingerprint(runtime) {
    let h = 0;
    let k = 1;
    for (const s of runtime.physics.states()) {
        h += k * (s.x * 1.000003 + s.y * 2.000007 + s.angle * 3.000011);
        k = (k * 1.618034) % 7.1 + 0.5;
    }
    return h;
}
export class ReplayRecorder {
    constructor(snapshot, buildChecksum = "") {
        Object.defineProperty(this, "snapshot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: snapshot
        });
        Object.defineProperty(this, "buildChecksum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: buildChecksum
        });
        Object.defineProperty(this, "bodies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Float64Array(REPLAY_MAX_TICKS)
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Uint32Array(REPLAY_MAX_TICKS)
        });
        Object.defineProperty(this, "inputList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "markerList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "ticks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "seenEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "truncatedFlag", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    get length() { return this.ticks; }
    get truncated() { return this.truncatedFlag; }
    get inputs() { return this.inputList; }
    get markers() { return this.markerList; }
    /** A tap during the TEST, on the tick the next step will compute. */
    noteInput(tick, kind, partId) { if (tick < REPLAY_MAX_TICKS && this.inputList.length < 2000)
        this.inputList.push({ tick, kind, partId }); }
    /** Call once after every simulation step. */
    record(runtime) {
        const t = runtime.tick - 1;
        if (t !== this.ticks)
            return; // only real, consecutive steps (never twice, never while paused)
        if (t >= REPLAY_MAX_TICKS) {
            this.truncatedFlag = true;
            return;
        }
        this.bodies[t] = bodyFingerprint(runtime);
        this.events[t] = runtime.causalEvents.length;
        this.ticks = t + 1;
        collectMarkers(runtime.causalEvents, this.seenEvents, this.markerList);
        this.seenEvents = runtime.causalEvents.length;
    }
    fingerprintAt(tick) { return tick < this.ticks ? { bodies: this.bodies[tick], events: this.events[tick] } : undefined; }
    /** Bytes this recording holds (fingerprints for the ticks used, taps and markers). */
    bytes() { return this.ticks * 12 + this.inputList.length * 48 + this.markerList.length * 96; }
}
function collectMarkers(events, from, out) {
    for (let i = from; i < events.length && out.length < MAX_MARKERS; i++) {
        const e = events[i];
        const label = FAILURE_EVENTS[e.kind];
        if (!label)
            continue;
        if (out.some(m => m.kind === e.kind && m.partId === e.sourceId))
            continue;
        out.push({ tick: e.tick, kind: e.kind, partId: e.sourceId, label });
    }
}
/** Plays a recording back by running the same build with the same taps, checking every tick. */
export class ReplayPlayer {
    constructor(registry, recording) {
        Object.defineProperty(this, "registry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: registry
        });
        Object.defineProperty(this, "recording", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: recording
        });
        Object.defineProperty(this, "runtime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "paused", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /** Ticks where playback didn't match the recording (should always stay 0). */
        Object.defineProperty(this, "mismatches", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "inputIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "fastTarget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "playAfterJump", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.runtime = new RuntimeWorld(recording.snapshot, registry);
    }
    get tick() { return this.runtime.tick; }
    get done() { return this.runtime.tick >= this.recording.length; }
    get fastForwarding() { return this.fastTarget !== undefined; }
    restart() { this.runtime.destroy(); this.runtime = new RuntimeWorld(this.recording.snapshot, this.registry); this.inputIndex = 0; this.fastTarget = undefined; }
    /** One recorded tick forward (taps applied first, exactly as they were). */
    stepOnce() {
        if (this.done)
            return false;
        const t = this.runtime.tick;
        const inputs = this.recording.inputs;
        while (this.inputIndex < inputs.length && inputs[this.inputIndex].tick <= t) {
            const i = inputs[this.inputIndex++];
            if (i.tick < t)
                continue;
            if (i.kind === "FLIP")
                this.runtime.flipSwitch(i.partId);
            else
                this.runtime.pressButton(i.partId, i.kind === "PRESS");
        }
        this.runtime.step(1 / REPLAY_HZ);
        const want = this.recording.fingerprintAt(t);
        if (want && (want.bodies !== bodyFingerprint(this.runtime) || want.events !== this.runtime.causalEvents.length))
            this.mismatches++;
        return true;
    }
    /** Called once per fixed clock tick by the game loop. */
    step() { if (this.fastTarget !== undefined)
        return; if (!this.paused)
        this.stepOnce(); }
    /** Runs (a chunk per frame) up to `tick` — from the start if that is behind us — then plays on (or pauses there). */
    jumpTo(tick, thenPlay = true) { const target = Math.max(0, Math.min(tick, this.recording.length)); if (target < this.runtime.tick)
        this.restart(); this.fastTarget = target; this.playAfterJump = thenPlay; }
    /** Called once per frame: does a bounded chunk of a fast-forward. Returns true while still going. */
    frame(maxTicks = FAST_FORWARD_TICKS_PER_FRAME, budgetMs = FAST_FORWARD_BUDGET_MS) {
        if (this.fastTarget === undefined)
            return false;
        const start = performance.now();
        for (let k = 0; k < maxTicks && this.runtime.tick < this.fastTarget; k++) {
            this.stepOnce();
            if (performance.now() - start >= budgetMs)
                break;
        }
        if (this.runtime.tick >= this.fastTarget) {
            this.fastTarget = undefined;
            this.paused = !this.playAfterJump;
            return false;
        }
        return true;
    }
    destroy() { this.runtime.destroy(); }
}
const VEHICLE = /cart|car|rover|rocket|plane|glider|craft|boat|vehicle|lander|train/;
export function followKind(definitionId) {
    const id = definitionId.toLowerCase();
    if (/ball|marble/.test(id))
        return "BALL";
    if (/bolt|traveller/.test(id))
        return "BOLT";
    if (id.startsWith("robot."))
        return "ROBOT";
    if (VEHICLE.test(id))
        return "VEHICLE";
    return "PART";
}
/** Things worth following in this run, best first: balls, Bolt, robots, vehicles, then other moving parts. */
export function followTargets(runtime, parts, limit = 8) {
    const moving = new Set(runtime.physics.states().map(s => s.id).filter(id => runtime.physics.isDynamic(id)));
    const order = ["BALL", "BOLT", "ROBOT", "VEHICLE", "PART"];
    return parts.filter(p => p.parameters.locked !== true && (moving.has(p.id) || runtime.robots.robot(p.id)))
        .map(p => ({ partId: p.id, kind: followKind(p.definitionId), dyn: moving.has(p.id) && !runtime.robots.robot(p.id) }))
        .filter(t => t.kind !== "PART" || t.dyn)
        .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)).slice(0, limit).map(({ partId, kind }) => ({ partId, kind }));
}
/** Where a followed thing is right now (metres), or undefined when it has gone. */
export function followPoint(runtime, partId) {
    const r = runtime.robots.robot(partId);
    if (r)
        return { x: r.x, y: r.y };
    const s = runtime.physics.states().find(b => b.id === partId);
    return s ? { x: s.x, y: s.y } : undefined;
}
