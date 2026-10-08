import { activeProfile, MAX_EXPERIMENTS, MAX_TRIALS, newId, updateProfile } from "../app/AppState.js";
import { MAIN_LABS } from "../progression/CampaignData.js";
import { clearedLabIds, ownsFullGame, routeToRegion } from "../progression/Campus.js";
import { EXPERIMENT_TEMPLATES, experimentTemplate } from "./ExperimentTemplates.js";
/**
 * Experiment Lab (M22): Question → Prediction → Build A → Build B → Test → Compare → Change one thing → Retest → Save.
 * Pure helpers for the flow; the screens are in main.ts. Every result in a trial is a Metric Registry measurement.
 */
export { EXPERIMENT_TEMPLATES };
/** The lab opens with the full game once the Motion Yard is restored; each experiment once its own lab is open. */
export function experimentLabOpen(save) { return Boolean(activeProfile(save)) && ownsFullGame(save.entitlement) && clearedLabIds(save).includes(MAIN_LABS[0].id); }
export function experimentUnlocked(save, templateId) {
    const t = experimentTemplate(templateId);
    if (!t || !experimentLabOpen(save))
        return false;
    return routeToRegion(save, t.labId).kind === "ENTER";
}
/** Did the child change exactly one choice between two trials? */
export function changedOne(prev, next) { return (prev.a !== next.a ? 1 : 0) + (prev.b !== next.b ? 1 : 0) === 1; }
/** A comparison trial (A and B differ — the variable is the only thing that does). */
export function isComparison(t) { return t.a !== t.b; }
/** Discoveries a set of trials earns — all from what was measured, never from just finishing. */
export function experimentDiscoveries(trials, prediction) {
    const out = new Set();
    if (trials.some(isComparison))
        out.add("experiment.fair-test");
    const first = trials.find(isComparison);
    if (first && prediction && first.verdict === prediction)
        out.add("experiment.prediction");
    if (trials.some((t, i) => i > 0 && changedOne(trials[i - 1], t)))
        out.add("experiment.change-one");
    if (trials.some(t => !isComparison(t) && t.verdict === "SAME"))
        out.add("experiment.control");
    return [...out];
}
/** Save an experiment (newest kept; at most MAX_EXPERIMENTS per inventor, MAX_TRIALS trials each). */
export function withSavedExperiment(save, templateId, trials, prediction, nowMs = Date.now()) {
    const p = activeProfile(save);
    if (!p || !experimentTemplate(templateId) || !trials.length)
        return { save };
    const record = { id: newId("exp"), templateId, ...(prediction ? { prediction } : {}), trials: trials.slice(-MAX_TRIALS).map(t => ({ a: t.a, b: t.b, valueA: round(t.valueA), valueB: round(t.valueB), verdict: t.verdict })), savedAtMs: nowMs };
    return { save: updateProfile(save, p.id, q => ({ ...q, experiments: [...q.experiments, record].slice(-MAX_EXPERIMENTS) })), record };
}
export function savedExperiments(save, templateId) { return (activeProfile(save)?.experiments ?? []).filter(e => !templateId || e.templateId === templateId); }
function round(v) { return Math.round(v * 1000) / 1000; }
export const EXPERIMENT_PARENT_MAPPINGS = Object.freeze([
    { concept: "Fair tests", evidence: "ran a fair test, changing only one thing between A and B", discoveryId: "experiment.fair-test" },
    { concept: "Fair tests", evidence: "made a prediction before testing and checked it against the result", discoveryId: "experiment.prediction" },
    { concept: "Fair tests", evidence: "changed one thing and tested again", discoveryId: "experiment.change-one" }
]);
export const EXPERIMENT_CONCEPT_EVIDENCE = {
    "experiment.fair-test": "A and B were the same except for one thing, and both were measured.",
    "experiment.prediction": "The prediction matched what was measured.",
    "experiment.change-one": "Between two trials, exactly one thing was changed.",
    "experiment.control": "A and B were set up the same and came out about the same — a good check."
};
