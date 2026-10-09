/**
 * Clues for the Challenge Lab (M26). Each challenge built on a lab level uses that level's verified answer (it still
 * completes the challenge, and tests check it scores). Longest Jump has its own room and its own verified answer.
 * Built from the lab hint table passed in, so there is no import loop with the hint module.
 */
const BASE = {
    "challenge.fastest-vehicle": "motion.make-it-farther", "challenge.tallest-tower": "builder.tallest-tower", "challenge.longest-glide": "flight.long-glide",
    "challenge.heavy-hauler": "builder.heavy-delivery", "challenge.low-power-lift": "power.power-the-lift", "challenge.fewest-parts": "motion.ramp-rescue",
    "challenge.budget-builder": "builder.bridge-the-gap", "challenge.egg-drop": "builder.keep-the-egg-safe", "challenge.chain-master": "chain.first-domino",
    "challenge.robot-efficiency": "robot.turn-the-corner", "challenge.stable-platform": "builder.stop-the-wobble"
};
const JUMP = {
    concept: "Build a slope the cart can roll down onto the cliff, so it is going fast when it reaches the edge.",
    usefulParts: ["motion.ramp"],
    solution: [{ definitionId: "motion.ramp", x: 2.1, y: 2.9, rotation: 0.5 }, { definitionId: "motion.ramp", x: 3.4, y: 3.9, rotation: 0.3 }],
    ghostCount: 1
};
export function challengeHints(base) {
    const out = { "challenge.longest-jump": JUMP };
    for (const [id, from] of Object.entries(BASE)) {
        const h = base[from];
        if (h)
            out[id] = h;
    }
    return out;
}
