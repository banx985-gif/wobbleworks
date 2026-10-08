import { labMissions } from "../labs/LabModule.js";
import { SPACE_TRUTH_CONTRACT } from "./SpaceSystem.js";
/**
 * Lab 9 — Space Centre (M19). Every discovery is measured by the SpaceSystem (or the Power Lab / Robot Lab systems it
 * reuses) in that TEST (truth.space.v1). Mass never changes with gravity; weight does.
 */
export { SPACE_TRUTH_CONTRACT };
export const SPACE_MISSIONS = labMissions("space-centre");
export function collectSpaceDiscoveries(build, runtime) {
    const s = runtime.space;
    if (!s.hasSpace())
        return [];
    const out = new Set();
    const events = runtime.causalEvents;
    const of = (k) => events.filter(e => e.kind === k);
    const has = (k) => of(k).length > 0;
    const def = (id) => (id ? build.getPart(id)?.definitionId : undefined);
    if (of("ROVER_DRIVING").some(e => (s.vessel(e.sourceId)?.driving ?? false)))
        out.add("space.rover");
    if (of("ROVER_CLIMB").some(e => Number(e.data?.grip ?? 0) >= 0.9))
        out.add("space.grip");
    if (of("HIT_GROUND").some(e => Number(e.data?.g ?? 9.81) < 5 && Number(e.data?.seconds ?? 0) >= 0.6))
        out.add("space.low-gravity");
    // The same kind of object, with exactly the same mass, landed in two different gravities: weight changed, mass didn't.
    const fallen = build.allParts().filter(p => runtime.isDynamicBody(p.id) && s.fallTime(p.id) !== undefined && !s.isAttached(p.id));
    if (fallen.some(a => fallen.some(b => b.id !== a.id && b.definitionId === a.definitionId && Math.abs(runtime.physics.mass(a.id) - runtime.physics.mass(b.id)) < 1e-9 && Math.abs(s.gravityAt(a.position.x) - s.gravityAt(b.position.x)) > 3)))
        out.add("space.mass-same");
    if (has("ROCKET_LIFTOFF"))
        out.add("space.thrust");
    if (of("ROCKET_STRAIGHT").some(e => e.data?.fins === true && of("ROCKET_GUST").some(g => g.sourceId === e.sourceId)))
        out.add("space.fins");
    if (of("TOUCHDOWN").some(e => Number(e.data?.distance ?? 0) > 4 && def(e.sourceId) === "space.rocket"))
        out.add("space.trajectory");
    if (has("PARACHUTE_NO_AIR"))
        out.add("space.no-air");
    if (of("TOUCHDOWN").some(e => e.data?.legs === true && runtime.flight.peakImpact(e.sourceId) <= 2) && has("LEGS_ABSORB"))
        out.add("space.landing");
    const panels = build.allParts().filter(p => p.definitionId === "space.solar-panel" && !s.isAttached(p.id));
    if (panels.some(p => Math.abs(runtime.circuits.current(p.id)) > 0.3) || of("ROVER_DRIVING").some(e => e.data?.power === "SOLAR"))
        out.add("space.solar");
    if (has("ORBIT_ARC"))
        out.add("space.planet-pull");
    if (of("BOX_DROPPED").some(e => def(e.sourceId) === "space.robot-arm") && build.allParts().some(p => p.definitionId === "space.repair-slot" && build.allParts().some(b => b.definitionId === "space.repair-module" && runtime.robots.boxAt(b.id, p.id))))
        out.add("space.robot-arm");
    if (has("STAGE_RELEASED"))
        out.add("combo.space-stages");
    if (build.allParts().some(p => typeof p.parameters.closedWhenBoxAt === "string" && runtime.buttonPressed(p.id) && Math.abs(runtime.circuits.current(p.id)) > 0.3))
        out.add("combo.space-robot-power");
    if (of("ORBIT_ARC").some(e => def(e.targetId) === "silly.duck" && s.orbitDegrees(e.targetId) >= 270))
        out.add("secret.space-duck");
    if (s.vesselViews().some(v => v.type === "ROCKET" && v.maxAltitude >= 12))
        out.add("secret.space-sky-high");
    return [...out];
}
export const SPACE_PARENT_MAPPINGS = Object.freeze([
    { concept: "Space", evidence: "saw things fall more slowly where gravity is weaker", discoveryId: "space.low-gravity" },
    { concept: "Space", evidence: "compared the same object in Earth and Moon gravity: its weight changed, its mass did not", discoveryId: "space.mass-same" },
    { concept: "Space", evidence: "launched a rocket whose push beat its weight", discoveryId: "space.thrust" },
    { concept: "Space", evidence: "used fins to keep a rocket pointing straight in a gust", discoveryId: "space.fins" },
    { concept: "Space", evidence: "powered a circuit with a solar panel facing the sun", discoveryId: "space.solar" }
]);
export const SPACE_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "space.low-gravity", title: "Jumping on the Moon", example: "Astronauts on the Moon bounced along in big slow hops: the Moon's gravity is about one sixth of Earth's." },
    { discoveryId: "space.mass-same", title: "Mass vs weight", example: "An astronaut weighs less on the Moon, but their mass — how much stuff they're made of — is exactly the same." },
    { discoveryId: "space.thrust", title: "Rocket launches", example: "A rocket only lifts off when its engines push up harder than its weight pulls down." },
    { discoveryId: "space.fins", title: "Fins and feathers", example: "Model rockets have fins and arrows have feathers for the same reason: they keep the front pointing forward." },
    { discoveryId: "space.no-air", title: "No air on the Moon", example: "Parachutes work on Earth and Mars, which have air. On the Moon, landers use legs and engines instead." },
    { discoveryId: "space.solar", title: "Solar-powered spacecraft", example: "Satellites and the space station turn big solar panels to face the Sun to make their electricity." }
]);
export const SPACE_CONCEPT_EVIDENCE = {
    "space.rover": "A rover with wheels front and back, a motor and power drove itself along.",
    "space.grip": "Grippy wheels climbed a slope that smooth wheels spun on.",
    "space.low-gravity": "Something fell in a low-gravity zone and took noticeably longer to land.",
    "space.mass-same": "The same object with the same mass landed in two different gravities: its weight changed, its mass didn't.",
    "space.thrust": "A booster pushed harder than the rocket's weight, so it lifted off.",
    "space.fins": "A rocket with fins stayed pointing straight through a gust.",
    "space.trajectory": "A leaning rocket flew over and came down far from where it started.",
    "space.no-air": "A parachute did nothing because there was no air to push against.",
    "space.landing": "Landing legs squashed and soaked up the speed, so it touched down gently.",
    "space.solar": "A solar panel facing the sun powered a circuit.",
    "space.planet-pull": "A planet's pull bent something's path into a curve around it.",
    "space.robot-arm": "A programmed robot arm placed a module in its slot.",
    "combo.space-stages": "One stage of the mission started the next one.",
    "combo.space-robot-power": "A robot arm fitted a module that completed a circuit.",
    "secret.space-duck": "The duck went three quarters of the way round the planet. Quack!",
    "secret.space-sky-high": "A rocket climbed more than 12 metres. That's higher than the whole room!"
};
export const SPACE_CENTRE = {
    labId: "space-centre", folder: "space", concept: "Space", scannerName: "Gravity Meter", truthContractId: SPACE_TRUTH_CONTRACT.id,
    parentMappings: SPACE_PARENT_MAPPINGS, realWorldCards: SPACE_REAL_WORLD_CARDS, conceptEvidence: SPACE_CONCEPT_EVIDENCE,
    collectDiscoveries: collectSpaceDiscoveries
};
