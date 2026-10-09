/**
 * Measures one TEST so a saved invention version can carry real results (M24 version comparison).
 * Only things the simulation actually reports are measured: how far (in a straight line) and how high any moving body got from where
 * it started, the fastest any body went, the longest chain, and the biggest structure wobble.
 */
export class RunMeter {
    constructor(buildChecksum) {
        Object.defineProperty(this, "buildChecksum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: buildChecksum
        });
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "distance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "ticks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "runtime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    sample(runtime) {
        this.ticks++;
        for (const s of runtime.physics.states()) {
            const s0 = this.start.get(s.id);
            if (!s0) {
                this.start.set(s.id, { x: s.x, y: s.y });
                continue;
            }
            this.distance = Math.max(this.distance, Math.hypot(s.x - s0.x, s.y - s0.y));
            this.height = Math.max(this.height, s0.y - s.y);
            this.speed = Math.max(this.speed, Math.hypot(s.vx, s.vy));
        }
        this.runtime = runtime;
    }
    /** Results so far; nothing until the TEST has run for half a second. */
    result() {
        if (this.ticks < 30)
            return undefined;
        const out = { distance: this.distance, height: Math.max(0, this.height), speed: this.speed };
        const rt = this.runtime;
        if (rt === null || rt === void 0 ? void 0 : rt.chain.active)
            out.chain = rt.chain.longest();
        if (rt && rt.structures.memberStates().length)
            out.wobble = rt.structures.maxWobble();
        return out;
    }
}
