/**
 * Space Centre (M19): gravity zones, rockets, rovers, toy planets and launchers.
 *
 * Truth (truth.space.v1): weaker gravity changes WEIGHT and trajectories, never MASS. The physics world keeps Earth
 * gravity; inside a zone each body gets an upward force of m × (9.81 − g), so its weight there is exactly m × g while its
 * mass (and so how hard it is to push) is unchanged. Air only exists where a zone says so: parachutes, fins and drag do
 * nothing in a vacuum. Rockets push along their own axis while a booster burns; fins keep them pointing into the airflow.
 * Rover wheels can only push as hard as their grip allows (grip × weight), so low gravity means less grip as well as less
 * weight. A planet's pull is a simple toy: towards its centre, weaker further away — not a full orbital simulation.
 */
export const SPACE_TRUTH_CONTRACT = Object.freeze({
    id: "truth.space.v1",
    domain: "Low Gravity / Space",
    preserve: ["lower gravitational acceleration changes weight and trajectories", "mass stays the same in any gravity", "parachutes and fins need air", "rockets push along their axis while fuel lasts", "wheel grip depends on weight"],
    simplify: ["2D environment zones with fixed gravity", "toy planet pull and orbit-style paths", "boosters burn at a fixed thrust for a fixed time"],
    neverImply: ["objects lose mass because gravity is weaker"]
});
export const EARTH_G = 9.81;
export const MOON_G = 1.62;
const RHO = 1.2;
const FLOOR = 8.4;
export function spaceBehaviour(def) { const b = def?.behaviours.find(x => x.kind === "SPACE"); return b?.kind === "SPACE" ? b : undefined; }
export function vesselBehaviour(def) { const b = def?.behaviours.find(x => x.kind === "VESSEL"); return b?.kind === "VESSEL" ? b : undefined; }
/** Can this part clip onto a rocket or rover? Space parts, plus a Power Lab battery, a solar panel and a Flight Hangar parachute. */
export function attachKind(def) {
    const s = spaceBehaviour(def);
    if (s)
        return s.part;
    if (def?.behaviours.some(b => b.kind === "CIRCUIT" && b.role === "BATTERY"))
        return "BATTERY";
    if (def?.behaviours.some(b => b.kind === "AERO" && b.part === "PARACHUTE"))
        return "CHUTE";
    return undefined;
}
/** Where each kind of part clips on, relative to the vessel's centre (rocket: upright; rover: nose to the right). */
export const ROCKET_SLOTS = {
    BOOSTER: [{ x: 0, y: 0.95 }, { x: -0.36, y: 0.45 }, { x: 0.36, y: 0.45 }], FINS: [{ x: 0, y: 0.6 }], NOSE: [{ x: 0, y: -0.95 }], CAPSULE: [{ x: 0, y: -0.95 }],
    LEGS: [{ x: 0, y: 0.78 }], CHUTE: [{ x: 0, y: -1.3 }], CARGO: [{ x: 0, y: -0.2 }]
};
export const ROVER_SLOTS = {
    WHEEL: [{ x: 0.5, y: 0.12 }, { x: -0.5, y: 0.12 }], DRIVE: [{ x: 0, y: -0.02 }], BATTERY: [{ x: -0.3, y: -0.38 }], SOLAR: [{ x: 0.15, y: -0.45 }], CARGO: [{ x: 0.35, y: -0.42 }]
};
const ATTACH_REACH = 1.1;
/** Placement help: the nearest free-looking slot for this kind of part on this vessel (or nothing if too far). */
export function spaceSnap(x, y, kind, vessel) {
    const slots = (vessel.type === "ROCKET" ? ROCKET_SLOTS : ROVER_SLOTS)[kind];
    if (!slots)
        return undefined;
    const c = Math.cos(vessel.angle), s = Math.sin(vessel.angle);
    let best;
    for (const sl of slots) {
        const wx = vessel.x + sl.x * c - sl.y * s, wy = vessel.y + sl.x * s + sl.y * c;
        const d = Math.hypot(wx - x, wy - y);
        if (d <= ATTACH_REACH && (!best || d < best.d))
            best = { x: Math.round(wx * 1e6) / 1e6, y: Math.round(wy * 1e6) / 1e6, d };
    }
    return best ? { x: best.x, y: best.y } : undefined;
}
/** A launch pad's tilt (radians; set by tapping the pad: 0°, 15°, 30°, 45°). */
export function padTilt(pad) { return Number(pad.parameters.tilt ?? 0) * Math.PI / 180; }
/** Which part owns each clip-on part (the nearest rocket or rover in reach). Pure — used in BUILD mode too. */
export function attachmentOwners(parts, definition) {
    const vesselParts = parts.filter(p => vesselBehaviour(definition(p.definitionId)));
    const owner = new Map();
    for (const q of parts) {
        const k = attachKind(definition(q.definitionId));
        if (!k)
            continue;
        let best;
        for (const v of vesselParts) {
            const d = Math.hypot(q.position.x - v.position.x, q.position.y - v.position.y);
            if (d <= ATTACH_REACH + (k === "CHUTE" ? 0.4 : 0) && (!best || d < best.d))
                best = { id: v.id, d };
        }
        if (best)
            owner.set(q.id, best.id);
    }
    return owner;
}
/** Rockets standing on a tilted pad lean over with all their parts, turning about the bottom of the rocket. Pure. */
export function tiltedPoses(parts, definition) {
    const out = new Map();
    const owners = attachmentOwners(parts, definition);
    for (const v of parts) {
        if (vesselBehaviour(definition(v.definitionId))?.vessel !== "ROCKET")
            continue;
        const r = definition(v.definitionId)?.behaviours.find(b => b.kind === "RIGID_BODY");
        const half = r?.kind === "RIGID_BODY" ? r.height / 2 : 0.5;
        const pad = parts.find(p => p.definitionId === "space.launch-pad" && Math.abs(p.position.x - v.position.x) < 0.8 && p.position.y > v.position.y && p.position.y - v.position.y < half + 0.5);
        const tilt = pad ? padTilt(pad) : 0;
        if (!tilt)
            continue;
        const px = v.position.x, py = v.position.y + half;
        const c = Math.cos(tilt), s = Math.sin(tilt);
        const turn = (p) => { const dx = p.position.x - px, dy = p.position.y - py; out.set(p.id, { x: px + dx * c - dy * s, y: py + dx * s + dy * c, angle: p.rotation + tilt }); };
        turn(v);
        for (const q of parts)
            if (owners.get(q.id) === v.id)
                turn(q);
    }
    return out;
}
export class SpaceSystem {
    parts;
    definition;
    zones = [];
    vessels = [];
    planets = [];
    launchers = [];
    suns = [];
    bodies = [];
    heldParts = new Map();
    falls = new Map();
    thrustNow = new Map();
    driving = new Set();
    slipping = new Set();
    orbit = new Map();
    pending = [];
    tilts;
    windAt = () => ({ x: 0, y: 0 });
    once = new Set();
    started = false;
    ticks = 0;
    elapsed = 0;
    constructor(parts, definition) {
        this.parts = parts;
        this.definition = definition;
        const owner = attachmentOwners(parts, definition);
        this.tilts = tiltedPoses(parts, definition);
        for (const p of parts) {
            const def = definition(p.definitionId);
            for (const b of def?.behaviours ?? []) {
                if (b.kind === "GRAVITY_ZONE") {
                    const w = Number(p.parameters.width ?? 16);
                    this.zones.push({ id: p.id, x1: p.position.x - w / 2, x2: p.position.x + w / 2, g: Number(p.parameters.g ?? b.g), air: p.parameters.air === undefined ? b.air : p.parameters.air === true, wind: Number(p.parameters.wind ?? 0), label: String(p.parameters.label ?? (Number(p.parameters.g ?? b.g) < 0.01 ? "ZERO G" : Number(p.parameters.g ?? b.g) < 5 ? "MOON" : "EARTH")) });
                }
                if (b.kind === "PLANET")
                    this.planets.push({ part: p, pull: b.pull, radius: b.radius, range: b.range });
                if (b.kind === "LAUNCHER")
                    this.launchers.push({ part: p, speeds: b.speeds });
                if (b.kind === "SUN")
                    this.suns.push(p);
                if (b.kind === "RIGID_BODY" && b.bodyType === "DYNAMIC")
                    this.bodies.push({ part: p, height: b.height });
            }
            if (typeof p.parameters.waitFor === "string")
                this.heldParts.set(p.id, p);
            const vb = vesselBehaviour(def);
            if (!vb)
                continue;
            const c = Math.cos(p.rotation), s = Math.sin(p.rotation);
            const attached = [];
            for (const q of parts) {
                if (owner.get(q.id) !== p.id)
                    continue;
                const qd = definition(q.definitionId);
                const kind = attachKind(qd);
                const sp = spaceBehaviour(qd);
                const dx = q.position.x - p.position.x, dy = q.position.y - p.position.y;
                attached.push({ part: q, kind, def: qd, lx: dx * c + dy * s, ly: -dx * s + dy * c, mass: sp?.mass ?? (kind === "BATTERY" ? 0.3 : 0.05), burnLeft: Number(q.parameters.burn ?? sp?.burn ?? 0) });
            }
            const r = def.behaviours.find(b => b.kind === "RIGID_BODY");
            const bodyMass = r?.kind === "RIGID_BODY" ? r.density * r.width * r.height * (r.shape === "CIRCLE" ? Math.PI / 4 : 1) : 0.5;
            this.vessels.push({ id: p.id, part: p, type: vb.vessel, dragArea: vb.dragArea, parts: attached, mass: bodyMass + attached.reduce((t, a) => t + a.mass, 0), omega: 0, flying: false, maxAltitude: 0, startY: p.position.y, touchdown: false, held: typeof p.parameters.waitFor === "string", minAngle: p.rotation, maxAngle: p.rotation, slipTicks: 0, driveTicks: 0 });
        }
        for (const l of this.launchers) {
            let best;
            for (const b of this.bodies) {
                const d = Math.hypot(b.part.position.x - l.part.position.x, b.part.position.y - l.part.position.y);
                if (d <= 0.9 && (!best || d < best.d))
                    best = { id: b.part.id, d };
            }
            if (best)
                l.payload = best.id;
        }
    }
    hasSpace() { return this.zones.length > 0 || this.vessels.length > 0 || this.planets.length > 0 || this.launchers.length > 0 || this.parts.some(p => p.definitionId.startsWith("space.")); }
    isAttached(partId) { return this.vessels.some(v => v.parts.some(a => a.part.id === partId)); }
    zoneAt(x) { return this.zones.find(z => x >= z.x1 && x < z.x2); }
    /** Gravity (m/s²) where x is: a zone's, or ordinary Earth gravity. */
    gravityAt(x) { return this.zoneAt(x)?.g ?? EARTH_G; }
    airAt(x) { return this.zoneAt(x)?.air ?? true; }
    /** How strongly the sun shines on a panel facing `angle` (0 = straight up) at (x, y): 0..1. */
    sunlight(x, y, angle) { return sunFactor(this.suns, x, y, angle); }
    /** One tick (force phase): zone gravity, planets, launchers, held parts, then every rocket and rover. */
    step(dt, physics, happened, windAt = () => ({ x: 0, y: 0 })) {
        this.windAt = windAt;
        if (!this.started) {
            this.started = true;
            for (const [id, pose] of this.tilts) {
                if (this.vessels.some(v => v.id === id)) {
                    try {
                        physics.setPose(id, pose.x, pose.y, pose.angle);
                    }
                    catch { /* no body */ }
                }
            }
            for (const v of this.vessels) {
                try {
                    physics.setMass(v.id, v.mass);
                }
                catch { /* not simulated */ }
                if (v.parts.length)
                    this.pending.push({ kind: "VESSEL_ASSEMBLED", sourceId: v.id, data: { parts: v.parts.length, type: v.type } });
            }
        }
        this.elapsed += dt;
        this.thrustNow.clear();
        this.driving.clear();
        this.slipping.clear();
        // Parts waiting for an earlier stage (a lander waiting for the rocket, a rover waiting for the landing) stay put.
        for (const [id, p] of this.heldParts) {
            if (happened(String(p.parameters.waitFor))) {
                this.heldParts.delete(id);
                const v = this.vessels.find(x => x.id === id);
                if (v)
                    v.held = false;
                this.pending.push({ kind: "STAGE_RELEASED", sourceId: id, data: { after: String(p.parameters.waitFor) } });
                try {
                    physics.setLinearVelocity(id, { x: Number(p.parameters.launchVx ?? 0), y: Number(p.parameters.launchVy ?? 0) });
                }
                catch { /* no body */ }
                continue;
            }
            try {
                physics.setPose(id, p.position.x, p.position.y, p.rotation);
                physics.setLinearVelocity(id, { x: 0, y: 0 });
            }
            catch { /* attachments have no body */ }
        }
        // Gravity zones: weight is mass × the zone's g. Mass itself is never touched.
        for (const b of this.bodies) {
            if (this.heldParts.has(b.part.id))
                continue;
            let st;
            try {
                st = physics.state(b.part.id);
            }
            catch {
                continue;
            }
            const z = this.zoneAt(st.x);
            const m = physics.mass(b.part.id);
            if (!Number.isFinite(m))
                continue;
            if (z) {
                physics.applyForce(b.part.id, { x: 0, y: -m * (EARTH_G - z.g) });
                const key = `zone:${b.part.id}:${z.id}`;
                if (!this.once.has(key)) {
                    this.once.add(key);
                    this.pending.push({ kind: "GRAVITY_ZONE", sourceId: z.id, targetId: b.part.id, data: { g: z.g, mass: round(m), weight: round(m * z.g) } });
                }
            }
            // Toy planets pull towards their centre, weaker further away (capped so nothing goes infinite).
            for (const pl of this.planets) {
                const dx = pl.part.position.x - st.x, dy = pl.part.position.y - st.y, d = Math.hypot(dx, dy);
                if (d > pl.range || d < 0.05)
                    continue;
                const a = Math.min(30, pl.pull / Math.max(d * d, pl.radius * pl.radius));
                physics.applyForce(b.part.id, { x: m * a * dx / d, y: m * a * dy / d });
                const ang = Math.atan2(st.y - pl.part.position.y, st.x - pl.part.position.x);
                const o = this.orbit.get(b.part.id);
                if (o) {
                    let dA = ang - o.last;
                    while (dA > Math.PI)
                        dA -= Math.PI * 2;
                    while (dA < -Math.PI)
                        dA += Math.PI * 2;
                    o.total += dA;
                    o.last = ang;
                    if (Math.abs(o.total) > Math.PI && !this.once.has(`arc:${b.part.id}`)) {
                        this.once.add(`arc:${b.part.id}`);
                        this.pending.push({ kind: "ORBIT_ARC", sourceId: pl.part.id, targetId: b.part.id, data: { degrees: Math.round(Math.abs(o.total) * 180 / Math.PI) } });
                    }
                }
                else {
                    this.orbit.set(b.part.id, { last: ang, total: 0 });
                    this.pending.push({ kind: "PLANET_PULL", sourceId: pl.part.id, targetId: b.part.id });
                }
            }
        }
        // Launchers fling whatever sits on them at their chosen speed, once, half a second in.
        for (const l of this.launchers) {
            if (!l.payload || this.once.has(`launch:${l.part.id}`) || this.elapsed < Number(l.part.parameters.fireAt ?? 0.5))
                continue;
            this.once.add(`launch:${l.part.id}`);
            const speed = l.speeds[Math.max(0, Math.min(l.speeds.length - 1, Math.round(Number(l.part.parameters.power ?? 0))))] ?? 0;
            const a = l.part.rotation;
            try {
                physics.setLinearVelocity(l.payload, { x: Math.cos(a) * speed, y: Math.sin(a) * speed });
                this.pending.push({ kind: "LAUNCHED", sourceId: l.part.id, targetId: l.payload, data: { speed } });
            }
            catch { /* payload has no body */ }
        }
        for (const v of this.vessels) {
            if (v.held)
                continue;
            if (v.type === "ROCKET")
                this.stepRocket(v, dt, physics, happened);
            else
                this.stepRover(v, dt, physics, happened);
        }
    }
    attachmentStarted(a, happened) {
        const wait = a.part.parameters.waitFor;
        if (typeof wait === "string" && !happened(wait))
            return false;
        return this.elapsed >= Number(a.part.parameters.delay ?? 0);
    }
    stepRocket(v, dt, physics, happened) {
        let st;
        try {
            st = physics.state(v.id);
        }
        catch {
            return;
        }
        const z = this.zoneAt(st.x);
        const air = z?.air ?? true;
        const gust = air ? this.windAt(st.x, st.y) : { x: 0, y: 0 };
        const wind = (z?.wind ?? 0) + gust.x;
        const ux = Math.sin(st.angle), uy = -Math.cos(st.angle);
        const c = Math.cos(st.angle), s = Math.sin(st.angle);
        let fx = 0, fy = 0, torque = 0, thrust = 0;
        for (const a of v.parts) {
            if (a.kind !== "BOOSTER" || a.burnLeft <= 0 || !this.attachmentStarted(a, happened))
                continue;
            const T = spaceBehaviour(a.def)?.thrust ?? 10;
            a.burnLeft -= dt;
            fx += ux * T;
            fy += uy * T;
            thrust += T;
            const rx = a.lx * c - a.ly * s, ry = a.lx * s + a.ly * c;
            torque += rx * (uy * T) - ry * (ux * T);
            if (!this.once.has(`ign:${a.part.id}`)) {
                this.once.add(`ign:${a.part.id}`);
                this.pending.push({ kind: "BOOSTER_IGNITED", sourceId: a.part.id, targetId: v.id, data: { thrust: T } });
            }
            if (a.burnLeft <= 0)
                this.pending.push({ kind: "BOOSTER_BURNOUT", sourceId: a.part.id, targetId: v.id });
        }
        if (thrust > 0)
            this.thrustNow.set(v.id, thrust);
        const fins = v.parts.some(a => a.kind === "FINS"), nose = v.parts.some(a => a.kind === "NOSE" || a.kind === "CAPSULE"), chute = v.parts.find(a => a.kind === "CHUTE");
        const rvx = st.vx - wind, rvy = st.vy - gust.y, speed = Math.hypot(rvx, rvy);
        if (air && speed > 0.05) {
            const cda = Math.max(0.03, v.dragArea - (nose ? 0.05 : 0) + (fins ? 0.02 : 0) + (chute ? 1.6 * 1.4 : 0));
            const d = 0.5 * RHO * cda * speed * speed;
            fx -= d * rvx / speed;
            fy -= d * rvy / speed;
            // Fins turn the nose into the airflow (like an arrow's feathers); a finless rocket's nose wanders away from it.
            const q = 0.5 * RHO * speed * speed;
            const dirX = rvx / speed, dirY = rvy / speed;
            const sinB = ux * dirY - uy * dirX;
            const cosB = ux * dirX + uy * dirY;
            const beta = Math.atan2(sinB, cosB);
            torque += fins ? 0.12 * q * Math.sin(beta) - 0.15 * v.omega * speed : -0.15 * q * Math.sin(beta);
            if (Math.abs(gust.x) + Math.abs(gust.y) > 0.5 && !this.once.has(`gust:${v.id}`)) {
                this.once.add(`gust:${v.id}`);
                this.pending.push({ kind: "ROCKET_GUST", sourceId: v.id, data: { wind: round(Math.hypot(gust.x, gust.y)) } });
            }
        }
        else if (chute && !air && st.vy > 1 && !this.once.has(`noair:${v.id}`)) {
            this.once.add(`noair:${v.id}`);
            this.pending.push({ kind: "PARACHUTE_NO_AIR", sourceId: chute.part.id, targetId: v.id });
        }
        // Landing legs: springy feet that push up harder the more they squash, and soak up speed as they do.
        const legs = v.parts.some(a => a.kind === "LEGS");
        const half = this.halfHeight(v.id);
        if (legs && Math.abs(st.angle) < 0.6) {
            const ground = this.groundBelow(st.x, st.y + half, physics);
            const comp = st.y + half + 0.45 - ground;
            if (comp > 0) {
                const m = v.mass;
                const f = m * (60 * comp) + m * 9 * Math.max(0, st.vy);
                fy -= f;
                if (st.vy > 0.6 && !this.once.has(`legs:${v.id}`)) {
                    this.once.add(`legs:${v.id}`);
                    this.pending.push({ kind: "LEGS_ABSORB", sourceId: v.id, data: { speed: round(st.vy) } });
                }
            }
        }
        try {
            physics.applyForce(v.id, { x: fx, y: fy });
        }
        catch { /* static */ }
        const inertia = v.mass * 0.2;
        const touching = physics.contactEvents.some(e => e.a === v.id || e.b === v.id) || st.y + half >= FLOOR - 0.01;
        v.omega = Math.max(-8, Math.min(8, v.omega + torque / inertia * dt));
        if (touching && thrust === 0)
            v.omega *= 0.5;
        physics.setAngularVelocity(v.id, v.omega);
        if (thrust > 0 && !this.once.has(`lift:${v.id}`) && v.startY - st.y > 0.3) {
            this.once.add(`lift:${v.id}`);
            this.pending.push({ kind: "ROCKET_LIFTOFF", sourceId: v.id, data: { thrust: round(thrust), weight: round(v.mass * (z?.g ?? EARTH_G)) } });
        }
    }
    stepRover(v, dt, physics, happened) {
        let st;
        try {
            st = physics.state(v.id);
        }
        catch {
            return;
        }
        const g = this.gravityAt(st.x);
        const view = this.roverFacts(v);
        const drive = v.parts.find(a => a.kind === "DRIVE");
        if (!drive || !this.attachmentStarted(drive, happened))
            return;
        if (!view.stable) {
            if (!this.once.has(`tip:${v.id}`)) {
                this.once.add(`tip:${v.id}`);
                this.pending.push({ kind: "ROVER_NO_WHEELS", sourceId: v.id, data: { wheels: v.parts.filter(a => a.kind === "WHEEL").length } });
            }
            return;
        }
        if (!view.powered) {
            if (!this.once.has(`nopower:${v.id}`)) {
                this.once.add(`nopower:${v.id}`);
                this.pending.push({ kind: "ROVER_NO_POWER", sourceId: v.id });
            }
            return;
        }
        // On the ground? Which way does the ground slope under the wheels?
        const contact = physics.contactEvents.find(e => e.a === v.id || e.b === v.id);
        const r = this.halfHeight(v.id);
        const onFloor = st.y + r >= FLOOR - 0.03;
        if (!contact && !onFloor)
            return;
        let slope = 0;
        if (contact) {
            const other = contact.a === v.id ? contact.b : contact.a;
            const op = this.parts.find(p => p.id === other);
            const rb = op ? this.definition(op.definitionId)?.behaviours.find(b => b.kind === "RIGID_BODY") : undefined;
            if (rb?.kind === "RIGID_BODY" && rb.shape === "RAMP")
                slope = op.rotation;
        }
        const tx = Math.cos(slope), ty = Math.sin(slope);
        const m = v.mass;
        const grip = Math.max(...v.parts.filter(a => a.kind === "WHEEL").map(a => spaceBehaviour(a.def)?.grip ?? 0.5));
        const sp = spaceBehaviour(drive.def);
        const maxForce = sp?.force ?? 4, target = sp?.speed ?? 1.6;
        const traction = grip * m * g * Math.cos(slope);
        const limit = Math.min(maxForce, traction);
        const vt = st.vx * tx + st.vy * ty;
        const want = m * (target - vt) * 4;
        const f = Math.max(-limit, Math.min(limit, want));
        physics.applyForce(v.id, { x: f * tx, y: f * ty });
        this.driving.add(v.id);
        v.driveTicks++;
        if (!this.once.has(`drive:${v.id}`)) {
            this.once.add(`drive:${v.id}`);
            this.pending.push({ kind: "ROVER_DRIVING", sourceId: v.id, data: { power: view.solar ? "SOLAR" : "BATTERY" } });
        }
        // The wheels ask for more push than their grip can give, and the rover is going nowhere: they spin.
        if (want > traction && traction < maxForce && vt < 0.15) {
            this.slipping.add(v.id);
            v.slipTicks++;
            if (v.slipTicks === 30)
                this.pending.push({ kind: "ROVER_SLIP", sourceId: v.id, data: { grip: round(grip), g: round(g), slope: round(Math.abs(slope)) } });
        }
        if (Math.abs(slope) > 0.3 && vt > 0.3 && !this.once.has(`climb:${v.id}`)) {
            this.once.add(`climb:${v.id}`);
            this.pending.push({ kind: "ROVER_CLIMB", sourceId: v.id, data: { slope: round(Math.abs(slope)), grip: round(grip) } });
        }
    }
    roverFacts(v) {
        const wheels = v.parts.filter(a => a.kind === "WHEEL");
        const stable = wheels.some(a => a.lx > 0.1) && wheels.some(a => a.lx < -0.1);
        const solar = v.parts.some(a => a.kind === "SOLAR" && this.sunlight(v.part.position.x + a.lx, v.part.position.y + a.ly, a.part.rotation) > 0.5);
        return { stable, powered: v.parts.some(a => a.kind === "BATTERY") || solar, solar };
    }
    /** After the physics step: flight, tumbling, touchdowns, how high things got and when they first hit the ground. */
    observe(physics) {
        for (const b of this.bodies) {
            let st;
            try {
                st = physics.state(b.part.id);
            }
            catch {
                continue;
            }
            const f = this.falls.get(b.part.id) ?? { startY: b.part.position.y, minY: b.part.position.y, ...(this.zoneAt(b.part.position.x) ? { zone: this.zoneAt(b.part.position.x).id } : {}) };
            this.falls.set(b.part.id, f);
            f.minY = Math.min(f.minY, st.y);
            const grounded = st.y + b.height / 2 >= FLOOR - 0.02 || physics.contactEvents.some(e => e.a === b.part.id || e.b === b.part.id);
            if (grounded && f.groundTick === undefined && this.ticks > 1 && !this.heldParts.has(b.part.id)) {
                f.groundTick = this.ticks;
                this.pending.push({ kind: "HIT_GROUND", sourceId: b.part.id, data: { seconds: round(this.ticks / 60), g: round(this.gravityAt(st.x)) } });
            }
        }
        for (const v of this.vessels) {
            if (v.held)
                continue;
            let st;
            try {
                st = physics.state(v.id);
            }
            catch {
                continue;
            }
            const half = this.halfHeight(v.id);
            const onLegs = v.parts.some(a => a.kind === "LEGS") && st.y + half + 0.45 >= this.groundBelow(st.x, st.y + half, physics) - 0.02;
            const touching = onLegs || physics.contactEvents.some(e => e.a === v.id || e.b === v.id) || st.y + half >= FLOOR - 0.02;
            v.maxAltitude = Math.max(v.maxAltitude, v.startY - st.y);
            if (!touching && Math.hypot(st.vx, st.vy) > 0.5) {
                v.flying = true;
                v.minAngle = Math.min(v.minAngle, st.angle);
                v.maxAngle = Math.max(v.maxAngle, st.angle);
            }
            else if (touching && v.flying && !v.touchdown && v.type === "ROCKET") {
                v.touchdown = true;
                this.pending.push({ kind: "TOUCHDOWN", sourceId: v.id, data: { speed: round(Math.hypot(st.vx, st.vy)), legs: v.parts.some(a => a.kind === "LEGS"), distance: round(Math.abs(st.x - v.part.position.x)) } });
            }
            if (v.type === "ROCKET" && v.flying && Math.abs(st.angle) > 1.2 && !this.once.has(`tumble:${v.id}`)) {
                this.once.add(`tumble:${v.id}`);
                this.pending.push({ kind: "ROCKET_TUMBLE", sourceId: v.id, data: { fins: v.parts.some(a => a.kind === "FINS") } });
            }
            if (v.type === "ROCKET" && v.maxAltitude > 4 && v.maxAngle - v.minAngle < 0.5 && !this.once.has(`straight:${v.id}`)) {
                this.once.add(`straight:${v.id}`);
                this.pending.push({ kind: "ROCKET_STRAIGHT", sourceId: v.id, data: { fins: v.parts.some(a => a.kind === "FINS") } });
            }
        }
        this.ticks += 1;
    }
    halfHeight(id) { const p = this.parts.find(q => q.id === id); const r = p ? this.definition(p.definitionId)?.behaviours.find(b => b.kind === "RIGID_BODY") : undefined; return r?.kind === "RIGID_BODY" ? r.height / 2 : 0.2; }
    /** The top of whatever solid ground is under (x, from y down). */
    groundBelow(x, y, physics) {
        let best = FLOOR;
        for (const p of this.parts) {
            const r = this.definition(p.definitionId)?.behaviours.find(b => b.kind === "RIGID_BODY");
            if (r?.kind !== "RIGID_BODY" || r.bodyType !== "STATIC" || r.shape === "RAMP")
                continue;
            const w = Number(p.parameters.width ?? r.width), h = Number(p.parameters.height ?? r.height);
            const top = p.position.y - h / 2;
            if (Math.abs(x - p.position.x) <= w / 2 && top >= y - 0.6 && top < best)
                best = top;
        }
        void physics;
        return best;
    }
    // ---------------------------------------------------------------- read-only views
    vessel(id) {
        const v = this.vessels.find(x => x.id === id);
        if (!v)
            return undefined;
        const f = this.roverFacts(v);
        return { id, type: v.type, mass: round(v.mass), thrust: this.thrustNow.get(id) ?? 0, flying: v.flying, touchdown: v.touchdown, angleSpread: v.maxAngle - v.minAngle, attached: v.parts.map(a => a.part.id), stable: f.stable, powered: f.powered, driving: this.driving.has(id), slipping: this.slipping.has(id), maxAltitude: v.maxAltitude };
    }
    vesselViews() { return this.vessels.map(v => this.vessel(v.id)); }
    attachedPose(partId, physics) {
        for (const v of this.vessels) {
            const a = v.parts.find(x => x.part.id === partId);
            if (!a)
                continue;
            let st;
            try {
                st = physics.state(v.id);
            }
            catch {
                return undefined;
            }
            const c = Math.cos(st.angle), s = Math.sin(st.angle);
            return { x: st.x + a.lx * c - a.ly * s, y: st.y + a.lx * s + a.ly * c, angle: st.angle + a.part.rotation - v.part.rotation };
        }
        return undefined;
    }
    /** Seconds from the start until this body first touched the ground (undefined if it hasn't). */
    fallTime(id) { const f = this.falls.get(id); return f?.groundTick === undefined ? undefined : f.groundTick / 60; }
    /** How far above its start this body rose at most (m). */
    maxRise(id) { const f = this.falls.get(id); return f ? f.startY - f.minY : 0; }
    orbitDegrees(id) { const o = this.orbit.get(id); return o ? Math.abs(o.total) * 180 / Math.PI : 0; }
    isHeld(id) { return this.heldParts.has(id); }
    boosterFuel(partId) { for (const v of this.vessels) {
        const a = v.parts.find(x => x.part.id === partId);
        if (a?.kind === "BOOSTER")
            return Math.max(0, a.burnLeft);
    } return undefined; }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
/** How directly a panel facing `angle` (0 = up) at (x, y) faces the nearest sun: 1 = straight at it, 0 = side-on or away. */
export function sunFactor(suns, x, y, angle) {
    let best = 0;
    const nx = Math.sin(angle), ny = -Math.cos(angle);
    for (const s of suns) {
        const dx = s.position.x - x, dy = s.position.y - y, d = Math.hypot(dx, dy) || 1;
        best = Math.max(best, (nx * dx + ny * dy) / d);
    }
    return Math.max(0, best);
}
function round(v) { return Math.round(v * 100) / 100; }
