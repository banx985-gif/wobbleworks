import { canonicalJson, utf8Length } from "./SaveManager.js";
export const STORAGE_THRESHOLDS = Object.freeze({ low: 0.75, nearlyFull: 0.9 });
export function storageLevel(ratio) {
    if (ratio === undefined || !Number.isFinite(ratio))
        return "UNKNOWN";
    if (ratio >= STORAGE_THRESHOLDS.nearlyFull)
        return "NEARLY_FULL";
    if (ratio >= STORAGE_THRESHOLDS.low)
        return "LOW";
    return "OK";
}
export function measureSave(save) {
    let largest;
    for (const p of save.profiles) {
        const bytes = utf8Length(canonicalJson(p));
        if (!largest || bytes > largest.bytes)
            largest = { name: p.name, bytes };
    }
    return { saveBytes: utf8Length(canonicalJson(save)), inventionCount: save.profiles.reduce((n, p) => n + p.shelf.length, 0) + save.myInventionsCount, ...(largest ? { largestProfile: largest } : {}) };
}
export async function storageReport(save, estimate = globalThis.navigator?.storage?.estimate?.bind(navigator.storage)) {
    const measured = measureSave(save);
    try {
        if (!estimate)
            return { level: "UNKNOWN", ...measured };
        const e = await estimate();
        if (!e.quota || e.usage === undefined)
            return { level: "UNKNOWN", ...measured };
        const ratio = e.usage / e.quota;
        return { level: storageLevel(ratio), usageBytes: e.usage, quotaBytes: e.quota, ratio, ...measured };
    }
    catch {
        return { level: "UNKNOWN", ...measured };
    }
}
export function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} bytes`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
