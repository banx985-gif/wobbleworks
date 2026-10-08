/**
 * Flight Hangar (M17) — Scientific Truth Contract for flight (design §8A).
 *   - Four things act on a flying machine: WEIGHT (down), THRUST (forward, from a powered propeller), DRAG (against the
 *     motion through the air) and LIFT (from wings moving through the air, sideways to that motion).
 *   - Lift grows with wing size, with speed (squared) and with the wing's angle to the airflow — until it stalls.
 *   - Thrust is not lift: a propeller pushes forward; the wings turn that speed into lift.
 *   - Stability: a tail behind the balance point keeps the nose steady; a machine that is too tail-heavy tips and tumbles.
 *   - Parachutes add a lot of drag so things fall slowly; balloons add an upward push (buoyancy) for light loads.
 *   - Fans move air; moving air pushes on whatever is in it (a push that depends on its size, not its weight).
 * Simplified: a 2D lift/drag model with one balance point per machine. Never implied: that one wing shape is always best,
 * or that thrust and lift are the same thing.
 */
export const FLIGHT_TRUTH_CONTRACT = Object.freeze({
    id: "truth.flight.v1",
    preserve: ["thrust, weight, drag and lift all act", "wing size, speed and angle change lift", "stability needs balance and a tail", "parachutes add drag", "moving air pushes things"],
    simplify: ["game-friendly 2D lift and drag", "one balance point per machine", "steady fan wind cones"],
    neverImply: ["one single wing shape is universally best", "thrust equals lift"]
});
const RHO = 1.2, G = 9.81, ATTACH_REACH = 0.75;
/** Seconds of propeller thrust in one battery pack. */
export const PACK_SECONDS = 2.0;
export function aeroBehaviour(def) { const b = def?.behaviours.find(x => x.kind === "AERO"); return b?.kind === "AERO" ? b : undefined; }
export function isCraft(def) { return Boolean(def?.behaviours.some(b => b.kind === "CRAFT")); }
export function fanBehaviour(def) { const b = def?.behaviours.find(x => x.kind === "WIND_FAN"); return b?.kind === "WIND_FAN" ? b : undefined; }
export function gateHeight(def) { const b = def?.behaviours.find(x => x.kind === "GATE"); return b?.kind === "GATE" ? b.height : undefined; }
/** Where a part dropped near a craft clips on: its slot offset in the craft's own frame (x forward, y down). */
export const CRAFT_SLOTS = {
    WING: { x: 0.1, y: -0.12 }, TAIL: { x: -0.5, y: -0.16 }, PROPELLER: { x: 0.58, y: 0 }, POWER_PACK: { x: -0.1, y: 0.2 }, PARACHUTE: { x: 0, y: -0.7 }, BALLOON: { x: 0, y: -1.0 }, WEIGHT: { x: 0.42, y: 0.12 }, PAYLOAD: { x: 0, y: 0.32 }
};
/** Attach point for a part dropped at (x, y) near a craft at pose (cx, cy, angle). Placement help only. */
export function craftSnap(x, y, part, craft, slotX) {
    if (Math.hypot(x - craft.x, y - craft.y) > 1.6)
        return undefined;
    const slot = CRAFT_SLOTS[part];
    const sx = part === "WING" || part === "WEIGHT" ? (slotX ?? slot.x) : slot.x;
    const c = Math.cos(craft.angle), s = Math.sin(craft.angle);
    return { x: craft.x + sx * c - slot.y * s, y: craft.y + sx * s + slot.y * c };
}
export class FlightSystem {
    parts;
    definition;
    crafts = [];
    fans = [];
    gates = [];
    passed = new Map();
    impacts = new Map();
    landed = new Map();
    lastV = new Map();
    forces = new Map();
    pending = [];
    once = new Set();
    started = false;
    ticks = 0;
    elapsed = 0;
    constructor(parts, definition) {
        this.parts = parts;
        this.definition = definition;
        // Each clip-on part belongs to the nearest craft within reach.
        const craftParts = parts.filter(p => isCraft(definition(p.definitionId)));
        const owner = new Map();
        for (const q of parts) {
            const aero = aeroBehaviour(definition(q.definitionId));
            if (!aero)
                continue;
            const reach = ATTACH_REACH + (aero.part === "BALLOON" || aero.part === "PARACHUTE" ? 0.5 : 0);
            let best;
            for (const c of craftParts) {
                const d = Math.hypot(q.position.x - c.position.x, q.position.y - c.position.y);
                if (d <= reach && (!best || d < best.d))
                    best = { id: c.id, d };
            }
            if (best)
                owner.set(q.id, best.id);
        }
        const used = new Set();
        for (const p of parts) {
            const def = definition(p.definitionId);
            const fan = fanBehaviour(def);
            if (fan)
                this.fans.push({ part: p, fan });
            const gh = gateHeight(def);
            if (gh !== undefined)
                this.gates.push({ part: p, height: Number(p.parameters.height ?? gh) });
            if (!isCraft(def))
                continue;
            const c = Math.cos(p.rotation), s = Math.sin(p.rotation);
            const attached = [];
            for (const q of parts) {
                const aero = aeroBehaviour(definition(q.definitionId));
                if (!aero || used.has(q.id) || owner.get(q.id) !== p.id)
                    continue;
                const dx = q.position.x - p.position.x, dy = q.position.y - p.position.y;
                used.add(q.id);
                attached.push({ part: q, aero, lx: dx * c + dy * s, ly: -dx * s + dy * c });
            }
            const r = def.behaviours.find(b => b.kind === "RIGID_BODY");
            const bodyMass = r?.kind === "RIGID_BODY" ? r.density * r.width * r.height : 0.15;
            const mass = bodyMass + attached.reduce((t, a) => t + a.aero.mass, 0);
            const comX = attached.reduce((t, a) => t + a.aero.mass * a.lx, 0) / mass;
            const craftDrag = def.behaviours.find(b => b.kind === "CRAFT");
            const bodyDrag = craftDrag?.kind === "CRAFT" ? craftDrag.dragArea : 0.05;
            this.crafts.push({ id: p.id, body: p, parts: attached, mass, comX, inertia: mass * 0.12, bodyDrag, omega: 0, thrustTime: 0, flying: false, pitchMin: p.rotation, pitchMax: p.rotation, startX: p.position.x, maxX: p.position.x, airborneTicks: 0 });
        }
    }
    hasFlight() { return this.crafts.length > 0 || this.fans.length > 0 || this.gates.length > 0 || this.parts.some(p => p.definitionId.startsWith("flight.")); }
    isAttached(partId) { return this.crafts.some(c => c.parts.some(a => a.part.id === partId)); }
    /** Wind at a point from every fan (m/s). */
    windAt(x, y) {
        let wx = 0, wy = 0;
        for (const { part, fan } of this.fans) {
            if (part.parameters.off === true)
                continue;
            const ax = Math.cos(part.rotation), ay = Math.sin(part.rotation);
            const dx = x - part.position.x, dy = y - part.position.y;
            const along = dx * ax + dy * ay;
            if (along <= 0 || along > fan.range)
                continue;
            const across = Math.abs(-dx * ay + dy * ax);
            const width = 0.3 + along * Math.tan(fan.spread);
            if (across > width)
                continue;
            const k = fan.speed * (1 - along / fan.range) * (1 - 0.5 * across / width);
            wx += ax * k;
            wy += ay * k;
        }
        return { x: wx, y: wy };
    }
    /** One tick (force phase): aerodynamic forces on every craft and wind on everything in a fan's breeze. */
    step(dt, physics, poweredDrive = () => 1) {
        if (!this.started) {
            this.started = true;
            for (const c of this.crafts) {
                try {
                    physics.setMass(c.id, c.mass);
                }
                catch { /* not simulated */ }
                if (c.parts.length)
                    this.pending.push({ kind: "CRAFT_ASSEMBLED", sourceId: c.id, data: { parts: c.parts.length } });
            }
        }
        this.forces.clear();
        this.elapsed += dt;
        // Things waiting on a launcher or a conveyor stay put until their moment (releaseAt seconds), then go with their launch speed.
        for (const p of this.parts) {
            const at = Number(p.parameters.releaseAt);
            if (!Number.isFinite(at))
                continue;
            try {
                if (this.elapsed < at) {
                    physics.setPose(p.id, p.position.x, p.position.y, p.rotation);
                    physics.setLinearVelocity(p.id, { x: 0, y: 0 });
                }
                else if (!this.once.has(`release:${p.id}`)) {
                    this.once.add(`release:${p.id}`);
                    physics.setLinearVelocity(p.id, { x: Number(p.parameters.launchVx ?? 0), y: Number(p.parameters.launchVy ?? 0) });
                    this.pending.push({ kind: "RELEASED", sourceId: p.id });
                }
            }
            catch { /* not simulated */ }
        }
        for (const c of this.crafts) {
            if (this.elapsed < Number(c.body.parameters.releaseAt ?? 0))
                continue;
            let st;
            try {
                st = physics.state(c.id);
            }
            catch {
                continue;
            }
            const wind = this.windAt(st.x, st.y);
            const rvx = st.vx - wind.x, rvy = st.vy - wind.y;
            const v = Math.hypot(rvx, rvy);
            const heading = st.angle;
            const hx = Math.cos(heading), hy = Math.sin(heading);
            let fx = 0, fy = 0, torque = 0, lift = 0, drag = 0, thrust = 0, stalled = false;
            // Drag of the body and of every attached surface; lift from wings and tail.
            const dragArea = c.bodyDrag + c.parts.reduce((t, a) => t + (a.aero.part === "PARACHUTE" ? (a.aero.area ?? 2) * 1.4 : a.aero.part === "BALLOON" ? 0.25 : a.aero.part === "WING" || a.aero.part === "TAIL" ? (a.aero.area ?? 0.3) * 0.04 : 0.02), 0);
            if (v > 0.01) {
                const d = 0.5 * RHO * dragArea * v * v;
                fx -= d * rvx / v;
                fy -= d * rvy / v;
                drag += d;
                const gamma = Math.atan2(rvy, rvx);
                for (const a of c.parts) {
                    if (a.aero.part !== "WING" && a.aero.part !== "TAIL")
                        continue;
                    // Screen y points down, so the angle of attack is the flight path angle minus the nose angle (plus the wing's own nose-up tilt).
                    const alpha = wrap(gamma - heading + (a.aero.incidence ?? 0));
                    const isStall = Math.abs(alpha) > 0.35;
                    if (isStall && a.aero.part === "WING")
                        stalled = true;
                    const cl = Math.max(-1.1, Math.min(1.1, 2 * Math.PI * alpha * 0.8)) * (isStall ? 0.4 : 1);
                    const L = 0.5 * RHO * (a.aero.area ?? 0.3) * cl * v * v;
                    // Lift is sideways to the airflow: rotate the airflow direction a quarter turn towards "up" for a nose-level wing.
                    const lxDir = rvy / v, lyDir = -rvx / v;
                    fx += L * lxDir;
                    fy += L * lyDir;
                    if (a.aero.part === "WING")
                        lift += Math.abs(L);
                    // Pitching: lift acting ahead of the balance point raises the nose; behind it lowers the nose.
                    torque -= (a.lx - c.comX) * L;
                    const ind = 0.5 * RHO * (a.aero.area ?? 0.3) * 0.08 * cl * cl * v * v;
                    fx -= ind * rvx / v;
                    fy -= ind * rvy / v;
                    drag += ind;
                }
                // Pitch damping: tails and wings resist spinning, more at speed.
                const damp = c.parts.reduce((t, a) => t + (a.aero.part === "TAIL" ? 1.6 : a.aero.part === "WING" ? 0.3 : 0), 0.05) * v * 0.08;
                torque -= damp * c.omega;
            }
            // Thrust: a propeller pushes along the nose — only with power on board.
            // The battery pack runs down: thrust lasts packSeconds of propeller time (Power Lab: batteries store limited energy).
            const packs = c.parts.filter(a => a.aero.part === "POWER_PACK").length;
            const charged = packs > 0 && c.thrustTime < PACK_SECONDS * packs;
            for (const a of c.parts)
                if (a.aero.part === "PROPELLER" && charged) {
                    const t = (a.aero.thrust ?? 2) * poweredDrive(c.id);
                    fx += hx * t;
                    fy += hy * t;
                    thrust += t;
                }
            if (thrust > 0) {
                c.thrustTime += dt;
                if (c.thrustTime >= PACK_SECONDS * packs && !this.once.has(`flat:${c.id}`)) {
                    this.once.add(`flat:${c.id}`);
                    this.pending.push({ kind: "BATTERY_EMPTY", sourceId: c.id });
                }
            }
            // Balloons push up (buoyancy), the same whatever the speed.
            for (const a of c.parts)
                if (a.aero.part === "BALLOON")
                    fy -= a.aero.buoyancy ?? 1.5;
            try {
                physics.applyForce(c.id, { x: fx, y: fy });
            }
            catch { /* static */ }
            c.omega = Math.max(-6, Math.min(6, c.omega + torque / c.inertia * dt));
            if (Math.abs(st.vx) + Math.abs(st.vy) < 0.5)
                c.omega *= 0.8;
            physics.setAngularVelocity(c.id, c.omega);
            this.forces.set(c.id, { lift, drag, thrust, weight: c.mass * G, airspeed: v, stalled, lx: fx, ly: fy, dx: rvx, dy: rvy });
            if (stalled && !this.once.has(`stall:${c.id}`)) {
                this.once.add(`stall:${c.id}`);
                this.pending.push({ kind: "WING_STALL", sourceId: c.id });
            }
            if (thrust > 0 && !this.once.has(`thrust:${c.id}`)) {
                this.once.add(`thrust:${c.id}`);
                this.pending.push({ kind: "PROPELLER_THRUST", sourceId: c.id, data: { thrust: round(thrust) } });
            }
            if (lift > c.mass * G * 0.6 && !this.once.has(`lift:${c.id}`)) {
                this.once.add(`lift:${c.id}`);
                this.pending.push({ kind: "WING_LIFT", sourceId: c.id, data: { lift: round(lift), weight: round(c.mass * G) } });
            }
        }
        // Wind pushes everything else that's in it (drag on its size).
        if (this.fans.length)
            for (const p of this.parts) {
                // Rockets and rovers feel the wind through the Space Centre's own airflow model.
                if (this.crafts.some(c => c.id === p.id) || this.isAttached(p.id) || this.definition(p.definitionId)?.behaviours.some(b => b.kind === "VESSEL"))
                    continue;
                let st;
                try {
                    st = physics.state(p.id);
                }
                catch {
                    continue;
                }
                if (!Number.isFinite(physics.mass(p.id)))
                    continue;
                const wind = this.windAt(st.x, st.y);
                if (wind.x === 0 && wind.y === 0)
                    continue;
                const r = this.definition(p.definitionId)?.behaviours.find(b => b.kind === "RIGID_BODY");
                const area = r?.kind === "RIGID_BODY" ? Math.max(r.width, r.height) * 0.6 : 0.3;
                const rvx = wind.x - st.vx, rvy = wind.y - st.vy, v = Math.hypot(rvx, rvy);
                if (v < 0.01)
                    continue;
                const d = 0.5 * RHO * area * 1.1 * v * v;
                physics.applyForce(p.id, { x: d * rvx / v, y: d * rvy / v });
                if (!this.once.has(`wind:${p.id}`)) {
                    this.once.add(`wind:${p.id}`);
                    this.pending.push({ kind: "WIND_PUSH", sourceId: "wind", targetId: p.id, data: { speed: round(v) } });
                }
            }
    }
    /** After the physics step: landings, bumps, gates, how far and how steadily each craft flew. */
    observe(physics) {
        for (const p of this.parts) {
            let st;
            try {
                st = physics.state(p.id);
            }
            catch {
                continue;
            }
            if (!Number.isFinite(physics.mass(p.id)))
                continue;
            const prev = this.lastV.get(p.id);
            this.lastV.set(p.id, { vx: st.vx, vy: st.vy, x: st.x, y: st.y });
            if (!prev)
                continue;
            const dv = Math.hypot(st.vx - prev.vx, st.vy - prev.vy);
            if (dv > 1.0 && prev.vy > 0.5) {
                this.impacts.set(p.id, Math.max(this.impacts.get(p.id) ?? 0, Math.abs(prev.vy)));
                if (!this.landed.get(p.id))
                    this.pending.push({ kind: "LANDING", sourceId: p.id, data: { impact: round(Math.abs(prev.vy)) } });
                this.landed.set(p.id, true);
            }
            const resting = Math.abs(st.vy) < 0.05 && Math.abs(st.vx) < 0.3;
            if (resting && this.ticks > 30)
                this.landed.set(p.id, this.landed.get(p.id) || this.impacts.has(p.id) || this.ticks > 60);
            for (const g of this.gates) {
                const gx = g.part.position.x, gy = g.part.position.y, top = gy - g.height / 2, bottom = gy + g.height / 2;
                // A hoop turned on its side (a launch corridor ring) is passed by crossing its height instead of its x.
                const flat = Math.abs(Math.sin(g.part.rotation)) > 0.7;
                const crossed = flat ? (prev.y - gy) * (st.y - gy) <= 0 && prev.y !== st.y && Math.abs(st.x - gx) <= g.height / 2 : (prev.x - gx) * (st.x - gx) <= 0 && prev.x !== st.x && st.y >= top && st.y <= bottom;
                if (crossed) {
                    const set = this.passed.get(p.id) ?? new Set();
                    if (!set.has(g.part.id)) {
                        set.add(g.part.id);
                        this.passed.set(p.id, set);
                        this.pending.push({ kind: "GATE_PASSED", sourceId: p.id, targetId: g.part.id });
                    }
                }
            }
        }
        for (const c of this.crafts) {
            let st;
            try {
                st = physics.state(c.id);
            }
            catch {
                continue;
            }
            // Flying = moving, clear of the floor and touching nothing this tick (bouncing or sliding along the ground isn't flight).
            const touching = physics.contactEvents.some(e => e.a === c.id || e.b === c.id);
            const h = this.halfHeight(c.id);
            const airborne = Math.hypot(st.vx, st.vy) > 0.8 && !touching && st.y + h < 8.4 - 0.03;
            if (airborne) {
                c.flying = true;
                c.airborneTicks++;
                if (c.airborneTicks > 20) {
                    c.pitchMin = Math.min(c.pitchMin, st.angle);
                    c.pitchMax = Math.max(c.pitchMax, st.angle);
                }
                c.maxX = Math.max(c.maxX, st.x);
            }
            else if (c.flying && c.landedX === undefined && Math.hypot(st.vx, st.vy) < 0.3) {
                c.landedX = st.x;
                this.pending.push({ kind: "CRAFT_LANDED", sourceId: c.id, data: { distance: round(st.x - c.startX) } });
            }
            if (c.airborneTicks === 30)
                this.pending.push({ kind: "CRAFT_FLYING", sourceId: c.id });
            if (Math.abs(wrap(st.angle)) > 2.2 && !this.once.has(`tumble:${c.id}`)) {
                this.once.add(`tumble:${c.id}`);
                this.pending.push({ kind: "CRAFT_TUMBLE", sourceId: c.id });
            }
        }
        this.ticks += 1;
    }
    halfHeight(id) { const p = this.parts.find(q => q.id === id); const r = p ? this.definition(p.definitionId)?.behaviours.find(b => b.kind === "RIGID_BODY") : undefined; return r?.kind === "RIGID_BODY" ? r.height / 2 : 0.1; }
    // ---------------------------------------------------------------- read-only views
    craft(id) {
        const c = this.crafts.find(x => x.id === id);
        if (!c)
            return undefined;
        const f = this.forces.get(id);
        return { id, lift: f?.lift ?? 0, drag: f?.drag ?? 0, thrust: f?.thrust ?? 0, weight: c.mass * G, airspeed: f?.airspeed ?? 0, flying: c.flying, maxX: c.maxX, ...(c.landedX !== undefined ? { landedX: c.landedX } : {}), pitchSpread: c.pitchMax - c.pitchMin, attached: c.parts.map(a => a.part.id), stalled: f?.stalled ?? false };
    }
    craftStates() { return this.crafts.map(c => this.craft(c.id)); }
    attachedPose(partId, physics) {
        for (const c of this.crafts) {
            const a = c.parts.find(p => p.part.id === partId);
            if (!a)
                continue;
            try {
                const s = physics.state(c.id);
                const cs = Math.cos(s.angle), sn = Math.sin(s.angle);
                return { x: s.x + a.lx * cs - a.ly * sn, y: s.y + a.lx * sn + a.ly * cs, angle: s.angle + (a.part.rotation - c.body.rotation) };
            }
            catch {
                return undefined;
            }
        }
        return undefined;
    }
    peakImpact(id) { return this.impacts.get(id) ?? 0; }
    hasLanded(id) { return this.landed.get(id) === true; }
    gatesPassed(id) { return [...(this.passed.get(id) ?? [])]; }
    forceArrows(id) { const f = this.forces.get(id); return f ? { lift: f.lift, drag: f.drag, thrust: f.thrust, weight: f.weight } : undefined; }
    fanStates() { return this.fans.map(f => ({ id: f.part.id, x: f.part.position.x, y: f.part.position.y, angle: f.part.rotation, range: f.fan.range, spread: f.fan.spread, speed: f.fan.speed })); }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
function wrap(a) { while (a > Math.PI)
    a -= 2 * Math.PI; while (a < -Math.PI)
    a += 2 * Math.PI; return a; }
function round(v) { return Math.round(v * 1000) / 1000; }
