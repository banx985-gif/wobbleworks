export const MOTION_PERFORMANCE_BUDGET = Object.freeze({
    targetFrameMs: 16.67,
    targetSimulationMs: 6,
    maxAuthoredBodiesPerMission: 24,
    maxAvailablePartTypesPerMission: 12,
    maxPlayerAddedParts: 24
});
export function validateMotionLevelBudget(level) {
    var _a, _b, _c, _d;
    const authoredBodies = ((_b = (_a = level.starterParts) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + ((_d = (_c = level.staticObjects) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0);
    const issues = [];
    if (authoredBodies > MOTION_PERFORMANCE_BUDGET.maxAuthoredBodiesPerMission)
        issues.push(`authored bodies ${authoredBodies} > ${MOTION_PERFORMANCE_BUDGET.maxAuthoredBodiesPerMission}`);
    if (level.availablePartIds.length > MOTION_PERFORMANCE_BUDGET.maxAvailablePartTypesPerMission)
        issues.push(`available part types ${level.availablePartIds.length} > ${MOTION_PERFORMANCE_BUDGET.maxAvailablePartTypesPerMission}`);
    return { ok: issues.length === 0, issues };
}
