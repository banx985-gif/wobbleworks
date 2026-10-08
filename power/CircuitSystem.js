/**
 * Power Lab (M14) — Scientific Truth Contract for electricity (design §8A).
 *
 * The CircuitSystem is a small, low-voltage DC network solved by nodal analysis every tick:
 *   - Only the two ENDS of a wire connect. Wire ends and component terminals that meet (after snapping) share a node.
 *   - Batteries push current round a COMPLETE loop (source → path → load → back). A load in a broken loop gets nothing.
 *   - Loads share the push in series (each gets less) and each get the full push on parallel branches (the battery works harder).
 *   - Electricity takes the easiest path: a plain wire across a load carries the current around it (a bypass / short).
 *   - Switches and buttons open or close the loop. Two batteries in series push twice as hard.
 *   - Batteries store a limited amount of energy; every load uses some each second. Overloaded power stations switch off.
 * Not modelled (and never implied): shocks, sparks, heat damage, or anything to do with water touching electricity.
 */
export const ELECTRICITY_TRUTH_CONTRACT = Object.freeze({
    id: "truth.electricity.v1",
    preserve: ["a circuit needs a complete path", "source, load and switch relationships", "series and parallel", "electricity takes the easiest path", "batteries store limited energy"],
    simplify: ["low-voltage abstract network", "steady current with no spin-up", "ideal wires with a tiny resistance", "no dangerous shock model"],
    neverImply: ["disconnected wires can power loads", "water and electricity interaction is modelled"]
});
/** Reference push of one ordinary battery (volts) and how close two points must be to be the same connection (m). */
export const ONE_BATTERY_VOLTS = 3;
export const NODE_EPSILON = 0.06;
const GMIN = 1e-9;
/** Load level thresholds (1 ≈ one battery straight across the load). */
export const LEVEL_ON = 0.15;
export const LEVEL_BRIGHT = 0.6;
export function circuitBehaviour(def) { const b = def?.behaviours.find(x => x.kind === "CIRCUIT"); return b?.kind === "CIRCUIT" ? b : undefined; }
export function wireBehaviour(def) { const b = def?.behaviours.find(x => x.kind === "WIRE"); return b?.kind === "WIRE" ? b : undefined; }
/** World positions of a component's terminals (rotation applied). */
export function circuitTerminals(part, def) {
    const b = circuitBehaviour(def);
    if (!b)
        return [];
    const c = Math.cos(part.rotation), s = Math.sin(part.rotation);
    return b.terminals.map(t => ({ x: part.position.x + t.x * c - t.y * s, y: part.position.y + t.x * s + t.y * c }));
}
/** A wire's two end points. */
export function wireEnds(part, def) {
    const w = wireBehaviour(def);
    if (!w)
        return undefined;
    const length = Number(part.parameters.length ?? w.length);
    const c = Math.cos(part.rotation), s = Math.sin(part.rotation);
    return { x1: part.position.x - c * length / 2, y1: part.position.y - s * length / 2, x2: part.position.x + c * length / 2, y2: part.position.y + s * length / 2, length };
}
/** Geometry → nodes and elements. Pure; used in BUILD mode too (terminal dots). */
export function analyzeCircuit(parts, definition) {
    const points = [];
    for (const p of parts) {
        const def = definition(p.definitionId);
        if (!def)
            continue;
        const ends = wireEnds(p, def);
        if (ends) {
            points.push({ partId: p.id, index: 0, x: ends.x1, y: ends.y1, isWire: true }, { partId: p.id, index: 1, x: ends.x2, y: ends.y2, isWire: true });
            continue;
        }
        circuitTerminals(p, def).forEach((t, index) => points.push({ partId: p.id, index, x: t.x, y: t.y, isWire: false }));
    }
    // Union points that meet.
    const parent = points.map((_, i) => i);
    const find = (i) => { while (parent[i] !== i) {
        parent[i] = parent[parent[i]];
        i = parent[i];
    } return i; };
    for (let i = 0; i < points.length; i++)
        for (let j = i + 1; j < points.length; j++) {
            if (Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y) <= NODE_EPSILON) {
                const a = find(i), b = find(j);
                if (a !== b)
                    parent[Math.max(a, b)] = Math.min(a, b);
            }
        }
    const nodeOf = new Map();
    const nodes = [];
    const terminals = points.map((pt, i) => {
        const root = find(i);
        if (!nodeOf.has(root)) {
            nodeOf.set(root, nodes.length);
            nodes.push({ x: points[root].x, y: points[root].y });
        }
        return { ...pt, node: nodeOf.get(root) };
    });
    const elements = [];
    for (const p of parts) {
        const def = definition(p.definitionId);
        if (!def)
            continue;
        const ts = terminals.filter(t => t.partId === p.id);
        if (ts.length !== 2)
            continue;
        const w = wireBehaviour(def);
        const c = circuitBehaviour(def);
        const base = { partId: p.id, a: ts[0].node, b: ts[1].node, broken: p.parameters.broken === true };
        if (w) {
            elements.push({ ...base, kind: "WIRE", ohms: w.ohms, volts: 0, capacity: 0, maxPower: Infinity });
            continue;
        }
        if (!c || c.role === "JUNCTION")
            continue;
        if (c.role === "BATTERY")
            elements.push({ ...base, kind: "BATTERY", ohms: c.ohms ?? 0.5, volts: Number(p.parameters.volts ?? c.volts ?? ONE_BATTERY_VOLTS), capacity: Number(p.parameters.capacity ?? c.capacity ?? 400), maxPower: Number(p.parameters.maxPower ?? c.maxPower ?? Infinity) });
        else if (c.role === "SWITCH" || c.role === "BUTTON")
            elements.push({ ...base, kind: c.role, ohms: 0.01, volts: 0, capacity: 0, maxPower: Infinity });
        else
            elements.push({ ...base, kind: "LOAD", ohms: Number(p.parameters.ohms ?? c.ohms ?? 6), volts: 0, capacity: 0, maxPower: Infinity, ...(c.load ? { load: c.load } : {}) });
    }
    return { nodes, terminals, elements };
}
/** Where a dropped wire end should go: onto the nearest terminal or other wire end. Placement help only. */
export function wireEndSnap(x, y, layout, ignorePart, reach = 0.35) {
    let best;
    for (const t of layout.terminals) {
        if (t.partId === ignorePart)
            continue;
        const d = Math.hypot(t.x - x, t.y - y);
        if (d <= reach && (!best || d < best.d))
            best = { x: t.x, y: t.y, d };
    }
    return best ? { x: best.x, y: best.y } : undefined;
}
export class CircuitSystem {
    layout;
    charge = new Map();
    energy = new Map();
    tripped = new Set();
    overTicks = new Map();
    elementCurrent = new Map();
    loads = new Map();
    closed = new Map();
    tallies = new Map();
    /** Recent levels of each load (last 10 s) so goals can ask "bright for the last 2 seconds, all together". */
    history = new Map();
    voltages = [];
    pending = [];
    once = new Set();
    ticks = 0;
    constructor(parts, definition) {
        this.layout = analyzeCircuit(parts, definition);
        for (const e of this.layout.elements) {
            if (e.kind === "BATTERY") {
                this.charge.set(e.partId, e.capacity);
                this.energy.set(e.partId, 0);
            }
            if (e.kind === "LOAD")
                this.loads.set(e.partId, { id: e.partId, kind: e.load ?? "DEVICE", power: 0, level: 0, current: 0, on: false, onTicks: 0, peakLevel: 0, everOn: false });
            if (e.kind === "SWITCH")
                this.closed.set(e.partId, parts.find(p => p.id === e.partId)?.parameters.closed === true);
            if (e.kind === "BUTTON")
                this.closed.set(e.partId, false);
        }
    }
    get tick() { return this.ticks; }
    hasCircuit() { return this.layout.elements.some(e => e.kind === "BATTERY"); }
    /** One tick. `pressed` says whether each button is held down right now (by a body, Bolt's schedule or a finger). */
    step(dt, pressed, flipped = new Set()) {
        const els = this.layout.elements;
        for (const e of els) {
            if (e.kind === "BUTTON") {
                const now = pressed(e.partId);
                if (now !== this.closed.get(e.partId)) {
                    this.closed.set(e.partId, now);
                    this.pending.push({ kind: "SWITCH_CHANGED", sourceId: e.partId, data: { closed: now } });
                }
            }
            if (e.kind === "SWITCH" && flipped.has(e.partId)) {
                const now = !this.closed.get(e.partId);
                this.closed.set(e.partId, now);
                this.pending.push({ kind: "SWITCH_CHANGED", sourceId: e.partId, data: { closed: now } });
            }
        }
        this.solve();
        // Energy, overloads and load states.
        for (const e of els)
            if (e.kind === "BATTERY") {
                const i = this.elementCurrent.get(e.partId) ?? 0;
                const emf = this.emf(e);
                const p = Math.max(0, emf * i);
                if (p > 0) {
                    const used = p * dt;
                    this.energy.set(e.partId, this.energy.get(e.partId) + used);
                    const before = this.charge.get(e.partId);
                    const after = Math.max(0, before - used);
                    this.charge.set(e.partId, after);
                    if (before > 0 && after <= 0)
                        this.pending.push({ kind: "BATTERY_EMPTY", sourceId: e.partId });
                }
                if (i > 3 && !this.once.has(`short:${e.partId}`)) {
                    this.once.add(`short:${e.partId}`);
                    this.pending.push({ kind: "SHORT_CIRCUIT", sourceId: e.partId, data: { current: round(i) } });
                }
                if (Number.isFinite(e.maxPower) && !this.tripped.has(e.partId)) {
                    const over = p > e.maxPower ? (this.overTicks.get(e.partId) ?? 0) + 1 : 0;
                    this.overTicks.set(e.partId, over);
                    if (over >= 6) {
                        this.tripped.add(e.partId);
                        this.pending.push({ kind: "BREAKER_TRIPPED", sourceId: e.partId, data: { power: round(p), limit: e.maxPower } });
                    }
                }
            }
        const anySourceCurrent = els.some(e => e.kind === "BATTERY" && Math.abs(this.elementCurrent.get(e.partId) ?? 0) > 0.3);
        for (const e of els)
            if (e.kind === "LOAD") {
                const v = (this.voltages[e.a] ?? 0) - (this.voltages[e.b] ?? 0);
                const i = e.broken ? 0 : v / e.ohms;
                const power = e.broken ? 0 : v * v / e.ohms;
                const level = power / (ONE_BATTERY_VOLTS * ONE_BATTERY_VOLTS / e.ohms);
                const prev = this.loads.get(e.partId);
                const on = level >= LEVEL_ON;
                if (on && !prev.everOn)
                    this.pending.push({ kind: "CIRCUIT_COMPLETE", sourceId: e.partId, data: { level: round(level), load: prev.kind } });
                if (on !== prev.on)
                    this.pending.push({ kind: on ? "LOAD_ON" : "LOAD_OFF", sourceId: e.partId, data: { level: round(level) } });
                if (!on && anySourceCurrent && this.connectedToSource(e) && level < 0.02 && !this.once.has(`bypass:${e.partId}`)) {
                    this.once.add(`bypass:${e.partId}`);
                    this.pending.push({ kind: "LOAD_BYPASSED", sourceId: e.partId });
                }
                const h = this.history.get(e.partId) ?? [];
                h.push(level);
                if (h.length > 600)
                    h.shift();
                this.history.set(e.partId, h);
                this.loads.set(e.partId, { id: e.partId, kind: prev.kind, power, level, current: i, on, onTicks: on ? prev.onTicks + 1 : 0, peakLevel: Math.max(prev.peakLevel, level), everOn: prev.everOn || on });
                for (const [control, isClosed] of this.closed) {
                    const key = `${control}|${e.partId}`;
                    const t = this.tallies.get(key) ?? { closedOn: 0, closedOff: 0, openOn: 0, openOff: 0 };
                    if (isClosed) {
                        if (on)
                            t.closedOn++;
                        else
                            t.closedOff++;
                    }
                    else {
                        if (on)
                            t.openOn++;
                        else
                            t.openOff++;
                    }
                    this.tallies.set(key, t);
                }
            }
        this.ticks += 1;
    }
    emf(e) { return this.tripped.has(e.partId) || (this.charge.get(e.partId) ?? 0) <= 0 ? 0 : e.volts; }
    /** Is this load's network joined (through closed paths) to any battery at all? */
    connectedToSource(load) {
        const adj = new Map();
        const add = (a, b) => { (adj.get(a) ?? adj.set(a, []).get(a)).push(b); (adj.get(b) ?? adj.set(b, []).get(b)).push(a); };
        for (const e of this.layout.elements)
            if (this.conducts(e) && e.partId !== load.partId)
                add(e.a, e.b);
        const seen = new Set([load.a]);
        const q = [load.a];
        while (q.length) {
            const n = q.shift();
            for (const m of adj.get(n) ?? [])
                if (!seen.has(m)) {
                    seen.add(m);
                    q.push(m);
                }
        }
        return seen.has(load.b) && this.layout.elements.some(e => e.kind === "BATTERY" && seen.has(e.a));
    }
    conducts(e) { return !e.broken && ((e.kind !== "SWITCH" && e.kind !== "BUTTON") || this.closed.get(e.partId) === true); }
    /** Modified nodal analysis: node voltages + one current per battery. Floating parts settle at 0 V (tiny leak to ground). */
    solve() {
        const els = this.layout.elements;
        const n = this.layout.nodes.length;
        const sources = els.filter(e => e.kind === "BATTERY");
        const size = n + sources.length;
        this.elementCurrent.clear();
        if (n === 0) {
            this.voltages = [];
            return;
        }
        const A = Array.from({ length: size }, () => new Array(size).fill(0));
        const z = new Array(size).fill(0);
        const stampG = (a, b, g) => { A[a][a] += g; A[b][b] += g; A[a][b] -= g; A[b][a] -= g; };
        for (let i = 0; i < n; i++)
            A[i][i] += GMIN;
        for (const e of els) {
            if (e.kind === "BATTERY")
                continue;
            if (!this.conducts(e) || e.a === e.b)
                continue;
            stampG(e.a, e.b, 1 / e.ohms);
        }
        // Battery k: an ideal source in series with its internal resistance, modelled as V(+) − V(−) = emf − I·r (I flows − → + inside).
        sources.forEach((e, k) => {
            const row = n + k;
            const neg = e.a, pos = e.b;
            if (e.broken || neg === pos) {
                A[row][row] = 1;
                return;
            }
            A[pos][row] -= 1;
            A[neg][row] += 1; // the unknown is the current leaving + into the circuit
            A[row][pos] += 1;
            A[row][neg] -= 1;
            A[row][row] += e.ohms;
            z[row] = this.emf(e);
        });
        const x = gaussSolve(A, z);
        this.voltages = x.slice(0, n);
        sources.forEach((e, k) => this.elementCurrent.set(e.partId, x[n + k] ?? 0));
        for (const e of els)
            if (e.kind !== "BATTERY")
                this.elementCurrent.set(e.partId, this.conducts(e) ? ((this.voltages[e.a] ?? 0) - (this.voltages[e.b] ?? 0)) / e.ohms : 0);
    }
    // ---------------------------------------------------------------- read-only views (renderer, goals, evidence)
    load(id) { return this.loads.get(id); }
    loadStates() { return [...this.loads.values()]; }
    source(id) {
        const e = this.layout.elements.find(x => x.partId === id && x.kind === "BATTERY");
        if (!e)
            return undefined;
        const i = this.elementCurrent.get(id) ?? 0;
        return { id, charge: this.charge.get(id), capacity: e.capacity, energyUsed: this.energy.get(id), current: i, power: Math.max(0, this.emf(e) * i), tripped: this.tripped.has(id), empty: (this.charge.get(id) ?? 0) <= 0 };
    }
    sources() { return this.layout.elements.filter(e => e.kind === "BATTERY").map(e => this.source(e.partId)); }
    /** Total energy taken from every battery so far (the energyUsed metric). */
    energyUsed() { let t = 0; for (const v of this.energy.values())
        t += v; return t; }
    /** Current through any element (A, + = from its first terminal to its second). */
    current(id) { return this.elementCurrent.get(id) ?? 0; }
    isClosed(id) { return this.closed.get(id) === true; }
    nodeVoltage(node) { return this.voltages[node] ?? 0; }
    /** How hard an electric motor is driven, as a multiple of one battery straight across it (signed = direction). */
    motorDrive(id) {
        const e = this.layout.elements.find(x => x.partId === id && x.kind === "LOAD");
        if (!e)
            return 0;
        const i = this.current(id);
        const ref = ONE_BATTERY_VOLTS / (e.ohms + 0.5);
        const s = i / ref;
        return Math.abs(s) < LEVEL_ON ? 0 : Math.max(-2.5, Math.min(2.5, s));
    }
    /** How many ticks in a row (up to now) this load has stayed at or above a level. */
    ticksAtLeast(id, level) { const h = this.history.get(id) ?? []; let n = 0; for (let i = h.length - 1; i >= 0 && h[i] >= level; i--)
        n++; return n; }
    controlTally(controlId, loadId) { return { ...(this.tallies.get(`${controlId}|${loadId}`) ?? { closedOn: 0, closedOff: 0, openOn: 0, openOff: 0 }) }; }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
/** Dense Gaussian elimination with partial pivoting (systems here are tiny). Singular columns give 0. */
export function gaussSolve(Ain, bin) {
    const n = bin.length;
    const A = Ain.map(r => [...r]);
    const b = [...bin];
    for (let col = 0; col < n; col++) {
        let piv = col;
        for (let r = col + 1; r < n; r++)
            if (Math.abs(A[r][col]) > Math.abs(A[piv][col]))
                piv = r;
        if (Math.abs(A[piv][col]) < 1e-14)
            continue;
        if (piv !== col) {
            [A[piv], A[col]] = [A[col], A[piv]];
            [b[piv], b[col]] = [b[col], b[piv]];
        }
        for (let r = col + 1; r < n; r++) {
            const f = A[r][col] / A[col][col];
            if (f === 0)
                continue;
            for (let k = col; k < n; k++)
                A[r][k] -= f * A[col][k];
            b[r] -= f * b[col];
        }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
        if (Math.abs(A[r][r]) < 1e-14) {
            x[r] = 0;
            continue;
        }
        let s = b[r];
        for (let k = r + 1; k < n; k++)
            s -= A[r][k] * x[k];
        x[r] = s / A[r][r];
    }
    return x;
}
function round(v) { return Math.round(v * 1000) / 1000; }
