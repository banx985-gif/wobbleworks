import { evaluateLevelOutcome } from "../core/OutcomeEvaluator.js";
import { POWER_LAB } from "../power/PowerLab.js";
/** The labs added from M14 onward, in campaign order. Each lab milestone appends its module here. */
export const LAB_MODULES = [POWER_LAB];
export function labModule(labId) { return LAB_MODULES.find(m => m.labId === labId); }
/** Success uses the level file's rules only; discoveries come from the lab's own measurements. */
export function evaluateLabMission(module, level, build, runtime) {
    if (!runtime)
        return { levelId: level.id, success: false, discoveries: [] };
    return { levelId: level.id, success: evaluateLevelOutcome(level, build, runtime).complete, discoveries: module.collectDiscoveries(build, runtime) };
}
