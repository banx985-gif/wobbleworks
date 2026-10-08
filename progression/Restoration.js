import { activeProfile, currentOpening } from "../app/AppState.js";
import { MAIN_LABS } from "./CampaignData.js";
import { clearedLabIds } from "./Campus.js";
export const RESTORATION_ORDER = [
    "DORMANT", "WORKSHOP_AWAKE", "MOTION_RESTORED", "GEARS_TURNING", "STRUCTURES_SOUND", "POWER_ON",
    "MAGNETS_HUMMING", "WATER_FLOWING", "AIR_MOVING", "ROBOTS_ACTIVE", "SPACE_READY", "CAMPUS_RESTORED"
];
/** Which lab clearing moves the hub into each lab stage (index 2… lines up with MAIN_LABS). */
export const STAGE_FOR_LAB = Object.freeze(Object.fromEntries(MAIN_LABS.map((lab, i) => [lab.id, RESTORATION_ORDER[i + 2]])));
export const RESTORATION_MOMENTS = Object.freeze({
    DORMANT: { stage: "DORMANT", boltLine: "", change: "Dusty, dark and very quiet." },
    WORKSHOP_AWAKE: { stage: "WORKSHOP_AWAKE", boltLine: "The lights are back! This is OUR workshop now.", change: "The workbench lights flicker on and Bolt's charging station hums." },
    MOTION_RESTORED: { stage: "MOTION_RESTORED", boltLine: "Listen! The test track is running again!", change: "The test track whirs, the Motion Yard sign glows and Sprocket wakes up." },
    GEARS_TURNING: { stage: "GEARS_TURNING", boltLine: "The big wall gears are turning!", change: "Giant gears on the wall start to turn." },
    STRUCTURES_SOUND: { stage: "STRUCTURES_SOUND", boltLine: "The roof isn't wobbly any more. Mostly.", change: "The roof beams are braced and the bridge outside is fixed." },
    POWER_ON: { stage: "POWER_ON", boltLine: "Power's on everywhere! Look at all the lights!", change: "Every sign lights up." },
    MAGNETS_HUMMING: { stage: "MAGNETS_HUMMING", boltLine: "The scrap sorter is sorting!", change: "The scrap conveyor starts moving." },
    WATER_FLOWING: { stage: "WATER_FLOWING", boltLine: "The fountain works! I'm only a little bit wet.", change: "The fountain sprays and the plants revive." },
    AIR_MOVING: { stage: "AIR_MOVING", boltLine: "Planes! Real planes!", change: "Little aircraft loop overhead." },
    ROBOTS_ACTIVE: { stage: "ROBOTS_ACTIVE", boltLine: "New robot friends! Hello! HELLO!", change: "Helper robots roll around the hub." },
    SPACE_READY: { stage: "SPACE_READY", boltLine: "The launch tower is ready. Wow.", change: "A rocket appears through the window." },
    CAMPUS_RESTORED: { stage: "CAMPUS_RESTORED", boltLine: "We did it. The whole campus is alive again!", change: "Everything runs at once." }
});
export function restorationStage(save) {
    if (!currentOpening(save).complete)
        return "DORMANT";
    const cleared = new Set(clearedLabIds(save));
    let stage = "WORKSHOP_AWAKE";
    // Campaign order: each lab stage counts only once every earlier lab is also cleared.
    for (const lab of MAIN_LABS) {
        if (!cleared.has(lab.id))
            break;
        stage = STAGE_FOR_LAB[lab.id];
    }
    const finaleDone = activeProfile(save)?.rewards.includes("badge.campus-restored") ?? false;
    return finaleDone ? "CAMPUS_RESTORED" : stage;
}
export function stageIndex(stage) { return RESTORATION_ORDER.indexOf(stage); }
/** Restoration moments reached but not yet shown to this profile, oldest first. */
export function pendingRestorationMoments(save) {
    const p = activeProfile(save);
    if (!p)
        return [];
    const reached = stageIndex(restorationStage(save));
    const seen = new Set(p.restorationSeen);
    return RESTORATION_ORDER.slice(1, reached + 1).filter(s => !seen.has(`restore.${s}`)).map(s => RESTORATION_MOMENTS[s]);
}
/** Visible hub features switched on at the current stage (used for CSS classes + tests). */
export function hubFeatures(stage) {
    const i = stageIndex(stage);
    const f = [];
    if (i >= 1)
        f.push("lights-on", "bolt-station-on");
    if (i >= 2)
        f.push("test-track-running", "motion-sign-lit", "sprocket-awake");
    if (i >= 3)
        f.push("wall-gears-turning");
    if (i >= 4)
        f.push("roof-braced");
    if (i >= 5)
        f.push("all-signs-lit");
    if (i >= 6)
        f.push("conveyor-moving");
    if (i >= 7)
        f.push("fountain-on", "plants-revived");
    if (i >= 8)
        f.push("planes-overhead");
    if (i >= 9)
        f.push("robots-visiting");
    if (i >= 10)
        f.push("rocket-visible");
    return f;
}
export const VISITOR_HOOKS = [
    { id: "visitor.postie-pip", name: "Postie Pip", icon: "📮", arrivesAt: "MOTION_RESTORED", line: "Heard the test track running! Here — a thank-you from the campus post room.", gift: "sticker.postie-thanks" }
];
export function dueVisitors(save) {
    const p = activeProfile(save);
    if (!p)
        return [];
    const reached = stageIndex(restorationStage(save));
    const met = new Set(p.visitorsMet);
    return VISITOR_HOOKS.filter(v => stageIndex(v.arrivesAt) <= reached && !met.has(v.id));
}
