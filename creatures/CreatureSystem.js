/**
 * Creature Machines (M29). A creature is a body with parts clipped on — legs, spring legs, wings, a claw, body
 * segments, a motor and a battery — built with the normal parts tray and moved by the normal physics, in the same way
 * as the Space Centre's rovers. Truth (truth.creatures.v1):
 *  - legs hold the body up only as much weight as they can carry; too much and they fold;
 *  - legs push the body along only while they are on the ground, and only with power (a motor and a battery);
 *  - a creature needs legs at the front AND the back to walk;
 *  - spring legs store a wind-up and release it as hops;
 *  - flapping wings push on the air; wings on one side only tip the body over;
 *  - a claw can only grab what it can reach.
 * Simplified: legs, wings and segments are drawn swinging, not simulated joint by joint; a creature walks along the
 * floor; segments follow the head like a train.
 */
export const CREATURE_TRUTH_CONTRACT = Object.freeze({
    id: "truth.creatures.v1",
    domain: "Creature machines",
    preserve: ["legs can only carry so much weight", "legs push only while they touch the ground", "walking needs legs at the front and the back", "a creature needs power to move", "springs store energy and release it", "unbalanced wings tip the body"],
    simplify: ["legs, wings and body segments are drawn swinging rather than simulated joint by joint", "creatures walk along a flat floor", "segments follow the head like a train"],
    neverImply: ["real animals move exactly like these toys"]
});
export function creatureBehaviour(def) { const b = def === null || def === void 0 ? void 0 : def.behaviours.find(x => x.kind === "CREATURE"); return (b === null || b === void 0 ? void 0 : b.kind) === "CREATURE" ? b : undefined; }
const isBattery = (def) => Boolean((def === null || def === void 0 ? void 0 : def.behaviours.some(b => b.kind === "CIRCUIT" && b.role === "BATTERY")) && !(def === null || def === void 0 ? void 0 : def.behaviours.some(b => b.kind === "GENERATOR" || b.kind === "SOLAR_PANEL")));
const FLOOR = 8.4, G = 9.81, REACH = 1.4;
export const LEG_CAPACITY = { LEG: 1.2, BIG_LEG: 4, SPRING_LEG: 1 };
export const LEG_LENGTH = { LEG: 0.55, BIG_LEG: 0.9, SPRING_LEG: 0.45 };
/** Which creature body each clip-on part belongs to (nearest body in reach; segments may hang off other segments). Pure — used in BUILD mode too. */
export function creatureOwners(parts, definition) {
    var _a, _b;
    const bodies = parts.filter(p => { var _a; return ((_a = creatureBehaviour(definition(p.definitionId))) === null || _a === void 0 ? void 0 : _a.part) === "BODY"; });
    const owner = new Map();
    const clips = parts.filter(p => { const c = creatureBehaviour(definition(p.definitionId)); return (c && c.part !== "BODY") || isBattery(definition(p.definitionId)); });
    for (const q of clips) {
        if (((_a = creatureBehaviour(definition(q.definitionId))) === null || _a === void 0 ? void 0 : _a.part) === "SEGMENT")
            continue;
        let best;
        for (const b of bodies) {
            const d = Math.hypot(q.position.x - b.position.x, q.position.y - b.position.y);
            if (d <= REACH && (!best || d < best.d))
                best = { id: b.id, d };
        }
        if (best)
            owner.set(q.id, best.id);
    }
    // Segments chain on: each joins a body, or a segment that has already joined, within reach.
    let grew = true;
    const segs = clips.filter(q => { var _a; return ((_a = creatureBehaviour(definition(q.definitionId))) === null || _a === void 0 ? void 0 : _a.part) === "SEGMENT"; });
    while (grew) {
        grew = false;
        for (const s of segs) {
            if (owner.has(s.id))
                continue;
            for (const o of [...bodies, ...segs.filter(x => owner.has(x.id))]) {
                if (Math.hypot(s.position.x - o.position.x, s.position.y - o.position.y) <= 1.0) {
                    owner.set(s.id, (_b = owner.get(o.id)) !== null && _b !== void 0 ? _b : o.id);
                    grew = true;
                    break;
                }
            }
        }
    }
    return owner;
}
export class CreatureSystem {
    constructor(parts, definition) {
        var _a, _b;
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
        Object.defineProperty(this, "creatures", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "pending", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "once", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "owners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ticks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.owners = creatureOwners(parts, definition);
        for (const body of parts.filter(p => { var _a; return ((_a = creatureBehaviour(definition(p.definitionId))) === null || _a === void 0 ? void 0 : _a.part) === "BODY"; })) {
            const clips = parts.filter(q => this.owners.get(q.id) === body.id).map(q => { var _a; const c = creatureBehaviour(definition(q.definitionId)); return { part: q, kind: c ? c.part : "BATTERY", lx: q.position.x - body.position.x, ly: q.position.y - body.position.y, mass: (_a = c === null || c === void 0 ? void 0 : c.mass) !== null && _a !== void 0 ? _a : 0.25 }; });
            const own = creatureBehaviour(definition(body.definitionId));
            const springs = clips.filter(c => c.kind === "SPRING_LEG").length;
            this.creatures.push({ id: body.id, body, clips, mass: ((_a = own.mass) !== null && _a !== void 0 ? _a : 0.5) + clips.reduce((t, c) => t + c.mass, 0), dir: String((_b = body.parameters.facing) !== null && _b !== void 0 ? _b : "right") === "left" ? -1 : 1,
                phase: 0, tilt: 0, maxTilt: 0, tipped: false, flaps: 0, hopsLeft: 3 * Math.min(3, springs), restTicks: 0, airborne: false, grabLift: 0, riders: new Map(), path: CreatureSystem.startPath(body, clips), walking: false, startX: body.position.x, heavy: false });
        }
    }
    get active() { return this.creatures.length > 0; }
    /** The clip-on parts (they are drawn with their creature and have no physics body of their own). */
    isClip(partId) { return this.owners.has(partId); }
    ownerOf(partId) { return this.owners.get(partId); }
    /** Start of a TEST: each creature weighs its body plus everything clipped on. */
    start(physics) { for (const c of this.creatures) {
        try {
            physics.setMass(c.id, c.mass);
        }
        catch { /* no body */ }
    } }
    step(dt, physics) {
        var _a;
        this.ticks++;
        for (const c of this.creatures) {
            let st;
            try {
                st = physics.state(c.id);
            }
            catch {
                continue;
            }
            const half = this.halfHeight(c.body);
            const legs = c.clips.filter(k => k.kind === "LEG" || k.kind === "BIG_LEG" || k.kind === "SPRING_LEG");
            const reach = legs.length ? Math.max(...legs.map(k => { var _a; return (_a = LEG_LENGTH[k.kind]) !== null && _a !== void 0 ? _a : 0.5; })) : 0;
            const gap = FLOOR - (st.y + half);
            // What it carries: anything resting on its back.
            const halfW = this.halfWidth(c.body);
            const top = st.y - half;
            // A load that settles on its back is strapped on (simplified friction) and rides along with it.
            for (const p of this.parts) {
                if (p.id === c.id || this.owners.has(p.id) || c.riders.has(p.id) || p.id === c.grabbed || this.creatures.some(o => o.riders.has(p.id)))
                    continue;
                try {
                    if (!physics.isDynamic(p.id))
                        continue;
                    const r = physics.state(p.id);
                    const rh = this.halfHeight(p);
                    if (Math.abs(r.x - st.x) <= halfW && Math.abs((r.y + rh) - top) <= 0.12) {
                        c.riders.set(p.id, r.x - st.x);
                        this.pending.push({ kind: "CREATURE_CARRYING", sourceId: c.id, targetId: p.id });
                    }
                }
                catch { /* no body */ }
            }
            const riders = [...c.riders.keys()];
            const load = c.mass + riders.reduce((t, id) => { try {
                return t + physics.mass(id);
            }
            catch {
                return t;
            } }, 0);
            const capacity = legs.reduce((t, k) => { var _a; return t + ((_a = LEG_CAPACITY[k.kind]) !== null && _a !== void 0 ? _a : 1); }, 0);
            const onLegs = legs.length > 0 && gap <= reach + 0.06 && !c.airborne;
            // Legs hold the body up — but only as much weight as they can carry.
            if (onLegs && !c.tipped) {
                const heavy = load > capacity;
                c.heavy = heavy;
                if (heavy && !this.once.has(`heavy:${c.id}`)) {
                    this.once.add(`heavy:${c.id}`);
                    this.pending.push({ kind: "CREATURE_TOO_HEAVY", sourceId: c.id, data: { load: round(load), capacity: round(capacity) } });
                }
                // A damped spring: steady at full leg height. Strong legs can stop a fall; overloaded legs can only push with what they can carry, so they fold.
                const k = 60 * load, damp = 2 * Math.sqrt(k * load);
                const want = load * G + (reach - gap) * k + st.vy * damp;
                const cap = heavy ? capacity * G : load * G * 3;
                try {
                    physics.applyForce(c.id, { x: 0, y: -Math.max(0, Math.min(cap, want)) });
                }
                catch { /* static */ }
            }
            const powered = c.clips.some(k => k.kind === "MOTOR") && c.clips.some(k => k.kind === "BATTERY");
            const front = legs.some(k => k.lx > 0.1 && k.kind !== "SPRING_LEG"), back = legs.some(k => k.lx < -0.1 && k.kind !== "SPRING_LEG");
            const segments = c.clips.filter(k => k.kind === "SEGMENT").length;
            c.walking = false;
            if (powered && !c.tipped && !c.heavy) {
                const walkers = legs.filter(k => k.kind !== "SPRING_LEG");
                if (walkers.length && onLegs) {
                    if (front && back) {
                        const len = walkers.reduce((t, k) => { var _a; return t + ((_a = LEG_LENGTH[k.kind]) !== null && _a !== void 0 ? _a : 0.5); }, 0) / walkers.length;
                        const pairs = Math.floor(walkers.length / 2);
                        this.push(c, st.vx, 1.6 * len * (1 + 0.12 * Math.min(Math.max(0, pairs - 1), 3)), 0.8 * load * G, physics, "CREATURE_WALKING", { legs: walkers.length });
                    }
                    else if (!this.once.has(`wobbly:${c.id}`)) {
                        this.once.add(`wobbly:${c.id}`);
                        this.pending.push({ kind: "CREATURE_NO_BALANCE", sourceId: c.id, data: { front, back } });
                    }
                }
                else if (segments >= 3 && gap <= 0.08)
                    this.push(c, st.vx, Math.min(1, 0.25 * segments), 0.6 * load * G, physics, "CREATURE_CRAWLING", { segments });
            }
            if (c.walking)
                c.phase += dt * 6;
            // Spring legs: a wound-up hop each time it has settled on the ground.
            const springs = legs.filter(k => k.kind === "SPRING_LEG").length;
            if (springs && !c.tipped) {
                const grounded = gap <= reach + 0.08 && Math.abs(st.vy) < 0.3;
                if (c.airborne && grounded && this.ticks > 2)
                    c.airborne = false;
                c.restTicks = grounded ? c.restTicks + 1 : 0;
                if (grounded && c.restTicks >= 24 && c.hopsLeft > 0) {
                    const n = Math.min(3, springs);
                    c.hopsLeft--;
                    c.restTicks = 0;
                    c.airborne = true;
                    physics.setLinearVelocity(c.id, { x: c.dir * (1.6 + 0.8 * (n - 1)), y: -(3.2 + 0.5 * n) });
                    this.pending.push({ kind: "CREATURE_HOP", sourceId: c.id, data: { springs: n, left: c.hopsLeft } });
                }
            }
            // Wings: flapping pushes on the air. Wings on one side only make a turning push that tips the body.
            const wings = c.clips.filter(k => k.kind === "WING");
            if (wings.length && powered && !c.tipped) {
                const before = Math.sin(c.phase);
                c.phase += dt * Math.PI * 4;
                const now = Math.sin(c.phase);
                if (before < 0 && now >= 0) {
                    c.flaps++;
                    this.pending.push({ kind: "CREATURE_FLAP", sourceId: c.id, data: { wings: wings.length } });
                }
                const lift = Math.max(0, now) * 0.5 * c.mass * G;
                try {
                    physics.applyForce(c.id, { x: 0, y: -lift * wings.length * 0.5 });
                }
                catch { /* static */ }
                // How hard the wings try to lean it over, against how wide it stands. Past 0.5 its base lifts and it tips over.
                const torque = wings.reduce((t, k) => t + k.lx, 0) * lift;
                const stance = Math.max(0.3, ...legs.map(k => Math.abs(k.lx)));
                const target = torque / (c.mass * G * stance);
                c.tilt += (target - c.tilt) * Math.min(1, dt * 6);
                if (this.ticks > 30)
                    c.maxTilt = Math.max(c.maxTilt, Math.abs(target));
                if (!c.tipped && Math.abs(target) > 0.5) {
                    c.tipped = true;
                    c.tilt = Math.sign(target) * 1.4;
                    this.pending.push({ kind: "CREATURE_TIPPED", sourceId: c.id, data: { lean: round(target) } });
                }
            }
            else
                c.tilt *= 0.9;
            // Loads on its back ride along with it — unless it tipped over.
            for (const [id, ox] of c.riders) {
                if (c.tipped) {
                    c.riders.delete(id);
                    continue;
                }
                try {
                    const rh = this.halfHeight(this.parts.find(q => q.id === id));
                    physics.setPose(id, st.x + ox, st.y - half - rh - 0.005, 0);
                    physics.setLinearVelocity(id, { x: st.vx, y: st.vy });
                }
                catch {
                    c.riders.delete(id);
                }
            }
            // A claw grabs the first loose thing it can reach, and lifts it.
            const claw = c.clips.find(k => k.kind === "CLAW");
            if (claw && powered) {
                const cx = st.x + claw.lx, cy = st.y + claw.ly;
                if (!c.grabbed) {
                    for (const p of this.parts) {
                        if (p.id === c.id || this.owners.has(p.id) || (p.parameters.locked === true && !((_a = p.tags) === null || _a === void 0 ? void 0 : _a.includes("target"))))
                            continue;
                        let ps;
                        try {
                            ps = physics.state(p.id);
                        }
                        catch {
                            continue;
                        }
                        if (!physics.isDynamic(p.id))
                            continue;
                        if (Math.hypot(ps.x - (cx + c.dir * 0.3), ps.y - cy) <= 0.6) {
                            c.grabbed = p.id;
                            this.pending.push({ kind: "CREATURE_GRABBED", sourceId: c.id, targetId: p.id });
                            break;
                        }
                    }
                }
                else {
                    c.grabLift = Math.min(0.6, c.grabLift + dt * 0.6);
                    try {
                        physics.setPose(c.grabbed, cx + c.dir * 0.3, cy - c.grabLift, 0);
                        physics.setLinearVelocity(c.grabbed, { x: st.vx, y: 0 });
                    }
                    catch { /* gone */ }
                }
            }
            // The path the body segments follow: a new point each time the head has moved 5 cm.
            const head = c.path[0];
            if (Math.hypot(st.x - head.x, st.y - head.y) >= 0.05) {
                c.path.unshift({ x: st.x, y: st.y });
                if (c.path.length > 400)
                    c.path.length = 400;
            }
        }
    }
    /** The path starts as the line from the head back through its segments, as they were placed. */
    static startPath(body, clips) { return [{ x: body.position.x, y: body.position.y }, ...clips.filter(k => k.kind === "SEGMENT").sort((a, b) => Math.hypot(a.lx, a.ly) - Math.hypot(b.lx, b.ly)).map(k => ({ x: k.part.position.x, y: k.part.position.y }))]; }
    push(c, vx, target, traction, physics, kind, data) {
        const want = c.mass * (c.dir * target - vx) * 6;
        const f = Math.max(-traction, Math.min(traction, want));
        try {
            physics.applyForce(c.id, { x: f, y: 0 });
        }
        catch {
            return;
        }
        c.walking = true;
        if (!this.once.has(`${kind}:${c.id}`)) {
            this.once.add(`${kind}:${c.id}`);
            this.pending.push({ kind, sourceId: c.id, data });
        }
    }
    halfWidth(p) { var _a; const r = (_a = this.definition(p.definitionId)) === null || _a === void 0 ? void 0 : _a.behaviours.find(b => b.kind === "RIGID_BODY"); return (r === null || r === void 0 ? void 0 : r.kind) === "RIGID_BODY" ? r.width / 2 : 0.3; }
    halfHeight(p) { var _a; const r = (_a = this.definition(p.definitionId)) === null || _a === void 0 ? void 0 : _a.behaviours.find(b => b.kind === "RIGID_BODY"); return (r === null || r === void 0 ? void 0 : r.kind) === "RIGID_BODY" ? r.height / 2 : 0.25; }
    view(id, physics) {
        var _a, _b;
        const c = this.creatures.find(x => x.id === id);
        if (!c)
            return undefined;
        let st;
        try {
            st = physics === null || physics === void 0 ? void 0 : physics.state(id);
        }
        catch {
            st = undefined;
        }
        return { id, x: (_a = st === null || st === void 0 ? void 0 : st.x) !== null && _a !== void 0 ? _a : c.body.position.x, y: (_b = st === null || st === void 0 ? void 0 : st.y) !== null && _b !== void 0 ? _b : c.body.position.y, tilt: c.tilt, phase: c.phase, walking: c.walking, tipped: c.tipped, flaps: c.flaps, legs: c.clips.filter(k => k.kind === "LEG" || k.kind === "BIG_LEG").length, segments: c.clips.filter(k => k.kind === "SEGMENT").length, ...(c.grabbed ? { grabbed: c.grabbed } : {}), heavy: c.heavy };
    }
    /** Where a clip-on part is right now (it rides on its creature). Segments follow the creature's trail. */
    clipPose(partId, physics) {
        const owner = this.owners.get(partId);
        const c = this.creatures.find(x => x.id === owner);
        if (!c)
            return undefined;
        const k = c.clips.find(q => q.part.id === partId);
        if (!k)
            return undefined;
        let st;
        try {
            st = physics === null || physics === void 0 ? void 0 : physics.state(c.id);
        }
        catch {
            st = undefined;
        }
        if (!st)
            return undefined;
        if (k.kind === "SEGMENT")
            return { ...alongPath([{ x: st.x, y: st.y }, ...c.path], Math.hypot(k.lx, k.ly)), angle: 0 };
        const cs = Math.cos(c.tilt), sn = Math.sin(c.tilt);
        return { x: st.x + k.lx * cs - k.ly * sn, y: st.y + k.lx * sn + k.ly * cs, angle: c.tilt };
    }
    grabbed(targetId) { return this.creatures.some(c => c.grabbed === targetId && c.grabLift >= 0.3); }
    drainEvents() { return this.pending.splice(0); }
}
const round = (v) => Math.round(v * 100) / 100;
/** The point a given distance back along a path (or its last point). */
function alongPath(path, dist) {
    let left = dist;
    for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d >= left && d > 0) {
            const t = left / d;
            return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        left -= d;
    }
    return path[path.length - 1];
}
