import { titleVisibility } from "./AppState.js";
export const SHELL_SCREENS = [
    "SPLASH", "LOADING", "RECOVERY_NOTICE", "TITLE", "PROFILE_SELECT", "CREATE_INVENTOR", "SETTINGS", "GROWN_UPS",
    "MOTION_YARD", "WORKSHOP", "PAUSE", "LOADING_FAILURE", "STORAGE_WARNING", "OFFLINE_ENTITLEMENT", "UNSUPPORTED_DEVICE", "ROTATE_DEVICE",
    "HUB", "CAMPUS_MAP", "LOCKER", "TROPHIES", "SHELF", "LAB_LOCKED", "PARENT_DASHBOARD", "EXTRAS", "INFO", "DISCOVERY_BOOK", "INVENTIONS"
];
export const SHELL_SMOKE_ROUTE = SHELL_SCREENS;
export class AppShellController {
    screen = "SPLASH";
    lockedUntilMs = 0;
    transitionLockMs;
    smokeIndex = -1;
    constructor(transitionLockMs = 180) { this.transitionLockMs = transitionLockMs; }
    current() { return this.screen; }
    titleVisibility(save) { return titleVisibility(save); }
    isInputLocked(nowMs) { return nowMs < this.lockedUntilMs; }
    canUseGameplay(nowMs) { return this.screen === "WORKSHOP" && !this.isInputLocked(nowMs); }
    transition(next, nowMs, force = false) {
        if (!force && this.isInputLocked(nowMs))
            return false;
        if (next === this.screen)
            return true;
        this.screen = next;
        this.lockedUntilMs = nowMs + this.transitionLockMs;
        return true;
    }
    force(next, nowMs) { void this.transition(next, nowMs, true); }
    nextSmokeScreen(nowMs) {
        this.smokeIndex = (this.smokeIndex + 1) % SHELL_SMOKE_ROUTE.length;
        const next = SHELL_SMOKE_ROUTE[this.smokeIndex];
        this.force(next, nowMs);
        return next;
    }
}
