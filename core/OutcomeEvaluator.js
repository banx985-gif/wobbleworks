function tagged(build, tag) {
    return build.allParts().filter(part => part.tags?.includes(tag));
}
function speed(runtime, id) {
    try {
        const s = runtime.physics.state(id);
        return Math.hypot(s.vx, s.vy);
    }
    catch {
        return 0;
    }
}
function position(runtime, part) {
    try {
        const s = runtime.physics.state(part.id);
        return { x: s.x, y: s.y };
    }
    catch {
        return part.position;
    }
}
function eventTargetMatches(runtime, build, targetTag, targetId) {
    if (!targetTag)
        return true;
    if (!targetId)
        return false;
    return tagged(build, targetTag).some(part => part.id === targetId);
}
export function evaluateOutcomeRule(rule, build, runtime) {
    if (rule.kind === "ELAPSED_AT_LEAST")
        return runtime.elapsedTime >= rule.seconds;
    if (rule.kind === "OBJECT_ENTERS_ZONE") {
        const objects = tagged(build, rule.objectTag), zones = tagged(build, rule.zoneTag);
        return objects.some(object => zones.some(zone => {
            const a = position(runtime, object), b = position(runtime, zone);
            const inZone = Math.hypot(a.x - b.x, a.y - b.y) <= rule.radius;
            return inZone && (rule.maxSpeed === undefined || speed(runtime, object.id) <= rule.maxSpeed);
        }));
    }
    if (rule.kind === "OBJECT_STOPS_BEFORE_X") {
        if (runtime.elapsedTime < rule.minElapsed)
            return false;
        return tagged(build, rule.objectTag).some(object => {
            const p = position(runtime, object);
            return p.x <= rule.maxX && speed(runtime, object.id) <= rule.maxSpeed;
        });
    }
    if (rule.kind === "DISTANCE_FROM_START") {
        return tagged(build, rule.objectTag).some(object => {
            const p = position(runtime, object);
            return Math.hypot(p.x - object.position.x, p.y - object.position.y) >= rule.minDistance;
        });
    }
    if (rule.kind === "COMPARE_SPEED") {
        const a = tagged(build, rule.aTag)[0], b = tagged(build, rule.bTag)[0];
        if (!a || !b)
            return false;
        const av = speed(runtime, a.id), bv = speed(runtime, b.id);
        return rule.faster === "A" ? av - bv >= rule.minDelta : bv - av >= rule.minDelta;
    }
    if (rule.kind === "EVENT_OCCURRED") {
        const count = runtime.causalEvents.filter(event => event.kind === rule.eventKind && eventTargetMatches(runtime, build, rule.targetTag, event.targetId)).length;
        return count >= (rule.minimumCount ?? 1);
    }
    if (rule.kind === "CONTACT_WITH_TAG") {
        const objects = new Set(tagged(build, rule.objectTag).map(part => part.id));
        const others = new Set(tagged(build, rule.otherTag).map(part => part.id));
        const count = runtime.causalEvents.filter(event => event.kind === "PHYSICS_CONTACT" && event.targetId !== undefined && ((objects.has(event.sourceId) && others.has(event.targetId)) || (objects.has(event.targetId) && others.has(event.sourceId)))).length;
        return count >= (rule.minimumCount ?? 1);
    }
    if (rule.kind === "FORBIDDEN_CONTACT") {
        const a = new Set(tagged(build, rule.aTag).map(part => part.id));
        const b = new Set(tagged(build, rule.bTag).map(part => part.id));
        return !runtime.causalEvents.some(event => event.kind === "PHYSICS_CONTACT" && event.targetId !== undefined && ((a.has(event.sourceId) && b.has(event.targetId)) || (a.has(event.targetId) && b.has(event.sourceId))));
    }
    if (rule.kind === "MECHANISM_FAMILY_COUNT") {
        const present = new Set(build.allParts().filter(part => rule.definitionIds.includes(part.definitionId)).map(part => part.definitionId));
        return present.size >= rule.minimum;
    }
    return false;
}
export function evaluateLevelOutcome(level, build, runtime) {
    if (!runtime)
        return { complete: false, passed: [] };
    const rules = level.outcomeRules ?? [];
    if (rules.length === 0)
        return { complete: false, passed: [] };
    const passed = rules.map(rule => evaluateOutcomeRule(rule, build, runtime));
    return { complete: passed.every(Boolean), passed };
}
