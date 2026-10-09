import { activeProfile } from "../app/AppState.js";
import { clearedLabIds, ownsFullGame } from "../progression/Campus.js";
import { CREATURE_MUSIC, MAIN_LABS } from "../progression/CampaignData.js";
/**
 * Creature & Music Machines (M29): the 12 locked challenges (master guide §14) as a workshop mode. Each challenge
 * opens once the lab whose parts it needs is restored; the mode itself opens with the Motion Yard, in the full game.
 */
export const CREATURE_MUSIC_LABS = {
    "creature.hopping-frog": "motion-yard", "creature.flapping-bird": "power-lab", "creature.crab-grabber": "power-lab", "creature.crawling-bug": "power-lab",
    "creature.spider-walker": "power-lab", "creature.dinosaur-walker": "power-lab", "music.three-note-machine": "motion-yard", "music.drum-loop": "gear-garage",
    "music.mechanical-melody": "motion-yard", "music.water-chimes": "water-works", "music.robot-band": "robot-lab", "music.grand-workshop-jam": "power-lab"
};
export const CREATURE_MUSIC_MISSIONS = CREATURE_MUSIC.missions;
export function creatureMusicOpen(save) { return Boolean(activeProfile(save)) && ownsFullGame(save.entitlement) && clearedLabIds(save).includes(MAIN_LABS[0].id); }
export function creatureMusicChallengeOpen(save, id) { const lab = CREATURE_MUSIC_LABS[id]; return Boolean(lab) && creatureMusicOpen(save) && clearedLabIds(save).includes(lab); }
/** Sound for a note: its pitch on a C major scale, and how long each kind of instrument rings. */
export const RING_SECONDS = { DRUM: 0.08, TONE_BLOCK: 0.05, CHIME: 0.45, BELL: 0.35, HORN: 0.22, BUZZER: 0.15 };
