export class PerformanceMonitor {
    fps = 0;
    frameMs = 0;
    simulationMs = 0;
    frames = 0;
    accumulatedMs = 0;
    last = performance.now();
    frame(now = performance.now()) { this.frameMs = now - this.last; this.last = now; this.frames += 1; this.accumulatedMs += this.frameMs; if (this.accumulatedMs >= 500) {
        this.fps = Math.round(this.frames * 1000 / this.accumulatedMs);
        this.frames = 0;
        this.accumulatedMs = 0;
    } }
    measureSimulation(run) { const start = performance.now(); run(); this.simulationMs = performance.now() - start; }
}
