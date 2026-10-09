/**
 * Full-game ownership (M37). Kept apart from child gameplay: gameplay only ever reads the save's entitlement state
 * through ownsFullGame(); nothing in here touches levels, physics or progress.
 *
 * An ownership PROOF is a small signed record issued by the store or the WobbleWorks ownership service after a real
 * purchase. It is checked on the device with an embedded public key (ECDSA P-256 / SHA-256, Web Crypto), so a
 * legitimate buyer keeps playing offline. It has no expiry (a one-time purchase); the service can only revoke it
 * (for example after a refund), and the game only learns that when it happens to be online.
 */
export const FULL_GAME_PRODUCT = "wobbleworks.full-game";
/**
 * Public keys this build trusts. The real key belongs to the ownership service and is added when that service exists
 * (release work, M40–M41). Until then the list is empty, so no proof is accepted in this build — the grown-up test
 * tool is the only way to open the full game in test builds.
 */
export const TRUSTED_KEYS = [];
const ALGO = { name: "ECDSA", namedCurve: "P-256" };
const SIGN = { name: "ECDSA", hash: "SHA-256" };
function subtle() { const c = globalThis.crypto?.subtle; if (!c)
    throw new Error("Web Crypto is not available"); return c; }
/** The exact bytes that are signed: fields in a fixed order. */
export function canonicalPayload(p) { return JSON.stringify([p.v, p.product, p.platform, p.owner, p.issuedAtMs, p.keyId]); }
const b64url = (bytes) => { let s = ""; for (const b of bytes)
    s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64url = (s) => { const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)); return Uint8Array.from(bin, c => c.charCodeAt(0)); };
export function isProofShape(v) {
    const p = v;
    const q = p?.payload;
    return Boolean(p) && typeof p.signature === "string" && p.signature.length > 20 && p.signature.length < 400 && Boolean(q) && q.v === 1 &&
        typeof q.product === "string" && ["IOS", "ANDROID", "WEB", "TEST"].includes(q.platform) && typeof q.owner === "string" && /^[A-Za-z0-9._:-]{4,128}$/.test(q.owner) &&
        Number.isFinite(q.issuedAtMs) && q.issuedAtMs > 0 && typeof q.keyId === "string" && /^[a-z0-9-]{1,40}$/.test(q.keyId);
}
/** Check a proof on the device — no network. Never throws. */
export async function verifyProof(value, keys = TRUSTED_KEYS, nowMs = Date.now()) {
    if (!isProofShape(value))
        return { ok: false, reason: "NOT_A_PROOF" };
    const { payload, signature } = value;
    if (payload.product !== FULL_GAME_PRODUCT)
        return { ok: false, reason: "WRONG_PRODUCT" };
    if (payload.issuedAtMs > nowMs + 24 * 3600 * 1000)
        return { ok: false, reason: "FROM_THE_FUTURE" };
    const key = keys.find(k => k.keyId === payload.keyId);
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
