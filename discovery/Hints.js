import { POWER_HINTS } from "../power/PowerHints.js";
import { MAGNET_HINTS } from "../magnets/MagnetHints.js";
import { WATER_HINTS } from "../water/WaterHints.js";
import { FLIGHT_HINTS } from "../flight/FlightHints.js";
import { ROBOT_HINTS } from "../robots/RobotHints.js";
import { SPACE_HINTS } from "../space/SpaceHints.js";
import { CHAIN_HINTS } from "../chain/ChainHints.js";
import { describeBlock } from "../robots/BlockEditor.js";
const g = (definitionId, x, y, rotation = 0) => ({ definitionId, x, y, rotation });
export const MOTION_HINTS = {
    "motion.roll-with-it": { concept: "Something could ROLL down to the bucket…", usefulParts: ["motion.ramp"], solution: [g("motion.ramp", 3.5, 4, 0.25)], ghostCount: 1 },
    "motion.ramp-rescue": { concept: "Bolt needs a gentle way down — lots of small slopes, not one big drop.", usefulParts: ["motion.ramp"], solution: [g("motion.ramp", 5.4, 5.1, 0.35), g("motion.ramp", 7.2, 6.2, 0.3), g("motion.ramp", 9.0, 7.0, 0.2)], ghostCount: 2 },
    "motion.too-fast": { concept: "What could rub against the cart and slow it down?", usefulParts: ["motion.friction-high"], solution: [g("motion.friction-high", 6.5, 8.32)], ghostCount: 1 },
    "motion.spring-delivery": { concept: "The parcel needs a big upward PUSH.", usefulParts: ["motion.spring"], solution: [g("motion.spring", 3.0, 8.0)], ghostCount: 1 },
    "motion.slippery-business": { concept: "Watch what grippy and slippy ground do to the cart.", usefulParts: [], solution: [], ghostCount: 0, noPartsLine: "This machine is ready — press TEST and watch the cart on each surface." },
    "motion.bounce-around": { concept: "A ball that bounces can change direction…", usefulParts: ["motion.ramp"], solution: [g("motion.ramp", 3.5, 5.5, 0.2)], ghostCount: 1 },
    "motion.heavy-or-light": { concept: "Both get the same push. Which one moves more?", usefulParts: [], solution: [], ghostCount: 0, noPartsLine: "Press TEST and watch which one zooms ahead." },
    "motion.make-it-farther": { concept: "The cart slows down because the ground rubs it. Could the ground be slippier?", usefulParts: ["motion.friction-low"], solution: [g("motion.friction-low", 2.8, 8.32), g("motion.friction-low", 5.0, 8.32), g("motion.friction-low", 7.2, 8.32), g("motion.friction-low", 9.4, 8.32)], ghostCount: 2 },
    "motion.which-ramp-wins": { concept: "Two slopes, two balls. Guess which goes farther, then TEST!", usefulParts: [], solution: [], ghostCount: 0, noPartsLine: "Make a guess, then press TEST and compare." },
    "motion.duck-cannon": { concept: "Ducks can't fly far on their own. What could fling it?", usefulParts: ["motion.spring"], solution: [g("motion.spring", 2.5, 8.15)], ghostCount: 1 },
    "motion.giant-marble-delivery": { concept: "Mix machines: one part to get the marble rolling, one to send it flying.", usefulParts: ["motion.ramp", "motion.spring"], solution: [g("motion.ramp", 2.5, 4, 0.15), g("motion.spring", 4.0, 8.0)], ghostCount: 1 },
    "motion.runaway-test-cart": { concept: "Stop it gently — no walls! What slows things without crashing?", usefulParts: ["motion.friction-high"], solution: [g("motion.friction-high", 6.5, 8.32)], ghostCount: 1 }
};
export const GEAR_HINTS = {
    "gear.turn-the-door": { concept: "The turning has to travel from the crank to the door…", usefulParts: ["gear.large"], solution: [g("gear.large", 4.8, 5)], ghostCount: 1 },
    "gear.wrong-way-round": { concept: "Every pair of touching gears swaps the direction.", usefulParts: ["gear.small", "gear.medium"], solution: [g("gear.small", 4.3, 5), g("gear.medium", 5.1, 5)], ghostCount: 1, remove: ["middle"] },
    "gear.speed-it-up": { concept: "To spin fast, something big should turn something little.", usefulParts: ["gear.large", "gear.small"], solution: [g("gear.large", 3.5, 5), g("gear.small", 4.6, 5)], ghostCount: 1 },
    "gear.slow-and-strong": { concept: "Slow and steady wins: going slower gives more strength.", usefulParts: ["gear.small", "gear.large"], solution: [g("gear.small", 3.5, 5), g("gear.large", 4.6, 5)], ghostCount: 1 },
    "gear.lift-bolt": { concept: "It's a long way up. What can reach that far?", usefulParts: ["gear.belt-pulley"], solution: [g("gear.belt-pulley", 4, 6.8), g("gear.belt-pulley", 10, 2.6)], ghostCount: 1 },
    "gear.three-fans": { concept: "The turning can hop from gear to gear to gear.", usefulParts: ["gear.medium", "gear.large"], solution: [g("gear.medium", 3, 5), g("gear.large", 4.3, 5), g("gear.medium", 5.6, 5), g("gear.large", 6.9, 5)], ghostCount: 2 },
    "gear.clockwork-trouble": { concept: "Follow the chain from the motor. Where does it stop?", usefulParts: ["gear.medium"], solution: [g("gear.medium", 5.4, 4.5)], ghostCount: 1, remove: ["loose"] },
    "gear.conveyor-rescue": { concept: "The conveyor has to move toward the bay. Which way is that?", usefulParts: ["gear.belt-pulley"], solution: [g("gear.belt-pulley", 2.5, 5.5), g("gear.belt-pulley", 5.2, 7.2)], ghostCount: 1 },
    "gear.big-gear-vs-small-gear": { concept: "Make A and B different on purpose — that's a fair test!", usefulParts: ["gear.large", "gear.small"], solution: [g("gear.large", 3, 3.5), g("gear.small", 4.1, 3.5), g("gear.small", 3, 6.5), g("gear.large", 4.1, 6.5)], ghostCount: 2 },
    "gear.spin-sprocket": { concept: "The motor is speedy. Sprocket needs it calmer.", usefulParts: ["gear.small", "gear.large"], solution: [g("gear.small", 3, 5), g("gear.large", 4.1, 5)], ghostCount: 1 },
    "gear.the-clockwork-carnival": { concept: "One motor, three rides. Build out from the motor one ride at a time.", usefulParts: ["gear.small", "gear.medium", "gear.large"], solution: [g("gear.small", 2.5, 5), g("gear.large", 3.6, 5), g("gear.medium", 4.25, 3.8742), g("gear.medium", 5.25, 3.874), g("gear.large", 5.9, 5), g("gear.small", 7, 5)], ghostCount: 3 },
    "gear.jammed-factory-drive": { concept: "TEST it first. Is it stuck, too weak, or going backwards?", usefulParts: ["gear.large"], solution: [g("gear.large", 5.6, 5), g("gear.large", 4.05, 4.603)], ghostCount: 1, remove: ["a", "b", "c", "factory-gear"] }
};
/** Builder Bay (M13). Generated from the verified solutions; ghosts are part of each one. */
export const BUILDER_HINTS = {
    "builder.bridge-the-gap": { concept: "Bolt needs a path all the way across. No gaps!", usefulParts: ["builder.beam-wood"], solution: [{ definitionId: "builder.beam-wood", x: 7, y: 5.2, rotation: 0, length: 4 }], ghostCount: 1 },
    "builder.stop-the-wobble": { concept: "A square can lean over. What shape can't?", usefulParts: ["builder.brace"], solution: [{ definitionId: "builder.brace", x: 6, y: 7.2, rotation: -0.785398, length: 2.828427 }], ghostCount: 1 },
    "builder.triangle-power": { concept: "The shelf needs help from underneath, back to the wall.", usefulParts: ["builder.brace"], solution: [{ definitionId: "builder.brace", x: 5, y: 5.5, rotation: -0.624023, length: 3.080584 }], ghostCount: 1 },
    "builder.heavy-delivery": { concept: "This load is heavy. Is wood strong enough?", usefulParts: ["builder.beam-metal"], solution: [{ definitionId: "builder.beam-metal", x: 7, y: 7, rotation: 0, length: 4 }], ghostCount: 1 },
    "builder.build-a-crane": { concept: "Hold the winch up high, then turn it slowly and strongly.", usefulParts: ["builder.beam-metal", "gear.belt-pulley", "gear.belt-pulley-big"], solution: [{ definitionId: "builder.beam-metal", x: 6.5, y: 6.1, rotation: -1.337053, length: 4.317407 }, { definitionId: "builder.beam-metal", x: 7.5, y: 6.1, rotation: -1.80454, length: 4.317407 }, { definitionId: "gear.belt-pulley", x: 3, y: 7.4, rotation: 0 }, { definitionId: "gear.belt-pulley-big", x: 7, y: 4, rotation: 0 }], ghostCount: 2 },
    "builder.roof-rescue": { concept: "Hold the roof from the walls — keep the floor clear for Bolt.", usefulParts: ["builder.brace"], solution: [{ definitionId: "builder.brace", x: 4.5, y: 5.25, rotation: -0.463648, length: 3.354102 }, { definitionId: "builder.brace", x: 7.5, y: 5.25, rotation: -2.677945, length: 3.354102 }], ghostCount: 1 },
    "builder.tallest-tower": { concept: "Wide at the bottom, joined at the top.", usefulParts: ["builder.beam-metal"], solution: [{ definitionId: "builder.beam-metal", x: 6.25, y: 5.5, rotation: -1.299849, length: 5.604463 }, { definitionId: "builder.beam-metal", x: 7.75, y: 5.5, rotation: -1.841743, length: 5.604463 }], ghostCount: 1 },
    "builder.keep-the-egg-safe": { concept: "Catch it high up, or catch it softly.", usefulParts: ["builder.rope"], solution: [{ definitionId: "builder.rope", x: 8, y: 5, rotation: 0, length: 3 }], ghostCount: 1 },
    "builder.which-bridge-holds-more": { concept: "Build A and B differently on purpose — that's the test!", usefulParts: ["builder.beam-wood"], solution: [{ definitionId: "builder.beam-wood", x: 4, y: 6, rotation: 0, length: 2 }, { definitionId: "builder.beam-wood", x: 11.5, y: 6, rotation: 0, length: 1 }, { definitionId: "builder.beam-wood", x: 12.5, y: 6, rotation: 0, length: 1 }, { definitionId: "builder.beam-wood", x: 11.5, y: 5.5, rotation: -0.785398, length: 1.414214 }, { definitionId: "builder.beam-wood", x: 12.5, y: 5.5, rotation: 0.785398, length: 1.414214 }, { definitionId: "builder.beam-wood", x: 12, y: 5.5, rotation: 1.570796, length: 1 }], ghostCount: 3 },
    "builder.elephant-robot-parade": { concept: "Strong parts, short spans, and support from below.", usefulParts: ["builder.beam-metal"], solution: [{ definitionId: "builder.beam-metal", x: 6, y: 5.2, rotation: 0, length: 2 }, { definitionId: "builder.beam-metal", x: 8, y: 5.2, rotation: 0, length: 2 }, { definitionId: "builder.beam-metal", x: 6, y: 5.85, rotation: -0.576375, length: 2.385372 }, { definitionId: "builder.beam-metal", x: 8, y: 5.85, rotation: -2.565217, length: 2.385372 }], ghostCount: 2 },
    "builder.the-robot-parade-bridge": { concept: "Use the rock in the middle. Make triangles from the cliff walls.", usefulParts: ["builder.beam-metal", "builder.brace"], solution: [{ definitionId: "builder.beam-metal", x: 5, y: 5.2, rotation: 0, length: 2 }, { definitionId: "builder.beam-metal", x: 7, y: 5.2, rotation: 0, length: 2 }, { definitionId: "builder.beam-metal", x: 9, y: 5.2, rotation: 0, length: 2 }, { definitionId: "builder.brace", x: 6.5, y: 5.8, rotation: -2.265535, length: 1.56205 }, { definitionId: "builder.brace", x: 7.5, y: 5.8, rotation: -0.876058, length: 1.56205 }, { definitionId: "builder.beam-metal", x: 5, y: 6, rotation: -0.674741, length: 2.56125 }, { definitionId: "builder.beam-metal", x: 9, y: 6, rotation: -2.466852, length: 2.56125 }], ghostCount: 3 },
    "builder.collapsing-workshop-roof": { concept: "TEST it first: what gives way? Then support the middle from above and below.", usefulParts: ["builder.beam-metal", "builder.brace", "builder.rope"], solution: [{ definitionId: "builder.beam-metal", x: 6.5, y: 4.5, rotation: 0, length: 3 }, { definitionId: "builder.beam-wood", x: 6.5, y: 5.25, rotation: 0.463648, length: 3.354102 }, { definitionId: "builder.beam-wood", x: 9.5, y: 5.25, rotation: 2.677945, length: 3.354102 }, { definitionId: "builder.brace", x: 8, y: 5.25, rotation: -1.570796, length: 1.5 }, { definitionId: "builder.rope", x: 3.5, y: 3, rotation: 0.785398, length: 4.242641 }, { definitionId: "builder.rope", x: 12.5, y: 3, rotation: 2.356194, length: 4.242641 }], ghostCount: 3, remove: ["roof-2"] }
};
/** Every lab's hints, by level id. */
export const LEVEL_HINTS = { ...MOTION_HINTS, ...GEAR_HINTS, ...BUILDER_HINTS, ...POWER_HINTS, ...MAGNET_HINTS, ...WATER_HINTS, ...FLIGHT_HINTS, ...ROBOT_HINTS, ...SPACE_HINTS, ...CHAIN_HINTS };
export { POWER_HINTS, MAGNET_HINTS, WATER_HINTS, FLIGHT_HINTS, ROBOT_HINTS, SPACE_HINTS, CHAIN_HINTS };
/** What each tier shows. Tiers are cumulative: Hint 3 still shows the idea and the glowing parts. */
export function hintView(levelId, level, tier) {
    const h = LEVEL_HINTS[levelId];
    const concept = h?.concept ?? level?.hints?.[0] ?? "Change ONE thing, then TEST again.";
    const parts = h?.usefulParts.length ? h.usefulParts : [];
    if (tier === 0)
        return { tier, line: "", glowParts: [], ghosts: [] };
    if (tier === 1)
        return { tier, line: concept, glowParts: [], ghosts: [] };
    const partLine = parts.length ? "These parts could help — look for the glow!" : (h?.noPartsLine ?? concept);
    if (tier === 2)
        return { tier, line: partLine, glowParts: parts, ghosts: [] };
    // Robot Lab: show the first blocks of one working program (never the whole program).
    const firstProgram = h?.programs ? Object.values(h.programs)[0] : undefined;
    if (firstProgram?.length) {
        const shown = firstProgram.slice(0, Math.min(2, Math.max(1, firstProgram.length - 1))).map(describeBlock).join(", then ");
        return { tier, line: `One working program starts like this: ${shown}…`, glowParts: parts, ghosts: [] };
    }
    const ghosts = h ? h.solution.slice(0, h.ghostCount) : [];
    return { tier, line: ghosts.length ? "Here's a piece of one idea. Drag a real part onto the ghost, then TEST!" : (h?.noPartsLine ?? concept), glowParts: parts, ghosts };
}
/** Per-attempt hint state. Hints only ever go up one step when the child asks. */
export class HintTracker {
    levelId;
    tierValue = 0;
    asked = 0;
    constructor(levelId) {
        this.levelId = levelId;
    }
    tier() { return this.tierValue; }
    timesAsked() { return this.asked; }
    next() { this.asked += 1; if (this.tierValue < 3)
        this.tierValue = (this.tierValue + 1); return this.tierValue; }
    reset() { this.tierValue = 0; }
}
/**
 * Snap a dropped part onto a matching visible ghost (placement help only, like the opening's wheel snap).
 * Returns the ghost to snap to, or undefined. Never changes physics or success rules: the part ends up
 * at a place the child could have dragged it to by hand.
 */
export function ghostSnap(definitionId, at, ghosts, radius) {
    let best, bestD = radius;
    for (const ghost of ghosts) {
        if (ghost.definitionId !== definitionId)
            continue;
        const d = Math.hypot(ghost.x - at.x, ghost.y - at.y);
        if (d <= bestD) {
            best = ghost;
            bestD = d;
        }
    }
    return best;
}
