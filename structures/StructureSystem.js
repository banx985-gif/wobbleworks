/**
 * Builder Bay structure solver (M13).
 *
 * Coarse but honest: members are straight beams joined by pins (a truss). Each TEST tick the solver works
 * out how hard every member is pulled (tension) or squashed (compression), adds bending for loads that sit
 * part-way along a beam, and compares that with the material's strength. Overloaded members break and the
 * load moves to whatever is left. A frame with no triangles has nothing stopping it from leaning, so it
 * wobbles and collapses; bracing it into triangles makes it stiff. Nothing here is "magic":
 * triangles still break if overloaded, and wood, metal and rope really do behave differently.
 */
export const STRUCTURE_TRUTH_CONTRACT = Object.freeze({
    id: "truth.structures.v1",
    preserve: ["bracing", "load paths", "stability", "tension and compression", "materials differ in strength and weight", "long thin parts buckle and bend more"],
    simplify: ["pin joints", "coarse stress model", "cartoon failure threshold", "steady loads with a short settle-in"],
    neverImply: ["triangles are magically unbreakable", "material choice never matters"]
});
export const MATERIALS = Object.freeze({
    WOOD: { weightPerMetre: 0.25, tension: 40, compression: 30, buckle: 60, bending: 6, stiffness: 1000, hardness: 1 },
    METAL: { weightPerMetre: 0.6, tension: 120, compression: 90, buckle: 220, bending: 16, stiffness: 4000, hardness: 1.2 },
    ROPE: { weightPerMetre: 0.05, tension: 60, compression: 0, buckle: 0, bending: 0, stiffness: 600, hardness: 0.35 }
});
export const FLOOR_Y = 8.2;
export const JOINT_TOLERANCE = 0.1;
export const COLLAPSE_WOBBLE = 0.6;
const SETTLE_SECONDS = 1;
const GRAVITY = 9.81;
const REGULARISE = 1e-3;
/** No real structure is perfectly straight: every downward load also gives a tiny sideways nudge (3%), so an unbraced frame leans the way a real one would. */
const SIDEWAYS_NUDGE = 0.03;
export function beamEndpoints(part, def) {
    const b = def.behaviours.find(x => x.kind === "BEAM");
    if (b?.kind !== "BEAM")
        return undefined;
    const length = Number(part.parameters.length ?? b.length);
    const c = Math.cos(part.rotation), s = Math.sin(part.rotation);
    return { x1: part.position.x - c * length / 2, y1: part.position.y - s * length / 2, x2: part.position.x + c * length / 2, y2: part.position.y + s * length / 2, length };
}
function onFloor(x, y, chasms) { return y >= FLOOR_Y - 0.12 && !chasms.some(c => x > c.x1 && x < c.x2); }
/** Geometry → joints, members and fixed surfaces. Pure; used in BUILD mode too (joint dots, support marks). */
export function analyzeStructure(parts, definition) {
    const chasms = [];
    const fixedSurfaces = [];
    const anchors = [];
    const grounds = [];
    for (const p of parts) {
        const def = definition(p.definitionId);
        if (!def)
            continue;
        for (const b of def.behaviours) {
            if (b.kind === "CHASM")
                chasms.push({ x1: p.position.x - Number(p.parameters.width ?? b.width) / 2, x2: p.position.x + Number(p.parameters.width ?? b.width) / 2 });
            if (b.kind === "STRUCT_ANCHOR")
                anchors.push({ x: p.position.x, y: p.position.y, id: p.id });
            if (b.kind === "STRUCT_GROUND") {
                const w = Number(p.parameters.width ?? b.width), h = Number(p.parameters.height ?? b.height);
                const top = p.position.y - h / 2;
                grounds.push({ x1: p.position.x - w / 2, x2: p.position.x + w / 2, top });
                fixedSurfaces.push({ x1: p.position.x - w / 2, y1: top, x2: p.position.x + w / 2, y2: top, hardness: 1.5 });
            }
            if (b.kind === "RIGID_BODY" && b.bodyType === "STATIC" && (p.definitionId === "motion.platform" || p.definitionId === "motion.ramp" || p.definitionId === "structure.block")) {
                const c = Math.cos(p.rotation), s = Math.sin(p.rotation);
                const half = b.width / 2;
                const lift = p.definitionId === "motion.ramp" ? 0 : b.height / 2;
                fixedSurfaces.push({ x1: p.position.x - c * half, y1: p.position.y - s * half - lift, x2: p.position.x + c * half, y2: p.position.y + s * half - lift, hardness: 1.5 });
            }
        }
    }
    // Floor, split around chasms.
    const cuts = [...chasms].sort((p, q) => p.x1 - q.x1);
    let from = -1;
    for (const c of cuts) {
        if (c.x1 > from)
            fixedSurfaces.push({ x1: from, y1: FLOOR_Y, x2: c.x1, y2: FLOOR_Y, hardness: 1.5 });
        from = Math.max(from, c.x2);
    }
    fixedSurfaces.push({ x1: from, y1: FLOOR_Y, x2: 17, y2: FLOOR_Y, hardness: 1.5 });
    const joints = [];
    const members = [];
    const jointAt = (x, y) => {
        const i = joints.findIndex(j => Math.hypot(j.x - x, j.y - y) <= JOINT_TOLERANCE);
        if (i >= 0)
            return i;
        const anchor = anchors.find(a => Math.hypot(a.x - x, a.y - y) <= 0.2);
        const ground = grounds.find(g => Math.abs(y - g.top) <= 0.15 && x >= g.x1 - 0.1 && x <= g.x2 + 0.1);
        const support = anchor ? anchor.id : ground ? "ground" : onFloor(x, y, chasms) ? "floor" : undefined;
        joints.push({ x, y, supported: support !== undefined, ...(support ? { support } : {}) });
        return joints.length - 1;
    };
    const beams = parts.map(p => ({ p, def: definition(p.definitionId) })).filter(x => x.def?.behaviours.some(b => b.kind === "BEAM")).sort((p, q) => p.p.id.localeCompare(q.p.id));
    for (const { p, def } of beams) {
        const b = def.behaviours.find(x => x.kind === "BEAM");
        if (b?.kind !== "BEAM")
            continue;
        const e = beamEndpoints(p, def);
        if (e.length < 0.2)
            continue;
        members.push({ id: p.id, partId: p.id, material: b.material, a: jointAt(e.x1, e.y1), b: jointAt(e.x2, e.y2), length: e.length, thickness: b.thickness });
    }
    return { joints, members, fixedSurfaces, chasms, anchors };
}
// ------------------------------------------------------------------ dense linear solve (small systems)
function solveLinear(A, f) {
    const n = f.length;
    const M = A.map((row, i) => [...row, f[i]]);
    for (let c = 0; c < n; c++) {
        let p = c;
        for (let r = c + 1; r < n; r++)
            if (Math.abs(M[r][c]) > Math.abs(M[p][c]))
                p = r;
        [M[c], M[p]] = [M[p], M[c]];
        const piv = M[c][c];
        if (Math.abs(piv) < 1e-12)
            continue;
        for (let r = c + 1; r < n; r++) {
            const k = M[r][c] / piv;
            if (k === 0)
                continue;
            for (let k2 = c; k2 <= n; k2++)
                M[r][k2] -= k * M[c][k2];
        }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
        let s = M[r][n];
        for (let c = r + 1; c < n; c++)
            s -= M[r][c] * x[c];
        const piv = M[r][r];
        x[r] = Math.abs(piv) < 1e-12 ? 0 : s / piv;
    }
    return x;
}
/** One TEST run of a structure. Deterministic: the same build always behaves the same way. */
export class StructureSystem {
    definition;
    layout;
    broken = new Map();
    brokenTick = new Map();
    axial = new Map();
    ratio = new Map();
    peak = new Map();
    slack = new Set();
    disp = [];
    travellers = [];
    eggs = [];
    loads = [];
    wind = [];
    pending = [];
    wobbleNow = 0;
    peakWobble = 0;
    /** Wobble each tick, or -1 for a tick where something broke or loads were still settling. */
    history = [];
    time = 0;
    tickCount = 0;
    everBroken = false;
    extra = [];
    mountsOk = new Map();
    /** 0–0.9: how damaged (cracked) a member already is. Damaged members are weaker in every way. */
    damage = new Map();
    constructor(parts, definition) {
        this.definition = definition;
        this.layout = analyzeStructure(parts, definition);
        this.disp = this.layout.joints.map(() => ({ x: 0, y: 0 }));
        for (const p of parts)
            if (typeof p.parameters.damage === "number")
                this.damage.set(p.id, p.parameters.damage);
        for (const p of [...parts].sort((a, b) => a.id.localeCompare(b.id))) {
            const def = definition(p.definitionId);
            if (!def)
                continue;
            for (const b of def.behaviours) {
                if (b.kind === "TRAVELLER") {
                    const endX = Number(p.parameters.endX ?? p.position.x + 8);
                    this.travellers.push({ lowestY: p.position.y, usedMember: false, startY: p.position.y, id: p.id, who: b.who, weight: Number(p.parameters.weight ?? b.weight), speed: Number(p.parameters.speed ?? b.speed), height: b.height, x: p.position.x, y: p.position.y, vy: 0, endX, dir: Math.sign(endX - p.position.x) || 1, delay: Number(p.parameters.delay ?? 0), fallen: false, arrived: false, blocked: false, started: false });
                }
                if (b.kind === "EGG")
                    this.eggs.push({ id: p.id, weight: b.weight, x: p.position.x, y: p.position.y, vy: 0, landed: false, onStructure: false });
                if (b.kind === "STRUCT_LOAD")
                    this.loads.push({ id: p.id, weight: Number(p.parameters.weight ?? b.weight), x: p.position.x, y: p.position.y, startAt: Number(p.parameters.startAt ?? 0), ramp: Number(p.parameters.rampSeconds ?? 1), grow: p.parameters.grow === true, applied: 0, held: 0, done: false, fell: false });
                if (b.kind === "WIND")
                    this.wind.push({ force: Number(p.parameters.force ?? b.force) });
            }
        }
    }
    // -------------------------------------------------------------- queries
    get members() { return this.layout.members; }
    memberState(id) {
        if (!this.layout.members.some(m => m.id === id))
            return undefined;
        const ax = this.axial.get(id) ?? 0;
        const br = this.broken.get(id);
        return { id, broken: br !== undefined, ...(br ? { breakMode: br } : {}), axial: ax, ratio: this.ratio.get(id) ?? 0, peakRatio: this.peak.get(id) ?? 0, mode: this.slack.has(id) ? "SLACK" : Math.abs(ax) < 1e-6 ? "NONE" : ax > 0 ? "TENSION" : "COMPRESSION" };
    }
    memberStates() { return this.layout.members.map(m => this.memberState(m.id)); }
    damageOf(id) { return this.damage.get(id) ?? 0; }
    jointDisplacement(i) { return this.disp[i] ?? { x: 0, y: 0 }; }
    wobble() { return this.wobbleNow; }
    maxWobble() { return this.peakWobble; }
    brokenCount() { return this.broken.size; }
    anyBroken() { return this.everBroken; }
    settled() { return this.time >= SETTLE_SECONDS; }
    /** Consecutive settled ticks with nothing broken and wobble ≤ maxWobble. */
    calmTicksBelow(maxWobble) {
        if (this.broken.size > 0)
            return 0;
        let n = 0;
        for (let i = this.history.length - 1; i >= 0 && this.history[i] >= 0 && this.history[i] <= maxWobble; i--)
            n++;
        return n;
    }
    /** Highest point of the standing structure (smallest y), or undefined if nothing stands. */
    topY() {
        let top;
        for (const m of this.layout.members) {
            if (this.broken.has(m.id))
                continue;
            for (const j of [m.a, m.b]) {
                const y = this.layout.joints[j].y + this.disp[j].y;
                if (top === undefined || y < top)
                    top = y;
            }
        }
        return top;
    }
    /** Did this traveller walk on something the child built? */
    walkedOnStructure(id) { return this.travellers.find(t => t.id === id)?.usedMember ?? false; }
    /** Did this traveller go up by more than half a metre (e.g. a Motion ramp)? */
    climbedRamp(id) { const t = this.travellers.find(x => x.id === id); return t ? t.startY - Math.min(t.y, t.startY) > 0.5 || t.lowestY < t.startY - 0.5 : false; }
    /** Tick a member broke on (for drawing it falling). */
    brokenAtTick(id) { return this.brokenTick.get(id); }
    tick() { return this.tickCount; }
    traveller(id) { const t = this.travellers.find(x => x.id === id); return t ? { id, x: t.x, y: t.y, fallen: t.fallen, arrived: t.arrived, blocked: t.blocked, started: t.started, ...(t.onMember ? { onMember: t.onMember } : {}) } : undefined; }
    travellerStates() { return this.travellers.map(t => this.traveller(t.id)); }
    egg(id) { const e = this.eggs.find(x => x.id === id); return e ? { id, x: e.x, y: e.y, landed: e.landed, onStructure: e.onStructure, ...(e.impact !== undefined ? { impact: e.impact } : {}), ...(e.onMember ? { onMember: e.onMember } : {}) } : undefined; }
    eggStates() { return this.eggs.map(e => this.egg(e.id)); }
    load(id) { const l = this.loads.find(x => x.id === id); return l ? { id, x: l.x, y: l.y, applied: l.applied, held: l.held, done: l.done, fell: l.fell, ...(l.onMember ? { onMember: l.onMember } : {}) } : undefined; }
    loadStates() { return this.loads.map(l => this.load(l.id)); }
    /** Whether an external point load (e.g. a winch) found a joint to hang from last tick. */
    mounted(sourceId) { return this.mountsOk.get(sourceId) ?? false; }
    /** Is there a standing joint within 0.3 m of this point? (cheap; used before the first tick too) */
    hasJointNear(x, y) { return this.layout.joints.some((j, i) => Math.hypot(j.x - x, j.y - y) <= 0.3 && this.layout.members.some(m => (m.a === i || m.b === i) && !this.broken.has(m.id))); }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
    // -------------------------------------------------------------- surfaces under things
    surfaces() {
        const out = [...this.layout.fixedSurfaces];
        for (const m of this.layout.members) {
            if (this.broken.has(m.id) || m.material === "ROPE")
                continue;
            const a = this.layout.joints[m.a], b = this.layout.joints[m.b];
            const da = this.disp[m.a], db = this.disp[m.b];
            const x1 = a.x + clamp(da.x), y1 = a.y + clamp(da.y), x2 = b.x + clamp(db.x), y2 = b.y + clamp(db.y);
            if (Math.abs(Math.atan2(y2 - y1, x2 - x1)) > 0.7 && Math.abs(Math.atan2(y2 - y1, x2 - x1)) < Math.PI - 0.7)
                continue;
            out.push({ x1, y1: y1 - m.thickness / 2, x2, y2: y2 - m.thickness / 2, memberId: m.id, hardness: MATERIALS[m.material].hardness });
        }
        return out;
    }
    catchers() {
        // Eggs can also land in rope nets.
        const out = this.surfaces();
        for (const m of this.layout.members)
            if (!this.broken.has(m.id) && m.material === "ROPE") {
                const a = this.layout.joints[m.a], b = this.layout.joints[m.b];
                out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, memberId: m.id, hardness: MATERIALS.ROPE.hardness });
            }
        return out;
    }
    static yOn(s, x) {
        const lo = Math.min(s.x1, s.x2), hi = Math.max(s.x1, s.x2);
        if (x < lo - 1e-9 || x > hi + 1e-9)
            return undefined;
        if (Math.abs(s.x2 - s.x1) < 1e-9)
            return Math.min(s.y1, s.y2);
        return s.y1 + (s.y2 - s.y1) * (x - s.x1) / (s.x2 - s.x1);
    }
    memberT(memberId, x) {
        const m = this.layout.members.find(q => q.id === memberId);
        const a = this.layout.joints[m.a], b = this.layout.joints[m.b];
        return Math.abs(b.x - a.x) < 1e-9 ? 0.5 : clamp01((x - a.x) / (b.x - a.x));
    }
    // -------------------------------------------------------------- step
    step(dt, external = []) {
        this.time += dt;
        this.tickCount += 1;
        this.extra = external;
        const ramp = Math.min(1, this.time / SETTLE_SECONDS);
        this.moveTravellers(dt);
        this.moveEggs(dt);
        this.moveLoads(dt);
        this.solveAll(ramp);
        this.history.push(this.settled() && this.broken.size === 0 ? this.wobbleNow : -1);
    }
    moveTravellers(dt) {
        const surfaces = this.surfaces();
        for (const t of this.travellers) {
            if (t.arrived || (t.fallen && t.y > 10))
                continue;
            if (this.time < t.delay)
                continue;
            if (!t.started) {
                t.started = true;
                this.pending.push({ kind: "TRAVELLER_START", sourceId: t.id, data: { who: t.who } });
            }
            if (t.fallen) {
                t.vy += GRAVITY * dt;
                t.y += t.vy * dt;
                continue;
            }
            // Blocked by something in the way at body height?
            const ahead = { x1: Math.min(t.x + t.dir * 0.1, t.x + t.dir * 0.45), x2: Math.max(t.x + t.dir * 0.1, t.x + t.dir * 0.45), y1: t.y - t.height + 0.1, y2: t.y - 0.18 };
            const blocker = this.layout.members.find(m => !this.broken.has(m.id) && m.id !== t.onMember && this.segmentHitsBox(m, ahead));
            if (blocker) {
                if (!t.blocked) {
                    t.blocked = true;
                    this.pending.push({ kind: "TRAVELLER_BLOCKED", sourceId: t.id, targetId: blocker.id });
                }
                continue;
            }
            t.blocked = false;
            const nx = t.x + t.dir * t.speed * dt;
            let best;
            for (const s of surfaces) {
                const y = StructureSystem.yOn(s, nx);
                if (y === undefined || y < t.y - 0.4 || y > t.y + 0.3)
                    continue;
                if (!best || y < best.y)
                    best = { y, s };
            }
            if (!best) {
                t.fallen = true;
                t.vy = 0;
                t.x = nx;
                delete t.onMember;
                this.pending.push({ kind: "TRAVELLER_FELL", sourceId: t.id, data: { x: round(nx) } });
                continue;
            }
            t.x = nx;
            t.y = best.y;
            t.lowestY = Math.min(t.lowestY, t.y);
            if (best.s.memberId) {
                t.onMember = best.s.memberId;
                t.at = this.memberT(best.s.memberId, nx);
                t.usedMember = true;
            }
            else
                delete t.onMember;
            if ((t.dir > 0 && t.x >= t.endX) || (t.dir < 0 && t.x <= t.endX)) {
                t.arrived = true;
                delete t.onMember;
                this.pending.push({ kind: "TRAVELLER_ARRIVED", sourceId: t.id });
            }
        }
    }
    moveEggs(dt) {
        for (const e of this.eggs) {
            if (e.landed) {
                if (e.onMember && this.broken.has(e.onMember)) {
                    e.landed = false;
                    delete e.onMember;
                    e.onStructure = false;
                }
                else
                    continue;
            }
            const prev = e.y;
            e.vy += GRAVITY * dt;
            e.y += e.vy * dt;
            let hit;
            for (const s of this.catchers()) {
                const y = StructureSystem.yOn(s, e.x);
                if (y === undefined || y < prev - 1e-9 || y > e.y)
                    continue;
                if (!hit || y < hit.y)
                    hit = { y, s };
            }
            if (!hit)
                continue;
            e.y = hit.y;
            e.landed = true;
            const impact = round(e.vy * hit.s.hardness);
            e.impact = Math.max(e.impact ?? 0, impact);
            e.vy = 0;
            e.onStructure = hit.s.memberId !== undefined;
            if (hit.s.memberId)
                e.onMember = hit.s.memberId;
            this.pending.push({ kind: "EGG_LANDED", sourceId: e.id, ...(hit.s.memberId ? { targetId: hit.s.memberId } : {}), data: { impact, onStructure: e.onStructure } });
        }
    }
    moveLoads(dt) {
        for (const l of this.loads) {
            if (l.done || this.time < l.startAt)
                continue;
            if (!l.onMember && !l.fell) {
                // Settle onto the first surface straight below.
                let best;
                for (const s of this.surfaces()) {
                    const y = StructureSystem.yOn(s, l.x);
                    if (y === undefined || y < l.y - 0.01)
                        continue;
                    if (!best || y < best.y)
                        best = { y, s };
                }
                if (!best || !best.s.memberId) {
                    l.fell = true;
                    l.done = true;
                    this.pending.push({ kind: "LOAD_ON_GROUND", sourceId: l.id });
                    continue;
                }
                l.y = best.y;
                l.onMember = best.s.memberId;
                l.at = this.memberT(best.s.memberId, l.x);
            }
            if (l.onMember && this.broken.has(l.onMember)) {
                l.done = true;
                l.fell = true;
                delete l.onMember;
                this.pending.push({ kind: "LOAD_TEST_DONE", sourceId: l.id, data: { held: round(l.held), broke: true } });
                continue;
            }
            const f = clamp01((this.time - l.startAt) / Math.max(0.01, l.ramp));
            l.applied = l.weight * f;
            if (f >= 1 && !l.done && l.grow) {
                l.done = true;
                l.held = l.weight;
                this.pending.push({ kind: "LOAD_TEST_DONE", sourceId: l.id, data: { held: round(l.held), broke: false } });
            }
        }
        void dt;
    }
    segmentHitsBox(m, box) {
        const a = this.layout.joints[m.a], b = this.layout.joints[m.b];
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
            if (x >= box.x1 && x <= box.x2 && y >= box.y1 && y <= box.y2)
                return true;
        }
        return false;
    }
    solveAll(ramp) {
        const { joints, members } = this.layout;
        // Point loads sitting on members (travellers, eggs, test loads): P at fraction t along the member.
        const pointOnMember = [];
        for (const t of this.travellers)
            if (t.onMember && !t.fallen && !t.arrived)
                pointOnMember.push({ member: t.onMember, t: t.at ?? 0.5, P: t.weight, source: t.id });
        for (const e of this.eggs)
            if (e.landed && e.onMember)
                pointOnMember.push({ member: e.onMember, t: this.memberT(e.onMember, e.x), P: e.weight, source: e.id });
        for (const l of this.loads)
            if (l.onMember && !l.done)
                pointOnMember.push({ member: l.onMember, t: l.at ?? 0.5, P: l.applied, source: l.id });
        for (let pass = 0; pass < 10; pass++) {
            const active = members.filter(m => !this.broken.has(m.id) && !this.slack.has(m.id));
            // Components; members with no supported joint simply fall.
            const comp = new Map();
            let next = 0;
            for (const m of active) {
                const ca = comp.get(m.a), cb = comp.get(m.b);
                if (ca === undefined && cb === undefined) {
                    comp.set(m.a, next);
                    comp.set(m.b, next);
                    next++;
                }
                else if (ca !== undefined && cb === undefined)
                    comp.set(m.b, ca);
                else if (cb !== undefined && ca === undefined)
                    comp.set(m.a, cb);
                else if (ca !== cb) {
                    for (const [k, v] of comp)
                        if (v === cb)
                            comp.set(k, ca);
                }
            }
            const supportedComp = new Set();
            for (const [j, c] of comp)
                if (joints[j].supported)
                    supportedComp.add(c);
            let changed = false;
            for (const m of active)
                if (!supportedComp.has(comp.get(m.a))) {
                    this.breakMember(m, "UNSUPPORTED");
                    changed = true;
                }
            if (changed)
                continue;
            // Assemble and solve K u = f over free joints.
            const free = [...new Set(active.flatMap(m => [m.a, m.b]))].filter(j => !joints[j].supported).sort((p, q) => p - q);
            const idx = new Map(free.map((j, i) => [j, i]));
            const n = free.length * 2;
            const K = Array.from({ length: n }, () => new Array(n).fill(0));
            const f = new Array(n).fill(0);
            const bend = new Map();
            const addLoad = (j, fx, fy) => { const i = idx.get(j); if (i === undefined)
                return; f[i * 2] += fx + Math.abs(fy) * SIDEWAYS_NUDGE; f[i * 2 + 1] += fy; };
            for (const m of active) {
                const a = joints[m.a], b = joints[m.b];
                const L = m.length;
                const c = (b.x - a.x) / L, s = (b.y - a.y) / L;
                const k = MATERIALS[m.material].stiffness / L;
                const kk = [[c * c, c * s], [c * s, s * s]];
                const dofs = [m.a, m.b];
                for (let p = 0; p < 2; p++)
                    for (let q = 0; q < 2; q++) {
                        const ip = idx.get(dofs[p]), iq = idx.get(dofs[q]);
                        if (ip === undefined || iq === undefined)
                            continue;
                        const sign = p === q ? 1 : -1;
                        for (let r = 0; r < 2; r++)
                            for (let t = 0; t < 2; t++)
                                K[ip * 2 + r][iq * 2 + t] += sign * k * kk[r][t];
                    }
                // Own weight, half to each end, plus the bending it causes along the span.
                const w = MATERIALS[m.material].weightPerMetre * L * ramp;
                addLoad(m.a, 0, w / 2);
                addLoad(m.b, 0, w / 2);
                if (m.material !== "ROPE")
                    bend.set(m.id, (bend.get(m.id) ?? 0) + w * L / 8 * Math.abs(c));
            }
            for (const pl of pointOnMember) {
                const m = active.find(q => q.id === pl.member);
                if (!m)
                    continue;
                const P = pl.P;
                addLoad(m.a, 0, P * (1 - pl.t));
                addLoad(m.b, 0, P * pl.t);
                const a = joints[m.a], b = joints[m.b];
                const cos = Math.abs(b.x - a.x) / m.length;
                bend.set(m.id, (bend.get(m.id) ?? 0) + P * pl.t * (1 - pl.t) * m.length * cos);
            }
            // External point loads (a winch hanging from a joint) and wind at the top.
            this.mountsOk.clear();
            for (const e of this.extra) {
                const j = joints.findIndex((jt, i) => Math.hypot(jt.x - e.x, jt.y - e.y) <= 0.3 && active.some(m => m.a === i || m.b === i));
                this.mountsOk.set(e.sourceId, j >= 0);
                if (j >= 0)
                    addLoad(j, 0, e.force);
            }
            if (this.wind.length && free.length) {
                const top = free.reduce((best, j) => joints[j].y < joints[best].y ? j : best, free[0]);
                for (const w of this.wind)
                    addLoad(top, w.force * ramp, 0);
            }
            for (let i = 0; i < n; i++)
                K[i][i] += REGULARISE;
            const u = n ? solveLinear(K, f) : [];
            this.disp = joints.map(() => ({ x: 0, y: 0 }));
            free.forEach((j, i) => { this.disp[j] = { x: u[i * 2], y: u[i * 2 + 1] }; });
            // Wobble per component: a leaning, unbraced frame moves a lot.
            const compWobble = new Map();
            for (const j of free) {
                const c = comp.get(j);
                compWobble.set(c, Math.max(compWobble.get(c) ?? 0, Math.hypot(this.disp[j].x, this.disp[j].y)));
            }
            changed = false;
            for (const m of active)
                if ((compWobble.get(comp.get(m.a)) ?? 0) > COLLAPSE_WOBBLE) {
                    this.breakMember(m, "COLLAPSE");
                    changed = true;
                }
            if (changed)
                continue;
            // Member forces and how close each is to its limit.
            let worst;
            for (const m of active) {
                const a = joints[m.a], b = joints[m.b];
                const L = m.length;
                const c = (b.x - a.x) / L, s = (b.y - a.y) / L;
                const du = this.disp[m.b], da = this.disp[m.a];
                const N = MATERIALS[m.material].stiffness / L * ((du.x - da.x) * c + (du.y - da.y) * s);
                const mat = MATERIALS[m.material];
                if (m.material === "ROPE" && N < -1e-6) {
                    this.slack.add(m.id);
                    changed = true;
                    continue;
                }
                const compCap = Math.min(mat.compression, mat.buckle / (L * L));
                const strength = 1 - Math.max(0, Math.min(0.9, this.damage.get(m.id) ?? 0));
                const axialRatio = N >= 0 ? N / (mat.tension * strength) : (compCap > 0 ? -N / (compCap * strength) : Infinity);
                const bendRatio = m.material === "ROPE" ? 0 : (bend.get(m.id) ?? 0) / (mat.bending * strength);
                const r = axialRatio + bendRatio;
                this.axial.set(m.id, N);
                this.ratio.set(m.id, r);
                this.peak.set(m.id, Math.max(this.peak.get(m.id) ?? 0, r));
                const mode = bendRatio >= axialRatio ? "BENDING" : N >= 0 ? "TENSION" : compCap < mat.compression ? "BUCKLE" : "COMPRESSION";
                if (r > 1 && (!worst || r > worst.r))
                    worst = { m, mode, r };
            }
            if (changed)
                continue;
            // Break the most overloaded member, then look again: the load moves to whatever is left.
            if (worst) {
                this.breakMember(worst.m, worst.mode);
                continue;
            }
            this.wobbleNow = Math.max(0, ...[...compWobble.values()]);
            this.peakWobble = Math.max(this.peakWobble, this.wobbleNow);
            // Ropes that went slack this tick may tighten again next tick.
            this.slack.clear();
            return;
        }
        this.slack.clear();
    }
    breakMember(m, mode) {
        if (this.broken.has(m.id))
            return;
        this.broken.set(m.id, mode);
        this.brokenTick.set(m.id, this.tickCount);
        this.everBroken = true;
        this.ratio.set(m.id, 0);
        for (const l of this.loads)
            if (l.onMember === m.id && l.grow && !l.done) {
                l.done = true;
                l.held = l.applied;
                this.pending.push({ kind: "LOAD_TEST_DONE", sourceId: l.id, data: { held: round(l.held), broke: true } });
            }
        this.pending.push({ kind: mode === "COLLAPSE" ? "STRUCT_COLLAPSE" : mode === "UNSUPPORTED" ? "STRUCT_UNSUPPORTED" : "STRUCT_BREAK", sourceId: m.id, data: { mode, material: m.material } });
        for (const t of this.travellers)
            if (t.onMember === m.id && !t.fallen) {
                t.fallen = true;
                t.vy = 0;
                delete t.onMember;
                this.pending.push({ kind: "TRAVELLER_FELL", sourceId: t.id, targetId: m.id, data: { x: round(t.x) } });
            }
    }
}
function clamp(v) { return Math.max(-0.8, Math.min(0.8, v)); }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function round(v) { return Math.round(v * 1000) / 1000; }
// ------------------------------------------------------------------ placement help (BUILD mode)
/** Where a beam end should snap: another beam's end, an anchor, a cliff top or the floor. Placement only. */
export function beamEndSnap(x, y, layout, ignorePart, reach = 0.35) {
    let best;
    const consider = (px, py) => { const d = Math.hypot(px - x, py - y); if (d <= reach && (!best || d < best.d))
        best = { x: px, y: py, d }; };
    for (const a of layout.anchors)
        consider(a.x, a.y);
    layout.joints.forEach((j, i) => { if (ignorePart && layout.members.filter(m => m.a === i || m.b === i).every(m => m.partId === ignorePart) && !j.support)
        return; consider(j.x, j.y); });
    for (const s of layout.fixedSurfaces) {
        if (Math.abs(s.y1 - s.y2) > 1e-6)
            continue;
        if (x >= Math.min(s.x1, s.x2) && x <= Math.max(s.x1, s.x2) && Math.abs(y - s.y1) <= reach)
            consider(x, s.y1);
    }
    return best ? { x: best.x, y: best.y } : undefined;
}
