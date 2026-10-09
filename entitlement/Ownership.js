import { FULL_GAME_PRODUCT, trustedKeys, verifyProof } from "./Entitlement.js";
/**
 * Who owns the full game on this device (M37) — resolved from the cached signed proof, kept under its own key next to
 * (never inside) the child save, so backups and imports can never carry or forge ownership.
 */
export const PROOF_KEY = "entitlement.proof";
/** Decide ownership from the cached proof. Offline, a valid proof is enough: play is never held hostage by the network. */
export async function resolveOwnership(input) {
    var _a, _b;
    if (input.cached === undefined || input.cached === null)
        return { status: { state: input.saveState, source: "SAVE", checkedOnline: false }, clearCache: false };
    const check = await verifyProof(input.cached, (_a = input.keys) !== null && _a !== void 0 ? _a : trustedKeys(), (_b = input.nowMs) !== null && _b !== void 0 ? _b : Date.now());
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
    constructor(store, adapter, keys = trustedKeys(), online = () => typeof navigator === "undefined" || navigator.onLine) {
        Object.defineProperty(this, "store", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: store
        });
        Object.defineProperty(this, "adapter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: adapter
        });
        Object.defineProperty(this, "keys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: keys
        });
        Object.defineProperty(this, "online", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: online
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { state: "UNKNOWN", source: "SAVE", checkedOnline: false }
        });
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
        const out = await resolveOwnership({ cached, saveState, keys: this.keys, ...(this.online() && this.adapter.revalidate && !this.adapter.deferRevalidate ? { revalidate: (p) => this.adapter.revalidate(p) } : {}) });
        if (out.clearCache) {
            try {
                await this.store.setMany([{ key: PROOF_KEY, value: null }]);
            }
            catch { /* try again next time */ }
        }
        this.status = out.status;
        return this.status;
    }
    /**
     * After start-up, without holding anything up (Google Play): ask the store whether a purchase still stands (a refund
     * locks the full game again; no answer never does), or quietly pick up a purchase the store already knows about.
     * Returns true when the ownership state changed.
     */
    async refresh() {
        if (!this.online())
            return false;
        const before = this.status;
        let cached;
        try {
            cached = await this.store.get(PROOF_KEY);
        }
        catch {
            cached = undefined;
        }
        const good = cached !== undefined && cached !== null && (await verifyProof(cached, this.keys)).ok;
        if (good && this.adapter.revalidate) {
            const out = await resolveOwnership({ cached, saveState: before.state, keys: this.keys, revalidate: (p) => this.adapter.revalidate(p) });
            if (out.clearCache) {
                try {
                    await this.store.setMany([{ key: PROOF_KEY, value: null }]);
                }
                catch { /* try again next time */ }
            }
            // Only a definite answer changes anything: VALID confirms, REVOKED locks; no answer keeps the offline unlock.
            if (out.status.checkedOnline)
                this.status = out.status;
        }
        else if (!good && this.adapter.silentRestore && this.adapter.available) {
            const r = await this.safe(() => this.adapter.restore());
            if (r.kind === "OWNED" && (await verifyProof(r.proof, this.keys)).ok) {
                try {
                    await this.store.setMany([{ key: PROOF_KEY, value: r.proof }]);
                }
                catch {
                    return false;
                }
                this.status = { state: "OWNED", source: "PROOF", checkedOnline: true };
            }
        }
        return this.status.state !== before.state || this.status.source !== before.source;
    }
    async buy() { var _a; return this.settle(this.adapter.available ? await this.safe(() => this.adapter.purchase()) : { kind: "UNAVAILABLE", message: (_a = this.adapter.unavailableReason) !== null && _a !== void 0 ? _a : "Buying isn't available here." }, "bought"); }
    async restore() { var _a; return this.settle(this.adapter.available ? await this.safe(() => this.adapter.restore()) : { kind: "UNAVAILABLE", message: (_a = this.adapter.unavailableReason) !== null && _a !== void 0 ? _a : "Restoring isn't available here." }, "restored"); }
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
