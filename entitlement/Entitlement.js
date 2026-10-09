/**
 * Full-game ownership (M37). Kept apart from child gameplay: gameplay only ever reads the save's entitlement state
 * through ownsFullGame(); nothing in here touches levels, physics or progress.
 *
 * An ownership PROOF is a small signed record issued by the store or the WobbleWorks ownership service after a real
 * purchase. It is checked on the device with an embedded public key (ECDSA P-256 / SHA-256, Web Crypto), so a
 * legitimate buyer keeps playing offline. It has no expiry (a one-time purchase); the service can only revoke it
 * (for example after a refund), and the game only learns that when it happens to be online.
 *
 * On Google Play there is no WobbleWorks server: Play itself holds the purchase record. The proof there is Google's own
 * signed purchase record (the purchase details plus Google's RSA signature, made with this app's Play licence key), checked
 * on the device with the app's public licence key from the Play Console (PLAY_LICENSE_KEY below).
 */
export const FULL_GAME_PRODUCT = "wobbleworks.full-game";
/** Google Play (the Android app). The product id must match the in-app product made in the Play Console exactly. */
export const PLAY_PRODUCT_ID = "wobbleworks_full_game";
export const ANDROID_APP_ID = "com.banxgames.wobbleworks";
export const PLAY_KEY_ID = "google-play";
/**
 * Public keys this build trusts. The real key belongs to the ownership service and is added when that service exists
 * (release work, M40–M41). Until then the list is empty, so no proof is accepted in this build — the grown-up test
 * tool is the only way to open the full game in test builds.
 */
export const TRUSTED_KEYS = [];
/**
 * The app's Google Play licence key: Play Console → the app → Monetize with Play → Monetization setup → "Licensing"
 * (a long base64 public key). It's public, not a secret. tools/app-build.mjs fills it in from
 * store-keys/google-play-licence-key.txt when it builds the Android app; empty in web builds, which never use Play.
 */
export const PLAY_LICENSE_KEY = "";
/** Every key this build trusts: the service's keys, plus the Play licence key when this is an Android build that has one. */
export function trustedKeys() { return PLAY_LICENSE_KEY ? [...TRUSTED_KEYS, { keyId: PLAY_KEY_ID, playSpki: PLAY_LICENSE_KEY }] : TRUSTED_KEYS; }
const ALGO = { name: "ECDSA", namedCurve: "P-256" };
const SIGN = { name: "ECDSA", hash: "SHA-256" };
function subtle() { const c = globalThis.crypto?.subtle; if (!c)
    throw new Error("Web Crypto is not available"); return c; }
/** The exact bytes that are signed: fields in a fixed order. */
export function canonicalPayload(p) { return JSON.stringify([p.v, p.product, p.platform, p.owner, p.issuedAtMs, p.keyId]); }
const b64url = (bytes) => { let s = ""; for (const b of bytes)
    s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64url = (s) => { const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)); return Uint8Array.from(bin, c => c.charCodeAt(0)); };
