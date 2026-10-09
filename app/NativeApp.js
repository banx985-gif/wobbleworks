/** The on-screen back buttons the Android back button can press for the child. */
export const BACK_BUTTON_SELECTOR = '.back-btn, .big-btn.back, [data-shell-action="back-title"], [data-shell-action$="-back"]';
/**
 * What the Android back button does on each screen. It never quits in the middle of building: in the Workshop it opens
 * Pause, in Pause it carries on building, and elsewhere it goes back a screen. Only the title screen leaves the app.
 */
export function backStep(screen, hasBackButton) {
    if (screen === "WORKSHOP")
        return "PAUSE";
    if (screen === "PAUSE")
        return "RESUME";
    if (screen === "TITLE")
        return "EXIT";
    if (hasBackButton)
        return "BACK_BUTTON";
    if (screen === "HUB")
        return "TITLE";
    return "NOTHING";
}
/** The screen stays on while a child is building and testing; menus let the device sleep as usual. */
export function keepsScreenAwake(screen) { return screen === "WORKSHOP"; }
/**
 * Connects the app's events: back → `onBack`; the app hidden or shown → the same events the game already uses for
 * pausing sound and saving (`wobbleworks:native-background` / `-foreground`).
 */
export function hookNativeApp(win, onBack) {
    const cap = win.Capacitor;
    const native = Boolean(cap?.isNativePlatform?.());
    const app = native ? cap?.Plugins?.App : undefined;
    const awake = native ? cap?.Plugins?.KeepAwake : undefined;
    if (app) {
        app.addListener("backButton", onBack);
        app.addListener("pause", () => win.dispatchEvent(new Event("wobbleworks:native-background")));
        app.addListener("resume", () => win.dispatchEvent(new Event("wobbleworks:native-foreground")));
    }
    let current;
    return {
        native,
        setAwake(on) { if (!awake || on === current)
            return; current = on; void awake.set({ on }).catch(() => { current = undefined; }); },
        exit() { if (app)
            void app.exitApp(); }
    };
}
