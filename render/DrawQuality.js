/**
 * M50: how sharp the playfield is drawn, chosen by how well the device keeps up. Drawing fewer pixels is by far the
 * biggest saving on a cheap tablet (a busy Everything Lab ran at 12 frames a second at full sharpness and 30 at half
 * the pixels in the slowed-down test). Drawing only: physics, timing and what counts as a win never see this.
 *
 * Only frames drawn while something is happening are counted (a calm screen is drawn about once a second on purpose).
 * Every 2 seconds: under 40 frames a second → one step less sharp; 56 or more for 8 seconds in a row (and at least 10
 * seconds since the last change) → one step sharper again. Never below 0.75 pixels per screen point.
 */
export const QUALITY_STEPS = [2, 1.5, 1.25, 1, 0.75];
const WINDOW_MS = 2000, SLOW_FPS = 40, GOOD_FPS = 56, GOOD_WINDOWS = 4, SETTLE_MS = 10000, GAP_MS = 400;
export class DrawQuality {
    /** `deviceRatio`: the screen's own pixels per point (the most worth drawing; capped at 2). */
    constructor(deviceRatio) {
        /** Canvas pixels per screen point right now. */
        Object.defineProperty(this, "ratio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "steps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "windowStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -1
        });
        Object.defineProperty(this, "frames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "last", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -1
        });
        Object.defineProperty(this, "goodWindows", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -Infinity
        });
        const top = Math.min(2, Math.max(0.75, deviceRatio || 1));
        this.steps = [top, ...QUALITY_STEPS.filter(s => s < top - 1e-6)];
        this.ratio = top;
    }
    /** One frame drawn at `nowMs`. `busy`: something is moving or being touched. Returns the new ratio when it changes. */
    frame(nowMs, busy) {
        // Calm frames, and long gaps (the app hidden, a menu open), start a fresh measurement.
        if (!busy || this.last < 0 || nowMs - this.last > GAP_MS) {
            this.last = nowMs;
            this.windowStart = busy ? nowMs : -1;
            this.frames = 0;
            if (!busy)
                this.goodWindows = 0;
            return undefined;
        }
        this.last = nowMs;
        this.frames += 1;
        if (this.windowStart < 0) {
            this.windowStart = nowMs;
            this.frames = 0;
            return undefined;
        }
        const elapsed = nowMs - this.windowStart;
        if (elapsed < WINDOW_MS)
            return undefined;
        const fps = this.frames * 1000 / elapsed;
        this.windowStart = nowMs;
        this.frames = 0;
        const at = this.steps.indexOf(this.ratio);
        if (fps < SLOW_FPS) {
            this.goodWindows = 0;
            if (at < this.steps.length - 1)
                return this.change(this.steps[at + 1], nowMs);
            return undefined;
        }
        if (fps >= GOOD_FPS) {
            this.goodWindows += 1;
            if (this.goodWindows >= GOOD_WINDOWS && at > 0 && nowMs - this.lastChange >= SETTLE_MS) {
                this.goodWindows = 0;
                return this.change(this.steps[at - 1], nowMs);
            }
            return undefined;
        }
        this.goodWindows = 0;
        return undefined;
    }
    change(next, nowMs) { this.ratio = next; this.lastChange = nowMs; return next; }
}
