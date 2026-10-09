/**
 * Clues and verified answers for the 12 Hidden Prototype Lab challenges (M33). Every answer is checked by
 * tests/m33-prototype-lab.test.mjs: it really completes its room, and an empty build never does.
 */
const g = (definitionId, x, y, rotation = 0, length) => ({ definitionId, x, y, rotation, ...(length !== undefined ? { length } : {}) });
const UP_TO_CEILING = Math.PI - 0.35;
export const PROTOTYPE_HINTS = {
    "prototype.reverse-conveyor": { concept: "Each pair of meshing gears swaps the turning direction. A backwards drum needs the motor's direction swapped an odd number of times.", usefulParts: ["gear.large", "gear.small", "gear.medium"],
        solution: [g("gear.large", 2.5, 6), g("gear.small", 3.6, 6), g("gear.medium", 4.4, 6), g("gear.small", 5.2, 6)], ghostCount: 2 },
    "prototype.super-spring": { concept: "You can't tame the spring — but a slope in the ball's way changes where it goes next.", usefulParts: ["motion.ramp"], solution: [g("motion.ramp", 2.5, 4.5, 0.8)], ghostCount: 1 },
    "prototype.magnet-maze": { concept: "Same ends push apart, opposite ends pull together. Each magnet must PUSH the puck on, not hold it.", usefulParts: [], solution: [], ghostCount: 0,
        turn: { m1: Math.PI, m2: 0, m3: 0 }, noPartsLine: "Tap each magnet to turn it round until it pushes the puck along." },
    "prototype.bubble-lift": { concept: "One blower lifts the feather; a second, tilted one can push it across.", usefulParts: ["proto.bubble-blower"],
        solution: [g("proto.bubble-blower", 3, 8.6, -Math.PI / 2), g("proto.bubble-blower", 2.5, 7, -0.6)], ghostCount: 1 },
    "prototype.worm-gear-box": { concept: "The worm turns the big gear very slowly — which makes it very strong.", usefulParts: ["proto.worm-gear", "gear.large"],
        solution: [g("proto.worm-gear", 3.5, 5), g("gear.large", 4.4, 5)], ghostCount: 1 },
    "prototype.tiny-factory": { concept: "Dominoes are small: a short line of them fits in the factory and passes the push to the bell.", usefulParts: ["chain.domino"],
        solution: [g("chain.domino", 4.8, 7.95), g("chain.domino", 5.6, 7.95), g("chain.domino", 6.4, 7.95)], ghostCount: 2 },
    "prototype.no-wheels-allowed": { concept: "A slope turns Bolt's fall into speed, and slippery pads let him slide a long way.", usefulParts: ["motion.ramp", "motion.friction-low"],
        solution: [g("motion.ramp", 4.4, 5.1, 0.45), g("motion.friction-low", 6.6, 8.3), g("motion.friction-low", 9, 8.3), g("motion.friction-low", 11.4, 8.3)], ghostCount: 2 },
    "prototype.upside-down-test": { concept: "Under the ceiling, a balloon slides UP a slope the way a ball slides down one.", usefulParts: ["motion.ramp"],
        solution: [g("motion.ramp", 2.9, 2.6, UP_TO_CEILING), g("motion.ramp", 5, 1.92, UP_TO_CEILING), g("motion.ramp", 7.1, 1.24, UP_TO_CEILING)], ghostCount: 2 },
    "prototype.five-systems": { concept: "Send the pumped water to the squirter, and give the magnet something made of steel to pull.", usefulParts: ["plumb.pipe", "scrap.steel-ball"],
        solution: [g("plumb.pipe", 8.425, 7.125, -1.297788, 1.298075), g("scrap.steel-ball", 13.6, 8.22)], ghostCount: 1 },
    "prototype.maximum-wobble": { concept: "Two long beams leaning together make the tallest A-frame — almost as long as a beam can be.", usefulParts: ["builder.beam-metal"],
        solution: [g("builder.beam-metal", 6.25, 5.25, -1.321834, 6.087693), g("builder.beam-metal", 7.75, 5.25, -1.819759, 6.087693)], ghostCount: 1 },
    "prototype.sprocket-shortcut": { concept: "Catch Sprocket's fall on a slope and he keeps his speed instead of bumping.", usefulParts: ["motion.ramp"], solution: [g("motion.ramp", 5.5, 7, 0.6)], ghostCount: 1 },
    "prototype.bolts-missing-memory": { concept: "The Super Spring throws the ball over the wall — put it just before the wall.", usefulParts: ["proto.super-spring"], solution: [g("proto.super-spring", 4.8, 8.24)], ghostCount: 1 }
};
