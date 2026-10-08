/**
 * Gear Garage rotation solver (M12).
 *
 * Gear lock (design §"Gear lock"): visible teeth are art; meshing is a stable constrained rotational
 * relationship, never tooth-to-tooth collision. This solver is kinematic and deterministic:
 *   - parts whose centres sit on the same spot share an AXLE (compound gears, gear-on-shaft)
 *   - two toothed gears whose rims touch (centre distance = r1 + r2) MESH: ω₂ = −ω₁·r₁/r₂ (direction flips)
 *   - belt pulleys pair with their nearest pulley: ω₂ = +ω₁·r₁/r₂ (same direction)
 *   - turning force goes the other way: τ₂ = τ₁·r₂/r₁ × efficiency, so power out ≤ power in
 *   - a loop that asks one axle to turn two ways at once JAMS; a load needing more turning force
 *     than the driver can give STALLS. Neither ever "makes power from nothing".
 */
export const GEAR_TRUTH_CONTRACT = Object.freeze({
    id: "truth.gears.v1",
    preserve: ["meshing reverses direction", "ratio changes relative angular speed and turning effect", "linked rotation", "belts keep direction", "power out never exceeds power in"],
    simplify: ["constrained gear relationship instead of tooth collision", "steady speeds with no spin-up", "one efficiency value per link"],
    neverImply: ["large gears simply make more power from nothing"]
});
export const MESH_TOLERANCE = 0.09;
export const AXLE_TOLERANCE = 0.12;
export const LINK_EFFICIENCY = 0.97;
const BELT_REACH = 9;
export function gearNodeFrom(part, def) {
    const g = def.behaviours.find(b => b.kind === "GEAR");
    if (!g || g.kind !== "GEAR")
        return undefined;
    const d = def.behaviours.find(b => b.kind === "GEAR_DRIVER");
    const o = def.behaviours.find(b => b.kind === "GEAR_OUTPUT");
    const dir = Number(part.parameters.direction ?? 1) < 0 ? -1 : 1;
    return {
        id: part.id, definitionId: part.definitionId, x: part.position.x, y: part.position.y, role: g.role, radius: g.radius, teeth: g.teeth, parameters: part.parameters,
        ...(d?.kind === "GEAR_DRIVER" ? { driver: { kind: d.driver, speed: d.speed * dir, torque: d.torque, ...(d.electric ? { electric: true } : {}), ...(d.hydraulic ? { hydraulic: true } : {}) } } : {}),
        ...(o?.kind === "GEAR_OUTPUT" ? { output: { kind: o.output, load: Number(part.parameters.load ?? o.load), drum: o.drum ?? g.radius } } : {})
    };
}
/** Geometry → axles, meshes, belts. Pure; used both in BUILD mode (help drawing) and at TEST start. */
export function analyzeGears(parts, definition, connections = []) {
    const nodes = [];
    for (const p of parts) {
        const def = definition(p.definitionId);
        const n = def ? gearNodeFrom(p, def) : undefined;
        if (n)
            nodes.push(n);
    }
    // Axles: union-find on centres that coincide.
    const parent = nodes.map((_, i) => i);
    const find = (i) => parent[i] === i ? i : (parent[i] = find(parent[i]));
    for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++)
            if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) <= AXLE_TOLERANCE)
                parent[find(i)] = find(j);
    const roots = [...new Set(nodes.map((_, i) => find(i)))].sort((a, b) => a - b);
    const axleOf = new Map(nodes.map((n, i) => [n.id, roots.indexOf(find(i))]));
    const links = [];
    const clashes = [];
    const nearMisses = [];
    // A GEAR connection records which pair the child snapped together. Stacked (compound) gears on two axles can
    // touch in two places at once; in a real machine only the pair in the same layer meshes, so each pair of axles
    // gets ONE mesh: the snapped pair if there is one, otherwise the first pair in a fixed order.
    const snapped = new Set(connections.filter(c => c.config.kind === "ROTATIONAL" && c.config.relationship === "GEAR").flatMap(c => [pairKey(c.fromPartId, c.toPartId), pairKey(c.toPartId, c.fromPartId)]));
    const byAxles = new Map();
    for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            if (a.role !== "GEAR" || b.role !== "GEAR" || axleOf.get(a.id) === axleOf.get(b.id))
                continue;
            const d = Math.hypot(a.x - b.x, a.y - b.y), touch = a.radius + b.radius;
            if (Math.abs(d - touch) <= MESH_TOLERANCE) {
                const key = [axleOf.get(a.id), axleOf.get(b.id)].sort((p, q) => p - q).join(":");
                byAxles.set(key, [...(byAxles.get(key) ?? []), { kind: "MESH", a: a.id, b: b.id, ratio: -a.radius / b.radius }]);
            }
            else if (d < touch - MESH_TOLERANCE)
                clashes.push({ a: a.id, b: b.id });
            else if (d - touch < 0.6)
                nearMisses.push({ a: a.id, b: b.id, gap: d - touch });
        }
    for (const candidates of byAxles.values()) {
        const pick = candidates.find(l => snapped.has(pairKey(l.a, l.b))) ?? [...candidates].sort((p, q) => pairKey(p.a, p.b).localeCompare(pairKey(q.a, q.b)))[0];
        links.push(pick);
    }
    // Belts: greedy nearest pairs of pulleys on different axles.
    const pulleys = nodes.filter(n => n.role === "PULLEY");
    const pairs = [];
    for (let i = 0; i < pulleys.length; i++)
        for (let j = i + 1; j < pulleys.length; j++) {
            const a = pulleys[i], b = pulleys[j];
            if (axleOf.get(a.id) === axleOf.get(b.id))
                continue;
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d <= BELT_REACH)
                pairs.push({ a, b, d });
        }
    pairs.sort((p, q) => p.d - q.d || p.a.id.localeCompare(q.a.id));
    const belted = new Set();
    for (const p of pairs) {
        if (belted.has(p.a.id) || belted.has(p.b.id))
            continue;
        belted.add(p.a.id);
        belted.add(p.b.id);
        links.push({ kind: "BELT", a: p.a.id, b: p.b.id, ratio: p.a.radius / p.b.radius });
    }
    // Explicit rotational connections from the build still count.
    const ids = new Set(nodes.map(n => n.id));
    for (const c of connections)
        if (c.config.kind === "ROTATIONAL" && c.config.relationship !== "GEAR" && ids.has(c.fromPartId) && ids.has(c.toPartId))
            links.push({ kind: "LINK", a: c.fromPartId, b: c.toPartId, ratio: c.config.ratio * (c.config.invertDirection ? -1 : 1) });
    return { nodes, axleOf, links, clashes, nearMisses };
}
/** One TEST run of a gear network. Deterministic: the same build gives the same result every time. */
export class GearSystem {
    analysis;
    trains = [];
    angle = new Map();
    runTicks = new Map();
    held = new Set();
    extraLoad = new Map();
    /** Electric motors (Power Lab): how hard the circuit drives each one (0 = no current, ±1 ≈ one battery, sign = direction). */
    driveScale = new Map();
    announcedTrains = new Map();
    pending = [];
    tick = 0;
    constructor(parts, definition, connections = [], extraLoads = new Map()) {
        this.analysis = analyzeGears(parts, definition, connections);
        for (const n of this.analysis.nodes) {
            this.angle.set(n.id, 0);
            this.runTicks.set(n.id, 0);
            if (n.driver?.electric || n.driver?.hydraulic)
                this.driveScale.set(n.id, 0);
        }
        for (const [id, load] of extraLoads)
            this.extraLoad.set(id, load);
        this.solve();
    }
    get nodes() { return this.analysis.nodes; }
    node(id) { return this.analysis.nodes.find(n => n.id === id); }
    solve() {
        const { nodes, axleOf, links } = this.analysis;
        const axleCount = new Set(axleOf.values()).size;
        const adj = new Map();
        for (let i = 0; i < axleCount; i++)
            adj.set(i, []);
        for (const l of links) {
            const a = axleOf.get(l.a), b = axleOf.get(l.b);
            adj.get(a).push({ to: b, ratio: l.ratio });
            adj.get(b).push({ to: a, ratio: 1 / l.ratio });
        }
        const seen = new Set();
        this.trains.length = 0;
        for (let start = 0; start < axleCount; start++) {
            if (seen.has(start))
                continue;
            const axles = new Set();
            const queue = [start];
            seen.add(start);
            while (queue.length) {
                const a = queue.shift();
                axles.add(a);
                for (const e of adj.get(a))
                    if (!seen.has(e.to)) {
                        seen.add(e.to);
                        queue.push(e.to);
                    }
            }
            const train = { axles, status: "IDLE", factors: new Map(), depths: new Map(), required: 0, available: 0 };
            const members = nodes.filter(n => axles.has(axleOf.get(n.id)));
            const drivers = members.filter(n => n.driver).sort((p, q) => p.id.localeCompare(q.id));
            if (!drivers.length) {
                this.trains.push(train);
                continue;
            }
            const driver = drivers[0];
            train.driverId = driver.id;
            const root = axleOf.get(driver.id);
            train.factors.set(root, 1);
            train.depths.set(root, 0);
            const q = [root];
            while (q.length && train.status !== "JAMMED") {
                const a = q.shift();
                const fa = train.factors.get(a);
                for (const e of adj.get(a)) {
                    const want = fa * e.ratio;
                    const have = train.factors.get(e.to);
                    if (have === undefined) {
                        train.factors.set(e.to, want);
                        train.depths.set(e.to, train.depths.get(a) + 1);
                        q.push(e.to);
                    }
                    else if (Math.abs(have - want) > 1e-6 * Math.max(1, Math.abs(want))) {
                        train.status = "JAMMED";
                        train.reason = "LOOP";
                        break;
                    }
                }
            }
            // Two drivers must agree exactly, or they fight each other.
            if (train.status !== "JAMMED")
                for (const other of drivers.slice(1)) {
                    const f = train.factors.get(axleOf.get(other.id));
                    if (Math.abs(f * driver.driver.speed - other.driver.speed) > 1e-6) {
                        train.status = "JAMMED";
                        train.reason = "FIGHT";
                    }
                }
            if (train.status === "JAMMED") {
                this.trains.push(train);
                continue;
            }
            // Turning force: every load reflected back to the driver through the ratios (and a little friction).
            train.available = driver.driver.torque;
            for (const n of members)
                if (n.output) {
                    const ax = axleOf.get(n.id);
                    const load = n.output.load + (this.extraLoad.get(n.id) ?? 0);
                    train.required += load * Math.abs(train.factors.get(ax)) / Math.pow(LINK_EFFICIENCY, train.depths.get(ax));
                }
            train.status = train.required > train.available + 1e-9 ? "STALLED" : "TURNING";
            this.trains.push(train);
        }
    }
    trainOf(id) { const ax = this.analysis.axleOf.get(id); return ax === undefined ? undefined : this.trains.find(t => t.axles.has(ax)); }
    /** Drive scale of a train's driver: 1 for cranks and ordinary motors; whatever the circuit gives an electric motor. */
    scaleOf(t) { return t.driverId ? this.driveScale.get(t.driverId) ?? 1 : 0; }
    /** Status right now: an electric motor with no current is idle; a weak current can't turn a heavy load (stall). */
    effective(t) {
        if (t.status === "JAMMED" || t.status === "IDLE" || !t.driverId)
            return t.status;
        const s = this.scaleOf(t);
        if (s === 0)
            return "IDLE";
        return t.required > t.available * Math.abs(s) + 1e-9 ? "STALLED" : "TURNING";
    }
    status(id) { const t = this.trainOf(id); if (!t)
        return "IDLE"; const e = this.effective(t); return e === "TURNING" && t.driverId && this.held.has(t.driverId) ? "HELD" : e; }
    /** Power Lab: set how hard the circuit drives an electric motor (no effect on cranks or ordinary motors). */
    setDriveScale(driverId, scale) { if (this.driveScale.has(driverId))
        this.driveScale.set(driverId, scale); }
    isElectric(id) { return this.driveScale.has(id) && this.node(id)?.driver?.electric === true; }
    /** Water Works: a water wheel driven by the flow over it. */
    isHydraulic(id) { return this.driveScale.has(id) && this.node(id)?.driver?.hydraulic === true; }
    trainInfo(id) {
        const t = this.trainOf(id);
        if (!t)
            return undefined;
        return { status: this.status(id), ...(t.reason ? { reason: t.reason } : {}), required: t.required, available: t.available * Math.abs(this.driveScale.has(t.driverId ?? "") ? this.scaleOf(t) : 1), ...(t.driverId ? { driverId: t.driverId } : {}) };
    }
    /** ω (rad/s, + = clockwise on screen) right now. */
    omega(id) {
        const t = this.trainOf(id);
        if (!t || this.status(id) !== "TURNING")
            return 0;
        const driver = this.node(t.driverId);
        return (t.factors.get(this.analysis.axleOf.get(id)) ?? 0) * driver.driver.speed * this.scaleOf(t);
    }
    state(id) {
        const n = this.node(id);
        if (!n)
            return undefined;
        const t = this.trainOf(id);
        const ax = this.analysis.axleOf.get(id);
        const factor = t.factors.get(ax) ?? 0, depth = t.depths.get(ax) ?? 0;
        const driver = t.driverId ? this.node(t.driverId) : undefined;
        const torque = driver?.driver && factor ? driver.driver.torque * Math.abs(this.scaleOf(t)) / Math.abs(factor) * Math.pow(LINK_EFFICIENCY, depth) : 0;
        const angle = this.angle.get(id);
        return { id, angle, omega: this.omega(id), factor, depth, torque, turns: Math.abs(angle) / (Math.PI * 2), runTicks: this.runTicks.get(id) };
    }
    states() { return this.analysis.nodes.map(n => this.state(n.id)); }
    /** Stop a train (e.g. a winch has wound its rope all the way). Placement-free: it simply can't turn further. */
    hold(outputId) { const t = this.trainOf(outputId); if (t?.driverId && !this.held.has(t.driverId)) {
        this.held.add(t.driverId);
        this.pending.push({ kind: "GEAR_HELD", sourceId: outputId });
    } }
    step(dt) {
        this.announce();
        for (const n of this.analysis.nodes) {
            const w = this.omega(n.id);
            const before = this.angle.get(n.id);
            const after = before + w * dt;
            this.angle.set(n.id, after);
            this.runTicks.set(n.id, w !== 0 ? this.runTicks.get(n.id) + 1 : 0);
            if (n.output && Math.floor(Math.abs(after) / (Math.PI * 2)) > Math.floor(Math.abs(before) / (Math.PI * 2)))
                this.pending.push({ kind: "OUTPUT_TURN", sourceId: n.id, data: { turns: Math.floor(Math.abs(after) / (Math.PI * 2)), direction: w > 0 ? "CW" : "CCW" } });
        }
        this.tick += 1;
    }
    /** Each train's news is told once, the first tick it happens (straight away for cranks; when the current arrives for electric motors). */
    announce() {
        for (const t of this.trains) {
            if (!t.driverId)
                continue;
            const status = this.effective(t);
            if (status === "IDLE")
                continue;
            const told = this.announcedTrains.get(t) ?? new Set();
            if (told.has(status))
                continue;
            told.add(status);
            this.announcedTrains.set(t, told);
            if (status === "JAMMED") {
                this.pending.push({ kind: "GEAR_JAMMED", sourceId: t.driverId, data: { reason: t.reason ?? "LOOP" } });
                continue;
            }
            if (status === "STALLED") {
                this.pending.push({ kind: "GEAR_STALLED", sourceId: t.driverId, data: { required: round(t.required), available: round(t.available * Math.abs(this.scaleOf(t))) } });
                continue;
            }
            if (status !== "TURNING")
                continue;
            this.pending.push({ kind: "GEAR_TRAIN_RUNNING", sourceId: t.driverId, data: { axles: t.axles.size } });
            for (const l of this.analysis.links) {
                const ax = this.analysis.axleOf.get(l.a);
                if (!t.axles.has(ax))
                    continue;
                this.pending.push({ kind: l.kind === "MESH" ? "GEAR_MESH" : l.kind === "BELT" ? "BELT_DRIVE" : "ROTATION_LINK", sourceId: l.a, targetId: l.b, data: { ratio: round(l.ratio), reversed: l.ratio < 0 } });
            }
        }
    }
    /** Events since the last call (RuntimeWorld records them as causal events). */
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
function pairKey(a, b) { return `${a}|${b}`; }
function round(v) { return Math.round(v * 1000) / 1000; }
// ------------------------------------------------------------------ placement help (BUILD mode only)
/**
 * Where a dropped gear should sit: on a shaft/gear centre it shares that axle; next to a toothed gear it slides
 * to exactly touching so the teeth mesh. Placement help only — the same spots can be reached by hand.
 */
export function gearSnapPosition(moving, others, reach = 0.45) {
    let best;
    for (const o of others) {
        if (o.id === moving.id)
            continue;
        const dx = moving.x - o.x, dy = moving.y - o.y, d = Math.hypot(dx, dy);
        if (d <= Math.max(0.3, o.role === "SHAFT" ? 0.45 : 0.25)) {
            const score = d;
            if (!best || score < best.score)
                best = { x: o.x, y: o.y, kind: "AXLE", score, targetId: o.id };
            continue;
        }
        if (moving.role !== "GEAR" || o.role !== "GEAR")
            continue;
        const touch = moving.radius + o.radius;
        if (Math.abs(d - touch) > reach || d === 0)
            continue;
        const score = Math.abs(d - touch) + 0.3;
        if (!best || score < best.score)
            best = { x: o.x + dx / d * touch, y: o.y + dy / d * touch, kind: "MESH", score, targetId: o.id };
    }
    return best ? { x: best.x, y: best.y, kind: best.kind, targetId: best.targetId } : undefined;
}
