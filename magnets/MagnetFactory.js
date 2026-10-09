import { labMissions } from "../labs/LabModule.js";
import { MAGNETISM_TRUTH_CONTRACT, magnetBehaviour } from "./MagnetSystem.js";
/**
 * Lab 5 — Magnet Factory (M15). Every discovery is measured by the MagnetSystem in that TEST (truth.magnetism.v1).
 */
export { MAGNETISM_TRUTH_CONTRACT };
export const MAGNET_MISSIONS = labMissions("magnet-factory");
export function collectMagnetDiscoveries(build, runtime) {
    const m = runtime.magnets;
    const out = new Set();
    const events = runtime.causalEvents;
    if (!m.hasMagnets())
        return [];
    const of = (kind) => events.filter(e => e.kind === kind);
    const attract = of("MAGNET_ATTRACT"), repel = of("MAGNET_REPEL");
    if (attract.some(e => { var _a, _b; return ((_a = e.data) === null || _a === void 0 ? void 0 : _a.poles) === "N-S" || ((_b = e.data) === null || _b === void 0 ? void 0 : _b.poles) === "S-N"; }))
        out.add("magnet.unlike-attract");
    if (repel.some(e => { var _a, _b; return ((_a = e.data) === null || _a === void 0 ? void 0 : _a.poles) === "N-N" || ((_b = e.data) === null || _b === void 0 ? void 0 : _b.poles) === "S-S"; }))
        out.add("magnet.like-repel");
    // One and the same magnet pulled with one end and pushed with the other: every magnet has both poles.
    const ids = (list) => new Set(list.flatMap(e => { var _a; return [e.sourceId, (_a = e.targetId) !== null && _a !== void 0 ? _a : ""]; }));
    const a = ids(attract), r = ids(repel);
    if ([...a].some(id => id && r.has(id)))
        out.add("magnet.two-poles");
    const pulled = of("MAGNET_PULL_MATERIAL"), ignored = of("MAGNET_NO_EFFECT");
    if (pulled.length && ignored.length)
        out.add("magnet.materials");
    if (ignored.some(e => { var _a, _b; return ((_a = e.data) === null || _a === void 0 ? void 0 : _a.material) === "ALUMINIUM" || ((_b = e.data) === null || _b === void 0 ? void 0 : _b.material) === "COPPER"; }))
        out.add("magnet.not-all-metal");
    const electro = new Set(of("ELECTROMAGNET_ON").map(e => e.sourceId));
    if ([...pulled, ...of("MAGNET_HOLD")].some(e => electro.has(e.sourceId)))
        out.add("magnet.electromagnet");
    if (of("MAGNET_FLOATING").length)
        out.add("magnet.float");
    // Moved a metre or more by magnetic force while nothing that moves (and no magnet) ever touched it.
    const touchedByMover = (id) => events.some(e => e.kind === "PHYSICS_CONTACT" && (e.sourceId === id || e.targetId === id) && [e.sourceId, e.targetId].some(o => o && o !== id && (runtime.isDynamicBody(o) || Boolean(magnetBehaviour(runtime.partDefinition(o))))));
    for (const e of [...attract, ...repel, ...pulled])
        for (const id of [e.sourceId, e.targetId]) {
            if (!id || !runtime.isDynamicBody(id))
                continue;
            const start = m.startOf(id);
            if (!start)
                continue;
            try {
                const s = runtime.physics.state(id);
                if (Math.hypot(s.x - start.x, s.y - start.y) >= 1 && !touchedByMover(id))
                    out.add("magnet.no-contact");
            }
            catch { /* not simulated */ }
        }
    const carried = new Set(of("CONVEYOR_CARRY").map(e => e.targetId));
    if (pulled.some(e => carried.has(e.targetId)))
        out.add("combo.magnet-conveyor");
    const held = of("MAGNET_HOLD"), released = new Set(of("MAGNET_RELEASE").map(e => e.targetId));
    if (held.some(e => electro.has(e.sourceId) && released.has(e.targetId)))
        out.add("combo.magnet-circuit");
    if (new Set(of("MAGNET_FLOATING").map(e => e.sourceId)).size >= 2)
        out.add("secret.magnet-sandwich");
    if (build.allParts().some(p => p.definitionId === "magnetic.cart" && m.peakSpeed(p.id) > 5))
        out.add("secret.magnet-rocket");
    return [...out];
}
export const MAGNET_PARENT_MAPPINGS = Object.freeze([
    { concept: "Magnetism", evidence: "saw opposite poles (N and S) pull together", discoveryId: "magnet.unlike-attract" },
    { concept: "Magnetism", evidence: "saw matching poles push apart", discoveryId: "magnet.like-repel" },
    { concept: "Magnetism", evidence: "found that every magnet has two poles", discoveryId: "magnet.two-poles" },
    { concept: "Magnetism", evidence: "sorted magnetic and non-magnetic materials", discoveryId: "magnet.materials" },
    { concept: "Magnetism", evidence: "switched an electromagnet on and off with electricity", discoveryId: "magnet.electromagnet" }
]);
export const MAGNET_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "magnet.unlike-attract", title: "Fridge magnets", example: "Fridge doors close with a magnetic strip that pulls the door shut." },
    { discoveryId: "magnet.two-poles", title: "Compasses", example: "A compass needle is a tiny magnet: one end always swings towards the north." },
    { discoveryId: "magnet.materials", title: "Recycling centres", example: "Big magnets pull steel cans out of the recycling, while aluminium cans and plastic pass by." },
    { discoveryId: "magnet.not-all-metal", title: "Not every metal", example: "Aluminium foil and copper coins don't stick to magnets — only some metals, like iron and steel, do." },
    { discoveryId: "magnet.electromagnet", title: "Scrapyard cranes", example: "Scrapyard cranes use electromagnets: switch the electricity on to lift cars, off to drop them." },
    { discoveryId: "magnet.float", title: "Maglev trains", example: "Some fast trains float above their track on magnets — with guide rails and computer control to keep them steady." }
]);
export const MAGNET_CONCEPT_EVIDENCE = {
    "magnet.unlike-attract": "An N pole and an S pole facing each other pulled together.",
    "magnet.like-repel": "Two matching poles facing each other pushed apart.",
    "magnet.two-poles": "The same magnet pulled with one end and pushed with the other in one test.",
    "magnet.materials": "A magnet pulled a magnetic material while a non-magnetic one nearby didn't move.",
    "magnet.not-all-metal": "A magnet had no effect on aluminium or copper.",
    "magnet.electromagnet": "An electromagnet switched on by electricity pulled or held something.",
    "magnet.no-contact": "Something moved a metre or more by magnetic force without anything touching it.",
    "magnet.float": "Repulsion held a ring magnet up on its guide rod for a second.",
    "combo.magnet-conveyor": "A magnet pulled metal out of things a conveyor was carrying.",
    "combo.magnet-circuit": "An electromagnet picked something up and let it go when the electricity stopped.",
    "secret.magnet-sandwich": "Two ring magnets floated in a stack.",
    "secret.magnet-rocket": "A magnet cart was pushed faster than 5 m/s."
};
export const MAGNET_FACTORY = {
    labId: "magnet-factory", folder: "magnet", concept: "Magnetism", scannerName: "Magnet Scanner", truthContractId: MAGNETISM_TRUTH_CONTRACT.id,
    parentMappings: MAGNET_PARENT_MAPPINGS, realWorldCards: MAGNET_REAL_WORLD_CARDS, conceptEvidence: MAGNET_CONCEPT_EVIDENCE,
    collectDiscoveries: collectMagnetDiscoveries
};
