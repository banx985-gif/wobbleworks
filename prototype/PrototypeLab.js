import { regionStatus } from "../progression/Campus.js";
import { PROTOTYPE_LAB } from "../progression/CampaignData.js";
/**
 * The Hidden Prototype Lab (M33): the secret bonus chain. It opens when the three strange key pieces are found
 * (from the silly side missions — exploring is how you find it), in the full game. Its 12 challenges are a chain:
 * each opens when the one before it is done, and the last — Bolt's Missing Memory — gives Bolt back his final memory.
 * Every challenge is an ordinary level (content/prototype) checked by its own rules; the prototype parts are presets
 * of existing parts (src/content/prototypeParts.ts).
 */
export const PROTOTYPE_LAB_ID = "hidden-prototype-lab";
export const FINAL_PROTOTYPE_ID = "prototype.bolts-missing-memory";
export const PROTOTYPE_MISSIONS = PROTOTYPE_LAB.missions;
export function prototypeLabOpen(save, installed) { const st = regionStatus(save, PROTOTYPE_LAB_ID, installed); return st === "OPEN" || st === "CLEARED"; }
/** The bonus chain: the first challenge is open; each one after opens when the one before it is done. */
export function prototypeChallengeOpen(id, completed) {
    const i = PROTOTYPE_MISSIONS.findIndex(m => m.id === id);
    if (i < 0)
        return false;
    return i === 0 || completed.has(id) || completed.has(PROTOTYPE_MISSIONS[i - 1].id);
}
