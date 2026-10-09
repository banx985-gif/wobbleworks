export const SIMULATION_PHASES = [
    "TICK_BEGIN", "NETWORK_TOPOLOGY", "PRE_PHYSICS_SENSORS", "LOGIC_EVALUATION",
    "ACTUATOR_RESOLUTION", "FORCE_AND_COUPLING", "PHYSICS_STEP", "POST_PHYSICS_CONTACTS",
    "DOMAIN_TRANSFER", "CAUSAL_EVENT_RECORDING", "GOAL_AND_CONCEPT_EVIDENCE",
    "REPLAY_SAMPLE", "PRESENTATION_QUEUE"
];
export class SimulationPipeline {
    constructor() {
        Object.defineProperty(this, "trace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "handlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    on(phase, handler) {
        var _a;
        const list = (_a = this.handlers.get(phase)) !== null && _a !== void 0 ? _a : [];
        list.push(handler);
        this.handlers.set(phase, list);
    }
    step(tick, dt) {
        var _a;
        this.trace.length = 0;
        for (const phase of SIMULATION_PHASES) {
            this.trace.push(phase);
            for (const handler of (_a = this.handlers.get(phase)) !== null && _a !== void 0 ? _a : [])
                handler({ tick, dt, phase });
        }
    }
}
