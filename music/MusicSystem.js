/**
 * Music Machines (M29): instruments are ordinary parts played by ordinary systems — nothing here makes a sound on its
 * own. Truth (truth.music.v1):
 *  - an instrument sounds when something hits it (a ball, a domino, a hammer), when a water jet strikes a chime, or
 *    while an electric horn is powered;
 *  - a hammer on a turning shaft (a beater) strikes once every turn, so a steady motor makes a steady beat;
 *  - a timer switch closes for a moment at a steady rate, so a horn wired through it beeps in time;
 *  - each instrument has its own note (tap it to change the note).
 * Simplified: notes are a simple synthesised sound; there is no acoustics model (no echo, loudness or resonance).
 * Every note is recorded with what caused it — something hitting it, a beater, water, electricity, or a robot.
 */
export const MUSIC_TRUTH_CONTRACT = Object.freeze({
    id: "truth.music.v1",
    domain: "Music machines",
    preserve: ["an instrument sounds when something strikes it", "a beater on a turning shaft strikes once per turn", "a steady timer makes a steady beat", "an electric horn sounds while it has power"],
    simplify: ["notes are simple synthesised tones", "no acoustics model: no echo, loudness or resonance"],
    neverImply: ["a machine can make a sound without anything making it happen"]
});
export function musicBehaviour(def) { const b = def === null || def === void 0 ? void 0 : def.behaviours.find(x => x.kind === "MUSIC"); return (b === null || b === void 0 ? void 0 : b.kind) === "MUSIC" ? b : undefined; }
/** Which instrument family a part plays (the chain bell and the circuit buzzer count too). */
export function familyOf(def) {
    const m = musicBehaviour(def);
    if (m && m.family !== "BEATER" && m.family !== "TIMER")
        return m.family;
    if (def === null || def === void 0 ? void 0 : def.behaviours.some(b => b.kind === "CHAIN" && b.thing === "BELL"))
        return "BELL";
    if (def === null || def === void 0 ? void 0 : def.behaviours.some(b => b.kind === "CIRCUIT" && b.role === "LOAD" && b.load === "BUZZER"))
        return "BUZZER";
    return undefined;
}
/** A note's pitch from the part's setting (1–8, a C major scale), as a frequency for the sound. */
export const SCALE_HZ = [262, 294, 330, 349, 392, 440, 494, 523];
export function pitchOf(p) { var _a; const n = Math.round(Number((_a = p.parameters.note) !== null && _a !== void 0 ? _a : 1)); return Math.max(1, Math.min(8, Number.isFinite(n) ? n : 1)); }
const STRIKE_REACH = 0.45, COOLDOWN = 12;
export class MusicSystem {
    constructor(parts, definition) {
        var _a;
        Object.defineProperty(this, "parts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parts
        });
        Object.defineProperty(this, "definition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: definition
        });
        Object.defineProperty(this, "notes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "instruments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "beaters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "last", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "hornOn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "water", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        /** Which moving things are inside each instrument's reach (a note sounds when something arrives, not while it stays). */
        Object.defineProperty(this, "inside", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "pending", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        for (const p of parts) {
            const def = definition(p.definitionId);
            const f = familyOf(def);
            if (f)
                this.instruments.push({ part: p, family: f });
            if (((_a = musicBehaviour(def)) === null || _a === void 0 ? void 0 : _a.family) === "BEATER")
                this.beaters.push({ part: p, turns: 0 });
        }
    }
    get active() { return this.instruments.length > 0; }
    play(inst, tick, cause, by) {
        const before = this.last.get(inst.part.id);
        if (before !== undefined && tick - before < COOLDOWN)
            return;
        this.last.set(inst.part.id, tick);
        const note = { tick, instrumentId: inst.part.id, family: inst.family, pitch: pitchOf(inst.part), cause, ...(by ? { by } : {}) };
        this.notes.push(note);
        this.pending.push({ kind: "NOTE_PLAYED", sourceId: by !== null && by !== void 0 ? by : inst.part.id, targetId: inst.part.id, data: { family: inst.family, pitch: note.pitch, cause } });
    }
    /**
     * After the physics step and the other systems: strikes by moving things, beaters on turning shafts, water jets on
     * chimes, horns and buzzers switching on (and whether a robot's button press switched them), and bells the chain rang.
     */
    observe(tick, physics, shaftAngle, loadOn, robotPressing, events, skip, waterReceived = () => 0) {
        var _a, _b;
        for (const inst of this.instruments) {
            // A chime under a steady water jet keeps ringing — every half second while water keeps arriving.
            if (inst.family === "CHIME") {
                const w = waterReceived(inst.part.id), was = (_a = this.water.get(inst.part.id)) !== null && _a !== void 0 ? _a : 0;
                this.water.set(inst.part.id, w);
                const lastAt = this.last.get(inst.part.id);
                if (w > was && (lastAt === undefined || tick - lastAt >= 30))
                    this.play(inst, tick, "WATER", "water");
            }
            if (inst.family === "HORN" || inst.family === "BUZZER") {
                const on = loadOn(inst.part.id);
                if (on && !this.hornOn.get(inst.part.id))
                    this.play(inst, tick, robotPressing() ? "ROBOT" : "ELECTRIC");
                this.hornOn.set(inst.part.id, on);
                continue;
            }
            if (inst.family === "BELL")
                continue; // the chain system rings bells (below)
            const was = (_b = this.inside.get(inst.part.id)) !== null && _b !== void 0 ? _b : new Set();
            const now = new Set();
            for (const s of physics.states()) {
                if (!physics.isDynamic(s.id) || skip(s.id))
                    continue;
                if (Math.abs(s.x - inst.part.position.x) > STRIKE_REACH + 0.2 || Math.abs(s.y - inst.part.position.y) > STRIKE_REACH + 0.25)
                    continue;
                now.add(s.id);
                if (!was.has(s.id) && Math.hypot(s.vx, s.vy) >= 0.5)
                    this.play(inst, tick, "HIT", s.id);
            }
            this.inside.set(inst.part.id, now);
        }
        // A beater strikes the nearest instrument once each time its shaft comes round.
        for (const b of this.beaters) {
            const a = shaftAngle(b.part.id);
            if (a === undefined)
                continue;
            const turns = Math.floor(Math.abs(a) / (Math.PI * 2));
            if (turns > b.turns) {
                b.turns = turns;
                const near = this.instruments.filter(i => i.family !== "HORN" && i.family !== "BUZZER").map(i => ({ i, d: Math.hypot(i.part.position.x - b.part.position.x, i.part.position.y - b.part.position.y) })).filter(x => x.d <= 1.3).sort((x, y) => x.d - y.d)[0];
                if (near)
                    this.play(near.i, tick, "BEATER", b.part.id);
            }
        }
        for (const e of events) {
            const inst = this.instruments.find(i => i.part.id === e.targetId);
            if (!inst)
                continue;
            if (e.kind === "BELL_RING")
                this.play(inst, tick, "HIT", e.sourceId);
            if ((e.kind === "WATER_RECEIVED" || e.kind === "NOZZLE_HIT") && inst.family === "CHIME")
                this.play(inst, tick, "WATER", e.sourceId);
        }
    }
    drainEvents() { return this.pending.splice(0); }
}
// ------------------------------------------------------------------ what the music challenges check (pure, from the notes)
/** Instruments tagged in order were each first played in that order. */
export function playedInOrder(notes, order) {
    const first = order.map(id => { var _a; return (_a = notes.find(n => n.instrumentId === id)) === null || _a === void 0 ? void 0 : _a.tick; });
    return first.every(t => t !== undefined) && first.every((t, i) => i === 0 || t > first[i - 1]);
}
/** A steady beat: at least `min` notes whose gaps all stay within `tolerance` of the middle gap. */
export function steadyBeat(notes, min, tolerance = 0.2) {
    if (notes.length < min)
        return false;
    const tail = notes.slice(-min);
    const gaps = tail.slice(1).map((n, i) => n.tick - tail[i].tick);
    const mid = [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
    return mid >= 6 && gaps.every(g => Math.abs(g - mid) <= mid * tolerance);
}
export function familiesPlayed(notes) { return [...new Set(notes.map(n => n.family))]; }
export function causesPlayed(notes) { return [...new Set(notes.map(n => n.cause))]; }
export function playingSeconds(notes) { return notes.length < 2 ? 0 : (notes[notes.length - 1].tick - notes[0].tick) / 60; }
