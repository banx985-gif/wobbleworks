import { activeProfile, isSafeId, newId, updateProfile } from "../app/AppState.js";
import { canonicalJson, payloadChecksum } from "../save/SaveManager.js";
/**
 * Build-Your-Own Challenge (M31). A player sets up a challenge in a Free Build room — start objects, one goal zone,
 * obstacles, the parts players may use and an optional part limit — and then MUST solve it themselves before it can
 * be saved ("Validated by Creator Test"). The game never claims a challenge is solvable any other way: there is no
 * general solver. Challenges are kept on the device so any inventor here can try them.
 */
/** Things a challenge can start with (the goal: get all of them into the goal zone). */
export const START_PARTS = ["motion.ball", "motion.cart", "motion.parcel", "silly.duck", "motion.marble"];
export const GOAL_PART = "motion.goal-zone";
/** Obstacles a creator can place (they become fixed parts of the challenge). */
export const OBSTACLE_PARTS = ["structure.block", "motion.ramp", "motion.platform", "motion.friction-high", "motion.friction-low", "motion.bounce-pad", "motion.barrier"];
export const CREATOR_PALETTE = [...START_PARTS, GOAL_PART, ...OBSTACLE_PARTS];
/** Complexity caps (kept inside the sandbox budgets). */
export const MAX_CUSTOM_CHALLENGES = 30, MAX_FIXED_PARTS = 40, MAX_ALLOWED_PARTS = 40, PART_LIMITS = [0, 3, 5, 10];
export const VALIDATED_LABEL = "Validated by Creator Test";
/** The room fingerprint: a proof only counts for exactly this set of fixed parts. */
export function roomHash(fixed) { return payloadChecksum(canonicalJson(fixed.map(p => ({ id: p.id, d: p.definitionId, x: p.position.x, y: p.position.y, r: p.rotation, t: p.tags ?? [] })))); }
/** Is the setup ready to be proven? Returns what is still missing. */
export function setupMissing(fixed, allowed) {
    if (!fixed.some(p => START_PARTS.includes(p.definitionId)))
        return "Place something to start with (a ball, cart, parcel, duck or marble).";
    const goals = fixed.filter(p => p.definitionId === GOAL_PART).length;
    if (goals === 0)
        return "Place the goal zone.";
    if (goals > 1)
        return "Use just one goal zone.";
    if (fixed.length > MAX_FIXED_PARTS)
        return `Use at most ${MAX_FIXED_PARTS} pieces in the room.`;
    if (!allowed.length)
        return "Choose at least one part that players may use.";
    return undefined;
}
/** The fixed parts as saved: locked, start objects tagged "start", the goal tagged "goal". */
export function fixedForChallenge(parts) {
    return parts.map(p => ({ ...p, parameters: { ...p.parameters, locked: true }, tags: [...new Set([...(p.tags ?? []).filter(t => t !== "start" && t !== "goal"), ...(START_PARTS.includes(p.definitionId) ? ["start"] : []), ...(p.definitionId === GOAL_PART ? ["goal"] : [])])] }));
}
/** The challenge as a playable level: get every start object into the goal (and stay inside the part limit). */
export function challengeLevel(c, room) {
    return { schemaVersion: 1, id: `custom.${c.id}`, title: c.name, environmentId: room?.environmentId ?? "env.workshop", availablePartIds: [...c.allowedParts], starterParts: [], starterConnections: [], constraints: [], environmentModifiers: [], goals: [],
        staticObjects: [...(room?.staticObjects ?? []), ...c.fixed], outcomeRules: [{ kind: "ALL_IN_ZONE", objectTag: "start", zoneTag: "goal", radius: 1 }], evidenceRules: [], hints: [], narrationCues: [`${c.name} — made by ${c.creatorName}.`] };
}
/** Saves a proven challenge on the device. Refused unless the proof is for exactly this room and inside the part limit. */
export function withCustomChallenge(save, input) {
    const p = activeProfile(save);
    if (!p)
        return { save, reason: "NO_PROFILE" };
    if ((save.customChallenges ?? []).length >= MAX_CUSTOM_CHALLENGES)
        return { save, reason: "FULL" };
    const fixed = fixedForChallenge(input.fixed);
    if (setupMissing(fixed, input.allowedParts))
        return { save, reason: "NOT_READY" };
    if (input.proof.roomHash !== roomHash(fixed) || (input.partLimit > 0 && input.proof.partsUsed > input.partLimit))
        return { save, reason: "NOT_PROVEN" };
    const name = input.name.replace(/[^\p{L}\p{N} '!?&()_-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 40) || "My Challenge";
    const challenge = { id: newId("cc"), name, creatorProfileId: p.id, creatorName: p.name, createdAtMs: input.nowMs ?? Date.now(), roomId: input.roomId, fixed, allowedParts: [...new Set(input.allowedParts)].slice(0, MAX_ALLOWED_PARTS), partLimit: input.partLimit, proof: { ...input.proof } };
    return { save: { ...save, customChallenges: [...(save.customChallenges ?? []), challenge] }, challenge };
}
/** Only the inventor who made a challenge can delete it. */
export function withoutCustomChallenge(save, id) {
    const p = activeProfile(save);
    const c = save.customChallenges.find(x => x.id === id);
    if (!p || !c || c.creatorProfileId !== p.id)
        return save;
    return { ...save, customChallenges: save.customChallenges.filter(x => x.id !== id) };
}
/** A solve by this inventor: remembered in their own records (fewest parts kept). */
export function withCustomSolve(save, id, partsUsed) {
    const p = activeProfile(save);
    if (!p)
        return { save, first: false, best: false };
    const k = `custom.${id}`;
    const before = p.records[`${k}.parts`];
    const first = p.records[`${k}.solved`] === undefined;
    const best = before === undefined || partsUsed < before;
    return { save: updateProfile(save, p.id, q => ({ ...q, records: { ...q.records, [`${k}.solved`]: (q.records[`${k}.solved`] ?? 0) + 1, ...(best ? { [`${k}.parts`]: partsUsed } : {}) } })), first, best };
}
export function customSolved(save, id) { const r = activeProfile(save)?.records ?? {}; const parts = r[`custom.${id}.parts`]; return { solved: r[`custom.${id}.solved`] !== undefined, ...(parts !== undefined ? { parts } : {}) }; }
export { isSafeId };
