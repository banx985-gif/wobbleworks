import { activeProfile, updateProfile } from "../app/AppState.js";
import { DISCOVERIES, discoveryById, realWorldCard } from "./Discoveries.js";
import { PART_CARDS } from "./PartMastery.js";
import { historyAfterSolve, EMPTY_HISTORY } from "./AdaptiveAssistance.js";
/** Discoveries already in the Book for the current inventor (or the guest before one exists). */
export function knownDiscoveries(save) {
    var _a, _b, _c;
    return (_c = (_b = (_a = activeProfile(save)) === null || _a === void 0 ? void 0 : _a.discoveries) !== null && _b !== void 0 ? _b : save.motionDiscoveries) !== null && _c !== void 0 ? _c : [];
}
/**
 * Writes what a TEST really showed into the Discovery Book: new discoveries (each once) and new part uses.
 * Pure: the same save and evidence always give the same result. Unknown ids are ignored.
 */
export function recordRunEvidence(save, awards, uses) {
    var _a, _b;
    const known = new Set(knownDiscoveries(save));
    const fresh = awards.filter(a => discoveryById(a.id) && !known.has(a.id)).filter((a, i, all) => all.findIndex(b => b.id === a.id) === i);
    const p = activeProfile(save);
    if (!p) {
        if (!fresh.length)
            return { save, newDiscoveries: [], newUses: [] };
        return { save: { ...save, motionDiscoveries: [...known, ...fresh.map(a => a.id)] }, newDiscoveries: fresh, newUses: [] };
    }
    const mastery = Object.fromEntries(Object.entries((_a = p.mastery) !== null && _a !== void 0 ? _a : {}).map(([k, v]) => [k, [...v]]));
    const newUses = [];
    for (const u of uses) {
        if (!PART_CARDS.some(c => c.partId === u.partId && c.uses.some(x => x.id === u.useId)))
            continue;
        const list = (_b = mastery[u.partId]) !== null && _b !== void 0 ? _b : [];
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
export function guidanceHistory(save) { var _a, _b; return (_b = (_a = activeProfile(save)) === null || _a === void 0 ? void 0 : _a.guidance) !== null && _b !== void 0 ? _b : EMPTY_HISTORY; }
export function withSolveHistory(save, hintsUsed, failedTests) {
    const p = activeProfile(save);
    if (!p)
        return save;
    return updateProfile(save, p.id, q => ({ ...q, guidance: historyAfterSolve(q.guidance, hintsUsed, failedTests) }));
}
export function bookView(save) {
    var _a, _b;
    const known = new Set(knownDiscoveries(save));
    const mastery = (_b = (_a = activeProfile(save)) === null || _a === void 0 ? void 0 : _a.mastery) !== null && _b !== void 0 ? _b : {};
    const entries = DISCOVERIES.map(d => {
        const found = known.has(d.id);
        const secretHidden = d.kind === "SECRET" && !found;
        const rw = found ? realWorldCard(d.id) : undefined;
        return { id: d.id, kind: d.kind, found, title: secretHidden ? "???" : d.title, line: secretHidden ? "A secret experiment is hiding somewhere…" : found ? d.line : "Not discovered yet.", art: d.art, ...(rw ? { realWorld: rw } : {}) };
    });
    const parts = PART_CARDS.map(c => { var _a; const got = (_a = mastery[c.partId]) !== null && _a !== void 0 ? _a : []; const uses = c.uses.map(u => ({ label: got.includes(u.id) ? u.label : "?", found: got.includes(u.id) })); return { partId: c.partId, title: c.title, uses, anyFound: uses.some(u => u.found) }; });
    return { entries, parts, foundCount: entries.filter(e => e.found).length, total: entries.length };
}
