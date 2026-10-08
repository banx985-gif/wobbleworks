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
/** What each tier shows. Tiers are cumulative: Hint 3 still shows the idea and the glowing parts. */
export function hintView(levelId, level, tier) {
    const h = MOTION_HINTS[levelId];
    const concept = h?.concept ?? level?.hints?.[0] ?? "Change ONE thing, then TEST again.";
    const parts = h?.usefulParts.length ? h.usefulParts : [];
    if (tier === 0)
        return { tier, line: "", glowParts: [], ghosts: [] };
    if (tier === 1)
        return { tier, line: concept, glowParts: [], ghosts: [] };
    const partLine = parts.length ? "These parts could help — look for the glow!" : (h?.noPartsLine ?? concept);
    if (tier === 2)
        return { tier, line: partLine, glowParts: parts, ghosts: [] };
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
