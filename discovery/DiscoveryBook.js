import { activeProfile, updateProfile } from "../app/AppState.js";
import { DISCOVERIES, discoveryById, realWorldCard } from "./Discoveries.js";
import { PART_CARDS } from "./PartMastery.js";
import { historyAfterSolve, EMPTY_HISTORY } from "./AdaptiveAssistance.js";
/** Discoveries already in the Book for the current inventor (or the guest before one exists). */
export function knownDiscoveries(save) {
    return activeProfile(save)?.discoveries ?? save.motionDiscoveries ?? [];
}
/**
 * Writes what a TEST really showed into the Discovery Book: new discoveries (each once) and new part uses.
 * Pure: the same save and evidence always give the same result. Unknown ids are ignored.
 */
export function recordRunEvidence(save, awards, uses) {
    const known = new Set(knownDiscoveries(save));
    const fresh = awards.filter(a => discoveryById(a.id) && !known.has(a.id)).filter((a, i, all) => all.findIndex(b => b.id === a.id) === i);
    const p = activeProfile(save);
    if (!p) {
        if (!fresh.length)
            return { save, newDiscoveries: [], newUses: [] };
        return { save: { ...save, motionDiscoveries: [...known, ...fresh.map(a => a.id)] }, newDiscoveries: fresh, newUses: [] };
    }
    const mastery = Object.fromEntries(Object.entries(p.mastery ?? {}).map(([k, v]) => [k, [...v]]));
    const newUses = [];
    for (const u of uses) {
        if (!PART_CARDS.some(c => c.partId === u.partId && c.uses.some(x => x.id === u.useId)))
            continue;
        const list = mastery[u.partId] ?? [];
        if (!list.includes(u.useId)) {
            mastery[u.partId] = [...list, u.useId];
            newUses.push(u);
        }
    }
    if (!fresh.length && !newUses.length)
        return { save, newDiscoveries: [], newUses: [] };
    const next = updateProfile(save, p.id, q => ({ ...q, discoveries: [...q.discoveries, ...fresh.map(a => a.id)], ...(newUses.length ? { mastery } : {}) }));
    return { save: next, newDiscoveries: fresh, newUses };
}
export function guidanceHistory(save) { return activeProfile(save)?.guidance ?? EMPTY_HISTORY; }
export function withSolveHistory(save, hintsUsed, failedTests) {
    const p = activeProfile(save);
    if (!p)
        return save;
    return updateProfile(save, p.id, q => ({ ...q, guidance: historyAfterSolve(q.guidance, hintsUsed, failedTests) }));
}
export function bookView(save) {
    const known = new Set(knownDiscoveries(save));
    const mastery = activeProfile(save)?.mastery ?? {};
    const entries = DISCOVERIES.map(d => {
        const found = known.has(d.id);
        const secretHidden = d.kind === "SECRET" && !found;
        const rw = found ? realWorldCard(d.id) : undefined;
        return { id: d.id, kind: d.kind, found, title: secretHidden ? "???" : d.title, line: secretHidden ? "A secret experiment is hiding somewhere…" : found ? d.line : "Not discovered yet.", art: d.art, ...(rw ? { realWorld: rw } : {}) };
    });
    const parts = PART_CARDS.map(c => { const got = mastery[c.partId] ?? []; const uses = c.uses.map(u => ({ label: got.includes(u.id) ? u.label : "?", found: got.includes(u.id) })); return { partId: c.partId, title: c.title, uses, anyFound: uses.some(u => u.found) }; });
    return { entries, parts, foundCount: entries.filter(e => e.found).length, total: entries.length };
}
