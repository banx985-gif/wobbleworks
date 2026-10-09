import { assertLevelDefinition } from "./validation.js";
/**
 * Loads and checks a set of level files from content/<folder> (M44: all at the same time, not one after another,
 * so a slow tablet waits for the slowest file rather than the sum of them). The map keeps the given order.
 */
export async function loadLevelSet(registry, folder, ids, label) {
    const known = new Set(registry.all().map(part => part.id));
    const values = await Promise.all(ids.map(async (id) => {
        const response = await fetch(`./content/${folder}/${id}.json`, { cache: "no-store" });
        if (!response.ok)
            throw new Error(`${label} content failed to load: ${id}`);
        const value = await response.json();
        assertLevelDefinition(value, known);
        return value;
    }));
    return new Map(ids.map((id, i) => [id, values[i]]));
}
