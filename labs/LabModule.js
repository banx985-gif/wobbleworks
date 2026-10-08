import { assertLevelDefinition } from "../data/validation.js";
import { CREATIVE_MODES, MAIN_LABS } from "../progression/CampaignData.js";
export function labMissions(labId) { return [...MAIN_LABS, ...CREATIVE_MODES].find(l => l.id === labId).missions; }
export async function loadLabLevels(registry, labId, folder) {
    const known = new Set(registry.all().map(part => part.id));
    const levels = new Map();
    for (const mission of labMissions(labId)) {
        const response = await fetch(`./content/${folder}/${mission.id}.json`, { cache: "no-store" });
        if (!response.ok)
            throw new Error(`${labId} content failed to load: ${mission.id}`);
        const value = await response.json();
        assertLevelDefinition(value, known);
        levels.set(mission.id, value);
    }
    return levels;
}
