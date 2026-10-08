export const SIMULATION_PHASES = [
    "TICK_BEGIN", "NETWORK_TOPOLOGY", "PRE_PHYSICS_SENSORS", "LOGIC_EVALUATION",
    "ACTUATOR_RESOLUTION", "FORCE_AND_COUPLING", "PHYSICS_STEP", "POST_PHYSICS_CONTACTS",
    "DOMAIN_TRANSFER", "CAUSAL_EVENT_RECORDING", "GOAL_AND_CONCEPT_EVIDENCE",
    "REPLAY_SAMPLE", "PRESENTATION_QUEUE"
];
export class SimulationPipeline {
    trace = [];
    handlers = new Map();
    on(phase, handler) {
        const list = this.handlers.get(phase) ?? [];
        list.push(handler);
        this.handlers.set(phase, list);
    }
    step(tick, dt) {
        this.trace.length = 0;
        for (const phase of SIMULATION_PHASES) {
            this.trace.push(phase);
            for (const handler of this.handlers.get(phase) ?? [])
                handler({ tick, dt, phase });
        }
    }
}
