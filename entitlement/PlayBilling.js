import { PLAY_PRODUCT_ID, isPlayProofShape } from "./Entitlement.js";
/** Kind words for grown-ups. Nothing here ever blames them, and every failure says nothing was charged. */
export const PLAY_MESSAGES = {
    unreachable: "Google Play can't be reached right now. Please check the internet connection and try again. Nothing has been charged.",
    notOnSale: "The full game isn't on sale in Google Play yet. Please try again later. Nothing has been charged.",
    noPlay: "This device can't buy from Google Play (the Play Store app may be missing or signed out). Nothing has been charged.",
    pending: "Google Play is still waiting for the payment to go through. The full game opens by itself once it does.",
    notFinished: "Google Play didn't finish the purchase. Nothing has been charged. Please try again."
};
/** How long to wait for Play to start up before saying it can't be reached. */
const START_MS = 8000;
/** After the buying sheet closes, how long to wait for Play's answer. */
const ANSWER_MS = 60000;
function within(ms, p, otherwise) {
    return new Promise(resolve => { const t = setTimeout(() => resolve(otherwise), ms); p.then(v => { clearTimeout(t); resolve(v); }, () => { clearTimeout(t); resolve(otherwise); }); });
}
/** Google's signed purchase record, if this transaction is a finished (not pending) purchase of the full game. */
export function proofFromTransaction(t) {
    if (!t.products.some(p => p.id === PLAY_PRODUCT_ID))
        return undefined;
    const n = t.nativePurchase;
    if (!(n === null || n === void 0 ? void 0 : n.receipt) || !n.signature)
        return undefined;
    if (n.getPurchaseState !== undefined && n.getPurchaseState !== 1)
        return undefined; // 1 = PURCHASED, 2 = PENDING
    const proof = { v: 1, kind: "PLAY", purchase: n.receipt, signature: n.signature };
    return isPlayProofShape(proof) ? proof : undefined;
}
export function playAdapter(win) {
    let starting;
    let waiting;
    let lastError;
    const answer = (r) => { const w = waiting; waiting = undefined; w === null || w === void 0 ? void 0 : w(r); };
    /** The plugin arrives with Cordova's "deviceready"; then Play starts once and stays ready. */
    const start = () => starting !== null && starting !== void 0 ? starting : (starting = (async () => {
        if (!win.CdvPurchase && win.document)
            await within(START_MS, new Promise(done => win.document.addEventListener("deviceready", () => done(), { once: true })), undefined);
        const C = win.CdvPurchase;
        if (!C)
            return "NO_PLAY";
        const store = C.store, play = C.Platform.GOOGLE_PLAY;
        store.register([{ id: PLAY_PRODUCT_ID, type: C.ProductType.NON_CONSUMABLE, platform: play }]);
        store.when()
            // Play reports a finished purchase: keep Google's signed record, then acknowledge it (finish), or Play refunds it after 3 days.
            .approved(t => { const proof = proofFromTransaction(t); void t.finish(); if (proof)
            answer({ kind: "OWNED", proof }); })
            .pending(t => { if (t.products.some(p => p.id === PLAY_PRODUCT_ID))
            answer({ kind: "FAILED", message: PLAY_MESSAGES.pending }); });
        store.error(e => { lastError = e; });
        const errors = await within(START_MS, store.initialize([play]), null);
        if (errors === null) {
            starting = undefined;
            return "UNREACHABLE";
        } // try again next time
        if (errors.length && !store.get(PLAY_PRODUCT_ID, play)) {
            starting = undefined;
            return errors.some(e => /billing.*unavailable|not supported/i.test(e.message)) ? "NO_PLAY" : "UNREACHABLE";
        }
        return C;
    })());
    const failure = (s) => ({ kind: "FAILED", message: s === "NO_PLAY" ? PLAY_MESSAGES.noPlay : PLAY_MESSAGES.unreachable });
    const ownedProof = (C) => { for (const t of C.store.localTransactions) {
        const p = proofFromTransaction(t);
        if (p)
            return p;
    } return undefined; };
    return {
        kind: "NATIVE", platform: "ANDROID", available: true, deferRevalidate: true, silentRestore: true,
        async purchase() {
            var _a;
            const C = await start();
            if (typeof C === "string")
                return failure(C);
            const already = ownedProof(C);
            if (already)
                return { kind: "OWNED", proof: already };
            const offer = (_a = C.store.get(PLAY_PRODUCT_ID, C.Platform.GOOGLE_PLAY)) === null || _a === void 0 ? void 0 : _a.getOffer();
            if (!offer)
                return { kind: "FAILED", message: PLAY_MESSAGES.notOnSale };
            const result = new Promise(resolve => { waiting = resolve; });
            const err = await offer.order().catch((e) => ({ code: -1, message: String(e) }));
            if (err) {
                waiting = undefined;
                return err.code === C.ErrorCode.PAYMENT_CANCELLED ? { kind: "CANCELLED" } : { kind: "FAILED", message: PLAY_MESSAGES.notFinished };
            }
            return within(ANSWER_MS, result, { kind: "FAILED", message: PLAY_MESSAGES.notFinished });
        },
        /** Asks Play for this Google account's purchases: no questions, works after a reinstall or on a new device. */
        async restore() {
            const C = await start();
            if (typeof C === "string")
                return failure(C);
            await within(START_MS, C.store.restorePurchases(), undefined);
            const proof = ownedProof(C);
            return proof ? { kind: "OWNED", proof } : { kind: "NOTHING_TO_RESTORE" };
        },
        /** Online check: Play no longer listing the purchase (a refund) relocks. No answer from Play never does. */
        async revalidate(_proof) {
            const C = await start();
            if (typeof C === "string")
                return "UNREACHABLE";
            const product = C.store.get(PLAY_PRODUCT_ID, C.Platform.GOOGLE_PLAY);
            if (!product || lastError)
                return "UNREACHABLE";
            if (product.owned || ownedProof(C))
                return "VALID";
            // Before ever locking a buyer, ask Play for the purchase list again and wait for a real answer.
            const asked = await within(START_MS, C.store.restorePurchases().then(() => true), false);
            if (!asked || lastError)
                return "UNREACHABLE";
            return product.owned || ownedProof(C) ? "VALID" : "REVOKED";
        }
    };
}
/** Is this the Android app (as opposed to a web browser)? */
export function isAndroidApp(win) {
    var _a, _b, _c, _d;
    return Boolean(((_b = (_a = win === null || win === void 0 ? void 0 : win.Capacitor) === null || _a === void 0 ? void 0 : _a.isNativePlatform) === null || _b === void 0 ? void 0 : _b.call(_a)) && ((_d = (_c = win.Capacitor).getPlatform) === null || _d === void 0 ? void 0 : _d.call(_c)) === "android");
}
