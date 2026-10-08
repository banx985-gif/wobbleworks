import { labMissions } from "../labs/LabModule.js";
import { ELECTRICITY_TRUTH_CONTRACT, LEVEL_BRIGHT, LEVEL_ON } from "./CircuitSystem.js";
/**
 * Lab 4 — Power Lab (M14). Every discovery is measured by the CircuitSystem in that TEST (truth.electricity.v1);
 * finishing a level is never evidence on its own.
 */
export { ELECTRICITY_TRUTH_CONTRACT };
export const POWER_MISSIONS = labMissions("power-lab");
/** Half a second of steady current before anything counts as evidence. */
export const EVIDENCE_TICKS = 30;
export function collectPowerDiscoveries(build, runtime) {
    const c = runtime.circuits;
    const out = new Set();
    const events = runtime.causalEvents;
    if (!c.layout.elements.length)
        return [];
    const has = (kind) => events.some(e => e.kind === kind);
    const loads = c.loadStates();
    const steady = (id, level) => c.ticksAtLeast(id, level) >= EVIDENCE_TICKS;
    if (loads.some(l => steady(l.id, LEVEL_ON)))
        out.add("power.complete-circuit");
    // A switch or button changed, and in that same tick a load went on or off because of it.
    const changes = new Set(events.filter(e => e.kind === "SWITCH_CHANGED").map(e => e.tick));
    if (events.some(e => (e.kind === "LOAD_ON" || e.kind === "LOAD_OFF") && changes.has(e.tick)))
        out.add("power.switch-control");
    // Series: two loads lit together, each dimmer than half, carrying the same current (one path through both).
    const lit = loads.filter(l => steady(l.id, LEVEL_ON));
    for (let i = 0; i < lit.length; i++)
        for (let j = i + 1; j < lit.length; j++) {
            const a = lit[i], b = lit[j];
            if (a.level < 0.5 && b.level < 0.5 && Math.abs(Math.abs(a.current) - Math.abs(b.current)) < 0.02 * Math.max(Math.abs(a.current), 0.01))
                out.add("power.series");
        }
    if (loads.filter(l => steady(l.id, LEVEL_BRIGHT)).length >= 2)
        out.add("power.parallel");
    const electric = runtime.gears.nodes.filter(n => runtime.gears.isElectric(n.id));
    if (electric.some(n => (runtime.gears.state(n.id)?.runTicks ?? 0) >= EVIDENCE_TICKS))
        out.add("power.motor");
    if (loads.some(l => steady(l.id, 1.8)))
        out.add("power.more-batteries");
    if (has("LOAD_BYPASSED") || has("SHORT_CIRCUIT"))
        out.add("power.easy-path");
    if (has("BATTERY_EMPTY") || c.sources().some(s => s.energyUsed >= s.capacity * 0.5))
        out.add("power.battery-drain");
    // Combinations: an electric motor's own gear train really did the work.
    const electricTrain = (outputId) => { const d = runtime.gears.trainInfo(outputId)?.driverId; return d !== undefined && runtime.gears.isElectric(d); };
    if (events.some(e => (e.kind === "WINCH_LIFT" || e.kind === "OUTPUT_TURN") && electricTrain(e.sourceId)))
        out.add("combo.power-gears");
    if (events.some(e => e.kind === "CONVEYOR_CARRY") && runtime.gears.nodes.some(n => n.output?.kind === "CONVEYOR" && electricTrain(n.id) && (runtime.gears.state(n.id)?.runTicks ?? 0) >= EVIDENCE_TICKS))
        out.add("combo.power-conveyor");
    // Secrets.
    if (has("BREAKER_TRIPPED"))
        out.add("secret.power-overload");
    if (loads.filter(l => l.kind === "BULB" && l.on).length >= 5)
        out.add("secret.power-light-show");
    const duck = build.allParts().find(p => p.definitionId === "silly.duck");
    if (duck && loads.some(l => l.kind === "BUZZER" && l.on)) {
        try {
            const d = runtime.physics.state(duck.id);
            if (build.allParts().some(p => p.definitionId === "circuit.button" && c.isClosed(p.id) && Math.hypot(p.position.x - d.x, p.position.y - d.y) < 0.9))
                out.add("secret.power-duck-alarm");
        }
        catch { /* not simulated */ }
    }
    return [...out];
}
export const POWER_PARENT_MAPPINGS = Object.freeze([
    { concept: "Electricity & Circuits", evidence: "made a complete circuit to power something", discoveryId: "power.complete-circuit" },
    { concept: "Electricity & Circuits", evidence: "used a switch or button to control a circuit", discoveryId: "power.switch-control" },
    { concept: "Electricity & Circuits", evidence: "saw loads share power in one loop (series)", discoveryId: "power.series" },
    { concept: "Electricity & Circuits", evidence: "gave each load its own path (parallel)", discoveryId: "power.parallel" },
    { concept: "Electricity & Circuits", evidence: "used electricity to make a motor turn", discoveryId: "power.motor" }
]);
export const POWER_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "power.complete-circuit", title: "Torches", example: "A torch only lights when its switch closes the loop from the batteries, through the bulb and back." },
    { discoveryId: "power.switch-control", title: "Light switches", example: "The light switch on your wall opens and closes a gap in the loop to the ceiling light." },
    { discoveryId: "power.parallel", title: "Lights at home", example: "Houses are wired so each light has its own path — one bulb going out doesn't switch off the rest." },
    { discoveryId: "power.series", title: "Old fairy lights", example: "In some old strings of fairy lights the bulbs share one loop, so one loose bulb makes them all go dark." },
    { discoveryId: "power.motor", title: "Electric motors", example: "Fans, toy cars and washing machines all have electric motors that turn electricity into turning." },
    { discoveryId: "power.easy-path", title: "Short circuits", example: "Electricity takes the easiest path. That's why grown-ups must never let metal touch both ends of a plug." }
]);
export const POWER_CONCEPT_EVIDENCE = {
    "power.complete-circuit": "Electricity went round a complete loop and a load stayed on for half a second or more.",
    "power.switch-control": "A switch or button changed, and a load turned on or off in the same moment.",
    "power.series": "Two loads lit together on one path, sharing the current, each dimmer than half power.",
    "power.parallel": "Two loads on separate paths were both bright at the same time.",
    "power.motor": "An electric motor turned its gears for half a second or more.",
    "power.more-batteries": "A load got almost twice one battery's push or more.",
    "power.easy-path": "Current went through a plain wire instead of a load beside it.",
    "power.battery-drain": "A battery used up half of its stored energy or more.",
    "combo.power-gears": "An electric motor's gear train turned or lifted an output.",
    "combo.power-conveyor": "An electric motor drove the old conveyor and it carried cargo.",
    "secret.power-overload": "Too much was switched on at once, so the power station switched itself off.",
    "secret.power-light-show": "Five or more bulbs were lit at the same time.",
    "secret.power-duck-alarm": "A duck landed on a pressure pad and set off a buzzer."
};
export const POWER_LAB = {
    labId: "power-lab", folder: "power", concept: "Electricity & Circuits", scannerName: "Circuit Scanner", truthContractId: ELECTRICITY_TRUTH_CONTRACT.id,
    parentMappings: POWER_PARENT_MAPPINGS, realWorldCards: POWER_REAL_WORLD_CARDS, conceptEvidence: POWER_CONCEPT_EVIDENCE,
    collectDiscoveries: collectPowerDiscoveries
};
