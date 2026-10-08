export const WHY_CHOICES = {
    TOO_FAST: { label: "Too fast", icon: "💨" },
    NOT_ENOUGH_FORCE: { label: "Not enough push", icon: "🪶" },
    TOO_MUCH_FORCE: { label: "Too much push", icon: "💥" },
    WRONG_DIRECTION: { label: "Wrong way", icon: "↩️" },
    NOT_CONNECTED: { label: "Not connected", icon: "🔗" },
    UNSTABLE: { label: "Wobbly / tipped", icon: "🙃" },
    TOO_HEAVY: { label: "Too heavy", icon: "🏋️" },
    TOO_LIGHT: { label: "Too light", icon: "🎈" },
    TOO_SLOW: { label: "Too slow", icon: "🐌" },
    JAMMED: { label: "Jammed", icon: "🔒" },
    BLOCKED: { label: "In the way", icon: "🚧" },
    TOO_SHORT: { label: "Not tall enough", icon: "📏" },
    SAME: { label: "About the same", icon: "⚖️" }
};
function tagged(build, tag) { return build.allParts().find(p => p.tags?.includes(tag)); }
function state(runtime, id) { try {
    return runtime.physics.state(id);
}
catch {
    return undefined;
} }
function nameOf(part) {
    const n = part.definitionId.replace(/^[a-z]+\./, "").replaceAll("-", " ");
    return n === "bolt" ? "Bolt" : `the ${n}`;
}
const m = (v) => `${v.toFixed(1)} m`;
/** Picks two other answers deterministically so the same failure shows the same card. */
function choicesFor(reason) {
    const structure = ["BLOCKED", "TOO_SHORT", "SAME", "UNSTABLE"].includes(reason);
    const gear = ["JAMMED", "TOO_SLOW", "TOO_HEAVY"].includes(reason);
    const pool = (structure ? ["UNSTABLE", "TOO_HEAVY", "NOT_CONNECTED", "BLOCKED", "TOO_SHORT", "TOO_FAST"] : gear ? ["TOO_FAST", "TOO_SLOW", "WRONG_DIRECTION", "NOT_CONNECTED", "JAMMED", "TOO_HEAVY"] : ["TOO_FAST", "NOT_ENOUGH_FORCE", "TOO_MUCH_FORCE", "WRONG_DIRECTION", "NOT_CONNECTED", "UNSTABLE"]).filter(r => r !== reason);
    const seed = reason.length;
    const a = pool[seed % pool.length], b = pool[(seed + 2) % pool.length];
    const three = [reason, a, b];
    return [three[seed % 3], three[(seed + 1) % 3], three[(seed + 2) % 3]];
}
/**
 * Diagnoses a failed run from its real evidence. Returns undefined when nothing clear was measured —
 * then Bolt simply doesn't ask (no made-up reasons).
 */
