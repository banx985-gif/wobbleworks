import { gaussSolve } from "../power/CircuitSystem.js";
/**
 * Water Works (M16) — Scientific Truth Contract for water (design §8A).
 *   - Water follows the paths it has, from higher to lower: a pipe network is solved as heads (water "height pressure")
 *     at each joint, and flow goes from high head to low head through each pipe.
 *   - Water can't climb above the height it starts from. A pipe that goes higher than the source stays dry (an air lock).
 *   - Pumps add energy (extra head) so water can be lifted higher — only while they have electricity.
 *   - Valves let water through or stop it. Narrow pipes let less through than wide ones.
 *   - Tanks store a limited quantity; full tanks overflow from the top. Open pipe ends spill.
 *   - Nozzles turn pressure into a jet: more head = faster jet = longer arc. Jets carry a push.
 * Simplified: graph-based pipe flow and pressure; open-water drops and puddles are drawing. Never implied:
 * that the decorative splashes prove real hydraulic laws, or anything about water touching electricity.
 */
export const WATER_TRUTH_CONTRACT = Object.freeze({
    id: "truth.water.v1",
    preserve: ["water follows available paths under gravity", "water cannot rise above its source without a pump", "pumps add energy", "valves restrict flow", "tanks store quantity"],
    simplify: ["graph-based pipe flow", "simplified pressure", "drawn splashes and puddles"],
    neverImply: ["decorative open-water behaviour proves real hydraulic pressure laws", "water and electricity interaction is modelled"]
});
export const FLOOR = 8.4, NODE_EPS = 0.06, G = 9.81;
/** Elevation above the floor (m) of a world y. */
export const elevation = (y) => FLOOR - y;
export function fluidBehaviour(def) { const b = def === null || def === void 0 ? void 0 : def.behaviours.find(x => x.kind === "FLUID"); return (b === null || b === void 0 ? void 0 : b.kind) === "FLUID" ? b : undefined; }
export function pipeBehaviour(def) { const b = def === null || def === void 0 ? void 0 : def.behaviours.find(x => x.kind === "PIPE"); return (b === null || b === void 0 ? void 0 : b.kind) === "PIPE" ? b : undefined; }
export function targetBehaviour(def) { const b = def === null || def === void 0 ? void 0 : def.behaviours.find(x => x.kind === "WATER_TARGET"); return (b === null || b === void 0 ? void 0 : b.kind) === "WATER_TARGET" ? b : undefined; }
export function fluidPorts(part, def) {
    const b = fluidBehaviour(def);
    if (!b)
        return [];
    const c = Math.cos(part.rotation), s = Math.sin(part.rotation);
    // Tanks and sources stay upright (they hold water), so their ports never rotate.
    const upright = b.role === "TANK" || b.role === "SOURCE" || b.role === "WHEEL" || b.role === "DRAIN";
    return b.ports.map(t => upright ? { x: part.position.x + t.x, y: part.position.y + t.y } : { x: part.position.x + t.x * c - t.y * s, y: part.position.y + t.x * s + t.y * c });
}
export function pipeEnds(part, def) {
    var _a;
    const p = pipeBehaviour(def);
    if (!p)
        return undefined;
    const length = Number((_a = part.parameters.length) !== null && _a !== void 0 ? _a : p.length);
    const c = Math.cos(part.rotation), s = Math.sin(part.rotation);
    return { x1: part.position.x - c * length / 2, y1: part.position.y - s * length / 2, x2: part.position.x + c * length / 2, y2: part.position.y + s * length / 2, length };
}
export function analyzeFluid(parts, definition) {
    const pts = [];
    for (const p of parts) {
        const def = definition(p.definitionId);
        if (!def)
            continue;
        const e = pipeEnds(p, def);
        if (e) {
            pts.push({ partId: p.id, index: 0, x: e.x1, y: e.y1, isPipe: true }, { partId: p.id, index: 1, x: e.x2, y: e.y2, isPipe: true });
            continue;
        }
        fluidPorts(p, def).forEach((t, index) => pts.push({ partId: p.id, index, x: t.x, y: t.y, isPipe: false }));
    }
    const parent = pts.map((_, i) => i);
    const find = (i) => { while (parent[i] !== i) {
        parent[i] = parent[parent[i]];
        i = parent[i];
    } return i; };
    for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++)
            if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) <= NODE_EPS) {
                const a = find(i), b = find(j);
                if (a !== b)
                    parent[Math.max(a, b)] = Math.min(a, b);
            }
    const nodeOf = new Map();
    const nodes = [];
    const ports = pts.map((p, i) => { const r = find(i); if (!nodeOf.has(r)) {
        nodeOf.set(r, nodes.length);
        nodes.push({ x: pts[r].x, y: pts[r].y });
    } return { ...p, node: nodeOf.get(r) }; });
    return { nodes, ports };
}
/** Where a dropped pipe end should go: onto the nearest port or other pipe end. Placement help only. */
export function pipeEndSnap(x, y, layout, reach = 0.35) {
    let best;
    for (const t of layout.ports) {
        const d = Math.hypot(t.x - x, t.y - y);
        if (d <= reach && (!best || d < best.d))
            best = { x: t.x, y: t.y, d };
    }
    return best ? { x: best.x, y: best.y } : undefined;
}
const C_PIPE = 2.5, G_VALVE = 2, G_PUMP = 3, G_OUTLET = 1.2, G_NOZZLE = 0.35, PUMP_HEAD = 10;
export class FluidSystem {
    constructor(parts, definition) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        Object.defineProperty(this, "definition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: definition
        });
        Object.defineProperty(this, "layout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "elems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "bounds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "tanks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "targets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "parts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "received", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "open", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "flow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "fillTimes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "heads", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "jets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "spills", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "puddles", {
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
        Object.defineProperty(this, "once", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "elapsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "ticks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "nodeCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "allNodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.layout = analyzeFluid(parts, definition);
        for (const p of parts)
            this.parts.set(p.id, p);
        const L = this.layout;
        const extra = [];
        const newNode = (x, y) => { extra.push({ x, y }); return L.nodes.length + extra.length - 1; };
        const portsOf = (id) => L.ports.filter(p => p.partId === id);
        for (const p of parts) {
            const def = definition(p.definitionId);
            const pipe = pipeBehaviour(def);
            const f = fluidBehaviour(def);
            const t = targetBehaviour(def);
            if (t) {
                const w = Number((_a = p.parameters.width) !== null && _a !== void 0 ? _a : t.width), h = Number((_b = p.parameters.height) !== null && _b !== void 0 ? _b : t.height);
                this.targets.push({ id: p.id, x1: p.position.x - w / 2, x2: p.position.x + w / 2, top: p.position.y - h / 2, bottom: p.position.y + h / 2 });
                this.received.set(p.id, 0);
            }
            const ps = portsOf(p.id);
            if (pipe && ps.length === 2) {
                const len = Math.max(0.2, Number((_c = p.parameters.length) !== null && _c !== void 0 ? _c : pipe.length));
                const g = pipe.conductance * C_PIPE / len;
                if (p.parameters.broken === true) {
                    const e = pipeEnds(p, def);
                    const mx = (e.x1 + e.x2) / 2, my = (e.y1 + e.y2) / 2; // Each side of the break is its own open end: water can pour out of either, but never jumps the gap.
                    const ma = newNode(mx, my), mb = newNode(mx, my);
                    this.elems.push({ id: `${p.id}:a`, kind: "PIPE", a: ps[0].node, b: ma, g: g * 2, partId: p.id }, { id: `${p.id}:b`, kind: "PIPE", a: ps[1].node, b: mb, g: g * 2, partId: p.id });
                    this.bounds.push({ node: ma, head: elevation(my), inOnly: true, outOnly: false, owner: p.id, kind: "SPILL", x: mx, y: my }, { node: mb, head: elevation(my), inOnly: true, outOnly: false, owner: p.id, kind: "SPILL", x: mx, y: my });
                }
                else
                    this.elems.push({ id: p.id, kind: "PIPE", a: ps[0].node, b: ps[1].node, g, partId: p.id });
                continue;
            }
            if (!f || !ps.length)
                continue;
            const port = ps[0];
            if (f.role === "SOURCE")
                this.bounds.push({ node: port.node, head: elevation(port.y) + Number((_e = (_d = p.parameters.head) !== null && _d !== void 0 ? _d : f.head) !== null && _e !== void 0 ? _e : 2), inOnly: false, outOnly: true, owner: p.id, kind: "SOURCE", x: port.x, y: port.y });
            else if (f.role === "TANK") {
                const height = (_f = f.height) !== null && _f !== void 0 ? _f : 1.2, cap = Number((_h = (_g = p.parameters.capacity) !== null && _g !== void 0 ? _g : f.capacity) !== null && _h !== void 0 ? _h : 10), bottomY = p.position.y + height / 2;
                const base = { node: port.node, head: elevation(bottomY), inOnly: false, outOnly: false, owner: p.id, kind: "TANK_BASE", x: port.x, y: port.y };
                this.bounds.push(base);
                const top = ps[1] ? { node: ps[1].node, head: elevation(ps[1].y), inOnly: true, outOnly: false, owner: p.id, kind: "TANK_TOP", x: ps[1].x, y: ps[1].y } : undefined;
                if (top)
                    this.bounds.push(top);
                this.tanks.set(p.id, { volume: Number((_j = p.parameters.startVolume) !== null && _j !== void 0 ? _j : 0), capacity: cap, bottomY, height, baseNode: port.node, ...(top ? { topBoundary: top } : {}), baseBoundary: base, part: p });
            }
            else if (f.role === "VALVE" && ps.length === 2) {
                this.open.set(p.id, p.parameters.open === true);
                this.elems.push({ id: p.id, kind: "VALVE", a: ps[0].node, b: ps[1].node, g: G_VALVE, partId: p.id });
            }
            else if (f.role === "PUMP" && ps.length >= 2)
                this.elems.push({ id: p.id, kind: "PUMP", a: ps[0].node, b: ps[1].node, g: G_PUMP, partId: p.id });
            else if (f.role === "NOZZLE" || f.role === "SPRINKLER" || f.role === "WHEEL" || f.role === "DRAIN") {
                const out = newNode(port.x, port.y);
                this.elems.push({ id: p.id, kind: "OUTLET", a: port.node, b: out, g: f.role === "NOZZLE" ? G_NOZZLE : G_OUTLET, partId: p.id });
                this.bounds.push({ node: out, head: elevation(port.y), inOnly: true, outOnly: false, owner: p.id, kind: f.role, x: port.x, y: port.y });
            }
        }
        // Pipe ends joined to nothing else spill water.
        const count = new Map();
        for (const p of L.ports)
            count.set(p.node, ((_k = count.get(p.node)) !== null && _k !== void 0 ? _k : 0) + 1);
        for (const p of L.ports)
            if (p.isPipe && count.get(p.node) === 1 && !this.bounds.some(b => b.node === p.node))
                this.bounds.push({ node: p.node, head: elevation(p.y), inOnly: true, outOnly: false, owner: p.partId, kind: "SPILL", x: p.x, y: p.y });
        this.nodeCount = L.nodes.length + extra.length;
        this.allNodes = [...L.nodes, ...extra];
    }
    hasWater() { return this.bounds.some(b => b.kind === "SOURCE") || [...this.tanks.values()].some(t => t.volume > 0); }
    /**
     * One tick. `pumpDrive(id)` is how hard the circuit drives a pump (0…2); `gearAngle(id)` turns rotating nozzles;
     * `flips` toggles valves tapped during the TEST.
     */
    step(dt, pumpDrive, gearAngle, flips = new Set()) {
        var _a, _b, _c, _d, _e;
        this.elapsed += dt;
        for (const id of flips)
            if (this.open.has(id)) {
                const now = !this.open.get(id);
                this.open.set(id, now);
                this.pending.push({ kind: "VALVE_CHANGED", sourceId: id, data: { open: now } });
            }
        for (const [id, t] of this.tanks) {
            const level = t.volume / t.capacity * t.height;
            t.baseBoundary.head = elevation(t.bottomY) + level;
            void id;
        }
        // Solve, then block anything that would make water do the impossible (flow out of an outlet, up a dry pipe, back through a pump) and solve again.
        const blockedB = new Set(), blockedE = new Set(), dry = new Set();
        let flows = new Map();
        let bflow = new Map();
        for (let iter = 0; iter < 10; iter++) {
            const res = this.solve(blockedB, blockedE, dry, pumpDrive);
            flows = res.flows;
            bflow = res.bflow;
            this.heads = res.heads;
            let changed = false;
            for (const b of this.bounds) {
                if (blockedB.has(b))
                    continue;
                const q = (_a = bflow.get(b)) !== null && _a !== void 0 ? _a : 0; // + = water entering the network from b
                const tank = b.kind === "TANK_BASE" ? this.tanks.get(b.owner) : undefined;
                if ((b.inOnly && q > 1e-6) || (b.outOnly && q < -1e-6) || (tank && tank.volume <= 1e-6 && q > 1e-6)) {
                    blockedB.add(b);
                    changed = true;
                }
            }
            for (const e of this.elems)
                if (e.kind === "PUMP" && !blockedE.has(e.id) && ((_b = flows.get(e.id)) !== null && _b !== void 0 ? _b : 0) < -1e-6) {
                    blockedE.add(e.id);
                    changed = true;
                }
            // Air locks: water can't rise above the highest water feeding it (source level or tank surface) plus whatever live pumps add.
            const fixed = new Set(this.bounds.filter(b => !blockedB.has(b)).map(b => b.node));
            const supply = Math.max(-Infinity, ...this.bounds.filter(b => { var _a, _b; return !blockedB.has(b) && (b.kind === "SOURCE" || (b.kind === "TANK_BASE" && ((_b = (_a = this.tanks.get(b.owner)) === null || _a === void 0 ? void 0 : _a.volume) !== null && _b !== void 0 ? _b : 0) > 1e-6)); }).map(b => b.head))
                + this.elems.filter(e => e.kind === "PUMP" && !blockedE.has(e.id)).reduce((sum, e) => sum + PUMP_HEAD * Math.max(0, Math.min(2, pumpDrive(e.partId))), 0);
            for (let n = 0; n < this.nodeCount; n++)
                if (!fixed.has(n) && !dry.has(n) && this.touchesFlow(n, flows) && elevation(this.allNodes[n].y) > supply + 0.01) {
                    dry.add(n);
                    changed = true;
                    const src = this.bounds.find(b => b.kind === "SOURCE");
                    if (!this.once.has(`airlock:${n}`)) {
                        this.once.add(`airlock:${n}`);
                        this.pending.push({ kind: "WATER_AIRLOCK", sourceId: (_c = src === null || src === void 0 ? void 0 : src.owner) !== null && _c !== void 0 ? _c : "water", data: { y: round(this.allNodes[n].y) } });
                    }
                }
            if (!changed)
                break;
        }
        this.flow.clear();
        for (const [k, v] of flows)
            this.flow.set(k, v);
        // Tanks, outlets and spills.
        this.jets = [];
        this.spills = [];
        for (const b of this.bounds) {
            const q = blockedB.has(b) ? 0 : ((_d = bflow.get(b)) !== null && _d !== void 0 ? _d : 0);
            const out = -q; // water leaving the network into b
            if (b.kind === "TANK_BASE" || b.kind === "TANK_TOP") {
                const t = this.tanks.get(b.owner);
                const before = t.volume;
                t.volume = Math.max(0, t.volume + (b.kind === "TANK_BASE" ? -q : out) * dt);
                if (t.volume > t.capacity) {
                    const over = t.volume - t.capacity;
                    t.volume = t.capacity;
                    this.spills.push({ x: t.part.position.x, y: t.bottomY - t.height, flow: over / dt, id: b.owner });
                    this.deposit(t.part.position.x, t.bottomY - t.height, over);
                }
                this.trackFill(b.owner, before, t.volume, t.capacity);
                continue;
            }
            if (b.kind === "SOURCE" && q > 0.02 && !this.once.has(`flow:${b.owner}`)) {
                this.once.add(`flow:${b.owner}`);
                this.pending.push({ kind: "WATER_FLOWING", sourceId: b.owner, data: { flow: round(q) } });
            }
            if (out <= 1e-5)
                continue;
            if (b.kind === "DRAIN") {
                this.addReceived(b.owner, out * dt);
                continue;
            }
            if (b.kind === "SPILL") {
                this.spills.push({ x: b.x, y: b.y, flow: out, id: b.owner });
                this.deposit(b.x, b.y, out * dt);
                if (!this.once.has(`spill:${b.owner}`)) {
                    this.once.add(`spill:${b.owner}`);
                    this.pending.push({ kind: "WATER_SPILL", sourceId: b.owner, data: { x: round(b.x) } });
                }
                continue;
            }
            if (b.kind === "SPRINKLER") {
                for (const dx of [-0.6, 0, 0.6])
                    this.deposit(b.x + dx, b.y + 0.2, out * dt / 3);
                this.jets.push({ id: b.owner, points: [{ x: b.x - 0.6, y: b.y + 0.4 }, { x: b.x, y: b.y + 0.3 }, { x: b.x + 0.6, y: b.y + 0.4 }], flow: out, speed: 1 });
                continue;
            }
            if (b.kind === "WHEEL") {
                this.deposit(b.x, b.y + 0.9, out * dt);
                if (!this.once.has(`wheel:${b.owner}`) && out > 0.05) {
                    this.once.add(`wheel:${b.owner}`);
                    this.pending.push({ kind: "WATER_DROVE_WHEEL", sourceId: "water", targetId: b.owner, data: { flow: round(out) } });
                }
                continue;
            }
            if (b.kind === "NOZZLE")
                this.spray(b, out, gearAngle, dt);
        }
        for (const e of this.elems)
            if (e.kind === "PUMP" && ((_e = this.flow.get(e.id)) !== null && _e !== void 0 ? _e : 0) > 0.05 && pumpDrive(e.partId) > 0.1 && !this.once.has(`pump:${e.id}`)) {
                this.once.add(`pump:${e.id}`);
                this.pending.push({ kind: "PUMP_LIFT", sourceId: e.partId, data: { flow: round(this.flow.get(e.id)) } });
            }
        this.ticks += 1;
    }
    touchesFlow(n, flows) { return this.elems.some(e => { var _a; return (e.a === n || e.b === n) && Math.abs((_a = flows.get(e.id)) !== null && _a !== void 0 ? _a : 0) > 1e-5; }); }
    /** Nodal heads with fixed-head boundaries. Returns element flows (a→b) and how much enters the network at each boundary. */
    solve(blockedB, blockedE, dry, pumpDrive) {
        const n = this.nodeCount;
        const fixed = new Map();
        for (const b of this.bounds)
            if (!blockedB.has(b))
                fixed.set(b.node, b.head);
        const live = (e) => !blockedE.has(e.id) && !dry.has(e.a) && !dry.has(e.b) && (e.kind !== "VALVE" || this.open.get(e.partId) === true);
        const A = Array.from({ length: n }, () => new Array(n).fill(0));
        const z = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            if (fixed.has(i)) {
                A[i][i] = 1;
                z[i] = fixed.get(i);
            }
            else
                A[i][i] += 1e-9;
        }
        for (const e of this.elems) {
            if (!live(e))
                continue;
            const gain = e.kind === "PUMP" ? PUMP_HEAD * Math.max(0, Math.min(2, pumpDrive(e.partId))) : 0;
            for (const [i, j, sign] of [[e.a, e.b, 1], [e.b, e.a, -1]]) {
                if (fixed.has(i))
                    continue;
                A[i][i] += e.g;
                A[i][j] -= e.g;
                z[i] -= sign * e.g * gain;
            }
        }
        const heads = gaussSolve(A, z);
        const flows = new Map();
        const bflow = new Map();
        const net = new Array(n).fill(0);
        for (const e of this.elems) {
            const gain = e.kind === "PUMP" ? PUMP_HEAD * Math.max(0, Math.min(2, pumpDrive(e.partId))) : 0;
            const q = live(e) ? e.g * (heads[e.a] - heads[e.b] + gain) : 0;
            flows.set(e.id, q);
            net[e.a] -= q;
            net[e.b] += q;
        }
        for (const b of this.bounds)
            if (!blockedB.has(b))
                bflow.set(b, -net[b.node]); // what the boundary must supply to balance its node
        return { heads, flows, bflow };
    }
    /** A nozzle jet: speed from the pressure left at the nozzle, flown as an arc until it hits a target or the floor. */
    spray(b, flow, gearAngle, dt) {
        var _a;
        const elem = this.elems.find(e => e.id === b.owner);
        const pressure = Math.max(0, this.heads[elem.a] - elevation(b.y));
        const speed = Math.min(9, Math.sqrt(2 * G * pressure));
        const part = this.partOf(b.owner);
        const angle = ((_a = part === null || part === void 0 ? void 0 : part.rotation) !== null && _a !== void 0 ? _a : 0) + gearAngle(b.owner);
        const pts = [];
        let x = b.x + Math.cos(angle) * 0.3, y = b.y + Math.sin(angle) * 0.3, vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;
        let hit;
        for (let k = 0; k < 240; k++) {
            pts.push({ x, y });
            const h = 1 / 60;
            x += vx * h;
            y += vy * h;
            vy += G * h;
            const t = this.targets.find(q => x >= q.x1 && x <= q.x2 && y >= q.top && y <= q.bottom);
            if (t) {
                hit = t.id;
                break;
            }
            if (y >= FLOOR || x < 0 || x > 16)
                break;
        }
        pts.push({ x, y });
        if (hit) {
            this.addReceived(hit, flow * dt);
            if (!this.once.has(`hit:${b.owner}|${hit}`)) {
                this.once.add(`hit:${b.owner}|${hit}`);
                this.pending.push({ kind: "NOZZLE_HIT", sourceId: b.owner, targetId: hit, data: { speed: round(speed) } });
            }
        }
        else
            this.deposit(x, Math.min(y, FLOOR), flow * dt);
        this.jets.push({ id: b.owner, points: pts, flow, speed, ...(hit ? { hitTarget: hit } : {}) });
    }
    partOf(id) { return this.parts.get(id); }
    /** Water falling from (x, y) lands on the first target below it, else on the floor (a puddle). */
    deposit(x, y, amount) {
        var _a;
        const t = this.targets.filter(q => x >= q.x1 && x <= q.x2 && q.bottom >= y - 0.05).sort((p, q) => p.top - q.top)[0];
        if (t)
            this.addReceived(t.id, amount);
        else {
            const k = Math.round(x * 2) / 2;
            this.puddles.set(k, ((_a = this.puddles.get(k)) !== null && _a !== void 0 ? _a : 0) + amount);
        }
    }
    addReceived(id, amount) {
        var _a;
        const before = (_a = this.received.get(id)) !== null && _a !== void 0 ? _a : 0;
        this.received.set(id, before + amount);
        if (before === 0 && amount > 0)
            this.pending.push({ kind: "WATER_TARGET_WET", sourceId: "water", targetId: id });
    }
    trackFill(id, before, after, cap) {
        var _a;
        const m = (_a = this.fillTimes.get(id)) !== null && _a !== void 0 ? _a : new Map();
        this.fillTimes.set(id, m);
        for (const f of [0.25, 0.5, 0.75, 0.95])
            if (before < f * cap && after >= f * cap && !m.has(f)) {
                m.set(f, this.elapsed);
                if (f === 0.95)
                    this.pending.push({ kind: "TANK_FILLED", sourceId: id, data: { seconds: round(this.elapsed) } });
            }
        if (before <= 0 && after > 0 && !this.once.has(`tank:${id}`)) {
            this.once.add(`tank:${id}`);
            this.pending.push({ kind: "TANK_STARTED", sourceId: id });
        }
    }
    // ---------------------------------------------------------------- read-only views
    tank(id) { const t = this.tanks.get(id); return t ? { id, volume: t.volume, capacity: t.capacity, fraction: t.volume / t.capacity, bottomY: t.bottomY, height: t.height } : undefined; }
    tankStates() { return [...this.tanks.keys()].map(id => this.tank(id)); }
    /** Seconds when a tank first reached a fill fraction (0.25, 0.5, 0.75 or 0.95). */
    fillTime(id, fraction) { var _a; return (_a = this.fillTimes.get(id)) === null || _a === void 0 ? void 0 : _a.get(fraction); }
    received_(id) { var _a; return (_a = this.received.get(id)) !== null && _a !== void 0 ? _a : 0; }
    waterReceived(id) { var _a; return (_a = this.received.get(id)) !== null && _a !== void 0 ? _a : 0; }
    flowThrough(id) { var _a; return (_a = this.flow.get(id)) !== null && _a !== void 0 ? _a : [...this.flow.entries()].filter(([k]) => k.startsWith(`${id}:`)).reduce((s, [, v]) => s + Math.abs(v), 0); }
    isOpen(id) { return this.open.get(id) === true; }
    jetStates() { return this.jets; }
    spillStates() { return this.spills; }
    puddleStates() { return [...this.puddles.entries()].map(([x, amount]) => ({ x, amount })); }
    totalSpilled() { let t = 0; for (const v of this.puddles.values())
        t += v; return t; }
    /** Pressure head (m) at a pipe joint: how high the water there could rise. */
    headAt(node) { var _a; return (_a = this.heads[node]) !== null && _a !== void 0 ? _a : 0; }
    /** How hard the water over a wheel drives it (1 ≈ a good steady flow). */
    wheelDrive(id) { var _a; const q = (_a = this.flow.get(id)) !== null && _a !== void 0 ? _a : 0; return q < 0.03 ? 0 : Math.min(2, q / 0.5); }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
function round(v) { return Math.round(v * 1000) / 1000; }
