export class FixedClock {
    hz;
    dt;
    accumulator = 0;
    previousMs = 0;
    speed = 1;
    constructor(hz = 60) { this.hz = hz; this.dt = 1 / hz; }
    setSpeed(multiplier) { this.speed = Math.max(0, multiplier); }
    reset(nowMs) { this.previousMs = nowMs; this.accumulator = 0; }
    consume(nowMs, step, maxSteps = 8) {
        if (this.previousMs === 0)
            this.previousMs = nowMs;
        const frameSeconds = Math.min(0.25, Math.max(0, (nowMs - this.previousMs) / 1000));
        this.previousMs = nowMs;
        this.accumulator += frameSeconds * this.speed;
        let steps = 0;
        while (this.accumulator >= this.dt && steps < maxSteps) {
            step(this.dt);
            this.accumulator -= this.dt;
            steps += 1;
        }
        if (steps === maxSteps)
            this.accumulator = 0;
        return steps;
    }
}
