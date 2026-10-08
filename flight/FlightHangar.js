import { labMissions } from "../labs/LabModule.js";
import { FLIGHT_TRUTH_CONTRACT } from "./FlightSystem.js";
/**
 * Lab 7 — Flight Hangar (M17). Every discovery is measured by the FlightSystem in that TEST (truth.flight.v1).
 */
export { FLIGHT_TRUTH_CONTRACT };
export const FLIGHT_MISSIONS = labMissions("flight-hangar");
export function collectFlightDiscoveries(build, runtime) {
    const f = runtime.flight;
    const out = new Set();
    const events = runtime.causalEvents;
    if (!f.hasFlight())
        return [];
    const of = (kind) => events.filter(e => e.kind === kind);
    const has = (kind) => of(kind).length > 0;
    const crafts = f.craftStates();
    if (has("WING_LIFT"))
        out.add("flight.lift");
    for (const c of crafts) {
        const parts = c.attached.map(id => build.getPart(id)?.definitionId);
        const start = build.getPart(c.id).position;
        const pos = (() => { try {
            return runtime.physics.state(c.id);
        }
        catch {
            return undefined;
        } })();
        if (parts.includes("flight.parachute") && f.hasLanded(c.id) && f.peakImpact(c.id) <= 3 && pos && pos.y - start.y >= 3)
            out.add("flight.parachute");
        if (parts.includes("flight.tail") && c.flying && c.maxX - start.x >= 4 && c.pitchSpread < 0.6)
            out.add("flight.stability");
        if (c.thrust > 0 || of("PROPELLER_THRUST").some(e => e.sourceId === c.id)) {
            if (of("WING_LIFT").some(e => e.sourceId === c.id))
                out.add("flight.thrust-lift");
        }
        if (parts.includes("flight.balloon") && pos && start.y - pos.y >= 1)
            out.add("flight.buoyancy");
    }
    for (const e of of("WIND_PUSH")) {
        const p = e.targetId ? build.getPart(e.targetId) : undefined;
        if (!p)
            continue;
        try {
            const s = runtime.physics.state(p.id);
            if (Math.hypot(s.x - p.position.x, s.y - p.position.y) >= 1) {
                out.add("flight.wind");
                break;
            }
        }
        catch { /* not simulated */ }
    }
    if (has("WING_STALL"))
        out.add("flight.stall");
    const sprung = new Set(of("SPRING_LAUNCH").map(e => e.targetId));
    if (of("CRAFT_FLYING").some(e => sprung.has(e.sourceId)))
        out.add("combo.flight-spring");
    const flat = new Set(of("BATTERY_EMPTY").map(e => e.sourceId));
    if (of("CRAFT_LANDED").some(e => flat.has(e.sourceId)))
        out.add("combo.flight-battery");
    if (has("CRAFT_TUMBLE"))
        out.add("secret.flight-loop");
    if (of("GATE_PASSED").some(e => build.getPart(e.sourceId)?.definitionId === "flight.basket"))
        out.add("secret.flight-sprocket");
    return [...out];
}
export const FLIGHT_PARENT_MAPPINGS = Object.freeze([
    { concept: "Flight", evidence: "made wings produce lift", discoveryId: "flight.lift" },
    { concept: "Flight", evidence: "used a tail to keep a glider steady", discoveryId: "flight.stability" },
    { concept: "Flight", evidence: "slowed a fall with a parachute (drag)", discoveryId: "flight.parachute" },
    { concept: "Flight", evidence: "used a propeller's thrust to keep flying", discoveryId: "flight.thrust-lift" },
    { concept: "Flight", evidence: "lifted something light with balloons", discoveryId: "flight.buoyancy" }
]);
export const FLIGHT_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "flight.lift", title: "Aeroplane wings", example: "A plane's wings are tilted slightly into the air rushing past, which pushes them up." },
    { discoveryId: "flight.stability", title: "Tail fins", example: "Planes and paper darts have tails at the back to stop the nose bobbing up and down." },
    { discoveryId: "flight.parachute", title: "Parachutes", example: "A parachute catches lots of air, so it falls slowly enough to land softly." },
    { discoveryId: "flight.thrust-lift", title: "Propellers and jets", example: "Engines push a plane forwards; the wings turn that speed into lift. Two different jobs!" },
    { discoveryId: "flight.buoyancy", title: "Hot-air balloons", example: "A balloon floats up when its upward push is bigger than everything it carries weighs." },
    { discoveryId: "flight.wind", title: "Windmills and kites", example: "Moving air pushes things — it turns windmills and keeps kites up." }
]);
export const FLIGHT_CONCEPT_EVIDENCE = {
    "flight.lift": "Wings moving through the air pushed up with more than half the machine's weight.",
    "flight.stability": "A glider with a tail flew 4 m or more with its nose staying steady.",
    "flight.parachute": "Something with a parachute fell 3 m or more and still landed gently.",
    "flight.thrust-lift": "A propeller pushed a machine forward while its wings made lift.",
    "flight.buoyancy": "Balloons lifted a basket a metre or more.",
    "flight.wind": "A fan's breeze moved something a metre or more.",
    "flight.stall": "A wing tilted too steeply into the air and lost most of its lift (a stall).",
    "combo.flight-spring": "A Motion Yard spring launched a glider into flight.",
    "combo.flight-battery": "A plane's battery ran out and its wings glided it down to land.",
    "secret.flight-loop": "A machine flipped right over in the air.",
    "secret.flight-sprocket": "Sprocket's balloon basket flew through a hoop."
};
export const FLIGHT_HANGAR = {
    labId: "flight-hangar", folder: "flight", concept: "Flight", scannerName: "Air Scanner", truthContractId: FLIGHT_TRUTH_CONTRACT.id,
    parentMappings: FLIGHT_PARENT_MAPPINGS, realWorldCards: FLIGHT_REAL_WORLD_CARDS, conceptEvidence: FLIGHT_CONCEPT_EVIDENCE,
    collectDiscoveries: collectFlightDiscoveries
};
