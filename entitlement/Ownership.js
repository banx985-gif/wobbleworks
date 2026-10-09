import { FULL_GAME_PRODUCT, TRUSTED_KEYS, verifyProof } from "./Entitlement.js";
/**
 * Who owns the full game on this device (M37) — resolved from the cached signed proof, kept under its own key next to
 * (never inside) the child save, so backups and imports can never carry or forge ownership.
 */
export const PROOF_KEY = "entitlement.proof";
/** Decide ownership from the cached proof. Offline, a valid proof is enough: play is never held hostage by the network. */
export async function resolveOwnership(input) {
    if (input.cached === undefined || input.cached === null)
        return { status: { state: input.saveState, source: "SAVE", checkedOnline: false }, clearCache: false };
    const check = await verifyProof(input.cached, input.keys ?? TRUSTED_KEYS, input.nowMs ?? Date.now());
    if (!check.ok)
        return { status: { state: input.saveState, source: "SAVE", proofProblem: check.reason, checkedOnline: false }, clearCache: check.reason === "NOT_A_PROOF" };
    let r = "UNREACHABLE";
    if (input.revalidate) {
        try {
            r = await input.revalidate(input.cached);
        }
        catch {
            r = "UNREACHABLE";
        }
    }
    if (r === "REVOKED")
        return { status: { state: "LOCKED", source: "PROOF", checkedOnline: true }, clearCache: true };
    return { status: { state: r === "VALID" ? "OWNED" : "OFFLINE_GRACE", source: "PROOF", checkedOnline: r === "VALID" }, clearCache: false };
}
export class OwnershipController {
    store;
    adapter;
    keys;
    online;
    status = { state: "UNKNOWN", source: "SAVE", checkedOnline: false };
    constructor(store, adapter, keys = TRUSTED_KEYS, online = () => typeof navigator === "undefined" || navigator.onLine) {
        this.store = store;
        this.adapter = adapter;
        this.keys = keys;
        this.online = online;
    }
    current() { return this.status; }
    storeKind() { return this.adapter.kind; }
    /** At start-up: read the cached proof and check it on the device (and with the store, if online). */
    async load(saveState) {
        let cached;
        try {
            cached = await this.store.get(PROOF_KEY);
        }
        catch {
            cached = undefined;
        }
        const out = await resolveOwnership({ cached, saveState, keys: this.keys, ...(this.online() && this.adapter.revalidate ? { revalidate: (p) => this.adapter.revalidate(p) } : {}) });
        if (out.clearCache) {
            try {
                await this.store.setMany([{ key: PROOF_KEY, value: null }]);
            }
            catch { /* try again next time */ }
        }
        this.status = out.status;
        return this.status;
    }
    async buy() { return this.settle(this.adapter.available ? await this.safe(() => this.adapter.purchase()) : { kind: "UNAVAILABLE", message: this.adapter.unavailableReason ?? "Buying isn't available here." }, "bought"); }
    async restore() { return this.settle(this.adapter.available ? await this.safe(() => this.adapter.restore()) : { kind: "UNAVAILABLE", message: this.adapter.unavailableReason ?? "Restoring isn't available here." }, "restored"); }
    async safe(f) { try {
        return await f();
    }
    catch {
        return { kind: "FAILED", message: "The store didn't answer. Please check the internet connection and try again." };
    } }
    /** Only a proof that verifies on this device is ever kept. */
    async settle(r, verb) {
        if (r.kind === "CANCELLED")
            return { status: this.status, message: "Nothing was bought. Nothing has changed." };
        if (r.kind === "NOTHING_TO_RESTORE")
            return { status: this.status, message: "No full-game purchase was found for this store account." };
        if (r.kind === "UNAVAILABLE" || r.kind === "FAILED")
            return { status: this.status, message: r.message };
        const check = await verifyProof(r.proof, this.keys);
        if (!check.ok)
            return { status: this.status, message: "The store's answer couldn't be checked, so nothing was changed. Please try again." };
        await this.store.setMany([{ key: PROOF_KEY, value: r.proof }]);
        this.status = { state: "OWNED", source: "PROOF", checkedOnline: true };
        return { status: this.status, message: `The full game is ${verb} on this device. Thank you!` };
    }
}
export { FULL_GAME_PRODUCT };
