import { RuntimeWorld } from "../physics/RuntimeWorld.js";
export class TestSystem {
    constructor(registry) {
        Object.defineProperty(this, "registry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: registry
        });
        Object.defineProperty(this, "runtime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "snapshot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "paused", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
    }
    start(snapshot) { this.stop(); this.snapshot = snapshot; this.runtime = new RuntimeWorld(snapshot, this.registry); this.paused = false; return this.runtime; }
    step(dt = 1 / 60) { if (!this.runtime || this.paused)
        return; this.runtime.step(dt * this.speed); }
    stop() { if (this.runtime)
        this.runtime.destroy(); this.runtime = undefined; this.paused = false; return this.snapshot; }
    togglePause() { this.paused = !this.paused; return this.paused; }
    setSlowMotion(enabled) { this.speed = enabled ? 0.25 : 1; }
    active() { return this.runtime; }
    isPaused() { return this.paused; }
}
