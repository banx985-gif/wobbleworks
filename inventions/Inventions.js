import { activeProfile, updateProfile, newId, INVENTION_NAME_MAX, MAX_INVENTIONS, MAX_VERSIONS } from "../app/AppState.js";
import { addToShelf, removeFromShelf } from "../progression/ProgressionManager.js";
import { createBuildSnapshot } from "../core/BuildSnapshot.js";
import { canonicalJson, payloadChecksum, utf8Length } from "../save/SaveManager.js";
/**
 * My Inventions (M24): the saved-invention library with its version history.
 *
 * - Version 1 keeps the whole build. Every later version keeps only what changed since the version before it,
 *   so a long history doesn't copy unchanged parts again and again.
 * - Versions are never edited. "Bring back" an old version makes a NEW version with the old build in it.
 * - Every version carries the fingerprint of its whole build. A version is only ever loaded if it rebuilds to
 *   exactly that fingerprint, so a damaged history can never quietly load the wrong machine.
 * - Tidying (the storage manager) only removes versions the player chose, never the newest one, and rebuilds the
 *   changes between the versions that stay so each kept version still rebuilds to its own fingerprint.
 * All functions are pure: they take a save and return a new one. Saving stays in main.ts.
 */
/** Space one inventor's inventions may use inside the save before the game asks for a tidy-up. */
export const INVENTION_BUDGET_BYTES = 1500000;
/** What "Tidy up" keeps by default: the first version and the newest few. */
export const TIDY_KEEP_LATEST = 5;
export function contentOf(build) {
    return JSON.parse(JSON.stringify({ parts: build.parts, connections: build.connections }));
}
export function contentChecksum(c) { return payloadChecksum(canonicalJson({ parts: c.parts, connections: c.connections })); }
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
/** The changes that turn `prev` into `next`. */
export function diffContent(prev, next) {
    const before = new Map(prev.parts.map(p => [p.id, p]));
    const afterIds = new Set(next.parts.map(p => p.id));
    const add = [], change = [];
    for (const p of next.parts) {
        const old = before.get(p.id);
        if (!old)
            add.push(p);
        else if (!same(old, p))
            change.push(p);
    }
    const remove = prev.parts.filter(p => !afterIds.has(p.id)).map(p => p.id);
    const natural = [...prev.parts.filter(p => afterIds.has(p.id)).map(p => p.id), ...add.map(p => p.id)];
    const order = next.parts.map(p => p.id);
    const delta = { add, change, remove, ...(same(prev.connections, next.connections) ? {} : { connections: next.connections }), ...(same(natural, order) ? {} : { order }) };
    return JSON.parse(JSON.stringify(delta));
}
/** Applies one version's changes to the build before it. */
export function applyDelta(prev, d) {
    var _a;
    const removed = new Set(d.remove);
    const changed = new Map(d.change.map(p => [p.id, p]));
    let parts = prev.parts.filter(p => !removed.has(p.id)).map(p => { var _a; return (_a = changed.get(p.id)) !== null && _a !== void 0 ? _a : p; });
    parts = [...parts, ...d.add];
    if (d.order) {
        const byId = new Map(parts.map(p => [p.id, p]));
        parts = d.order.map(id => byId.get(id)).filter((p) => Boolean(p));
    }
    const connections = (_a = d.connections) !== null && _a !== void 0 ? _a : prev.connections;
    return JSON.parse(JSON.stringify({ parts, connections }));
}
/** Every version rebuilt in order (undefined where a version doesn't match its fingerprint, and for all after it). */
export function resolveAll(inv) {
    const out = new Map();
    let cur;
    for (const v of inv.versions) {
        cur = v.base ? contentOf(v.base) : cur && v.delta ? applyDelta(cur, v.delta) : undefined;
        if (cur && contentChecksum(cur) !== v.checksum)
            cur = undefined;
        out.set(v.n, cur);
    }
    return out;
}
/** One version's build, or undefined if it can't be rebuilt exactly. */
export function resolveVersion(inv, n) {
    let cur;
    for (const v of inv.versions) {
        cur = v.base ? contentOf(v.base) : cur && v.delta ? applyDelta(cur, v.delta) : undefined;
        if (!cur || contentChecksum(cur) !== v.checksum)
            return undefined;
        if (v.n === n)
            return cur;
    }
    return undefined;
}
export function latestVersion(inv) { return inv.versions[inv.versions.length - 1]; }
export function inventionsOf(save) { var _a, _c; return (_c = (_a = activeProfile(save)) === null || _a === void 0 ? void 0 : _a.inventions) !== null && _c !== void 0 ? _c : []; }
export function inventionById(save, id) { return inventionsOf(save).find(i => i.id === id); }
export function cleanInventionName(raw) {
    return raw.replace(/[^\p{L}\p{N} '!?&()_-]/gu, "").replace(/\s+/g, " ").trim().slice(0, INVENTION_NAME_MAX) || "My Invention";
}
export function suggestedName(save) {
    const names = new Set(inventionsOf(save).map(i => i.name));
    for (let k = 1;; k++) {
        const n = `My Invention ${k}`;
        if (!names.has(n))
            return n;
    }
}
export function inventionBytes(inv) { return utf8Length(canonicalJson(inv)); }
export function profileInventionBytes(p) { return p.inventions.reduce((n, i) => n + inventionBytes(i), 0); }
function cleanMetrics(m) {
    if (!m)
        return undefined;
    const out = Object.fromEntries(Object.entries(m).filter(([k, v]) => /^[a-z][a-z-]{0,23}$/.test(k) && Number.isFinite(v)).map(([k, v]) => [k, Math.round(v * 1000) / 1000]));
    return Object.keys(out).length ? out : undefined;
}
function makeVersion(n, nowMs, content, prev, extra = {}) {
    const metrics = cleanMetrics(extra.metrics);
    return { n, savedAtMs: nowMs, ...(prev ? { delta: diffContent(prev, content) } : { base: contentOf(content) }), checksum: contentChecksum(content), partCount: content.parts.length, ...(extra.restoredFrom !== undefined ? { restoredFrom: extra.restoredFrom } : {}), ...(metrics ? { metrics } : {}) };
}
function withInventions(save, change) {
    const p = activeProfile(save);
    if (!p)
        return save;
    return updateProfile(save, p.id, q => ({ ...q, inventions: change(q.inventions) }));
}
function overBudget(save) { const p = activeProfile(save); return Boolean(p && profileInventionBytes(p) > INVENTION_BUDGET_BYTES); }
/** Saves a new invention whose version 1 is this build. */
export function saveNewInvention(save, input) {
    var _a;
    const p = activeProfile(save);
    if (!p)
        return { save, reason: "NO_PROFILE" };
    if (p.inventions.length >= MAX_INVENTIONS)
        return { save, reason: "FULL" };
    const nowMs = (_a = input.nowMs) !== null && _a !== void 0 ? _a : Date.now();
    const invention = { id: newId("inv"), name: cleanInventionName(input.name), createdAtMs: nowMs, environment: /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/.test(input.environment) ? input.environment : "workshop", versions: [makeVersion(1, nowMs, input.content, undefined, input.metrics ? { metrics: input.metrics } : {})], ...(input.copiedFrom ? { copiedFrom: input.copiedFrom } : {}) };
    const next = withInventions(save, list => [...list, invention]);
    if (overBudget(next))
        return { save, reason: "TOO_BIG" };
    return { save: next, invention, version: invention.versions[0] };
}
/** Saves this build as the next version. If it is exactly the newest version already, nothing is added. */
export function saveVersion(save, inventionId, content, nowMs = Date.now(), extra = {}) {
    const inv = inventionById(save, inventionId);
    if (!inv)
        return { save, reason: "MISSING" };
    const last = latestVersion(inv);
    if (contentChecksum(content) === last.checksum)
        return { save, invention: inv, version: last, unchanged: true };
    if (inv.versions.length >= MAX_VERSIONS)
        return { save, invention: inv, reason: "VERSIONS_FULL" };
    const prev = resolveVersion(inv, last.n);
    if (!prev)
        return { save, invention: inv, reason: "DAMAGED" };
    const version = makeVersion(last.n + 1, nowMs, content, prev, extra);
    const updated = { ...inv, versions: [...inv.versions, version] };
    const next = withInventions(save, list => list.map(i => i.id === inv.id ? updated : i));
    if (overBudget(next))
        return { save, invention: inv, reason: "TOO_BIG" };
    return { save: next, invention: updated, version };
}
/** Brings an old version back by saving it again as a NEW version. The old one stays exactly as it was. */
export function restoreAsNewVersion(save, inventionId, n, nowMs = Date.now()) {
    var _a;
    const inv = inventionById(save, inventionId);
    if (!inv)
        return { save, reason: "MISSING" };
    const old = resolveVersion(inv, n);
    if (!old)
        return { save, invention: inv, reason: "DAMAGED" };
    const metrics = (_a = inv.versions.find(v => v.n === n)) === null || _a === void 0 ? void 0 : _a.metrics;
    return saveVersion(save, inventionId, old, nowMs, { restoredFrom: n, ...(metrics ? { metrics } : {}) });
}
/** A copy of one version (newest by default) as a brand-new invention with its own history. */
export function duplicateInvention(save, inventionId, n, nowMs = Date.now()) {
    var _a;
    const inv = inventionById(save, inventionId);
    if (!inv)
        return { save, reason: "MISSING" };
    const pick = n !== null && n !== void 0 ? n : latestVersion(inv).n;
    const content = resolveVersion(inv, pick);
    if (!content)
        return { save, invention: inv, reason: "DAMAGED" };
    const base = `${inv.name.slice(0, INVENTION_NAME_MAX - 7)} (copy)`;
    const metrics = (_a = inv.versions.find(v => v.n === pick)) === null || _a === void 0 ? void 0 : _a.metrics;
    return saveNewInvention(save, { name: base, content, environment: inv.environment, nowMs, copiedFrom: inv.id, ...(metrics ? { metrics } : {}) });
}
export function renameInvention(save, inventionId, name) {
    const clean = cleanInventionName(name);
    const p = activeProfile(save);
    if (!p)
        return save;
    const next = withInventions(save, list => list.map(i => i.id === inventionId ? { ...i, name: clean } : i));
    // Shelf labels follow the invention's name.
    return updateProfile(next, p.id, q => ({ ...q, shelf: q.shelf.map(s => s.inventionId === inventionId ? { ...s, title: clean } : s) }));
}
/** Deletes an invention (the player confirmed). Its shelf spot goes too. */
export function deleteInvention(save, inventionId) {
    const p = activeProfile(save);
    if (!p)
        return save;
    let next = save;
    for (const s of p.shelf.filter(x => x.inventionId === inventionId))
        next = removeFromShelf(next, s.id);
    return withInventions(next, list => list.filter(i => i.id !== inventionId));
}
// ------------------------------------------------------------------ shelf
export function shelfItemFor(save, inventionId) { var _a; return (_a = activeProfile(save)) === null || _a === void 0 ? void 0 : _a.shelf.find(s => s.inventionId === inventionId); }
/** Puts one version (newest by default) on the Workshop shelf. */
export function showOnShelf(save, inventionId, n, nowMs = Date.now()) {
    const inv = inventionById(save, inventionId);
    if (!inv)
        return { save, full: false, reason: "MISSING" };
    const pick = n !== null && n !== void 0 ? n : latestVersion(inv).n;
    const content = resolveVersion(inv, pick);
    if (!content)
        return { save, full: false, reason: "DAMAGED" };
    let base = save;
    const existing = shelfItemFor(save, inventionId);
    if (existing)
        base = removeFromShelf(base, existing.id);
    const lab = inv.environment.startsWith("lab:") ? inv.environment.slice(4) : undefined;
    const out = addToShelf(base, inv.name, createBuildSnapshot({ id: `invention:${inv.id}`, revision: pick, createdAtMs: nowMs, parts: content.parts, connections: content.connections }), lab, nowMs);
    if (out.full || !out.item)
        return { save, full: true };
    const p = activeProfile(out.save);
    const itemId = out.item.id;
    return { save: updateProfile(out.save, p.id, q => ({ ...q, shelf: q.shelf.map(s => s.id === itemId ? { ...s, inventionId, versionN: pick } : s) })), full: false };
}
export function takeOffShelf(save, inventionId) { const item = shelfItemFor(save, inventionId); return item ? removeFromShelf(save, item.id) : save; }
// ------------------------------------------------------------------ comparing versions
/** Measured results a version can carry, and which way is "better". Only measured numbers — never a guess. */
export const VERSION_METRICS = {
    distance: { label: "Farthest anything travelled", unit: "m", better: "MORE", more: "went farther", less: "didn't go as far" },
    height: { label: "Highest anything climbed", unit: "m", better: "MORE", more: "went higher", less: "didn't go as high" },
    speed: { label: "Top speed", unit: "m/s", better: "MORE", more: "went faster", less: "went slower" },
    chain: { label: "Longest chain", unit: "steps", better: "MORE", more: "made a longer chain", less: "made a shorter chain" },
    wobble: { label: "Biggest wobble", unit: "", better: "LESS", more: "wobbled more", less: "was steadier" }
};
/** What changed between two versions, and how their measured results compare (only where both were tested). */
export function compareVersions(inv, a, b) {
    var _a, _c, _e, _f, _g, _h;
    const all = resolveAll(inv);
    const ca = all.get(a), cb = all.get(b);
    if (!ca || !cb)
        return undefined;
    const byA = new Map(ca.parts.map(p => [p.id, p])), byB = new Map(cb.parts.map(p => [p.id, p]));
    const added = {}, removed = {};
    let moved = 0, retuned = 0;
    for (const p of cb.parts) {
        const o = byA.get(p.id);
        if (!o)
            added[p.definitionId] = ((_a = added[p.definitionId]) !== null && _a !== void 0 ? _a : 0) + 1;
        else {
            if (Math.hypot(o.position.x - p.position.x, o.position.y - p.position.y) > 0.01 || Math.abs(o.rotation - p.rotation) > 0.01)
                moved++;
            if (!same(o.parameters, p.parameters))
                retuned++;
        }
    }
    for (const p of ca.parts)
        if (!byB.has(p.id))
            removed[p.definitionId] = ((_c = removed[p.definitionId]) !== null && _c !== void 0 ? _c : 0) + 1;
    const ma = (_f = (_e = inv.versions.find(v => v.n === a)) === null || _e === void 0 ? void 0 : _e.metrics) !== null && _f !== void 0 ? _f : {}, mb = (_h = (_g = inv.versions.find(v => v.n === b)) === null || _g === void 0 ? void 0 : _g.metrics) !== null && _h !== void 0 ? _h : {};
    const metrics = Object.keys(VERSION_METRICS).filter(k => ma[k] !== undefined && mb[k] !== undefined).map(key => {
        const x = ma[key], y = mb[key];
        const close = Math.abs(x - y) <= Math.max(0.05, Math.abs(x) * 0.02);
        const better = VERSION_METRICS[key].better;
        return { key, a: x, b: y, winner: close ? "SAME" : (better === "MORE" ? y > x : y < x) ? "B" : "A" };
    });
    return { a, b, partsA: ca.parts.length, partsB: cb.parts.length, added, removed, moved, retuned, wiringChanged: !same(ca.connections, cb.connections), metrics };
}
/** Plain-words comparison: what changed between the two versions, and what TESTs measured for each. */
export function comparisonLines(c, partName) {
    const changes = [];
    const list = (r) => Object.entries(r).map(([id, n]) => `${n} ${partName(id)}${n > 1 ? "s" : ""}`).join(", ");
    if (Object.keys(c.added).length)
        changes.push(`Added ${list(c.added)}.`);
    if (Object.keys(c.removed).length)
        changes.push(`Took away ${list(c.removed)}.`);
    if (c.moved)
        changes.push(`Moved or turned ${c.moved} part${c.moved > 1 ? "s" : ""}.`);
    if (c.retuned)
        changes.push(`Changed the settings on ${c.retuned} part${c.retuned > 1 ? "s" : ""}.`);
    if (c.wiringChanged)
        changes.push("Changed how parts are joined.");
    if (!changes.length)
        changes.push("The builds are exactly the same.");
    changes.push(c.partsB === c.partsA ? `Same number of parts (${c.partsA}).` : `Version ${c.b} uses ${Math.abs(c.partsB - c.partsA)} ${c.partsB < c.partsA ? "fewer" : "more"} part${Math.abs(c.partsB - c.partsA) === 1 ? "" : "s"} (${c.partsA} → ${c.partsB}).`);
    const results = c.metrics.map(m => {
        const d = VERSION_METRICS[m.key];
        const f = (x) => `${m.key === "chain" ? x : x.toFixed(1)}${d.unit ? " " + d.unit : ""}`;
        return m.winner === "SAME" ? `${d.label}: about the same (${f(m.a)} and ${f(m.b)}).` : `${d.label}: Version ${c.b} ${m.b > m.a ? d.more : d.less} (${f(m.a)} → ${f(m.b)}).`;
    });
    return { changes, results };
}
// ------------------------------------------------------------------ storage manager
/**
 * Removes the chosen old versions of one invention. The newest version, and any version on the shelf, always stay.
 * The kept versions are re-linked so each still rebuilds to exactly its own fingerprint; nothing about them changes.
 */
export function tidyVersions(save, inventionId, removeNs) {
    var _a;
    const inv = inventionById(save, inventionId);
    if (!inv)
        return { save, removed: 0, reason: "MISSING" };
    const shelfN = (_a = shelfItemFor(save, inventionId)) === null || _a === void 0 ? void 0 : _a.versionN;
    const newest = latestVersion(inv).n;
    const drop = new Set(removeNs.filter(n => n !== newest && n !== shelfN && inv.versions.some(v => v.n === n)));
    if (!drop.size)
        return { save, removed: 0 };
    const all = resolveAll(inv);
    if ([...all.values()].some(c => !c))
        return { save, removed: 0, reason: "DAMAGED" };
    const kept = inv.versions.filter(v => !drop.has(v.n));
    let prev;
    const versions = kept.map(v => {
        const content = all.get(v.n);
        const { base: _b, delta: _d, ...meta } = v;
        const out = { ...meta, ...(prev ? { delta: diffContent(prev, content) } : { base: contentOf(content) }) };
        prev = content;
        return out;
    });
    return { save: withInventions(save, list => list.map(i => i.id === inv.id ? { ...inv, versions } : i)), removed: drop.size };
}
/** Versions "Tidy up" offers to remove: everything except the first, the newest few and the one on the shelf. */
export function tidySuggestion(save, inv, keepLatest = TIDY_KEEP_LATEST) {
    var _a;
    const shelfN = (_a = shelfItemFor(save, inv.id)) === null || _a === void 0 ? void 0 : _a.versionN;
    const latest = new Set(inv.versions.slice(-keepLatest).map(v => v.n));
    return inv.versions.slice(1).map(v => v.n).filter(n => !latest.has(n) && n !== shelfN);
}
/** The child-friendly storage summary for My Inventions. */
export function inventionStorage(save) {
    const list = inventionsOf(save);
    const rows = list.map(i => ({ id: i.id, name: i.name, versions: i.versions.length, bytes: inventionBytes(i), tidyable: tidySuggestion(save, i).length }));
    return { count: list.length, versions: list.map(i => i.versions.length), bytes: rows.reduce((n, r) => n + r.bytes, 0), budget: INVENTION_BUDGET_BYTES, big: rows.filter(r => r.tidyable > 0).sort((x, y) => y.bytes - x.bytes) };
}
/** Thumbnail cache key for one version's picture. */
export function thumbKey(inventionId, n) { return `${inventionId}@${n}`; }
/** Every thumbnail key still in use (all inventions of all inventors), so cleanup never removes a current picture. */
export function liveThumbKeys(save) { return new Set(save.profiles.flatMap(p => p.inventions.flatMap(i => i.versions.map(v => thumbKey(i.id, v.n))))); }
