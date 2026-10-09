import { OPENING_CHALLENGES } from "./OpeningDirector.js";
import { loadLevelSet } from "../data/LevelFiles.js";
export async function loadOpeningLevels(registry) {
    return loadLevelSet(registry, "opening", OPENING_CHALLENGES.map(c => c.levelId), "Opening");
}
