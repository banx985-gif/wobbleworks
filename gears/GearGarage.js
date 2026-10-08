import { assertLevelDefinition } from "../data/validation.js";
import { evaluateLevelOutcome } from "../core/OutcomeEvaluator.js";
import { MAIN_LABS } from "../progression/CampaignData.js";
import { GEAR_TRUTH_CONTRACT } from "./GearSystem.js";
/**
 * Lab 2 — Gear Garage (M12). Missions, content loading, evidence-backed discoveries,
 * parent mappings and real-world connection moments. Every claim here maps to GEAR_TRUTH_CONTRACT
 * and to something the GearSystem actually measured during a TEST.
 */
export { GEAR_TRUTH_CONTRACT };
export const GEAR_MISSIONS = MAIN_LABS.find(l => l.id === "gear-garage").missions;
export async function loadGearGarageLevels(registry) {
    const known = new Set(registry.all().map(part => part.id));
    const levels = new Map();
    for (const mission of GEAR_MISSIONS) {
        const response = await fetch(`./content/gear/${mission.id}.json`, { cache: "no-store" });
        if (!response.ok)
            throw new Error(`Gear Garage content failed to load: ${mission.id}`);
        const value = await response.json();
        assertLevelDefinition(value, known);
        levels.set(mission.id, value);
    }
    return levels;
}
/** How long a relationship must really run before it counts as evidence (half a second). */
export const EVIDENCE_TICKS = 30;
/** Gear discoveries this run has real evidence for. Finishing a level is never evidence on its own. */
export function collectGearDiscoveries(build, runtime) {
    const gears = runtime.gears;
    const out = new Set();
    const events = runtime.causalEvents;
    const has = (kind) => events.some(e => e.kind === kind);
    const running = (id) => (gears.state(id)?.runTicks ?? 0) >= EVIDENCE_TICKS;
    const links = gears.analysis.links;
    // Meshed pair both turning, opposite ways, for long enough.
    if (links.some(l => l.kind === "MESH" && running(l.a) && running(l.b) && Math.sign(gears.omega(l.a)) === -Math.sign(gears.omega(l.b))))
        out.add("gear.direction-flip");
    for (const s of gears.states()) {
        if (!running(s.id) || s.depth === 0)
            continue;
        if (Math.abs(s.factor) >= 1.5)
            out.add("gear.speed-up");
        if (Math.abs(s.factor) <= 0.7)
            out.add("gear.slow-strong");
        if (s.factor > 0 && s.depth >= 2 && !links.some(l => l.kind !== "MESH" && (l.a === s.id || l.b === s.id)))
            out.add("gear.same-way");
        if (Math.abs(s.factor) >= 5)
            out.add("secret.super-spin");
    }
    const turningAxles = new Set(gears.states().filter(s => running(s.id)).map(s => gears.analysis.axleOf.get(s.id)));
    if (turningAxles.size >= 3)
        out.add("gear.chain");
    if (links.some(l => l.kind === "BELT" && running(l.a) && running(l.b) && Math.sign(gears.omega(l.a)) === Math.sign(gears.omega(l.b))))
        out.add("gear.belt-same-way");
    if (has("GEAR_STALLED"))
        out.add("gear.power-limit");
    if (events.some(e => e.kind === "GEAR_JAMMED" && e.data?.reason === "LOOP"))
        out.add("secret.gear-gridlock");
    if (has("CONVEYOR_CARRY") && events.some(e => e.kind === "CONVEYOR_CARRY" && (() => { try {
        const st = runtime.physics.state(e.targetId);
        const start = build.getPart(e.targetId)?.position;
        return start ? Math.abs(st.x - start.x) > 1 : false;
    }
    catch {
        return false;
    } })()))
        out.add("combo.gear-conveyor");
    if (events.some(e => e.kind === "WINCH_LIFT"))
        out.add("combo.gear-winch");
    if (has("SPROCKET_FLUNG"))
        out.add("secret.sprocket-fling");
    return [...out];
}
export function evaluateGearMission(level, build, runtime) {
    if (!runtime)
        return { levelId: level.id, success: false, discoveries: [] };
    return { levelId: level.id, success: evaluateLevelOutcome(level, build, runtime).complete, discoveries: collectGearDiscoveries(build, runtime) };
}
export const GEAR_PARENT_MAPPINGS = Object.freeze([
    { concept: "Gears & Mechanisms", evidence: "saw meshed gears turn opposite ways", discoveryId: "gear.direction-flip" },
    { concept: "Gears & Mechanisms", evidence: "used a big gear to turn a small one faster", discoveryId: "gear.speed-up" },
    { concept: "Gears & Mechanisms", evidence: "traded speed for turning force", discoveryId: "gear.slow-strong" },
    { concept: "Gears & Mechanisms", evidence: "passed rotation along a gear train", discoveryId: "gear.chain" },
    { concept: "Gears & Mechanisms", evidence: "used a belt to carry rotation", discoveryId: "gear.belt-same-way" }
]);
export const GEAR_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "gear.direction-flip", title: "Gears in the kitchen", example: "In a hand whisk, the big gear turns one way and the little gears spin the other way." },
    { discoveryId: "gear.speed-up", title: "Bicycle gears", example: "A big front gear with a small back gear makes the wheel spin fast for each push of the pedals." },
    { discoveryId: "gear.slow-strong", title: "Cranes and winches", example: "Cranes turn their drums slowly through gears so they have the strength to lift heavy loads." },
    { discoveryId: "gear.chain", title: "Clocks", example: "Inside a clock, a chain of gears passes turning from the spring all the way to the hands." },
    { discoveryId: "gear.belt-same-way", title: "Belts in machines", example: "Car engines and treadmills use belts to carry turning from one wheel to another." }
]);
