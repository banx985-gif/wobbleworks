import { FULL_GAME_PRODUCT, isProofShape } from "./Entitlement.js";
import { isAndroidApp, playAdapter } from "./PlayBilling.js";
/** The ownership service address. Empty until the service exists (release work). */
export const OWNERSHIP_SERVICE_URL = "";
export function nativeAdapter(bridge, platform) {
    const toResult = (r) => r.status === "OWNED" && r.proof !== undefined ? { kind: "OWNED", proof: r.proof } : r.status === "CANCELLED" ? { kind: "CANCELLED" } : r.status === "NOTHING" ? { kind: "NOTHING_TO_RESTORE" } : { kind: "FAILED", message: r.message ?? "The store couldn't finish. Nothing was charged." };
    return { kind: "NATIVE", platform, available: true, purchase: async () => toResult(await bridge.purchase(FULL_GAME_PRODUCT)), restore: async () => toResult(await bridge.restore(FULL_GAME_PRODUCT)), ...(bridge.revalidate ? { revalidate: (p) => bridge.revalidate(p) } : {}) };
}
/** Web: the parent signs in with an email code; the service returns a signed proof. `ask` asks the grown-up for text. */
export function webAdapter(serviceUrl, ask, fetcher = (...a) => fetch(...a)) {
    if (!serviceUrl)
        return { kind: "WEB", platform: "WEB", available: false, unavailableReason: "Buying on the web needs the WobbleWorks parent account service, which isn't open yet. Nothing has been charged.", purchase: async () => ({ kind: "UNAVAILABLE", message: "" }), restore: async () => ({ kind: "UNAVAILABLE", message: "" }) };
    const post = async (path, body) => { const r = await fetcher(`${serviceUrl}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); if (!r.ok)
        throw new Error(String(r.status)); return r.json(); };
    const signIn = async () => {
        const email = ask("Grown-ups: the email address you used (or want to use) for WobbleWorks:");
        if (!email)
            return { kind: "CANCELLED" };
        await post("/sign-in", { email, product: FULL_GAME_PRODUCT });
        const code = ask("We've emailed you a code. Type it here:");
        if (!code)
            return { kind: "CANCELLED" };
        const r = await post("/verify", { email, code, product: FULL_GAME_PRODUCT });
        if (r.status === "NOT_OWNED")
            return { kind: "NOTHING_TO_RESTORE" };
        if (r.status === "CHECKOUT" && typeof r.checkoutUrl === "string") {
            window.open(r.checkoutUrl, "_blank", "noopener");
            return { kind: "FAILED", message: "Finish buying in the new window, then come back and tap Restore a purchase." };
        }
        return isProofShape(r.proof) ? { kind: "OWNED", proof: r.proof } : { kind: "FAILED", message: "The service's answer couldn't be read. Nothing has changed." };
    };
    return {
        kind: "WEB", platform: "WEB", available: true, purchase: signIn, restore: signIn,
        revalidate: async (proof) => { try {
            const r = await post("/check", { proof });
            return r.status === "REVOKED" ? "REVOKED" : r.status === "VALID" ? "VALID" : "UNREACHABLE";
        }
        catch {
            return "UNREACHABLE";
        } }
    };
}
/** The right way to buy for where the game is running. */
export function pickAdapter(win, ask) {
    const bridge = win?.WobbleWorksNative;
    if (bridge)
        return nativeAdapter(bridge, bridge.platform ?? "ANDROID");
    if (win && isAndroidApp(win))
        return playAdapter(win);
    return webAdapter(OWNERSHIP_SERVICE_URL, ask);
}
