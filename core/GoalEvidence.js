export function evaluateGoal(goal, metrics) {
    var _a, _b, _c;
    if (goal.kind === "METRIC" && goal.metric && goal.comparator && goal.value !== undefined) {
        const current = Number((_a = metrics[goal.metric]) !== null && _a !== void 0 ? _a : 0);
        return ({ LT: current < goal.value, LTE: current <= goal.value, GT: current > goal.value, GTE: current >= goal.value, EQ: current === goal.value })[goal.comparator];
    }
    if (goal.kind === "CHAIN")
        return Number((_b = metrics.chainLength) !== null && _b !== void 0 ? _b : 0) >= Number((_c = goal.value) !== null && _c !== void 0 ? _c : 1);
    if (goal.kind === "SURVIVE")
        return Boolean(metrics.survivalState);
    return false;
}
export function collectEvidence(rules, events) {
    return rules.filter(rule => events.filter(event => event.kind === rule.eventKind).length >= rule.minimumCount).map(rule => rule.conceptId);
}
