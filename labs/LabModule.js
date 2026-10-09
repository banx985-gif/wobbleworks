import { CREATIVE_MODES, MAIN_LABS, PROTOTYPE_LAB } from "../progression/CampaignData.js";
import { loadLevelSet } from "../data/LevelFiles.js";
export function labMissions(labId) {
    const lab = [...MAIN_LABS, ...CREATIVE_MODES, PROTOTYPE_LAB].find(l => l.id === labId);
    if (!lab)
        throw new Error(`No missions known for ${labId}`);
    return lab.missions;
}
/** Load and check a fixed list of level files from content/<folder> (the Grand Hall's stages, M32). */
export async function loadLevelFiles(registry, ids, folder, title) {
    return loadLevelSet(registry, folder, ids, title);
}
export async function loadLabLevels(registry, labId, folder) {
    return loadLevelSet(registry, folder, labMissions(labId).map(m => m.id), labId);
}
