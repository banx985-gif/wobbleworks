/**
 * Hidden Prototype Lab parts (M33). Each is a PRESET of an existing part family, built from behaviours the game
 * already simulates and tests — so no prototype brings new physics:
 *   - Super Spring: a spring pad with a much bigger push (family motion.spring).
 *   - Worm Gear: a little screw that meshes like any gear. Its tiny radius makes a big gear turn 8 times slower and
 *     8 times stronger (a real worm gear is often even slower; this is shortened so a lift finishes in seconds)
 *     (family gears.worm-gear, from the catalogue).
 *   - Backwards Drum: a conveyor drum fitted the "wrong" way round, so the belt runs opposite to the drum's turning
 *     (family motion.conveyor).
 *   - Bubble Blower: a gentle wind fan (family silly.bubble-blower, from the catalogue).
 *   - Memory Chip: lights up when the chain reaches it, like a bell rings (family robotics.indicator-light).
 * Drawn in code until the prototype art arrives (docs/ART_NEEDED.md, Batch H).
 */
const axle = { id: "axle", family: "ROTATIONAL", capabilities: ["ROTATE"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "ONE" };
export const PROTOTYPE_PARTS = [
    { id: "proto.super-spring", familyId: "motion.spring", displayName: "Super Spring", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 0.8, height: 0.32, density: 1, friction: 0.8, restitution: 0.15 }, { kind: "SPRING_PAD", force: 42, range: 1.05 }], ports: [] },
    { id: "proto.worm-gear", familyId: "gears.worm-gear", displayName: "Worm Gear", category: "GEAR", behaviours: [{ kind: "GEAR", role: "GEAR", radius: 0.1, teeth: 1 }], ports: [axle] },
    { id: "proto.reverse-drum", familyId: "motion.conveyor", displayName: "Backwards Drum", category: "GEAR", behaviours: [{ kind: "GEAR", role: "SHAFT", radius: 0.18, teeth: 0 }, { kind: "GEAR_OUTPUT", output: "CONVEYOR", load: 0.3, drum: -0.35 }], ports: [axle] },
    { id: "proto.bubble-blower", familyId: "silly.bubble-blower", displayName: "Bubble Blower", category: "AIR", behaviours: [{ kind: "WIND_FAN", speed: 5, range: 4.5, spread: 0.4 }], ports: [] },
    { id: "proto.memory-chip", familyId: "robotics.indicator-light", displayName: "Memory Chip", category: "SILLY", behaviours: [{ kind: "CHAIN", thing: "BELL" }], ports: [] }
];
export const PROTOTYPE_PART_IDS = new Set(PROTOTYPE_PARTS.map(p => p.id));