export function diagnoseRun(level, build, runtime) {
    if (!runtime || runtime.tick < 20)
        return undefined;
    const card = (reason, evidence) => ({ reason, evidence, choices: choicesFor(reason) });
    const rules = level?.outcomeRules ?? [];
    // Builder Bay: the structure's own measurements.
    const structureCard = diagnoseStructures(rules, build, runtime, card);
    if (structureCard)
        return structureCard;
    // Gear Garage: the gear train's own measurements explain most failures.
    const gearCard = diagnoseGears(rules, build, runtime, card);
    if (gearCard)
        return gearCard;
    // Structure first: a broken joint or a cart on its roof explains everything after it.
    if (runtime.causalEvents.some(e => e.kind === "STRUCTURE_BROKE"))
        return card("UNSTABLE", "A joint snapped during the test, so the machine came apart.");
    for (const cart of build.allParts().filter(p => p.definitionId === "motion.cart")) {
        const s = state(runtime, cart.id);
        if (!s)
            continue;
        const tilt = Math.abs(Math.atan2(Math.sin(s.angle), Math.cos(s.angle)));
        if (tilt > 1.2)
            return card("UNSTABLE", `The cart tipped over — it ended up turned ${Math.round(tilt * 180 / Math.PI)}°.`);
    }
    // A wheel sitting right next to a cart but never attached to it.
    for (const wheel of build.allParts().filter(p => p.definitionId === "motion.wheel")) {
        const near = build.allParts().find(p => p.definitionId === "motion.cart" && Math.hypot(p.position.x - wheel.position.x, p.position.y - wheel.position.y) < 1.65);
        const joined = near && build.allConnections().some(c => (c.fromPartId === near.id && c.toPartId === wheel.id) || (c.toPartId === near.id && c.fromPartId === wheel.id));
        if (near && !joined)
            return card("NOT_CONNECTED", "The wheel was next to the cart, but it wasn't attached, so they moved separately.");
    }
    // Crashing into a hazard (a barrier or danger line) means it arrived too fast to stop.
    const hazards = build.allParts().filter(p => p.tags?.some(t => t.startsWith("hazard.")));
    for (const subject of build.allParts().filter(p => p.tags?.some(t => t.startsWith("subject.")))) {
        const hit = runtime.causalEvents.find(e => e.kind === "PHYSICS_CONTACT" && hazards.some(h => (e.sourceId === h.id && e.targetId === subject.id) || (e.targetId === h.id && e.sourceId === subject.id)));
        if (hit)
            return card("TOO_FAST", `${cap(nameOf(subject))} crashed into the barrier at ${(hit.tick / 60).toFixed(1)}s — it was still going too fast to stop.`);
    }
    for (const rule of rules) {
        if (rule.kind === "FORBIDDEN_CONTACT" || rule.kind === "OBJECT_STOPS_BEFORE_X") {
            const tag = rule.kind === "FORBIDDEN_CONTACT" ? rule.aTag : rule.objectTag;
            const part = tagged(build, tag);
            const s = part && state(runtime, part.id);
            if (!part || !s)
                continue;
            const v = Math.hypot(s.vx, s.vy);
            if (rule.kind === "OBJECT_STOPS_BEFORE_X" && s.x > rule.maxX)
                return card("TOO_FAST", `${cap(nameOf(part))} rolled ${m(s.x - rule.maxX)} past the danger line — it was still too fast.`);
            if (rule.kind === "OBJECT_STOPS_BEFORE_X" && v > rule.maxSpeed && runtime.elapsedTime >= rule.minElapsed)
                return card("TOO_FAST", `${cap(nameOf(part))} was still moving at ${v.toFixed(1)} m/s — it needs to slow down more.`);
        }
        if (rule.kind === "OBJECT_ENTERS_ZONE") {
            const subject = tagged(build, rule.objectTag), zone = tagged(build, rule.zoneTag);
            const s = subject && state(runtime, subject.id);
            if (!subject || !zone || !s)
                continue;
            const startD = Math.hypot(subject.position.x - zone.position.x, subject.position.y - zone.position.y);
            const nowD = Math.hypot(s.x - zone.position.x, s.y - zone.position.y);
            const v = Math.hypot(s.vx, s.vy);
            const moved = Math.hypot(s.x - subject.position.x, s.y - subject.position.y);
            if (nowD <= rule.radius && rule.maxSpeed !== undefined && v > rule.maxSpeed)
                return card("TOO_FAST", `${cap(nameOf(subject))} reached the spot at ${v.toFixed(1)} m/s — too fast for a safe landing.`);
            const dirToZone = Math.sign(zone.position.x - subject.position.x);
            const passed = dirToZone !== 0 && Math.sign(zone.position.x - s.x) === -dirToZone;
            if (s.x < -0.5 || s.x > 16.5)
                return card("TOO_MUCH_FORCE", `${cap(nameOf(subject))} flew right off the edge of the yard!`);
            if (v > 0.15) {
                if (passed && nowD > rule.radius && Math.sign(s.vx) === dirToZone)
                    return card("TOO_FAST", `${cap(nameOf(subject))} zoomed past the goal at ${v.toFixed(1)} m/s and kept going.`);
                continue; // still moving: no verdict yet
            }
            if (subject.position.y > zone.position.y + 0.8 && s.y > zone.position.y + 0.8)
                return card("NOT_ENOUGH_FORCE", `${cap(nameOf(subject))} never got up high enough — the goal is ${m(s.y - zone.position.y)} higher than where it ended.`);
            if (moved < 0.3)
                return card("NOT_ENOUGH_FORCE", `${cap(nameOf(subject))} hardly moved (${m(moved)}). Nothing pushed it toward the goal.`);
            const went = Math.sign(s.x - subject.position.x);
            if (nowD > startD + 0.5 && dirToZone !== 0 && went === -dirToZone)
                return card("WRONG_DIRECTION", `${cap(nameOf(subject))} went the other way — it ended ${m(nowD - startD)} farther from the goal than where it started.`);
            if (passed && nowD > rule.radius)
                return card("TOO_MUCH_FORCE", `${cap(nameOf(subject))} overshot — it landed ${m(nowD)} past the goal.`);
            if (nowD > rule.radius)
                return card("NOT_ENOUGH_FORCE", `${cap(nameOf(subject))} stopped ${m(nowD)} short of the goal.`);
        }
        if (rule.kind === "DISTANCE_FROM_START") {
            const subject = tagged(build, rule.objectTag);
            const s = subject && state(runtime, subject.id);
            if (!subject || !s)
                continue;
            const d = Math.hypot(s.x - subject.position.x, s.y - subject.position.y);
            if (Math.hypot(s.vx, s.vy) < 0.1 && d < rule.minDistance)
                return card("NOT_ENOUGH_FORCE", `${cap(nameOf(subject))} travelled ${m(d)}, but the goal is ${m(rule.minDistance)}. Something slowed it down.`);
        }
    }
    return undefined;
}
const WHO = { BOLT: "Bolt", ELEPHANT: "the elephant robot", CART: "the cart", ROBOT: "a parade robot" };
function diagnoseStructures(rules, build, runtime, card) {
    const st = runtime.structures;
    const ev = runtime.causalEvents;
    const n = (v) => v.toFixed(1);
    if (ev.some(e => e.kind === "WINCH_UNSUPPORTED"))
        return card("NOT_CONNECTED", "The winch had nothing holding it up, so it couldn't lift anything.");
    const isStructLevel = rules.some(r => r.kind.startsWith("STRUCT_"));
    if (!isStructLevel && !st.members.length)
        return undefined;
    const material = (id) => { const m = st.members.find(x => x.id === id); return m ? m.material === "WOOD" ? "wooden" : m.material === "METAL" ? "metal" : "rope" : ""; };
    // A beam with a loose end (resting on nothing, joined to nothing) just tips down: that is "not connected", not "no triangles".
    const dangling = st.members.find(m => { const ms = st.memberState(m.id); if (ms.breakMode !== "COLLAPSE" && ms.breakMode !== "UNSUPPORTED")
        return false; return [m.a, m.b].some(j => !st.layout.joints[j].supported && st.members.filter(x => x.a === j || x.b === j).length === 1); });
    if (dangling)
        return card("NOT_CONNECTED", "One end of a beam wasn't resting on anything or joined to anything, so it tipped down.");
    // Experiments: the comparison itself is the lesson, so report it before any breakage.
    for (const r of rules)
        if (r.kind === "STRUCT_COMPARE") {
            const ta = tagged(build, r.aTag), tb = tagged(build, r.bTag);
            const la = ta && st.load(ta.id), lb = tb && st.load(tb.id);
            if (la?.done && lb?.done && la.held > 0 && lb.held > 0 && Math.max(la.held, lb.held) / Math.min(la.held, lb.held) < r.minRatio)
                return card("SAME", `A held ${n(la.held)} and B held ${n(lb.held)} — almost the same. Make the two bridges different.`);
        }
    // Whatever gave way FIRST is the cause; later collapses are just the result.
    const firstFailure = ev.find(e => e.kind === "STRUCT_COLLAPSE" || e.kind === "STRUCT_BREAK");
    const collapse = firstFailure?.kind === "STRUCT_COLLAPSE" ? firstFailure : undefined;
    if (collapse)
        return card("UNSTABLE", "Part of the structure leaned over and fell down — it had no triangles to stop it changing shape.");
    const brk = firstFailure?.kind === "STRUCT_BREAK" ? firstFailure : undefined;
    if (brk) {
        const mode = String(brk.data?.mode ?? "");
        const mat = material(brk.sourceId);
        const what = mode === "BENDING" ? "bent too much in the middle and snapped" : mode === "BUCKLE" ? "was squashed until it buckled sideways" : mode === "TENSION" ? "was pulled until it snapped" : "was squashed until it broke";
        return card("TOO_HEAVY", `A ${mat} beam ${what}. Stronger material, a shorter span or a triangle would share the load.`);
    }
    const blocked = ev.find(e => e.kind === "TRAVELLER_BLOCKED");
    if (blocked) {
        const who = WHO[registryWho(build, blocked.sourceId)] ?? "someone";
        return card("BLOCKED", `Something you built was in the way, so ${who} couldn't get past.`);
    }
    const fell = ev.find(e => e.kind === "TRAVELLER_FELL");
    if (fell) {
        const who = WHO[registryWho(build, fell.sourceId)] ?? "someone";
        return card("NOT_CONNECTED", `${cap(who)} walked off the edge at ${n(Number(fell.data?.x ?? 0))} m — the path didn't reach all the way.`);
    }
    for (const r of rules) {
        if (r.kind === "STRUCT_EGG_SAFE") {
            const egg = tagged(build, r.eggTag);
            const e = egg && st.egg(egg.id);
            if (e?.landed) {
                if (!e.onStructure)
                    return card("NOT_CONNECTED", "Nothing caught the egg — it fell all the way to the floor.");
                if ((e.impact ?? 0) > r.maxImpact)
                    return card("TOO_FAST", `The egg landed with a bump of ${n(e.impact ?? 0)}; it can only take ${n(r.maxImpact)}. A shorter drop or a softer catch helps.`);
            }
        }
        if (r.kind === "STRUCT_HEIGHT") {
            const top = st.topY();
            if (top === undefined || top > r.aboveY)
                return card("TOO_SHORT", top === undefined ? "Nothing was left standing." : `The top reached ${n(8.2 - top)} m high, but the flag is at ${n(8.2 - r.aboveY)} m.`);
            if (st.wobble() > r.maxWobble)
                return card("UNSTABLE", `The tower swayed ${n(st.wobble() * 100)} cm in the wind — it needs to stay steadier.`);
        }
        if (r.kind === "STRUCT_STABLE" && st.wobble() > r.maxWobble)
            return card("UNSTABLE", `It moved ${n(st.wobble() * 100)} cm under the load. Bracing makes it stiffer.`);
        if (r.kind === "STRUCT_COMPARE") {
            const a = tagged(build, r.aTag), b = tagged(build, r.bTag);
            const la = a && st.load(a.id), lb = b && st.load(b.id);
            if (la?.done && lb?.done && la.held > 0 && lb.held > 0 && Math.max(la.held, lb.held) / Math.min(la.held, lb.held) < r.minRatio)
                return card("SAME", `A held ${n(la.held)} and B held ${n(lb.held)} — almost the same. Make the two bridges different.`);
            if ((la?.fell && la.held === 0) || (lb?.fell && lb.held === 0))
                return card("NOT_CONNECTED", "A test weight had no bridge under it and dropped straight into the canyon.");
        }
    }
    return undefined;
}
function registryWho(build, id) { const p = build.getPart(id); return p?.definitionId === "builder.elephant" ? "ELEPHANT" : p?.definitionId === "builder.cart" ? "CART" : p?.definitionId === "builder.robot" ? "ROBOT" : "BOLT"; }
function diagnoseGears(rules, build, runtime, card) {
    const g = runtime.gears;
    const n = (v) => v.toFixed(1);
    const targets = rules.flatMap((r) => r.kind === "GEAR_OUTPUT" ? [{ rule: r, tag: r.targetTag }] : r.kind === "GEAR_COMPARE" ? [{ rule: r, tag: r.aTag }, { rule: r, tag: r.bTag }] : []);
    // Any jam or stall anywhere is the headline.
    const jam = runtime.causalEvents.find(e => e.kind === "GEAR_JAMMED");
    if (jam)
        return card("JAMMED", jam.data?.reason === "CLASH" ? "Two gears were overlapping, so their teeth crashed and nothing could turn." : jam.data?.reason === "FIGHT" ? "Two drivers were trying to turn the same gears in different ways." : "Gears were meshed in a ring: each one tried to turn its neighbour the wrong way, so they all locked.");
    const stall = runtime.causalEvents.find(e => e.kind === "GEAR_STALLED");
    if (stall)
        return card("TOO_HEAVY", `The load needed ${n(Number(stall.data?.required ?? 0))} units of turning force but the driver only had ${n(Number(stall.data?.available ?? 0))}. A slower gear set-up is stronger.`);
    for (const { rule, tag } of targets) {
        const part = tagged(build, tag);
        if (!part)
            continue;
        const st = g.state(part.id);
        if (!st)
            continue;
        if (st.omega === 0) {
            const near = g.analysis.nearMisses.filter(m => m.a === part.id || m.b === part.id || g.analysis.axleOf.get(m.a) === g.analysis.axleOf.get(part.id) || g.analysis.axleOf.get(m.b) === g.analysis.axleOf.get(part.id)).sort((p, q) => p.gap - q.gap)[0];
            return card("NOT_CONNECTED", near ? `A gear here was ${n(near.gap)} m away from touching the next one, so the turning never arrived.` : "Nothing was turning this part — no gear touched it and joined it to the driver.");
        }
        if (rule.kind !== "GEAR_OUTPUT")
            continue;
        if (rule.direction === "CW" && st.omega < 0)
            return card("WRONG_DIRECTION", "It turned anticlockwise, but it needed to turn clockwise. Each pair of touching gears swaps the direction.");
        if (rule.direction === "CCW" && st.omega > 0)
            return card("WRONG_DIRECTION", "It turned clockwise, but it needed to turn anticlockwise. Each pair of touching gears swaps the direction.");
        if (rule.maxSpeed !== undefined && Math.abs(st.omega) > rule.maxSpeed)
            return card("TOO_FAST", `It spun at ${n(Math.abs(st.omega))} turns-speed — faster than the safe ${n(rule.maxSpeed)}.`);
        if (rule.minSpeed !== undefined && Math.abs(st.omega) < rule.minSpeed)
            return card("TOO_SLOW", `It turned at ${n(Math.abs(st.omega))}, but it needs at least ${n(rule.minSpeed)}. It was ${n(Math.abs(st.factor))} times the driver's speed.`);
    }
    const cmp = rules.find(r => r.kind === "GEAR_COMPARE");
    if (cmp?.kind === "GEAR_COMPARE") {
        const a = tagged(build, cmp.aTag), b = tagged(build, cmp.bTag);
        const wa = a ? Math.abs(g.omega(a.id)) : 0, wb = b ? Math.abs(g.omega(b.id)) : 0;
        if (wa && wb && Math.max(wa, wb) / Math.min(wa, wb) < cmp.minRatio)
            return card("TOO_SLOW", `A turned at ${n(wa)} and B at ${n(wb)} — almost the same. Make the two set-ups different.`);
    }
    return undefined;
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
