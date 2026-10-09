export class PerformanceMonitor {
    constructor() {
        Object.defineProperty(this, "fps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "frameMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "simulationMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "frames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "accumulatedMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "last", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: performance.now()
        });
    }
    frame(now = performance.now()) { this.frameMs = now - this.last; this.last = now; this.frames += 1; this.accumulatedMs += this.frameMs; if (this.accumulatedMs >= 500) {
        this.fps = Math.round(this.frames * 1000 / this.accumulatedMs);
        this.frames = 0;
        this.accumulatedMs = 0;
    } }
    measureSimulation(run) { const start = performance.now(); run(); this.simulationMs = performance.now() - start; }
}
