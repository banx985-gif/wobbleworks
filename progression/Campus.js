import { activeProfile, completedLevelIds, currentOpening } from "../app/AppState.js";
import { MAIN_LABS } from "./CampaignData.js";
import { labCleared } from "./LabProgression.js";
const MAP_POS = {
    "workshop-hub": { x: 120, y: 420 }, "motion-yard": { x: 250, y: 300 }, "gear-garage": { x: 390, y: 410 },
    "builder-bay": { x: 520, y: 290 }, "power-lab": { x: 650, y: 420 }, "magnet-factory": { x: 790, y: 330 },
    "water-works": { x: 880, y: 190 }, "flight-hangar": { x: 720, y: 110 }, "robot-lab": { x: 560, y: 150 },
    "space-centre": { x: 390, y: 110 }, "grand-invention-hall": { x: 210, y: 130 }, "hidden-prototype-lab": { x: 80, y: 220 }
};
export const CAMPUS_REGIONS = [
    { id: "workshop-hub", title: "Workshop Hub", kind: "HUB", free: true, map: MAP_POS["workshop-hub"], icon: "🏠", colour: "#ffd8a8" },
    ...MAIN_LABS.map((lab) => ({ id: lab.id, title: lab.title, kind: "LAB", free: lab.id === "motion-yard", lab, map: MAP_POS[lab.id], icon: lab.icon, colour: lab.colour })),
    { id: "grand-invention-hall", title: "Grand Invention Hall", kind: "FINALE", free: false, map: MAP_POS["grand-invention-hall"], icon: "🏛️", colour: "#ffe066" },
    { id: "hidden-prototype-lab", title: "Hidden Prototype Lab", kind: "SECRET", free: false, map: MAP_POS["hidden-prototype-lab"], icon: "❓", colour: "#ced4da" }
];
/** Labs whose authored content is in this build. Each lab milestone (M12–M19) adds its id here. */
export const INSTALLED_REGION_CONTENT = new Set(["workshop-hub", "motion-yard", "gear-garage", "builder-bay", "power-lab", "magnet-factory", "water-works", "flight-hangar"]);
export const HIDDEN_LAB_KEY_PIECES = ["key.prototype-1", "key.prototype-2", "key.prototype-3"];
export function ownsFullGame(entitlement) { return entitlement === "OWNED" || entitlement === "OFFLINE_GRACE"; }
export function regionById(id) { return CAMPUS_REGIONS.find(r => r.id === id); }
export function clearedLabIds(save) {
    const done = new Set(completedLevelIds(save));
    return MAIN_LABS.filter(lab => labCleared(lab, done)).map(lab => lab.id);
}
function progressAllows(save, region) {
    if (region.kind === "HUB")
        return true;
    if (!currentOpening(save).complete)
        return false;
    const cleared = new Set(clearedLabIds(save));
    if (region.kind === "LAB") {
        const index = MAIN_LABS.findIndex(l => l.id === region.id);
        return index === 0 || cleared.has(MAIN_LABS[index - 1].id);
    }
    if (region.kind === "FINALE")
        return MAIN_LABS.every(l => cleared.has(l.id));
    // SECRET: found through exploration — all prototype key pieces collected.
    const rewards = new Set(activeProfile(save)?.rewards ?? []);
    return HIDDEN_LAB_KEY_PIECES.every(k => rewards.has(k));
}
export function regionStatus(save, regionId, installed = INSTALLED_REGION_CONTENT) {
    const region = regionById(regionId);
    if (!region)
        return "LOCKED_PROGRESS";
    if (!progressAllows(save, region))
        return "LOCKED_PROGRESS";
    if (!region.free && !ownsFullGame(save.entitlement))
        return "LOCKED_OWNERSHIP";
    if (!installed.has(region.id))
        return "UNDER_REPAIR";
    if (region.kind === "LAB" && clearedLabIds(save).includes(region.id))
        return "CLEARED";
    return "OPEN";
}
/** What tapping a region on the campus map does. Paid content routes to the grown-up gate, never a shop. */
export function routeToRegion(save, regionId, installed = INSTALLED_REGION_CONTENT) {
    const status = regionStatus(save, regionId, installed);
    const title = regionById(regionId)?.title ?? "That place";
    if (status === "OPEN" || status === "CLEARED")
        return { kind: "ENTER", regionId };
    if (status === "LOCKED_OWNERSHIP")
        return { kind: "PARENT_GATE", regionId };
    if (status === "UNDER_REPAIR")
        return { kind: "NOT_YET", regionId, message: `Bolt is still fixing ${title}. It will open in a later update.` };
    const region = regionById(regionId);
    if (region?.kind === "SECRET")
        return { kind: "NOT_YET", regionId, message: "Something strange is behind this door… maybe some key pieces would help." };
    if (region?.kind === "FINALE")
        return { kind: "NOT_YET", regionId, message: "Repair every lab on campus to open the Grand Invention Hall." };
    const index = MAIN_LABS.findIndex(l => l.id === regionId);
    const before = index > 0 ? MAIN_LABS[index - 1].title : "the workshop";
    return { kind: "NOT_YET", regionId, message: `Finish ${before} first, then ${title} can open.` };
}
/** Child-facing copy for the parent-gated route. Deliberately contains no selling or pressure language. */
export const OWNERSHIP_CHILD_COPY = Object.freeze({
    title: "This lab is closed for now",
    body: "A grown-up can open the rest of the campus from the Grown-ups area. You can keep building in the Motion Yard and Free Build.",
    button: "Back to the map"
});
/** Words that must never appear in child-facing ownership copy (tested). */
export const PRESSURE_WORDS = ["buy", "purchase", "price", "$", "£", "€", "sale", "offer", "hurry", "now!", "only today", "limited", "don't miss", "unlock now", "pay"];
