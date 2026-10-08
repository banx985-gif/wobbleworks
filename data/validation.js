import { METRICS } from "../core/types.js";
const idPattern = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const metricSet = new Set(METRICS);
const portFamilies = new Set(["STRUCTURAL", "ROTATIONAL", "HINGE", "ROPE", "ELECTRICAL", "FLUID", "LOGIC"]);
export class ValidationError extends Error {
    constructor(message) { super(message); this.name = "ValidationError"; }
}
export function assertId(id, label = "id") {
    if (!idPattern.test(id))
        throw new ValidationError(`${label} must use lowercase stable-id naming: ${id}`);
}
export function assertPartDefinition(value) {
    if (!value || typeof value !== "object")
        throw new ValidationError("Part definition must be an object");
    const p = value;
    assertId(p.id, "part.id");
    assertId(p.familyId, "part.familyId");
    if (!p.displayName)
        throw new ValidationError("part.displayName is required");
    if (!Array.isArray(p.behaviours) || !Array.isArray(p.ports))
        throw new ValidationError("part behaviours/ports must be arrays");
    if (p.art) {
        assertId(p.art.assetId, "part.art.assetId");
        if (p.art.logicalSize.x <= 0 || p.art.logicalSize.y <= 0)
            throw new ValidationError("part art logical size must be positive");
    }
    for (const preset of p.presets ?? []) {
        assertId(preset.id, `preset on ${p.id}`);
        if (!preset.displayName)
            throw new ValidationError(`preset ${preset.id} displayName required`);
    }
    const seen = new Set();
    for (const port of p.ports) {
        assertId(port.id, `port id on ${p.id}`);
        if (seen.has(port.id))
            throw new ValidationError(`duplicate port ${port.id} on ${p.id}`);
        seen.add(port.id);
        if (!portFamilies.has(port.family))
            throw new ValidationError(`unknown port family ${String(port.family)}`);
        if (port.snapRadius < 0)
            throw new ValidationError(`negative snap radius on ${p.id}.${port.id}`);
    }
}
export function assertSupportedMetric(metric) {
    if (!metricSet.has(metric))
        throw new ValidationError(`Unsupported advertised metric: ${metric}`);
}
export function assertLevelDefinition(value, knownPartIds) {
    if (!value || typeof value !== "object")
        throw new ValidationError("Level must be an object");
    const l = value;
    if (l.schemaVersion !== 1)
        throw new ValidationError("Unsupported level schemaVersion");
    assertId(l.id, "level.id");
    if (!l.title || !l.environmentId)
        throw new ValidationError("level title/environmentId required");
    if (!Array.isArray(l.goals) || !Array.isArray(l.evidenceRules))
        throw new ValidationError("level goals/evidenceRules must be arrays");
    for (const partId of l.availablePartIds ?? []) {
        if (knownPartIds && !knownPartIds.has(partId))
            throw new ValidationError(`Unknown available part: ${partId}`);
    }
    const authoredInstances = [...(l.starterParts ?? []), ...(l.staticObjects ?? [])];
    for (const instance of authoredInstances) {
        if (knownPartIds && !knownPartIds.has(instance.definitionId))
            throw new ValidationError(`Unknown level part definition: ${instance.definitionId}`);
        for (const tag of instance.tags ?? [])
            assertId(tag, `tag on ${instance.id}`);
    }
    for (const spawn of l.spawns ?? [])
        if (knownPartIds && !knownPartIds.has(spawn.definitionId))
            throw new ValidationError(`Unknown spawn part definition: ${spawn.definitionId}`);
    for (const constraint of l.constraints ?? []) {
        assertId(constraint.id, "constraint.id");
        if (constraint.kind === "MAX_PARTS" && (!Number.isFinite(constraint.value) || Number(constraint.value) < 1))
            throw new ValidationError(`MAX_PARTS ${constraint.id} requires positive value`);
    }
    for (const goal of l.goals)
        if (goal.metric)
            assertSupportedMetric(goal.metric);
    const authoredTags = new Set(authoredInstances.flatMap(instance => [...(instance.tags ?? [])]));
    for (const rule of l.outcomeRules ?? []) {
        if (rule.kind === "OBJECT_ENTERS_ZONE") {
            if (rule.radius <= 0)
                throw new ValidationError(`OBJECT_ENTERS_ZONE requires positive radius`);
            if (!authoredTags.has(rule.objectTag) || !authoredTags.has(rule.zoneTag))
                throw new ValidationError(`Outcome rule references unknown authored tag`);
            if (rule.maxSpeed !== undefined && rule.maxSpeed < 0)
                throw new ValidationError(`Outcome maxSpeed cannot be negative`);
        }
        else if (rule.kind === "OBJECT_STOPS_BEFORE_X") {
            if (!authoredTags.has(rule.objectTag) || rule.maxSpeed < 0 || rule.minElapsed < 0)
                throw new ValidationError(`Invalid OBJECT_STOPS_BEFORE_X rule`);
        }
        else if (rule.kind === "DISTANCE_FROM_START") {
            if (!authoredTags.has(rule.objectTag) || rule.minDistance <= 0)
                throw new ValidationError(`Invalid DISTANCE_FROM_START rule`);
        }
        else if (rule.kind === "COMPARE_SPEED") {
            if (!authoredTags.has(rule.aTag) || !authoredTags.has(rule.bTag) || rule.minDelta < 0)
                throw new ValidationError(`Invalid COMPARE_SPEED rule`);
        }
        else if (rule.kind === "CONTACT_WITH_TAG") {
            if (!authoredTags.has(rule.objectTag) || !authoredTags.has(rule.otherTag))
                throw new ValidationError(`CONTACT_WITH_TAG references unknown authored tag`);
        }
        else if (rule.kind === "FORBIDDEN_CONTACT") {
            if (!authoredTags.has(rule.aTag) || !authoredTags.has(rule.bTag))
                throw new ValidationError(`FORBIDDEN_CONTACT references unknown authored tag`);
        }
        else if (rule.kind === "MECHANISM_FAMILY_COUNT") {
            if (rule.minimum < 1 || rule.definitionIds.length < rule.minimum)
                throw new ValidationError(`Invalid MECHANISM_FAMILY_COUNT rule`);
            for (const definitionId of rule.definitionIds)
                if (knownPartIds && !knownPartIds.has(definitionId))
                    throw new ValidationError(`Outcome rule references unknown part: ${definitionId}`);
        }
        else if (rule.kind === "ELAPSED_AT_LEAST" && rule.seconds < 0)
            throw new ValidationError(`ELAPSED_AT_LEAST cannot be negative`);
        else if (rule.kind === "GEAR_OUTPUT") {
            if (!authoredTags.has(rule.targetTag))
                throw new ValidationError(`GEAR_OUTPUT references unknown authored tag`);
            if ((rule.minSpeed ?? 0) < 0 || (rule.maxSpeed !== undefined && rule.maxSpeed < (rule.minSpeed ?? 0)) || (rule.minTurns ?? 0) < 0 || (rule.sustainSeconds ?? 0) < 0)
                throw new ValidationError(`Invalid GEAR_OUTPUT rule`);
        }
        else if (rule.kind === "STRUCT_ARRIVES") {
            if (!authoredTags.has(rule.travellerTag))
                throw new ValidationError(`STRUCT_ARRIVES references unknown authored tag`);
        }
        else if (rule.kind === "STRUCT_STABLE" || rule.kind === "STRUCT_HEIGHT") {
            if (rule.maxWobble <= 0 || rule.sustainSeconds < 0)
                throw new ValidationError(`Invalid ${rule.kind} rule`);
        }
        else if (rule.kind === "STRUCT_EGG_SAFE") {
            if (!authoredTags.has(rule.eggTag) || rule.maxImpact <= 0)
                throw new ValidationError(`Invalid STRUCT_EGG_SAFE rule`);
        }
        else if (rule.kind === "STRUCT_COMPARE") {
            if (!authoredTags.has(rule.aTag) || !authoredTags.has(rule.bTag) || rule.minRatio < 1)
                throw new ValidationError(`Invalid STRUCT_COMPARE rule`);
        }
        else if (rule.kind === "CIRCUIT_POWERED") {
            if (!authoredTags.has(rule.targetTag) || rule.minLevel <= 0 || rule.sustainSeconds < 0)
                throw new ValidationError(`Invalid CIRCUIT_POWERED rule`);
        }
        else if (rule.kind === "CIRCUIT_CONTROLLED") {
            if (!authoredTags.has(rule.targetTag) || !authoredTags.has(rule.controlTag))
                throw new ValidationError(`CIRCUIT_CONTROLLED tags must exist`);
        }
        else if (rule.kind === "CIRCUIT_COMPARE") {
            if (!authoredTags.has(rule.aTag) || !authoredTags.has(rule.bTag) || rule.minRatio < 1)
                throw new ValidationError(`Invalid CIRCUIT_COMPARE rule`);
        }
        else if (rule.kind === "ENERGY_AT_MOST") {
            if (!(rule.maxEnergy > 0))
                throw new ValidationError(`ENERGY_AT_MOST needs a positive limit`);
        }
        else if (rule.kind === "GEAR_COMPARE") {
            if (!authoredTags.has(rule.aTag) || !authoredTags.has(rule.bTag) || rule.minRatio < 1)
                throw new ValidationError(`Invalid GEAR_COMPARE rule`);
        }
    }
    for (const rule of l.evidenceRules) {
        if (!rule.truthContractId)
            throw new ValidationError(`Evidence rule ${rule.id} lacks truth contract mapping`);
        if (rule.minimumCount < 1)
            throw new ValidationError(`Evidence rule ${rule.id} minimumCount must be >= 1`);
    }
}
export function assertConnectionsReferenceKnownParts(connections, partIds) {
    for (const c of connections) {
        if (!partIds.has(c.fromPartId) || !partIds.has(c.toPartId))
            throw new ValidationError(`Connection ${c.id} references unknown part instance`);
    }
}
