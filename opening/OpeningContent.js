import { assertLevelDefinition } from "../data/validation.js";
import { OPENING_CHALLENGES } from "./OpeningDirector.js";
export async function loadOpeningLevels(registry) {
    const known = new Set(registry.all().map(p => p.id));
    const map = new Map();
    for (const challenge of OPENING_CHALLENGES) {
        const response = await fetch(`./content/opening/${challenge.levelId}.json`, { cache: "no-store" });
        if (!response.ok)
            throw new Error(`Opening content failed to load: ${challenge.levelId}`);
        const value = await response.json();
        assertLevelDefinition(value, known);
        map.set(challenge.levelId, value);
    }
    return map;
}
