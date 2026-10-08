/**
 * Free Build / sandbox parts (M23): spawnable everyday objects and the environment pieces behind the sandbox
 * modifiers (ice floor, wind zone, moving platform, rain and water areas). Code-drawn (docs/ART_NEEDED.md, Batch X).
 * The magnet switch (a reed switch) lets magnetism talk to circuits and robots.
 */
const part = (id, displayName, category, behaviours, familyId = id) => ({ id, familyId, displayName, category, behaviours, ports: [] });
const body = (bodyType, w, h, density, friction = 0.5, restitution = 0.1, shape = "BOX") => ({ kind: "RIGID_BODY", bodyType, shape, width: w, height: h, density, friction, restitution });
export const SANDBOX_PARTS = [
    part("sandbox.toy-car", "Toy Car", "MOTION", [body("DYNAMIC", 0.7, 0.35, 1.2, 0.08, 0.1)]),
    part("sandbox.balloon", "Balloon", "AIR", [body("DYNAMIC", 0.5, 0.6, 0.06, 0.3, 0.3, "CIRCLE"), { kind: "AIR_DRAG", area: 0.15 }, { kind: "BUOYANT", lift: 0.7 }]),
    part("sandbox.weight", "Heavy Weight", "MOTION", [body("DYNAMIC", 0.5, 0.4, 6, 0.6, 0.02)]),
    part("sandbox.bowling-ball", "Bowling Ball", "MOTION", [body("DYNAMIC", 0.55, 0.55, 5, 0.2, 0.15, "CIRCLE")], "motion.ball"),
    part("sandbox.feather", "Feather", "AIR", [body("DYNAMIC", 0.5, 0.08, 0.05, 0.4, 0.05), { kind: "AIR_DRAG", area: 0.6 }]),
    part("sandbox.egg", "Egg", "SILLY", [body("DYNAMIC", 0.3, 0.4, 0.9, 0.5, 0.05), { kind: "FRAGILE", breakSpeed: 3.5 }]),
    part("sandbox.toy-animal", "Toy Dog", "SILLY", [body("DYNAMIC", 0.6, 0.45, 0.6, 0.5, 0.2)]),
    part("sandbox.sprocket", "Sprocket", "SILLY", [body("DYNAMIC", 0.7, 0.5, 0.8, 0.5, 0.2)]),
    part("sandbox.ice-floor", "Ice Floor", "MOTION", [body("STATIC", 15.4, 0.12, 1, 0.02, 0.02)]),
    part("sandbox.wind-zone", "Wind", "AIR", [{ kind: "WIND_ZONE" }]),
    part("sandbox.moving-platform", "Moving Platform", "MOTION", [body("STATIC", 2.0, 0.25, 1, 0.8, 0.05), { kind: "KINEMATIC_PATH" }]),
    part("sandbox.rain", "Rain", "SILLY", [{ kind: "PRESENTATION", effect: "RAIN" }]),
    part("sandbox.water-area", "Pond", "WATER", [{ kind: "PRESENTATION", effect: "WATER_AREA" }]),
    part("sandbox.sign", "Sign", "LOGIC", []),
    /** Limited power: while this is in the room, every battery holds only `capacity` units of energy. */
    part("sandbox.power-limit", "Power Limit", "POWER", []),
    part("magnetic.reed-switch", "Magnet Switch", "MAGNET", [{ kind: "CIRCUIT", role: "BUTTON", terminals: [{ x: -0.4, y: 0.12 }, { x: 0.4, y: 0.12 }] }, { kind: "MAGNET_SENSOR", threshold: 1.0 }], "power.switch")
];
