import { isMagnetic } from "../magnets/MagnetSystem.js";
/** Does a program contain this block (with a sensor starting with the prefix, for IF/UNTIL)? */
function programUses(blocks, op, sensorPrefix) {
    return blocks.some(b => (b.op === op && (!sensorPrefix || ((b.op === "IF" || b.op === "UNTIL") && b.sensor.startsWith(sensorPrefix)))) || ((b.op === "REPEAT" || b.op === "UNTIL") && programUses(b.body, op, sensorPrefix)) || (b.op === "IF" && (programUses(b.then, op, sensorPrefix) || programUses(b.else, op, sensorPrefix))));
}
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
    if (rule.kind === "CIRCUIT_POWERED") {
        const loads = tagged(build, rule.targetTag);
        const need = Math.round(rule.sustainSeconds * 60);
        return loads.length > 0 && loads.every(l => runtime.circuits.ticksAtLeast(l.id, rule.minLevel) >= Math.max(1, need));
    }
    if (rule.kind === "CIRCUIT_CONTROLLED") {
        const controls = tagged(build, rule.controlTag), loads = tagged(build, rule.targetTag);
        if (!controls.length || !loads.length)
            return false;
        return loads.every(l => controls.some(c => { const t = runtime.circuits.controlTally(c.id, l.id); return t.closedOn >= Math.round(rule.minOnSeconds * 60) && t.openOff >= Math.round(rule.minOffSeconds * 60) && t.openOn <= 3; }));
    }
    if (rule.kind === "CIRCUIT_COMPARE") {
        const a = tagged(build, rule.aTag)[0], b = tagged(build, rule.bTag)[0];
        if (!a || !b)
            return false;
        const la = runtime.circuits.load(a.id), lb = runtime.circuits.load(b.id);
        if (!la || !lb || la.onTicks < 60 || lb.onTicks < 60 || la.power <= 0)
            return false;
        return lb.power / la.power >= rule.minRatio;
    }
    if (rule.kind === "ENERGY_AT_MOST")
        return runtime.circuits.energyUsed() <= rule.maxEnergy;
    if (rule.kind === "NO_OVERLOAD")
        return !runtime.circuits.sources().some(s => s.tripped);
    if (rule.kind === "ALL_IN_ZONE" || rule.kind === "NONE_IN_ZONE") {
        const objects = tagged(build, rule.objectTag), zones = tagged(build, rule.zoneTag);
        if (!objects.length || !zones.length)
            return false;
        const inside = (o) => zones.some(z => { const a = position(runtime, o), b = position(runtime, z); return Math.hypot(a.x - b.x, a.y - b.y) <= rule.radius; });
        if (rule.kind === "NONE_IN_ZONE")
            return runtime.elapsedTime >= (rule.minElapsed ?? 0) && !objects.some(inside);
        return objects.every(o => inside(o) && (rule.maxSpeed === undefined || speed(runtime, o.id) <= rule.maxSpeed));
    }
    if (rule.kind === "STAYS_PUT")
        return tagged(build, rule.objectTag).every(o => { const p = position(runtime, o); return Math.hypot(p.x - o.position.x, p.y - o.position.y) <= rule.maxMove; });
    if (rule.kind === "NO_PUSHING") {
        const objects = new Set(tagged(build, rule.objectTag).map(p => p.id));
        return !runtime.causalEvents.some(e => {
            if (e.kind !== "PHYSICS_CONTACT" || !e.targetId)
                return false;
            const other = objects.has(e.sourceId) ? e.targetId : objects.has(e.targetId) ? e.sourceId : undefined;
            if (!other || objects.has(other))
                return false;
            return runtime.isDynamicBody(other) || Boolean(runtime.partDefinition(other)?.behaviours.some(b => b.kind === "MAGNET_BAR"));
        });
    }
    if (rule.kind === "FLOAT_STABLE") {
        const objects = tagged(build, rule.objectTag);
        const need = Math.round(rule.sustainSeconds * 60);
        return objects.length > 0 && objects.every(o => runtime.magnets.floatingTicks(o.id) >= need && position(runtime, o).y <= rule.aboveY);
    }
    if (rule.kind === "MATERIALS_SORTED") {
        const samples = tagged(build, rule.sampleTag);
        if (!samples.length)
            return false;
        return samples.every(o => { const p = position(runtime, o); const moved = Math.hypot(p.x - o.position.x, p.y - o.position.y); return isMagnetic(runtime.partDefinition(o.id)) ? moved >= rule.minMove : moved <= rule.maxStill; });
    }
    if (rule.kind === "TANK_LEVEL") {
        const tanks = tagged(build, rule.tankTag);
        return tanks.length > 0 && tanks.every(t => { const st = runtime.water.tank(t.id); return st !== undefined && st.fraction >= (rule.minFraction ?? 0) && st.fraction <= (rule.maxFraction ?? 1); });
    }
    if (rule.kind === "WATER_RECEIVED") {
        if (runtime.elapsedTime < (rule.minElapsed ?? 0))
            return false;
        const ts = tagged(build, rule.targetTag);
        return ts.length > 0 && ts.every(t => { const w = runtime.water.waterReceived(t.id); return w >= (rule.min ?? 0) && w <= (rule.max ?? Infinity); });
    }
    if (rule.kind === "FILL_COMPARE") {
        const a = tagged(build, rule.aTag)[0], b = tagged(build, rule.bTag)[0];
        if (!a || !b)
            return false;
        const ta = runtime.water.fillTime(a.id, rule.fillFraction), tb = runtime.water.fillTime(b.id, rule.fillFraction);
        if (ta === undefined || tb === undefined)
            return false;
        return Math.max(ta, tb) / Math.max(1e-6, Math.min(ta, tb)) >= rule.minRatio;
    }
    if (rule.kind === "ROVER_DELIVERS") {
        const zones = tagged(build, rule.zoneTag);
        const cargo = rule.cargoTag ? tagged(build, rule.cargoTag) : [];
        return tagged(build, rule.roverTag).some(r => {
            const v = runtime.space.vessel(r.id);
            if (!v || !v.stable || !v.powered)
                return false;
            const p = position(runtime, r);
            return zones.some(z => Math.hypot(p.x - z.position.x, p.y - z.position.y) <= rule.radius) && cargo.every(c => v.attached.includes(c.id));
        });
    }
    if (rule.kind === "GRAVITY_COMPARE") {
        // A fair test: exactly one free object in each chamber, the same part with the same mass; then compare how long each took to land.
        const inZone = (tag) => {
            const z = tagged(build, tag)[0];
            if (!z)
                return [];
            const zone = runtime.space.zones.find(q => q.id === z.id);
            if (!zone)
                return [];
            return build.allParts().filter(p => p.parameters.locked !== true && runtime.isDynamicBody(p.id) && p.position.x >= zone.x1 && p.position.x < zone.x2);
        };
        const a = inZone(rule.aZoneTag), b = inZone(rule.bZoneTag);
        if (a.length !== 1 || b.length !== 1)
            return false;
        const pa = a[0], pb = b[0];
        if (pa.definitionId !== pb.definitionId || Math.abs(runtime.physics.mass(pa.id) - runtime.physics.mass(pb.id)) > 1e-9)
            return false;
        const ta = runtime.space.fallTime(pa.id), tb = runtime.space.fallTime(pb.id);
        if (ta === undefined || tb === undefined || ta <= 0)
            return false;
        return tb / ta >= rule.minRatio;
    }
    if (rule.kind === "FLIGHT_DISTANCE")
        return tagged(build, rule.craftTag).some(c => { const st = runtime.flight.craft(c.id); return st !== undefined && st.flying && st.maxX >= rule.minX; });
    if (rule.kind === "SAFE_LANDING") {
        if (runtime.elapsedTime < (rule.minElapsed ?? 0))
            return false;
        const objs = tagged(build, rule.objectTag);
        return objs.length > 0 && objs.every(o => runtime.flight.hasLanded(o.id) && runtime.flight.peakImpact(o.id) <= rule.maxImpact && speed(runtime, o.id) < 0.2);
    }
    if (rule.kind === "GATES_PASSED") {
        const gates = tagged(build, rule.gateTag);
        return gates.length > 0 && tagged(build, rule.craftTag).some(c => gates.every(g => runtime.flight.gatesPassed(c.id).includes(g.id)));
    }
    if (rule.kind === "STEADY_FLIGHT")
        return tagged(build, rule.craftTag).some(c => { const st = runtime.flight.craft(c.id); return st !== undefined && st.flying && st.maxX - c.position.x >= rule.minDistance && st.pitchSpread <= rule.maxPitchSpread; });
    if (rule.kind === "REACH_HEIGHT")
        return tagged(build, rule.objectTag).some(o => position(runtime, o).y <= rule.aboveY);
    if (rule.kind === "FLIGHT_COMPARE") {
        const a = tagged(build, rule.aTag)[0], b = tagged(build, rule.bTag)[0];
        if (!a || !b)
            return false;
        const sa = runtime.flight.craft(a.id), sb = runtime.flight.craft(b.id);
        if (sa?.landedX === undefined || sb?.landedX === undefined)
            return false;
        // How far each flew before touching down (sliding along the floor afterwards doesn't count).
        const da = sa.maxX - a.position.x, db = sb.maxX - b.position.x;
        if (da <= 0.2 || db <= 0.2)
            return false;
        return Math.max(da, db) / Math.min(da, db) >= rule.minRatio;
    }
    if (rule.kind === "ROBOT_AT" || rule.kind === "ROBOT_NO_CRASH" || rule.kind === "ROBOT_RACE") {
        const zoneCells = (tag) => tagged(build, tag).map(z => `${Math.round(z.position.x)},${Math.round(z.position.y)}`);
        if (rule.kind === "ROBOT_AT") {
            const cells = new Set(zoneCells(rule.zoneTag));
            const bots = tagged(build, rule.robotTag);
            return bots.length > 0 && bots.every(b => { const v = runtime.robots.robot(b.id); return v !== undefined && v.done && !v.crashed && cells.has(`${Math.round(v.x)},${Math.round(v.y)}`) && (rule.maxBlocks === undefined || v.blocks <= rule.maxBlocks); });
        }
        if (rule.kind === "ROBOT_NO_CRASH")
            return tagged(build, rule.robotTag).every(b => { const v = runtime.robots.robot(b.id); return v !== undefined && !v.crashed && v.bumps <= (rule.maxBumps ?? 0); });
        const a = tagged(build, rule.aTag)[0], b = tagged(build, rule.bTag)[0];
        if (!a || !b)
            return false;
        const va = runtime.robots.robot(a.id), vb = runtime.robots.robot(b.id);
        if (!va?.done || !vb?.done || va.crashed || vb.crashed || va.doneAt === undefined || vb.doneAt === undefined)
            return false;
        return Math.max(va.doneAt, vb.doneAt) / Math.max(0.01, Math.min(va.doneAt, vb.doneAt)) >= rule.minRatio;
    }
    if (rule.kind === "BOX_AT") {
        const cells = new Set(tagged(build, rule.zoneTag).map(z => `${Math.round(z.position.x)},${Math.round(z.position.y)}`));
        const boxes = tagged(build, rule.boxTag);
        return boxes.length > 0 && boxes.every(b => { const v = runtime.robots.box(b.id); return v !== undefined && !v.carried && cells.has(`${v.x},${v.y}`); });
    }
    if (rule.kind === "PROGRAM_USES")
        return tagged(build, rule.robotTag).every(b => programUses(runtime.robots.programOf(b.id), rule.op, rule.sensorPrefix));
    if (rule.kind === "BUTTON_PRESSED") {
        const bs = tagged(build, rule.buttonTag);
        return bs.length > 0 && bs.every(b => runtime.robots.isPressed(b.id));
    }
    if (rule.kind === "PRODUCTS_MADE")
        return runtime.robots.productCount() >= rule.count;
    if (rule.kind === "DANCE_SCORE")
        return runtime.robots.danceScore() >= rule.minSteps;
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
