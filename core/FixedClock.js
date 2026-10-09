export class FixedClock {
    hz;
    dt;
    accumulator = 0;
    previousMs = 0;
    speed = 1;
    constructor(hz = 60) { this.hz = hz; this.dt = 1 / hz; }
    setSpeed(multiplier) { this.speed = Math.max(0, multiplier); }
    reset(nowMs) { this.previousMs = nowMs; this.accumulator = 0; }
    /**
     * Run the fixed steps owed since the last frame. `budgetMs` (M38) caps how long one frame may spend stepping: on a
     * slow device the machine then runs in gentle slow motion instead of falling further and further behind (each step
     * is still exactly 1/60 s, so results never change — only how fast they appear).
     */
    consume(nowMs, step, maxSteps = 8, budgetMs = Infinity, clockMs = () => performance.now()) {
        if (this.previousMs === 0)
            this.previousMs = nowMs;
        const frameSeconds = Math.min(0.25, Math.max(0, (nowMs - this.previousMs) / 1000));
        this.previousMs = nowMs;
        this.accumulator += frameSeconds * this.speed;
        let steps = 0;
        const started = budgetMs < Infinity ? clockMs() : 0;
        let overBudget = false;
        while (this.accumulator >= this.dt && steps < maxSteps) {
            step(this.dt);
            this.accumulator -= this.dt;
            steps += 1;
            if (budgetMs < Infinity && clockMs() - started > budgetMs) {
                overBudget = true;
                break;
            }
        }
        if (steps === maxSteps || overBudget)
            this.accumulator = 0;
        return steps;
    }
}
