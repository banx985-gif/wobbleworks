/**
 * Chain Reaction Workshop (M21): the chain counter.
 *
 * A chain is counted from EXPLICIT cause → effect edges, never from things merely happening at the same time:
 * a part joins the chain only when something already in the chain set it going (pushed it, rang it, toppled it,
 * powered it, turned it, blew it, pulled it, launched it, signalled it). Everything that starts by itself at the
 * very beginning of the TEST is a "starting action" (a root).
 *
 * Loop protection: an edge can only re-trigger a part already in the chain after a cooldown; each ordered pair
 * (A → B) counts at most once; and a part can be set going at most MAX_EFFECTS_PER_PART times. So a ball bouncing
 * between two springs forever adds a couple of edges, never hundreds.
 *
 * The chain's own toy mechanisms (dominoes, bells, a seesaw, a trapdoor, a duck cannon, confetti) are simple and
 * deterministic; everything else is the real lab systems (physics, circuits, gears, water, magnets, wind, robots,
 * boosters), read from what they measured this tick.
 */
export const CHAIN_RULES = Object.freeze({ /** see addEdge: loops back into the same sequence never count */ COOLDOWN_SECONDS: 0.4, MAX_PAIR_REPEATS: 1, MAX_EFFECTS_PER_PART: 3, REST_SPEED: 0.06, MOVE_SPEED: 0.3, REST_TICKS: 18, CONTACT_WINDOW_TICKS: 12, START_WINDOW_TICKS: 30 });
export function chainThing(def) { const b = def === null || def === void 0 ? void 0 : def.behaviours.find(x => x.kind === "CHAIN"); return (b === null || b === void 0 ? void 0 : b.kind) === "CHAIN" ? b.thing : undefined; }
export function domainOf(def) {
    switch (def === null || def === void 0 ? void 0 : def.category) {
        case "POWER": return "ELECTRICAL";
        case "MAGNET": return "MAGNETIC";
        case "WATER": return "WATER";
        case "AIR": return "AIR";
        case "LOGIC": return "ROBOT";
        case "SPACE": return def.id === "space.robot-arm" ? "ROBOT" : "SPACE";
        default: return "MECHANICAL";
    }
}
export class ChainSystem {
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
        Object.defineProperty(this, "nodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "edges", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "pairs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "rest", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "resting", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        /** Recent explicit causes (a magnet starting to pull, a jet starting to push) stay credited for a second while the body speeds up. */
        Object.defineProperty(this, "recentCause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "contacts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "controlWasOn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "gearWasOn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "jetWasOn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "dominoes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "mechs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "held", {
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
        Object.defineProperty(this, "elapsedTicks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "active", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pressed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "pressedBy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "linkedQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        for (const p of parts) {
            const t = chainThing(definition(p.definitionId));
            if (!t)
                continue;
            if (t === "DOMINO")
                this.dominoes.push({ part: p, dir: Number((_a = p.parameters.dir) !== null && _a !== void 0 ? _a : 1) < 0 ? -1 : 1, state: "UP", at: 0 });
            else if (t !== "COUNTER")
                this.mechs.push({ part: p, thing: t, fired: false, at: 0 });
        }
        // A trapdoor holds the body resting on it; a cannon holds the duck sitting in it.
        for (const m of this.mechs)
            if (m.thing === "TRAPDOOR" || m.thing === "CANNON") {
                const payload = parts.filter(q => q.id !== m.part.id && this.dynamicDef(q) && Math.abs(q.position.x - m.part.position.x) <= 0.6 && q.position.y < m.part.position.y && m.part.position.y - q.position.y <= 0.9).sort((a, b) => b.position.y - a.position.y)[0];
                if (payload)
                    this.held.set(payload.id, m.part.id);
            }
        this.active = parts.some(p => chainThing(definition(p.definitionId)) !== undefined);
    }
    dynamicDef(p) { var _a; const r = (_a = this.definition(p.definitionId)) === null || _a === void 0 ? void 0 : _a.behaviours.find(b => b.kind === "RIGID_BODY"); return (r === null || r === void 0 ? void 0 : r.kind) === "RIGID_BODY" && r.bodyType === "DYNAMIC"; }
    def(id) { const p = this.parts.find(q => q.id === id); return p ? this.definition(p.definitionId) : undefined; }
    part(id) { return this.parts.find(q => q.id === id); }
    inChain(id) { return this.nodes.has(id); }
    node(id) { return this.nodes.get(id); }
    nodeList() { return [...this.nodes.values()]; }
    // ---------------------------------------------------------------- the counter
    addRoot(id) {
        var _a;
        if (this.nodes.has(id))
            return;
        const d = this.def(id);
        this.nodes.set(id, { id, family: (_a = d === null || d === void 0 ? void 0 : d.familyId) !== null && _a !== void 0 ? _a : id, domain: domainOf(d), root: true, firstTick: this.elapsedTicks, lastTick: this.elapsedTicks, effects: 0, depth: 0 });
        this.pending.push({ kind: "CHAIN_START", sourceId: id });
    }
    /** A static mechanism that's always on (a spring, a wind fan) joins the chain where the part that reached it came from, without an edge of its own. */
    joinPassive(id, via) {
        var _a;
        if (this.nodes.has(id))
            return;
        const v = this.nodes.get(via);
        if (!v)
            return;
        const d = this.def(id);
        this.nodes.set(id, { id, family: (_a = d === null || d === void 0 ? void 0 : d.familyId) !== null && _a !== void 0 ? _a : id, domain: domainOf(d), root: false, firstTick: this.elapsedTicks, lastTick: this.elapsedTicks, effects: 0, depth: v.depth, ...(v.parent ? { parent: v.parent } : {}), passiveVia: via });
    }
    /** Record cause → effect if it is a real new step (see the loop rules above). */
    addEdge(causeId, effectId, kind) {
        var _a, _b, _c;
        const cause = this.nodes.get(causeId);
        if (!cause || causeId === effectId)
            return false;
        // A step back into its own chain (something earlier in the same sequence) is a loop, not a new step.
        if (this.nodes.has(effectId) && cause.passiveVia !== effectId && this.pathTo(causeId).some(n => n.id === effectId))
            return false;
        const pair = `${causeId}>${effectId}`;
        if (((_a = this.pairs.get(pair)) !== null && _a !== void 0 ? _a : 0) >= CHAIN_RULES.MAX_PAIR_REPEATS)
            return false;
        const existing = this.nodes.get(effectId);
        const t = this.elapsedTicks;
        if (existing && (t - existing.lastTick < CHAIN_RULES.COOLDOWN_SECONDS * 60 || existing.effects >= CHAIN_RULES.MAX_EFFECTS_PER_PART))
            return false;
        this.pairs.set(pair, ((_b = this.pairs.get(pair)) !== null && _b !== void 0 ? _b : 0) + 1);
        const d = this.def(effectId);
        const depth = cause.depth + 1;
        const domain = domainOf(d);
        // A starting action stays a start; anything else takes the deeper route if there is one.
        if (existing) {
            existing.lastTick = t;
            existing.effects++;
            if (!existing.root && depth > existing.depth) {
                existing.depth = depth;
                existing.parent = causeId;
            }
        }
        else
            this.nodes.set(effectId, { id: effectId, family: (_c = d === null || d === void 0 ? void 0 : d.familyId) !== null && _c !== void 0 ? _c : effectId, domain, root: false, firstTick: t, lastTick: t, effects: 1, depth, parent: causeId });
        const edge = { index: this.edges.length + 1, tick: t, causeId, effectId, kind, domain, depth };
        this.edges.push(edge);
        this.pending.push({ kind: "CHAIN_EDGE", sourceId: causeId, targetId: effectId, data: { kind, depth, n: edge.index } });
        return true;
    }
    /** Force phase: the toy mechanisms act (dominoes topple, the seesaw flips, the trapdoor opens, the cannon fires). */
    step(physics) {
        var _a, _b;
        if (!this.active)
            return;
        const t = this.elapsedTicks;
        this.fireQueued(physics);
        for (const id of this.held.keys()) {
            const p = this.part(id);
            if (!p)
                continue;
            try {
                physics.setPose(id, p.position.x, p.position.y, p.rotation);
                physics.setLinearVelocity(id, { x: 0, y: 0 });
            }
            catch { /* no body */ }
        }
        for (const d of this.dominoes)
            if (d.state === "FALLING" && t - d.at >= 21) {
                d.state = "DOWN";
                this.pending.push({ kind: "DOMINO_DOWN", sourceId: d.part.id });
                // The top of the falling domino lands up to one domino-height away: it topples, rings, presses or pushes whatever is there.
                const x0 = d.part.position.x, y0 = d.part.position.y;
                const reach = (x, y) => { const dx = (x - x0) * d.dir; return dx > 0.05 && dx <= 0.95 && Math.abs(y - y0) <= 0.55; };
                for (const e of this.dominoes)
                    if (e.state === "UP" && reach(e.part.position.x, e.part.position.y))
                        this.topple(e, d.part.id);
                for (const m of this.mechs)
                    if (!m.fired && (m.thing === "BELL" || m.thing === "TRAPDOOR" || m.thing === "CANNON") && reach(m.part.position.x, m.part.position.y))
                        this.fire(m, d.part.id, physics);
                for (const p of this.parts)
                    if (((_a = this.def(p.id)) === null || _a === void 0 ? void 0 : _a.behaviours.some(b => b.kind === "CIRCUIT" && b.role === "BUTTON")) && reach(p.position.x, p.position.y)) {
                        this.pressed.add(p.id);
                        this.pressedBy.set(p.id, d.part.id);
                    }
                for (const p of this.parts) {
                    if (!this.dynamicDef(p) || this.held.has(p.id))
                        continue;
                    if (!physics.has(p.id))
                        continue;
                    const st = physics.state(p.id);
                    if (reach(st.x, st.y) && Math.hypot(st.vx, st.vy) < 0.3) {
                        physics.setLinearVelocity(p.id, { x: d.dir * 1.6, y: st.vy });
                        this.pending.push({ kind: "DOMINO_PUSH", sourceId: d.part.id, targetId: p.id });
                    }
                }
            }
        // Bodies already in the chain set off what they touch.
        for (const p of this.parts) {
            if (!this.nodes.has(p.id) || !this.dynamicDef(p))
                continue;
            if (!physics.has(p.id))
                continue;
            const st = physics.state(p.id);
            const speed = Math.hypot(st.vx, st.vy);
            if (speed < 0.3)
                continue;
            const r = (_b = this.definition(p.definitionId)) === null || _b === void 0 ? void 0 : _b.behaviours.find(b => b.kind === "RIGID_BODY");
            const hw = (r === null || r === void 0 ? void 0 : r.kind) === "RIGID_BODY" ? r.width / 2 : 0.3, hh = (r === null || r === void 0 ? void 0 : r.kind) === "RIGID_BODY" ? r.height / 2 : 0.3;
            // Hitting a standing domino knocks it over — and the hit stops the thing that hit it (it bounces back a little).
            for (const d of this.dominoes)
                if (d.state === "UP" && Math.abs(st.x - d.part.position.x) <= hw + 0.1 && Math.abs(st.y - d.part.position.y) <= hh + 0.45) {
                    this.topple(d, p.id);
                    if ((d.part.position.x - st.x) * st.vx > 0)
                        physics.setLinearVelocity(p.id, { x: -0.25 * st.vx, y: st.vy });
                }
            for (const m of this.mechs) {
                if (m.fired && m.thing !== "BELL" && m.thing !== "CONFETTI")
                    continue;
                const near = Math.abs(st.x - m.part.position.x) <= hw + (m.thing === "SEESAW" ? 0.95 : 0.4) && Math.abs(st.y - m.part.position.y) <= hh + 0.45;
                if (!near)
                    continue;
                if (m.thing === "SEESAW") {
                    const side = (st.x - m.part.position.x) * this.launchSide(m);
                    if (side < -0.2 && st.vy > -0.2)
                        this.fire(m, p.id, physics);
                }
                else if ((m.thing === "BELL" || m.thing === "CONFETTI") && t - m.at < 60)
                    continue;
                else
                    this.fire(m, p.id, physics);
            }
        }
    }
    launchSide(m) { var _a; return String((_a = m.part.parameters.launch) !== null && _a !== void 0 ? _a : "right") === "left" ? -1 : 1; }
    /** A circuit button held down by a fallen domino. */
    buttonHeld(id) { return this.pressed.has(id); }
    topple(d, by) { d.state = "FALLING"; d.at = this.elapsedTicks; d.by = by; this.pending.push({ kind: "DOMINO_FALL", sourceId: by, targetId: d.part.id }); }
    fire(m, by, physics) {
        var _a, _b, _c;
        m.at = this.elapsedTicks;
        const first = !m.fired;
        m.fired = true;
        if (m.thing === "BELL") {
            this.pending.push({ kind: "BELL_RING", sourceId: by, targetId: m.part.id });
            return;
        }
        if (m.thing === "CONFETTI") {
            this.pending.push({ kind: "CONFETTI_BURST", sourceId: by, targetId: m.part.id });
            return;
        }
        if (!first)
            return;
        if (m.thing === "TRAPDOOR") {
            this.pending.push({ kind: "TRAPDOOR_OPEN", sourceId: by, targetId: m.part.id });
            for (const [id, h] of this.held)
                if (h === m.part.id) {
                    this.held.delete(id);
                    this.pending.push({ kind: "TRAPDOOR_DROP", sourceId: m.part.id, targetId: id });
                }
            return;
        }
        if (m.thing === "CANNON") {
            this.pending.push({ kind: "CANNON_TRIGGERED", sourceId: by, targetId: m.part.id });
            const a = m.part.rotation - Math.PI / 4, speed = Number((_a = m.part.parameters.power) !== null && _a !== void 0 ? _a : 7);
            for (const [id, h] of this.held)
                if (h === m.part.id) {
                    this.held.delete(id);
                    try {
                        physics.setLinearVelocity(id, { x: Math.cos(a) * speed, y: Math.sin(a) * speed });
                    }
                    catch { /* no body */ }
                    this.pending.push({ kind: "CANNON_FIRE", sourceId: m.part.id, targetId: id, data: { speed } });
                }
            return;
        }
        if (m.thing === "SEESAW") {
            this.pending.push({ kind: "SEESAW_FLIP", sourceId: by, targetId: m.part.id });
            const side = this.launchSide(m);
            for (const p of this.parts) {
                if (!this.dynamicDef(p) || p.id === by)
                    continue;
                if (!physics.has(p.id))
                    continue;
                const st = physics.state(p.id);
                if ((st.x - m.part.position.x) * side > 0.2 && Math.abs(st.x - m.part.position.x) <= 1.1 && st.y < m.part.position.y && m.part.position.y - st.y < 0.9) {
                    physics.setLinearVelocity(p.id, { x: side * Number((_b = m.part.parameters.throwX) !== null && _b !== void 0 ? _b : 1.2), y: -Number((_c = m.part.parameters.throw) !== null && _c !== void 0 ? _c : 6.5) });
                    this.pending.push({ kind: "SEESAW_LAUNCH", sourceId: m.part.id, targetId: p.id });
                }
            }
        }
    }
    /** After the tick's events are recorded: read what every system measured and grow the chain. */
    observe(world) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        if (!this.active)
            return;
        const t = this.elapsedTicks;
        const events = world.causalEvents.filter(e => e.tick === world.tick);
        for (const c of world.physics.contactEvents) {
            for (const [a, b] of [[c.a, c.b], [c.b, c.a]]) {
                const m = (_a = this.contacts.get(a)) !== null && _a !== void 0 ? _a : new Map();
                m.set(b, t);
                this.contacts.set(a, m);
            }
        }
        // Explicit causes this tick (who pushed, rang, toppled, launched or lifted what).
        const explicit = new Map();
        const fanFor = (bodyId) => { var _a; if (!world.physics.has(bodyId))
            return undefined; const st = world.physics.state(bodyId); let best; for (const p of this.parts) {
            if (!((_a = this.definition(p.definitionId)) === null || _a === void 0 ? void 0 : _a.behaviours.some(b => b.kind === "WIND_FAN")))
                continue;
            const d = Math.hypot(st.x - p.position.x, st.y - p.position.y);
            if (!best || d < best.d)
                best = { id: p.id, d };
        } return best === null || best === void 0 ? void 0 : best.id; };
        const drumFor = (beltId) => { var _a, _b; return (_b = (_a = this.parts.find(p => p.parameters.drives === beltId)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : beltId; };
        // A robot reacting to its signal joins first, so whatever it does in the same tick counts.
        for (const e of events)
            if (e.kind === "SENSOR_DECISION" && ((_b = e.data) === null || _b === void 0 ? void 0 : _b.sensor) === "SIGNAL" && ((_c = e.data) === null || _c === void 0 ? void 0 : _c.result) === true) {
                const listen = (_d = this.part(e.sourceId)) === null || _d === void 0 ? void 0 : _d.parameters.listen;
                if (typeof listen === "string")
                    this.addEdge(listen, e.sourceId, "PROGRAM");
            }
        // A mechanism that deliberately launches or releases something outranks a passing push in the same tick.
        const STRONG = new Set(["LAUNCHED", "CANNON_FIRE", "SEESAW_LAUNCH", "TRAPDOOR_DROP", "BOOSTER_IGNITED", "DOMINO_PUSH", "WINCH_LIFT"]);
        const strongTargets = new Set(events.filter(e => STRONG.has(e.kind) && e.targetId).map(e => e.targetId));
        for (const e of events) {
            const tgt = e.targetId;
            if (!tgt)
                continue;
            if (strongTargets.has(tgt) && !STRONG.has(e.kind) && ["SPRING_LAUNCH", "WIND_PUSH", "WATER_JET_PUSH", "CONVEYOR_CARRY", "MAGNET_PULL_MATERIAL", "MAGNET_HOLD"].includes(e.kind))
                continue;
            if (e.kind === "SPRING_LAUNCH")
                explicit.set(tgt, { source: e.sourceId, kind: "LAUNCH", passive: true });
            else if (e.kind === "WIND_PUSH") {
                const fan = fanFor(tgt);
                if (fan)
                    explicit.set(tgt, { source: fan, kind: "BLOW", passive: true });
            }
            else if (e.kind === "WATER_JET_PUSH")
                explicit.set(tgt, { source: e.sourceId, kind: "FLOW", passive: false });
            else if (e.kind === "CONVEYOR_CARRY")
                explicit.set(tgt, { source: drumFor(e.sourceId), kind: "PUSH", passive: false });
            else if (e.kind === "WINCH_LIFT")
                explicit.set(tgt, { source: e.sourceId, kind: "LIFT", passive: false });
            else if (e.kind === "MAGNET_PULL_MATERIAL" || e.kind === "MAGNET_HOLD")
                explicit.set(tgt, { source: e.sourceId, kind: "PULL", passive: false });
            else if (e.kind === "LAUNCHED" || e.kind === "CANNON_FIRE" || e.kind === "SEESAW_LAUNCH")
                explicit.set(tgt, { source: e.sourceId, kind: e.kind === "SEESAW_LAUNCH" ? "LIFT" : "LAUNCH", passive: false });
            else if (e.kind === "BOOSTER_IGNITED")
                explicit.set(tgt, { source: e.sourceId, kind: "LAUNCH", passive: false });
            else if (e.kind === "DOMINO_PUSH")
                explicit.set(tgt, { source: e.sourceId, kind: undefined, passive: false });
            else if (e.kind === "TRAPDOOR_DROP")
                explicit.set(tgt, { source: e.sourceId, kind: "RELEASE", passive: false });
            // The chain's own mechanisms: the thing that set them off is the cause.
            else if (e.kind === "DOMINO_FALL")
                this.addEdge(e.sourceId, tgt, "TOPPLE");
            else if (e.kind === "BELL_RING")
                this.addEdge(e.sourceId, tgt, "RING");
            else if (e.kind === "CONFETTI_BURST")
                this.addEdge(e.sourceId, tgt, "BURST");
            else if (e.kind === "SEESAW_FLIP")
                this.addEdge(e.sourceId, tgt, "ROTATE");
            else if (e.kind === "TRAPDOOR_OPEN" || e.kind === "CANNON_TRIGGERED")
                this.addEdge(e.sourceId, tgt, "PUSH");
            // A robot's program reacting to its signal, and a robot pressing a button.
            else if (e.kind === "BUTTON_PRESSED")
                this.addEdge(e.sourceId, tgt, "PRESS");
        }
        // A booster lights when the part it waits for gets power.
        for (const e of events)
            if (e.kind === "BOOSTER_IGNITED") {
                const wait = String((_f = (_e = this.part(e.sourceId)) === null || _e === void 0 ? void 0 : _e.parameters.waitFor) !== null && _f !== void 0 ? _f : "");
                const [k, id] = wait.split(":");
                if (k === "POWERED" && id)
                    this.addEdge(id, e.sourceId, "POWER");
            }
        for (const [id, c] of explicit)
            this.recentCause.set(id, { ...c, tick: t });
        // Moving bodies: a body that was resting and starts moving was set going by something.
        for (const p of this.parts) {
            if (!this.dynamicDef(p) || this.held.has(p.id))
                continue;
            if (!world.physics.has(p.id))
                continue;
            const st = world.physics.state(p.id);
            const speed = Math.hypot(st.vx, st.vy);
            const resting = (_g = this.resting.get(p.id)) !== null && _g !== void 0 ? _g : true;
            const ex = explicit.get(p.id);
            const recent = this.recentCause.get(p.id);
            const started = ex !== null && ex !== void 0 ? ex : (recent && t - recent.tick <= 60 ? recent : undefined);
            const kindFor = (k) => { var _a; return k !== null && k !== void 0 ? k : (st.vy < -0.5 ? "LIFT" : st.vy > 0.6 ? "FALL" : ((_a = this.definition(p.definitionId)) === null || _a === void 0 ? void 0 : _a.behaviours.some(b => b.kind === "RIGID_BODY" && b.shape === "CIRCLE")) ? "ROLL" : "PUSH"); };
            const credit = (source, kind, passive) => { if (passive && !this.nodes.has(source) && this.nodes.has(p.id))
                this.joinPassive(source, p.id); return this.addEdge(source, p.id, kind); };
            if (speed > CHAIN_RULES.MOVE_SPEED && resting) {
                this.resting.set(p.id, false);
                let done = false;
                if (started)
                    done = credit(started.source, kindFor(started.kind), started.passive) || this.nodes.has(p.id);
                if (!done) {
                    const recent = [...((_h = this.contacts.get(p.id)) !== null && _h !== void 0 ? _h : new Map()).entries()].filter(([o, at]) => t - at <= CHAIN_RULES.CONTACT_WINDOW_TICKS * 3 && this.nodes.has(o)).sort((a, b) => b[1] - a[1]);
                    for (const [o] of recent)
                        if (this.addEdge(o, p.id, kindFor())) {
                            done = true;
                            break;
                        }
                }
                if (!done && !this.nodes.has(p.id) && t <= CHAIN_RULES.START_WINDOW_TICKS)
                    this.addRoot(p.id);
            }
            else if (started && this.nodes.has(p.id))
                credit(started.source, kindFor(started.kind), started.passive);
            else if (started && !this.nodes.has(p.id) && started.passive === false)
                credit(started.source, kindFor(started.kind), false);
            // A body counts as resting again once it has been still for a moment.
            const still = speed < CHAIN_RULES.REST_SPEED ? ((_j = this.rest.get(p.id)) !== null && _j !== void 0 ? _j : 0) + 1 : 0;
            this.rest.set(p.id, still);
            if (still >= CHAIN_RULES.REST_TICKS)
                this.resting.set(p.id, true);
        }
        // Circuits: a button pressed by a resting body, a fallen domino or a robot; loads that come on.
        const fingers = new Set(world.fingerControls());
        for (const p of this.parts) {
            const d = this.definition(p.definitionId);
            const c = d === null || d === void 0 ? void 0 : d.behaviours.find(b => b.kind === "CIRCUIT");
            if ((c === null || c === void 0 ? void 0 : c.kind) !== "CIRCUIT")
                continue;
            if (c.role === "BUTTON" || c.role === "SWITCH") {
                const on = c.role === "BUTTON" ? world.buttonPressed(p.id) : fingers.has(p.id);
                const was = (_k = this.controlWasOn.get(p.id)) !== null && _k !== void 0 ? _k : false;
                this.controlWasOn.set(p.id, on || was && c.role === "SWITCH");
                if (on && !was) {
                    if (fingers.has(p.id)) {
                        this.addRoot(p.id);
                        continue;
                    }
                    const by = (_m = (_l = this.pressedBy.get(p.id)) !== null && _l !== void 0 ? _l : this.robotPresser(p.id, events)) !== null && _m !== void 0 ? _m : this.restingOn(p, world);
                    if (by && this.addEdge(by, p.id, "PRESS"))
                        continue;
                    if (t <= CHAIN_RULES.START_WINDOW_TICKS)
                        this.addRoot(p.id);
                }
            }
            else if (c.role === "LOAD") {
                const on = world.loadLevel(p.id) > 0.3;
                const was = (_o = this.controlWasOn.get(p.id)) !== null && _o !== void 0 ? _o : false;
                this.controlWasOn.set(p.id, on);
                if (on && !was) {
                    const control = this.latestControl(world.circuitMates(p.id));
                    if (control)
                        this.addEdge(control, p.id, "POWER");
                    else if (t <= CHAIN_RULES.START_WINDOW_TICKS)
                        this.addRoot(p.id);
                }
            }
        }
        // Gears: a gear that starts turning was turned by its motor or by the gear it touches (a whole train can start in one tick, so keep passing along it).
        const started = [];
        for (const p of this.parts) {
            const sp = world.gearSpeed(p.id);
            if (Number.isNaN(sp))
                continue;
            const on = Math.abs(sp) > 0.05;
            const was = (_p = this.gearWasOn.get(p.id)) !== null && _p !== void 0 ? _p : false;
            this.gearWasOn.set(p.id, on);
            if (on && !was && !((_q = this.def(p.id)) === null || _q === void 0 ? void 0 : _q.behaviours.some(b => b.kind === "CIRCUIT")))
                started.push(p.id);
        }
        for (let progress = true; progress && started.length;) {
            progress = false;
            for (let i = 0; i < started.length; i++) {
                const id = started[i];
                const by = world.gearNeighbours(id).find(n => this.nodes.has(n));
                if (by && this.addEdge(by, id, "ROTATE")) {
                    started.splice(i--, 1);
                    progress = true;
                }
            }
        }
        if (t <= CHAIN_RULES.START_WINDOW_TICKS)
            for (const id of started)
                this.addRoot(id);
        // Water: a nozzle that starts squirting was fed by its (powered) pump.
        for (const p of this.parts) {
            const flow = world.jetFlow(p.id);
            if (Number.isNaN(flow))
                continue;
            const on = flow > 0.05;
            const was = (_r = this.jetWasOn.get(p.id)) !== null && _r !== void 0 ? _r : false;
            this.jetWasOn.set(p.id, on);
            if (!on || was)
                continue;
            const pump = this.parts.find(q => q.definitionId === "plumb.pump" && this.nodes.has(q.id));
            if (pump)
                this.addEdge(pump.id, p.id, "FLOW");
            else if (t <= CHAIN_RULES.START_WINDOW_TICKS)
                this.addRoot(p.id);
        }
        // Trapdoors and cannons linked to another part fire when that part joins the chain.
        for (const m of this.mechs)
            if (!m.fired && typeof m.part.parameters.link === "string" && this.nodes.has(m.part.parameters.link))
                this.fireLinked(m);
        this.elapsedTicks++;
    }
    fireLinked(m) { if (!this.linkedQueue.includes(m))
        this.linkedQueue.push(m); }
    /** Force phase helper: fire anything whose linked part has joined the chain. */
    fireQueued(physics) { for (const m of this.linkedQueue.splice(0))
        this.fire(m, String(m.part.parameters.link), physics); }
    /** The control (button or switch) in this circuit that most recently joined the chain. */
    latestControl(mates) {
        let best;
        const same = new Set(mates);
        for (const n of this.nodes.values()) {
            if (!same.has(n.id))
                continue;
            const d = this.def(n.id);
            if (!(d === null || d === void 0 ? void 0 : d.behaviours.some(b => b.kind === "CIRCUIT" && (b.role === "BUTTON" || b.role === "SWITCH"))))
                continue;
            if (!best || n.lastTick > best.lastTick)
                best = n;
        }
        return best === null || best === void 0 ? void 0 : best.id;
    }
    robotPresser(buttonId, events) {
        const arena = this.parts.find(p => { var _a; return p.parameters.link === buttonId && chainThing(this.def(p.id)) === undefined && ((_a = this.def(p.id)) === null || _a === void 0 ? void 0 : _a.behaviours.some(b => b.kind === "ARENA")); });
        return arena && (this.nodes.has(arena.id) || events.some(e => e.kind === "BUTTON_PRESSED" && e.targetId === arena.id)) ? arena.id : undefined;
    }
    restingOn(button, world) {
        let best;
        for (const p of this.parts) {
            if (!this.nodes.has(p.id) || !this.dynamicDef(p))
                continue;
            if (!world.physics.has(p.id))
                continue;
            const st = world.physics.state(p.id);
            const d = Math.hypot(st.x - button.position.x, st.y - button.position.y);
            if (d < 1.2 && (!best || d < best.d))
                best = { id: p.id, d };
        }
        return best === null || best === void 0 ? void 0 : best.id;
    }
    // ---------------------------------------------------------------- read-only measures (rules, records, the HUD)
    roots() { return [...this.nodes.values()].filter(n => n.root).map(n => n.id); }
    /** The longest cause → effect sequence (edges). */
    longest() { return this.edges.reduce((m, e) => Math.max(m, e.depth), 0); }
    /** The path back from a part to its starting action, effect first. */
    pathTo(id) { const out = []; let n = this.nodes.get(id); const seen = new Set(); while (n && !seen.has(n.id)) {
        seen.add(n.id);
        out.push(n);
        n = n.parent ? this.nodes.get(n.parent) : undefined;
    } return out; }
    /** The steps along a part's path, first step first. */
    pathEdges(id) {
        const nodes = [...this.pathTo(id)].reverse();
        const out = [];
        for (let i = 1; i < nodes.length; i++) {
            const a = nodes[i - 1].id, b = nodes[i].id;
            const e = this.edges.filter(x => x.causeId === a && x.effectId === b).sort((x, y) => y.depth - x.depth)[0];
            if (e)
                out.push(e);
        }
        return out;
    }
    domains() { return [...new Set([...this.nodes.values()].map(n => n.domain))]; }
    families() { return [...new Set([...this.nodes.values()].map(n => n.family))]; }
    /** Seconds from the first edge to the last. */
    seconds() { if (!this.edges.length)
        return 0; return (this.edges[this.edges.length - 1].tick - Math.min(...[...this.nodes.values()].filter(n => n.root).map(n => n.firstTick), this.edges[0].tick)) / 60; }
    isHeld(id) { return this.held.has(id); }
    dominoState(id) { const d = this.dominoes.find(x => x.part.id === id); return d ? { state: d.state, dir: d.dir, progress: d.state === "FALLING" ? Math.min(1, (this.elapsedTicks - d.at) / 21) : d.state === "DOWN" ? 1 : 0 } : undefined; }
    mechState(id) { const m = this.mechs.find(x => x.part.id === id); return m ? { fired: m.fired, ago: (this.elapsedTicks - m.at) / 60 } : undefined; }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
