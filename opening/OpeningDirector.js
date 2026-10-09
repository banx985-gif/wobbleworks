export const OPENING_CHALLENGES = [
    { step: 1, levelId: "opening.wheel-cart", title: "Give It a Wheel", prompt: "Drag the wheel onto the cart, then TEST.", boltLine: "Quick! This cart needs a wheel!" },
    { step: 2, levelId: "opening.ramp-ball-switch", title: "Wake the Switch", prompt: "Place the ramp so the ball can reach the switch.", boltLine: "Can we get that ball to the switch?" },
    { step: 3, levelId: "opening.spring-funny", title: "Boing!", prompt: "Put the spring under Bolt and TEST.", boltLine: "A spring! What could possibly go—WHOA!" },
    { step: 4, levelId: "opening.broken-machine", title: "Fix the Wobble", prompt: "This cart is missing a wheel. Repair it.", boltLine: "Something's definitely missing here." },
    { step: 5, levelId: "opening.free-choice", title: "Your Idea", prompt: "Get the ball moving. Ramp or spring — you choose.", boltLine: "Your call. Show me your way!" },
    { step: 6, levelId: "opening.free-build", title: "Empty Workshop", prompt: "Build anything. TEST it. Change it. TEST again.", boltLine: "This bit of workshop is yours. Make something weird!" }
];
export class OpeningDirector {
    constructor(step = 1) {
        Object.defineProperty(this, "step", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startedAtMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "firstInteractionAtMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstTestAtMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tests", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "stops", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "retries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "completed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "testsThisStep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.step = step;
    }
    startSession(nowMs) { if (this.startedAtMs === 0)
        this.startedAtMs = nowMs; }
    currentStep() { return this.step; }
    current() { return OPENING_CHALLENGES[this.step - 1]; }
    noteInteraction(nowMs) { var _a; (_a = this.firstInteractionAtMs) !== null && _a !== void 0 ? _a : (this.firstInteractionAtMs = nowMs); }
    noteTest(nowMs) { var _a; (_a = this.firstTestAtMs) !== null && _a !== void 0 ? _a : (this.firstTestAtMs = nowMs); this.tests += 1; this.testsThisStep += 1; if (this.testsThisStep > 1)
        this.retries += 1; }
    noteStop() { this.stops += 1; }
    completeCurrent() {
        const completed = this.step;
        this.completed.add(completed);
        this.testsThisStep = 0;
        if (completed === 6)
            return { completed, requiresInventor: false, openingComplete: true };
        const next = (completed + 1);
        this.step = next;
        return { completed, next, requiresInventor: completed === 3, openingComplete: false };
    }
    setStep(step) { this.step = step; this.testsThisStep = 0; }
    metrics() {
        return {
            sessionStartedAtMs: this.startedAtMs,
            ...(this.firstInteractionAtMs !== undefined ? { firstInteractionAtMs: this.firstInteractionAtMs } : {}),
            ...(this.firstTestAtMs !== undefined ? { firstTestAtMs: this.firstTestAtMs } : {}),
            testPresses: this.tests,
            stopPresses: this.stops,
            retries: this.retries,
            completedSteps: [...this.completed].sort((a, b) => a - b)
        };
    }
}
function partsByDefinition(build, definitionId) { return build.allParts().filter(p => p.definitionId === definitionId); }
function distance(a, b) { return Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y); }
export function evaluateOpeningSuccess(step, build, runtime) {
    if (!runtime || runtime.elapsedTime < 0.45)
        return false;
    if (step === 1) {
        const carts = partsByDefinition(build, "motion.cart"), wheels = partsByDefinition(build, "motion.wheel");
        return carts.some(cart => wheels.some(wheel => distance(cart, wheel) < 1.25)) && build.allConnections().some(c => carts.some(x => x.id === c.fromPartId || x.id === c.toPartId) && wheels.some(x => x.id === c.fromPartId || x.id === c.toPartId));
    }
    if (step === 2) {
        const ramps = partsByDefinition(build, "motion.ramp"), balls = partsByDefinition(build, "motion.ball"), switches = partsByDefinition(build, "motion.switch-pad");
        if (!ramps.length || !balls.length || !switches.length)
            return false;
        const ballState = (() => { try {
            return runtime.physics.state(balls[0].id);
        }
        catch {
            return undefined;
        } })();
        const sw = switches[0];
        const rampUseful = ramps.some(r => r.position.x > Math.min(balls[0].position.x, sw.position.x) - 0.5 && r.position.x < Math.max(balls[0].position.x, sw.position.x) + 0.5);
        return rampUseful && Boolean(ballState && Math.abs(ballState.x - sw.position.x) < 0.9 && Math.abs(ballState.y - sw.position.y) < 0.5);
    }
    if (step === 3)
        return runtime.causalEvents.some(e => e.kind === "SPRING_LAUNCH" && partsByDefinition(build, "silly.bolt").some(b => b.id === e.targetId));
    if (step === 4) {
        const cart = partsByDefinition(build, "motion.cart")[0];
        const wheels = partsByDefinition(build, "motion.wheel");
        return Boolean(cart && wheels.filter(w => distance(cart, w) < 1.35).length >= 2);
    }
    if (step === 5) {
        const ball = partsByDefinition(build, "motion.ball")[0];
        if (!ball)
            return false;
        const springWorked = runtime.causalEvents.some(e => e.kind === "SPRING_LAUNCH" && e.targetId === ball.id);
        const ramp = partsByDefinition(build, "motion.ramp")[0];
        let moved = false;
        try {
            moved = Math.abs(runtime.physics.state(ball.id).x - ball.position.x) > 1.8;
        }
        catch { }
        return springWorked || Boolean(ramp && moved);
    }
    return false;
}
