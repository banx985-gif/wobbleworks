/**
 * Kid-proofing (M51): a button that a child double-taps (or taps again while it is still working) acts once.
 * A second press is ignored while the first is still being handled, and for `quietMs` after it.
 */
export class TapGuard {
    constructor(quietMs = 400) {
        Object.defineProperty(this, "quietMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: quietMs
        });
        Object.defineProperty(this, "quietUntil", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -Infinity
        });
        Object.defineProperty(this, "working", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    /** True when this press should be handled (and starts the quiet time). */
    accept(nowMs) { if (this.working || nowMs < this.quietUntil)
        return false; this.quietUntil = nowMs + this.quietMs; return true; }
    /** Runs `work` for this press unless it should be ignored; presses while it runs are ignored too. */
    async run(nowMs, work) {
        if (!this.accept(nowMs))
            return undefined;
        this.working = true;
        try {
            return await work();
        }
        finally {
            this.working = false;
        }
    }
    /** Something new is on screen (e.g. the next message): it may be pressed again after the quiet time. */
    restart(nowMs) { this.quietUntil = nowMs + this.quietMs; }
}
