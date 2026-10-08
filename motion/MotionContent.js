import { assertLevelDefinition } from "../data/validation.js";
import { MOTION_MISSIONS } from "./MotionYard.js";
export async function loadMotionYardLevels(registry) {
    const known = new Set(registry.all().map(part => part.id));
    const levels = new Map();
    for (const mission of MOTION_MISSIONS) {
        const response = await fetch(`./content/motion/${mission.id}.json`, { cache: "no-store" });
        if (!response.ok)
            throw new Error(`Motion Yard content failed to load: ${mission.id}`);
        const value = await response.json();
        assertLevelDefinition(value, known);
        levels.set(mission.id, value);
    }
    return levels;
}