export function isPlayProofShape(v) {
    const p = v;
    return Boolean(p) && typeof p === "object" && p.v === 1 && p.kind === "PLAY" && typeof p.purchase === "string" && p.purchase.length > 20 && p.purchase.length < 4000 &&
        typeof p.signature === "string" && /^[A-Za-z0-9+/=]{100,1000}$/.test(p.signature);
}
/** What Google's signed purchase JSON says about the purchase (only the fields the game checks). */
function readPlayPurchase(json) {
    try {
        const o = JSON.parse(json);
        return o && typeof o === "object" ? o : undefined;
    }
    catch {
        return undefined;
    }
}
const unb64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
/** Google Play: check Google's RSA signature (SHA-1, as Play signs purchases) with the app's licence key. Never throws. */
async function verifyPlayProof(proof, keys, nowMs) {
    const p = readPlayPurchase(proof.purchase);
    if (!p)
        return { ok: false, reason: "NOT_A_PROOF" };
    const products = Array.isArray(p.productIds) ? p.productIds : [p.productId];
    if (p.packageName !== ANDROID_APP_ID || !products.includes(PLAY_PRODUCT_ID))
        return { ok: false, reason: "WRONG_PRODUCT" };
    // 0 = bought. 4 = still waiting for payment (cash), 1/2 = cancelled or refunded: none of those unlock anything.
    if (p.purchaseState !== undefined && p.purchaseState !== 0)
        return { ok: false, reason: "WRONG_PRODUCT" };
    const time = typeof p.purchaseTime === "number" ? p.purchaseTime : 0;
    if (time > nowMs + 24 * 3600 * 1000)
        return { ok: false, reason: "FROM_THE_FUTURE" };
    const key = keys.find((k) => "playSpki" in k);
    if (!key)
        return { ok: false, reason: "UNKNOWN_KEY" };
    try {
        const pub = await subtle().importKey("spki", unb64(key.playSpki), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-1" }, false, ["verify"]);
        const good = await subtle().verify("RSASSA-PKCS1-v1_5", pub, unb64(proof.signature), new TextEncoder().encode(proof.purchase));
        if (!good)
            return { ok: false, reason: "BAD_SIGNATURE" };
    }
    catch {
        return { ok: false, reason: "BAD_SIGNATURE" };
    }
    const ref = String(p.orderId ?? p.purchaseToken ?? "play").replace(/[^A-Za-z0-9._:-]/g, "").slice(0, 128).padEnd(4, "0");
    return { ok: true, payload: { v: 1, product: FULL_GAME_PRODUCT, platform: "ANDROID", owner: ref, issuedAtMs: time || 1, keyId: PLAY_KEY_ID } };
}
export function isProofShape(v) {
    const p = v;
    const q = p?.payload;
    return Boolean(p) && typeof p.signature === "string" && p.signature.length > 20 && p.signature.length < 400 && Boolean(q) && q.v === 1 &&
        typeof q.product === "string" && ["IOS", "ANDROID", "WEB", "TEST"].includes(q.platform) && typeof q.owner === "string" && /^[A-Za-z0-9._:-]{4,128}$/.test(q.owner) &&
        Number.isFinite(q.issuedAtMs) && q.issuedAtMs > 0 && typeof q.keyId === "string" && /^[a-z0-9-]{1,40}$/.test(q.keyId);
}
/** Check a proof on the device — no network. Never throws. */
export async function verifyProof(value, keys = trustedKeys(), nowMs = Date.now()) {
    if (isPlayProofShape(value))
        return verifyPlayProof(value, keys, nowMs);
    if (!isProofShape(value))
        return { ok: false, reason: "NOT_A_PROOF" };
    const { payload, signature } = value;
    if (payload.product !== FULL_GAME_PRODUCT)
        return { ok: false, reason: "WRONG_PRODUCT" };
    if (payload.issuedAtMs > nowMs + 24 * 3600 * 1000)
        return { ok: false, reason: "FROM_THE_FUTURE" };
    const key = keys.find((k) => k.keyId === payload.keyId && "jwk" in k);
    if (!key)
        return { ok: false, reason: "UNKNOWN_KEY" };
    try {
        const pub = await subtle().importKey("jwk", key.jwk, ALGO, false, ["verify"]);
        const good = await subtle().verify(SIGN, pub, unb64url(signature), new TextEncoder().encode(canonicalPayload(payload)));
        return good ? { ok: true, payload } : { ok: false, reason: "BAD_SIGNATURE" };
    }
    catch {
        return { ok: false, reason: "BAD_SIGNATURE" };
    }
}
/** Used by the ownership service (and tests) to issue a proof. The private key never ships in the game. */
export async function signProof(payload, privateJwk) {
    const key = await subtle().importKey("jwk", privateJwk, ALGO, false, ["sign"]);
    const sig = new Uint8Array(await subtle().sign(SIGN, key, new TextEncoder().encode(canonicalPayload(payload))));
    return { payload, signature: b64url(sig) };
}
