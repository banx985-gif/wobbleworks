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
    if (rule.kind === "GEAR_OUTPUT") {
        return tagged(build, rule.targetTag).some(part => {
            const st = runtime.gears.state(part.id);
            if (!st || st.omega === 0)
                return false;
            if (rule.direction === "CW" && st.omega <= 0)
                return false;
            if (rule.direction === "CCW" && st.omega >= 0)
                return false;
            const speed = Math.abs(st.omega);
            if (rule.minSpeed !== undefined && speed < rule.minSpeed)
                return false;
            if (rule.maxSpeed !== undefined && speed > rule.maxSpeed)
                return false;
            if (rule.minTurns !== undefined && st.turns < rule.minTurns)
                return false;
            return st.runTicks >= Math.round((rule.sustainSeconds ?? 0) * 60);
        });
    }
    if (rule.kind === "GEAR_COMPARE") {
        const a = tagged(build, rule.aTag)[0], b = tagged(build, rule.bTag)[0];
        if (!a || !b)
            return false;
        const sa = runtime.gears.state(a.id), sb = runtime.gears.state(b.id);
        if (!sa || !sb || !sa.omega || !sb.omega || sa.runTicks < 60 || sb.runTicks < 60)
            return false;
        const fast = Math.max(Math.abs(sa.omega), Math.abs(sb.omega)), slow = Math.min(Math.abs(sa.omega), Math.abs(sb.omega));
        return fast / slow >= rule.minRatio;
    }
    if (rule.kind === "STRUCT_ARRIVES") {
        const ts = tagged(build, rule.travellerTag);
        return ts.length > 0 && ts.every(t => runtime.structures.traveller(t.id)?.arrived === true);
    }
    if (rule.kind === "STRUCT_STABLE")
        return runtime.structures.calmTicksBelow(rule.maxWobble) >= Math.round(rule.sustainSeconds * 60);
    if (rule.kind === "STRUCT_HEIGHT") {
        const top = runtime.structures.topY();
        return top !== undefined && top <= rule.aboveY && runtime.structures.calmTicksBelow(rule.maxWobble) >= Math.round(rule.sustainSeconds * 60);
    }
    if (rule.kind === "STRUCT_EGG_SAFE")
        return tagged(build, rule.eggTag).some(e => { const st = runtime.structures.egg(e.id); return st !== undefined && st.landed && st.onStructure && (st.impact ?? Infinity) <= rule.maxImpact; });
    if (rule.kind === "STRUCT_COMPARE") {
        const a = tagged(build, rule.aTag)[0], b = tagged(build, rule.bTag)[0];
        if (!a || !b)
            return false;
        const la = runtime.structures.load(a.id), lb = runtime.structures.load(b.id);
        if (!la?.done || !lb?.done || la.held <= 0 || lb.held <= 0)
            return false;
        return Math.max(la.held, lb.held) / Math.min(la.held, lb.held) >= rule.minRatio;
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
