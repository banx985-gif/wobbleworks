import { MOTION_MISSIONS } from "./MotionYard.js";
import { loadLevelSet } from "../data/LevelFiles.js";
export async function loadMotionYardLevels(registry) {
    return loadLevelSet(registry, "motion", MOTION_MISSIONS.map(m => m.id), "Motion Yard");
}
