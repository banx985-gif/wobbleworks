export const MOTION_PERFORMANCE_BUDGET = Object.freeze({
    targetFrameMs: 16.67,
    targetSimulationMs: 6,
    maxAuthoredBodiesPerMission: 24,
    maxAvailablePartTypesPerMission: 12,
    maxPlayerAddedParts: 24
});
export function validateMotionLevelBudget(level) {
    const authoredBodies = (level.starterParts?.length ?? 0) + (level.staticObjects?.length ?? 0);
    const issues = [];
    if (authoredBodies > MOTION_PERFORMANCE_BUDGET.maxAuthoredBodiesPerMission)
        issues.push(`authored bodies ${authoredBodies} > ${MOTION_PERFORMANCE_BUDGET.maxAuthoredBodiesPerMission}`);
    if (level.availablePartIds.length > MOTION_PERFORMANCE_BUDGET.maxAvailablePartTypesPerMission)
        issues.push(`available part types ${level.availablePartIds.length} > ${MOTION_PERFORMANCE_BUDGET.maxAvailablePartTypesPerMission}`);
    return { ok: issues.length === 0, issues };
}
