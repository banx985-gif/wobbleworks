import { activeProfile, updateProfile } from "../app/AppState.js";
import { CHAIN_WORKSHOP, MAIN_LABS } from "../progression/CampaignData.js";
import { clearedLabIds, ownsFullGame } from "../progression/Campus.js";
import { CHAIN_RULES } from "./ChainSystem.js";
/**
 * Chain Reaction Workshop (M21): a permanent creative mode with 12 starter challenges.
 * Truth (truth.chain.v1): a chain is only what really caused what — explicit cause → effect steps measured by the
 * systems that did them. Things that merely happen at the same time are not linked, and loops can't farm steps.
 */
export const CHAIN_TRUTH_CONTRACT = Object.freeze({
    id: "truth.chain.v1",
    domain: "Cause and effect",
    preserve: ["each step is something that really set the next thing going", "one starting action", "loops can't be counted again and again"],
    simplify: ["dominoes, bells, the seesaw, trapdoor and duck cannon are simple toy mechanisms"],
    neverImply: ["two things happening at the same time means one caused the other"]
});
export { CHAIN_RULES };
export const CHAIN_MISSIONS = CHAIN_WORKSHOP.missions;
/** The workshop opens once the Motion Yard is restored, in the full game (or while a grown-up is testing). */
export function chainWorkshopOpen(save) { return Boolean(activeProfile(save)) && ownsFullGame(save.entitlement) && clearedLabIds(save).includes(MAIN_LABS[0].id); }
export function chainStats(runtime) {
    const c = runtime.chain;
    return { longest: c.longest(), steps: c.edges.length, domains: c.domains().length, families: c.families().length, seconds: Math.round(c.seconds() * 10) / 10, starts: c.roots().length };
}
/** Personal records live in the profile's existing `records` table (no new save field). Returns the save and which records were beaten. */
export const CHAIN_RECORD_KEYS = { longest: "chain.longest", steps: "chain.steps", domains: "chain.domains", families: "chain.families", seconds: "chain.seconds" };
export function withChainRecords(save, stats) {
    const p = activeProfile(save);
    if (!p || stats.steps === 0)
        return { save, beaten: [] };
    const beaten = Object.keys(CHAIN_RECORD_KEYS).filter(k => stats[k] > (p.records[CHAIN_RECORD_KEYS[k]] ?? 0));
    if (!beaten.length)
        return { save, beaten };
    return { save: updateProfile(save, p.id, q => ({ ...q, records: { ...q.records, ...Object.fromEntries(beaten.map(k => [CHAIN_RECORD_KEYS[k], stats[k]])) } })), beaten };
}
export function chainRecords(save) {
    const r = activeProfile(save)?.records ?? {};
    return Object.fromEntries(Object.entries(CHAIN_RECORD_KEYS).filter(([, k]) => r[k] !== undefined).map(([name, k]) => [name, r[k]]));
}
/** A chain saved to the Invention Shelf keeps its chain numbers alongside it (also in `records`, keyed by the shelf item). */
const META = ["longest", "steps", "domains", "seconds"];
export function withChainShelfMeta(save, shelfId, stats) {
    const p = activeProfile(save);
    if (!p || !p.shelf.some(s => s.id === shelfId))
        return save;
    return updateProfile(save, p.id, q => ({ ...q, records: { ...q.records, ...Object.fromEntries(META.map(k => [`chain.shelf.${shelfId}.${k}`, stats[k]])) } }));
}
export function chainShelfMeta(save, shelfId) {
    const r = activeProfile(save)?.records ?? {};
    const key = (k) => `chain.shelf.${shelfId}.${k}`;
    return r[key("longest")] === undefined ? undefined : { longest: r[key("longest")], steps: r[key("steps")] ?? 0, domains: r[key("domains")] ?? 0, seconds: r[key("seconds")] ?? 0 };
}
/** Tidy: chain numbers for shelf items that no longer exist are dropped. */
export function withoutStaleChainMeta(save) {
    const p = activeProfile(save);
    if (!p)
        return save;
    const live = new Set(p.shelf.map(s => s.id));
    const stale = Object.keys(p.records).filter(k => k.startsWith("chain.shelf.") && !live.has(k.slice("chain.shelf.".length).split(".")[0]));
    if (!stale.length)
        return save;
    return updateProfile(save, p.id, q => ({ ...q, records: Object.fromEntries(Object.entries(q.records).filter(([k]) => !stale.includes(k))) }));
}
/** Discoveries, all from the chain counter's measured edges. */
export function collectChainDiscoveries(build, runtime) {
    const c = runtime.chain;
    if (!c.active)
        return [];
    const out = new Set();
    const nodes = c.nodeList();
    if (c.roots().length === 1 && c.longest() >= 5)
        out.add("chain.cause-effect");
    const path = (id) => [...c.pathTo(id)].reverse();
    if (nodes.some(n => { const p = path(n.id); return p.some((x, i) => i > 0 && x.domain !== p[i - 1].domain); }))
        out.add("chain.energy-transfer");
    if (nodes.some(n => new Set(path(n.id).map(x => x.domain)).size >= 3))
        out.add("chain.many-systems");
    if (c.longest() >= 15)
        out.add("chain.long-chain");
    if (nodes.some(n => build.getPart(n.id)?.definitionId === "chain.confetti" && n.parent !== undefined && build.getPart(n.parent)?.definitionId === "silly.duck"))
        out.add("secret.chain-duck");
    if (nodes.some(n => { const p = path(n.id); return p.length > 1 && (n.firstTick - p[0].firstTick) / 60 >= 20; }))
        out.add("secret.chain-marathon");
    return [...out];
}
export const CHAIN_PARENT_MAPPINGS = Object.freeze([
    { concept: "Cause and effect", evidence: "built a chain where each step really set off the next", discoveryId: "chain.cause-effect" },
    { concept: "Cause and effect", evidence: "passed energy from one kind of machine to another (for example rolling → electricity → turning)", discoveryId: "chain.energy-transfer" },
    { concept: "Cause and effect", evidence: "combined three or more different systems in one chain", discoveryId: "chain.many-systems" }
]);
export const CHAIN_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "chain.cause-effect", title: "Chain reactions", example: "Domino shows and Rube Goldberg machines work because each step really pushes the next — take one away and it stops." },
    { discoveryId: "chain.energy-transfer", title: "Power stations", example: "A power station turns moving water or steam into electricity, and your toaster turns it back into heat." }
]);
export const CHAIN_CONCEPT_EVIDENCE = {
    "chain.cause-effect": "One starting action set off a chain of at least five real steps.",
    "chain.energy-transfer": "A chain passed from one kind of system to another.",
    "chain.many-systems": "One chain used three or more different kinds of system.",
    "chain.long-chain": "A chain of fifteen or more real steps.",
    "secret.chain-duck": "The duck flew through the confetti at the end of a chain. Quack!",
    "secret.chain-marathon": "One chain kept going for twenty seconds."
};
