export function detectDeviceSupport() {
    const reasons = [];
    if (typeof HTMLCanvasElement === "undefined")
        reasons.push("Canvas is unavailable");
    if (typeof PointerEvent === "undefined")
        reasons.push("Pointer Events are unavailable");
    if (typeof indexedDB === "undefined")
        reasons.push("IndexedDB is unavailable");
    if (typeof structuredClone !== "function")
        reasons.push("structuredClone is unavailable");
    return { supported: reasons.length === 0, reasons };
}
export async function storageWarningNeeded() {
    try {
        if (!navigator.storage?.estimate)
            return false;
        const estimate = await navigator.storage.estimate();
        if (!estimate.quota || !estimate.usage)
            return false;
        return estimate.usage / estimate.quota >= 0.9;
    }
    catch {
        return false;
    }
}
