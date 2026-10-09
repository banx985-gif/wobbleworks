function ordinary(lab, n) { var _a; return (_a = lab.missions.find(m => m.slot === "ORDINARY" && m.ordinaryNumber === n)) === null || _a === void 0 ? void 0 : _a.id; }
function bySlot(lab, slot) { var _a; return (_a = lab.missions.find(m => m.slot === slot)) === null || _a === void 0 ? void 0 : _a.id; }
function choiceIds(lab) { return lab.missions.filter(m => { var _a; return m.slot === "ORDINARY" && ((_a = m.ordinaryNumber) !== null && _a !== void 0 ? _a : 0) >= 4; }).map(m => m.id); }
export function labMissionUnlocked(lab, id, completed) {
    const meta = lab.missions.find(m => m.id === id);
    if (!meta)
        return false;
    if (completed.has(id))
        return true;
    // Creative-mode challenges are all open: nothing to unlock, nothing to clear.
    if (meta.slot === "CHALLENGE")
        return true;
    const o1 = ordinary(lab, 1), o2 = ordinary(lab, 2), o3 = ordinary(lab, 3);
    const firstThree = [o1, o2, o3].every(x => x !== undefined && completed.has(x));
    if (id === o1)
        return true;
    if (id === o2)
        return o1 !== undefined && completed.has(o1);
    if (id === o3)
        return o2 !== undefined && completed.has(o2);
    if (meta.slot === "ORDINARY" || meta.slot === "EXPERIMENT" || meta.slot === "SILLY")
        return firstThree;
    if (meta.slot === "MEGA")
        return firstThree && choiceIds(lab).some(c => completed.has(c));
    if (meta.slot === "EMERGENCY") {
        const mega = bySlot(lab, "MEGA");
        return mega !== undefined && completed.has(mega);
    }
    return false;
}
export function labCleared(lab, completed) {
    const emergency = bySlot(lab, "EMERGENCY");
    return emergency !== undefined && completed.has(emergency);
}
export function nextRequiredLabMission(lab, completed) {
    for (const n of [1, 2, 3]) {
        const id = ordinary(lab, n);
        if (id && !completed.has(id))
            return id;
    }
    const choices = choiceIds(lab);
    if (!choices.some(c => completed.has(c)))
        return choices[0];
    for (const slot of ["MEGA", "EMERGENCY"]) {
        const id = bySlot(lab, slot);
        if (id && !completed.has(id))
            return id;
    }
    return undefined;
}
export function labCompletionCount(lab, completed) {
    return { done: lab.missions.filter(m => completed.has(m.id)).length, total: lab.missions.length };
}
