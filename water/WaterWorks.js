import { labMissions } from "../labs/LabModule.js";
import { WATER_TRUTH_CONTRACT } from "./FluidSystem.js";
/**
 * Lab 6 — Water Works (M16). Every discovery is measured by the FluidSystem in that TEST (truth.water.v1).
 */
export { WATER_TRUTH_CONTRACT };
export const WATER_MISSIONS = labMissions("water-works");
export function collectWaterDiscoveries(build, runtime) {
    var _a;
    const w = runtime.water;
    const out = new Set();
    const events = runtime.causalEvents;
    if (!w.layout.ports.length)
        return [];
    const has = (kind) => events.some(e => e.kind === kind);
    if (has("TANK_STARTED") || has("WATER_TARGET_WET"))
        out.add("water.path");
    // Downhill: a tank that started with water gave some to another tank, with no pump helping.
    const pumping = has("PUMP_LIFT");
    for (const p of build.allParts()) {
        const start = Number((_a = p.parameters.startVolume) !== null && _a !== void 0 ? _a : 0);
        const t = w.tank(p.id);
        if (!t || start <= 0)
            continue;
        if (!pumping && t.volume < start * 0.7 && w.tankStates().some(o => o.id !== p.id && o.volume > 0.5 && o.bottomY > t.bottomY))
            out.add("water.downhill");
    }
    if (has("WATER_AIRLOCK"))
        out.add("water.climb");
    // Valves: one valve let water through while a closed valve held some back.
    const valves = build.allParts().filter(p => p.definitionId === "plumb.valve");
    if (valves.some(v => w.isOpen(v.id) && w.flowThrough(v.id) > 0.05) && valves.some(v => !w.isOpen(v.id)))
        out.add("water.valve");
    if (has("PUMP_LIFT"))
        out.add("water.pump");
    // Narrow pipes: a narrow pipe and a wide pipe both carried water, the narrow one much less.
    const flowOf = (def) => build.allParts().filter(p => p.definitionId === def).map(p => w.flowThrough(p.id)).filter(q => q > 0.02);
    const narrow = flowOf("plumb.pipe-narrow"), wide = flowOf("plumb.pipe");
    if (narrow.length && wide.length && Math.min(...narrow) <= 0.6 * Math.max(...wide))
        out.add("water.narrow");
    if (has("NOZZLE_HIT"))
        out.add("water.jet");
    if (events.some(e => e.kind === "WATER_SPILL" && w.tank(e.sourceId) !== undefined) || w.spillStates().some(s => w.tank(s.id) !== undefined))
        out.add("water.overflow");
    const wheels = runtime.gears.nodes.filter(n => runtime.gears.isHydraulic(n.id));
    if (wheels.some(n => { var _a, _b; return ((_b = (_a = runtime.gears.state(n.id)) === null || _a === void 0 ? void 0 : _a.runTicks) !== null && _b !== void 0 ? _b : 0) >= 30; }))
        out.add("water.wheel");
    const hydraulicTrain = (id) => { var _a; const d = (_a = runtime.gears.trainInfo(id)) === null || _a === void 0 ? void 0 : _a.driverId; return d !== undefined && runtime.gears.isHydraulic(d); };
    if (events.some(e => e.kind === "OUTPUT_TURN" && hydraulicTrain(e.sourceId)))
        out.add("combo.water-gears");
    if (has("PUMP_LIFT") && has("NOZZLE_HIT"))
        out.add("combo.water-electric");
    const duck = build.allParts().find(p => p.definitionId === "silly.duck");
    const pool = build.allParts().find(p => p.definitionId === "plumb.pool");
    if (duck && pool && events.some(e => e.kind === "WATER_JET_PUSH" && e.targetId === duck.id)) {
        try {
            const d = runtime.physics.state(duck.id);
            if (Math.abs(d.x - pool.position.x) < 1.1)
                out.add("secret.water-duck-splash");
        }
        catch { /* not simulated */ }
    }
    if (w.totalSpilled() >= 10)
        out.add("secret.water-big-spill");
    return [...out];
}
export const WATER_PARENT_MAPPINGS = Object.freeze([
    { concept: "Water & Flow", evidence: "made a path for water to flow along", discoveryId: "water.path" },
    { concept: "Water & Flow", evidence: "saw that water can't climb higher than where it starts", discoveryId: "water.climb" },
    { concept: "Water & Flow", evidence: "used a valve to stop or let through water", discoveryId: "water.valve" },
    { concept: "Water & Flow", evidence: "used a pump to lift water higher", discoveryId: "water.pump" },
    { concept: "Water & Flow", evidence: "compared how much water wide and narrow pipes carry", discoveryId: "water.narrow" }
]);
export const WATER_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "water.path", title: "Pipes at home", example: "Pipes in your walls carry water from the water main to every tap in the house." },
    { discoveryId: "water.climb", title: "Water towers", example: "Towns keep water in tall towers so it can flow down and push up into the houses below." },
    { discoveryId: "water.valve", title: "Taps", example: "A tap is a valve: turn it and it opens or closes the way for the water." },
    { discoveryId: "water.pump", title: "Pumps", example: "Pumps push water uphill — like the ones that lift water to the top floors of tall buildings." },
    { discoveryId: "water.narrow", title: "Hoses", example: "A wide fire hose carries far more water than a thin garden hose." },
    { discoveryId: "water.wheel", title: "Water wheels", example: "Old mills used falling water to turn a big wheel, and the wheel turned the millstones." }
]);
export const WATER_CONCEPT_EVIDENCE = {
    "water.path": "Water flowed along a pipe path into a tank or onto a target.",
    "water.downhill": "A tank on a shelf gave its water to a lower tank, with no pump.",
    "water.climb": "Water stopped at a pipe higher than the water feeding it.",
    "water.valve": "One valve let water through while a closed valve held water back.",
    "water.pump": "A powered pump pushed water up higher than it could go on its own.",
    "water.narrow": "A narrow pipe carried much less water than a wide one.",
    "water.jet": "A water jet flew in an arc and hit a target.",
    "water.overflow": "A full tank overflowed from the top.",
    "water.wheel": "Falling water turned a water wheel for half a second or more.",
    "combo.water-gears": "A water wheel's gears turned an old machine.",
    "combo.water-electric": "An electric pump fed a jet that hit its target.",
    "secret.water-duck-splash": "A water jet pushed the duck into the pool.",
    "secret.water-big-spill": "Ten litres of water ended up on the floor. Mop, please!"
};
export const WATER_WORKS = {
    labId: "water-works", folder: "water", concept: "Water & Flow", scannerName: "Flow Scanner", truthContractId: WATER_TRUTH_CONTRACT.id,
    parentMappings: WATER_PARENT_MAPPINGS, realWorldCards: WATER_REAL_WORLD_CARDS, conceptEvidence: WATER_CONCEPT_EVIDENCE,
    collectDiscoveries: collectWaterDiscoveries
};
