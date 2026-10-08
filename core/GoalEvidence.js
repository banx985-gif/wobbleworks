export function evaluateGoal(goal, metrics) {
    if (goal.kind === "METRIC" && goal.metric && goal.comparator && goal.value !== undefined) {
        const current = Number(metrics[goal.metric] ?? 0);
        return ({ LT: current < goal.value, LTE: current <= goal.value, GT: current > goal.value, GTE: current >= goal.value, EQ: current === goal.value })[goal.comparator];
    }
    if (goal.kind === "CHAIN")
        return Number(metrics.chainLength ?? 0) >= Number(goal.value ?? 1);
    if (goal.kind === "SURVIVE")
        return Boolean(metrics.survivalState);
    return false;
}
export function collectEvidence(rules, events) {
    return rules.filter(rule => events.filter(event => event.kind === rule.eventKind).length >= rule.minimumCount).map(rule => rule.conceptId);
}
