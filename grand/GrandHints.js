import { CAMPUS_SWITCH_ROOM, GRAND_CHALLENGES, grandStageLevelId } from "./GrandHall.js";
/**
 * Clues for the Grand Invention Hall (M32). Each stage is a copy of a lab room, so it uses that room's verified
 * answer (tests check it still solves the stage, inside any time goal). The final campus switch is the Generator
 * Test room, so it uses that job's answer. Built from the hint table passed in, so there is no import loop.
 */
export function grandHints(base) {
    const out = {};
    for (const c of GRAND_CHALLENGES)
        c.stages.forEach((s, n) => { const h = base[s.baseLevelId === CAMPUS_SWITCH_ROOM ? "contract.generator-test" : s.baseLevelId]; if (h)
            out[grandStageLevelId(c.id, n)] = h; });
    return out;
}
