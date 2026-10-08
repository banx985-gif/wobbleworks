export const WHY_CHOICES = {
    TOO_FAST: { label: "Too fast", icon: "💨" },
    NOT_ENOUGH_FORCE: { label: "Not enough push", icon: "🪶" },
    TOO_MUCH_FORCE: { label: "Too much push", icon: "💥" },
    WRONG_DIRECTION: { label: "Wrong way", icon: "↩️" },
    NOT_CONNECTED: { label: "Not connected", icon: "🔗" },
    UNSTABLE: { label: "Wobbly / tipped", icon: "🙃" },
    TOO_HEAVY: { label: "Too heavy", icon: "🏋️" },
    TOO_LIGHT: { label: "Too light", icon: "🎈" }
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
    const pool = ["TOO_FAST", "NOT_ENOUGH_FORCE", "TOO_MUCH_FORCE", "WRONG_DIRECTION", "NOT_CONNECTED", "UNSTABLE"].filter(r => r !== reason);
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
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
