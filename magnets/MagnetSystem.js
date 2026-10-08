/**
 * Magnet Factory (M15) — Scientific Truth Contract for magnetism (design §8A and §79).
 *   - Every bar magnet has BOTH poles: N at one end, S at the other. There is no "north magnet" or "south magnet";
 *     turning the magnet changes which pole faces the target.
 *   - Unlike poles attract (N–S); like poles repel (N–N, S–S). Each pole pushes or pulls every other pole it can reach.
 *   - Only magnetic materials (iron, steel, nickel) are pulled — by either pole. Aluminium, copper, wood, plastic, glass and rubber are not.
 *   - The force is strongest up close and fades with distance (a simple bounded curve, cut off past its range).
 *   - Electromagnets are magnets only while current flows through them; more current = stronger; reversing the current swaps N and S.
 *   - Floating needs a guide: repulsion can hold something up only when a guide stops it sliding or flipping (never free levitation).
 */
export const MAGNETISM_TRUTH_CONTRACT = Object.freeze({
    id: "truth.magnetism.v1",
    preserve: ["every bar magnet has both N and S poles", "unlike poles attract", "like poles repel", "magnetic material matters", "electromagnets need current"],
    simplify: ["simple force curve with a range limit", "poles treated as points at the magnet's ends", "held objects ride along with an electromagnet"],
    neverImply: ["a permanent magnet is only north or only south", "every metal is magnetic", "magnets can float things without a guide"]
});
export const MAGNETIC_MATERIALS = new Set(["IRON", "STEEL", "NICKEL"]);
const SUSCEPTIBILITY = { IRON: 1, STEEL: 0.85, NICKEL: 0.6 };
/** Pole force constant, induced-pull constant, close-range smoothing, range and a safety cap (game units). Force ∝ 1/(d² + EPS²). */
export const K_POLE = 4, K_INDUCED = 4, EPS = 0.2, RANGE = 3.2, MAX_FORCE = 120;
export function magnetBehaviour(def) { const b = def?.behaviours.find(x => x.kind === "MAGNET_BAR"); return b?.kind === "MAGNET_BAR" ? b : undefined; }
export function materialOf(def) { const b = def?.behaviours.find(x => x.kind === "MATERIAL"); return b?.kind === "MATERIAL" ? b.material : undefined; }
export function isMagnetic(def) { const m = materialOf(def); return m !== undefined && MAGNETIC_MATERIALS.has(m); }
/** Where a magnet's poles are: N at local +x, S at local −x. */
export function polePositions(x, y, angle, length) {
    const c = Math.cos(angle) * length / 2, s = Math.sin(angle) * length / 2;
    return { n: { x: x + c, y: y + s }, s: { x: x - c, y: y - s } };
}
export class MagnetSystem {
    entries = [];
    starts = new Map();
    states = [];
    pending = [];
    once = new Set();
    held = new Map();
    floatTicks = new Map();
    lastForce = new Map();
    maxSpeed = new Map();
    ticks = 0;
    elapsed = 0;
    /** Physics angle of each moving magnet before the first step (a quarter-turned magnet's body starts at 0). */
    baseAngle = new Map();
    constructor(parts, definition) {
        for (const p of parts) {
            const def = definition(p.definitionId);
            const bar = magnetBehaviour(def);
            const material = materialOf(def);
            if (!bar && !material)
                continue;
            const r = def?.behaviours.find(b => b.kind === "RIGID_BODY");
            const height = r?.kind === "RIGID_BODY" ? r.height : 0.3;
            this.entries.push({ part: p, ...(bar ? { bar } : {}), ...(material ? { material } : {}), height });
            this.starts.set(p.id, { x: p.position.x, y: p.position.y });
        }
    }
    hasMagnets() { return this.entries.some(e => e.bar); }
    get tick() { return this.ticks; }
    /**
     * One tick, in the force phase. `drive(id)` is how hard the circuit drives an electromagnet (signed, 1 ≈ one battery).
     * Forces go to dynamic bodies through the physics world; static magnets never move.
     */
    step(dt, physics, drive) {
        this.elapsed += dt;
        const pose = (e) => { try {
            const s = physics.state(e.part.id);
            const dyn = Number.isFinite(physics.mass(e.part.id));
            if (dyn && !this.baseAngle.has(e.part.id))
                this.baseAngle.set(e.part.id, s.angle);
            return { x: s.x, y: s.y, angle: dyn ? e.part.rotation + s.angle - this.baseAngle.get(e.part.id) : e.part.rotation, dynamic: dyn, vx: s.vx, vy: s.vy };
        }
        catch {
            return { ...this.trackPosition(e), angle: e.part.rotation, dynamic: false, vx: 0, vy: 0 };
        } };
        const poses = new Map(this.entries.map(e => [e.part.id, pose(e)]));
        // Magnet states this tick.
        const prevOn = new Map(this.states.map(s => [s.id, s.on]));
        this.states = this.entries.filter(e => e.bar).map(e => {
            const p = poses.get(e.part.id);
            const k = e.bar.electric ? drive(e.part.id) : 1;
            const strength = e.bar.strength * Math.min(2, Math.abs(k));
            const flip = (k < 0 ? Math.PI : 0) + (e.bar.poleAngle ?? 0);
            const poles = polePositions(p.x, p.y, p.angle + flip, e.bar.length);
            return { id: e.part.id, x: p.x, y: p.y, angle: p.angle + flip, strength, on: strength > 0.05, ...poles, dynamic: p.dynamic };
        });
        for (const m of this.states)
            if (this.entries.find(e => e.part.id === m.id).bar.electric && m.on !== (prevOn.get(m.id) ?? false))
                this.pending.push({ kind: m.on ? "ELECTROMAGNET_ON" : "ELECTROMAGNET_OFF", sourceId: m.id, data: { strength: round(m.strength) } });
        const forces = new Map();
        const add = (id, fx, fy) => { const f = forces.get(id) ?? { x: 0, y: 0 }; f.x += fx; f.y += fy; forces.set(id, f); };
        // Pole on pole: like repel, unlike attract.
        for (let i = 0; i < this.states.length; i++)
            for (let j = i + 1; j < this.states.length; j++) {
                const a = this.states[i], b = this.states[j];
                if (!a.on || !b.on)
                    continue;
                let fx = 0, fy = 0;
                let attract = 0, repel = 0;
                for (const [pa, qa] of [[a.n, 1], [a.s, -1]])
                    for (const [pb, qb] of [[b.n, 1], [b.s, -1]]) {
                        const dx = pb.x - pa.x, dy = pb.y - pa.y, d = Math.hypot(dx, dy);
                        if (d > RANGE)
                            continue;
                        const mag = Math.min(MAX_FORCE, K_POLE * a.strength * b.strength / (d * d + EPS * EPS)) * qa * qb; // + = push b away from a
                        fx += mag * dx / (d || 1);
                        fy += mag * dy / (d || 1);
                        if (qa * qb > 0)
                            repel += Math.abs(mag);
                        else
                            attract += Math.abs(mag);
                    }
                if (fx === 0 && fy === 0)
                    continue;
                add(b.id, fx, fy);
                add(a.id, -fx, -fy);
                const net = Math.hypot(fx, fy);
                const along = (fx * (b.x - a.x) + fy * (b.y - a.y)) / (Math.hypot(b.x - a.x, b.y - a.y) || 1);
                if (net > 0.5) {
                    const kind = along > 0 ? "MAGNET_REPEL" : "MAGNET_ATTRACT";
                    const key = `${kind}:${a.id}|${b.id}`;
                    if (!this.once.has(key)) {
                        this.once.add(key);
                        this.pending.push({ kind, sourceId: a.id, targetId: b.id, data: { force: round(net), poles: facingPoles(a, b) } });
                    }
                }
                void attract;
                void repel;
            }
        // Magnets pull magnetic materials (either pole); everything else is ignored.
        for (const e of this.entries) {
            if (!e.material)
                continue;
            const p = poses.get(e.part.id);
            if (!p.dynamic)
                continue;
            const chi = SUSCEPTIBILITY[e.material] ?? 0;
            for (const m of this.states) {
                if (!m.on || m.id === e.part.id)
                    continue;
                if (chi === 0) {
                    if (Math.hypot(m.x - p.x, m.y - p.y) < 1.6 && !this.once.has(`ignore:${m.id}|${e.part.id}`)) {
                        this.once.add(`ignore:${m.id}|${e.part.id}`);
                        this.pending.push({ kind: "MAGNET_NO_EFFECT", sourceId: m.id, targetId: e.part.id, data: { material: e.material } });
                    }
                    continue;
                }
                let fx = 0, fy = 0;
                for (const pole of [m.n, m.s]) {
                    const dx = pole.x - p.x, dy = pole.y - p.y, d = Math.hypot(dx, dy);
                    if (d > RANGE)
                        continue;
                    const mag = Math.min(MAX_FORCE, K_INDUCED * m.strength * chi / (d * d + EPS * EPS));
                    fx += mag * dx / (d || 1);
                    fy += mag * dy / (d || 1);
                }
                if (fx === 0 && fy === 0)
                    continue;
                add(e.part.id, fx, fy);
                if (m.dynamic)
                    add(m.id, -fx, -fy);
                if (Math.hypot(fx, fy) > 0.8 && !this.once.has(`pull:${m.id}|${e.part.id}`)) {
                    this.once.add(`pull:${m.id}|${e.part.id}`);
                    this.pending.push({ kind: "MAGNET_PULL_MATERIAL", sourceId: m.id, targetId: e.part.id, data: { material: e.material } });
                }
            }
        }
        for (const [id, f] of forces) {
            try {
                physics.applyForce(id, f);
            }
            catch { /* static */ }
            this.lastForce.set(id, { ...f });
        }
        for (const id of [...this.lastForce.keys()])
            if (!forces.has(id))
                this.lastForce.delete(id);
        // Electromagnet hooks hold what they've picked up, and let go when switched off.
        for (const m of this.states) {
            const e = this.entries.find(x => x.part.id === m.id);
            if (!e.bar.electric || m.dynamic)
                continue;
            for (const t of this.entries) {
                if (!t.material || !MAGNETIC_MATERIALS.has(t.material))
                    continue;
                const p = poses.get(t.part.id);
                if (!p.dynamic)
                    continue;
                const holding = this.held.get(t.part.id) === m.id;
                if (m.on && (holding || (Math.abs(p.x - m.x) < 0.5 && p.y > m.y && p.y - m.y < 0.25 + t.height / 2 + 0.25))) {
                    if (!holding) {
                        this.held.set(t.part.id, m.id);
                        this.pending.push({ kind: "MAGNET_HOLD", sourceId: m.id, targetId: t.part.id });
                    }
                    const v = this.trackVelocity(e);
                    physics.setPose(t.part.id, m.x + (holding ? 0 : 0), m.y + 0.25 + t.height / 2);
                    physics.setLinearVelocity(t.part.id, v);
                }
                else if (holding && !m.on) {
                    this.held.delete(t.part.id);
                    this.pending.push({ kind: "MAGNET_RELEASE", sourceId: m.id, targetId: t.part.id });
                }
            }
        }
        this.ticks += 1;
    }
    /** After the physics step: guided things stay on their rod (no sliding or flipping), with a little rod friction. */
    applyGuides(physics) {
        for (const e of this.entries) {
            const gx = Number(e.part.parameters.guideX);
            if (!Number.isFinite(gx))
                continue;
            try {
                const s = physics.state(e.part.id);
                physics.setPose(e.part.id, gx, s.y, this.baseAngle.get(e.part.id) ?? s.angle);
                physics.setLinearVelocity(e.part.id, { x: 0, y: s.vy * 0.97 });
                const f = this.lastForce.get(e.part.id);
                const lifted = (f?.y ?? 0) < -0.5;
                const n = lifted && Math.abs(s.vy) < 0.15 ? (this.floatTicks.get(e.part.id) ?? 0) + 1 : 0;
                this.floatTicks.set(e.part.id, n);
                if (n === 60)
                    this.pending.push({ kind: "MAGNET_FLOATING", sourceId: e.part.id, data: { y: round(s.y) } });
            }
            catch { /* not simulated */ }
        }
        // Rings threaded on the same rod can't pass through each other: keep them in their starting order.
        const rods = new Map();
        for (const e of this.entries) {
            const gx = Number(e.part.parameters.guideX);
            if (Number.isFinite(gx)) {
                const list = rods.get(gx) ?? [];
                list.push(e);
                rods.set(gx, list);
            }
        }
        for (const list of rods.values()) {
            list.sort((p, q) => q.part.position.y - p.part.position.y); // lowest first
            for (let i = 1; i < list.length; i++) {
                const lo = list[i - 1], up = list[i];
                try {
                    const sl = physics.state(lo.part.id), su = physics.state(up.part.id);
                    const limit = sl.y - (lo.height + up.height) / 2;
                    if (su.y > limit) {
                        physics.setPose(up.part.id, su.x, limit);
                        physics.setLinearVelocity(up.part.id, { x: 0, y: Math.min(su.vy, sl.vy) });
                    }
                }
                catch { /* not simulated */ }
            }
        }
        for (const e of this.entries) {
            try {
                const s = physics.state(e.part.id);
                this.maxSpeed.set(e.part.id, Math.max(this.maxSpeed.get(e.part.id) ?? 0, Math.hypot(s.vx, s.vy)));
            }
            catch { /* static */ }
        }
    }
    /** An electromagnet on a crane trolley follows its scripted track (trackFrom → trackTo between trackStart and trackEnd seconds). */
    trackPosition(e) {
        const p = e.part.parameters;
        const from = Number(p.trackFrom), to = Number(p.trackTo), t0 = Number(p.trackStart), t1 = Number(p.trackEnd);
        if (![from, to, t0, t1].every(Number.isFinite))
            return { x: e.part.position.x, y: e.part.position.y };
        const k = Math.max(0, Math.min(1, (this.elapsed - t0) / (t1 - t0)));
        return { x: from + (to - from) * k, y: e.part.position.y };
    }
    trackVelocity(e) {
        const p = e.part.parameters;
        const from = Number(p.trackFrom), to = Number(p.trackTo), t0 = Number(p.trackStart), t1 = Number(p.trackEnd);
        if (![from, to, t0, t1].every(Number.isFinite) || this.elapsed < t0 || this.elapsed > t1)
            return { x: 0, y: 0 };
        return { x: (to - from) / (t1 - t0), y: 0 };
    }
    // ---------------------------------------------------------------- read-only views
    magnets() { return this.states; }
    magnet(id) { return this.states.find(s => s.id === id); }
    force(id) { return this.lastForce.get(id); }
    isHeld(id) { return this.held.has(id); }
    floatingTicks(id) { return this.floatTicks.get(id) ?? 0; }
    startOf(id) { return this.starts.get(id); }
    peakSpeed(id) { return this.maxSpeed.get(id) ?? 0; }
    /** Field direction and strength at a point (for the Magnet Scanner's field view). */
    fieldAt(x, y) {
        let fx = 0, fy = 0;
        for (const m of this.states) {
            if (!m.on)
                continue;
            for (const [p, q] of [[m.n, 1], [m.s, -1]]) {
                const dx = x - p.x, dy = y - p.y, d = Math.max(EPS, Math.hypot(dx, dy));
                if (d > RANGE)
                    continue;
                fx += q * m.strength * dx / (d * d * d);
                fy += q * m.strength * dy / (d * d * d);
            }
        }
        return { x: fx, y: fy };
    }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
function facingPoles(a, b) {
    const na = Math.hypot(a.n.x - b.x, a.n.y - b.y) < Math.hypot(a.s.x - b.x, a.s.y - b.y) ? "N" : "S";
    const nb = Math.hypot(b.n.x - a.x, b.n.y - a.y) < Math.hypot(b.s.x - a.x, b.s.y - a.y) ? "N" : "S";
    return `${na}-${nb}`;
}
function round(v) { return Math.round(v * 1000) / 1000; }
