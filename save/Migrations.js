import { completionRewardIds, grantRewardsTo } from "../progression/Rewards.js";
import { CURRENT_SAVE_SCHEMA, DEFAULT_ASSISTANCE, DEFAULT_SETTINGS, MAX_EXPERIMENTS, OPENING_STARTER_PARTS, PAINTED_AVATARS, sanitizeProfileName, validateExperiment } from "../app/AppState.js";
import { DEFAULT_LOOK, validateLook } from "../inventor/InventorLook.js";
function asArray(v) { return Array.isArray(v) ? v : []; }
function asStrings(v) { return asArray(v).filter((x) => typeof x === "string"); }
/** v1 (M7–M9): flat root, profiles were {id,name,avatarStyle?}, progress lived on the root. */
const v1ToV2 = (v1) => {
    const openingStep = Number.isInteger(v1.openingStep) ? v1.openingStep : 1;
    const openingComplete = v1.openingComplete === true;
    const motionDone = asStrings(v1.motionCompletedLevelIds);
    const discoveries = asStrings(v1.motionDiscoveries);
    const rawProfiles = asArray(v1.profiles).filter((p) => Boolean(p) && typeof p === "object");
    const activeId = typeof v1.activeProfileId === "string" ? v1.activeProfileId : undefined;
    const now = typeof v1.savedAtMs === "number" ? v1.savedAtMs : Date.now();
    const levels = {};
    for (const id of motionDone)
        levels[id] = { completed: true, stars: ["solve"], completions: 1 };
    // v1 kept one shared progress set; it belongs to the active (or only/first) profile.
    const owner = activeId ?? rawProfiles[0]?.id;
    const profiles = rawProfiles.map((raw, index) => {
        const isOwner = raw.id === owner;
        const style = typeof raw.avatarStyle === "string" && ["ORANGE", "BLUE", "GREEN", "PURPLE"].includes(raw.avatarStyle) ? raw.avatarStyle : "ORANGE";
        const base = {
            id: String(raw.id ?? `profile-migrated-${index}`), name: sanitizeProfileName(String(raw.name ?? "Inventor")), avatarStyle: style,
            createdAtMs: now, lastPlayedAtMs: isOwner ? now : now - 1,
            openingStep: isOwner ? openingStep : 1, openingComplete: isOwner ? openingComplete : false,
            levels: isOwner ? levels : {}, discoveries: isOwner ? discoveries : [],
            unlockedParts: isOwner && openingComplete ? [...OPENING_STARTER_PARTS] : [], unlockedTools: [],
            rewards: [], unseenRewards: [], equipped: {}, shelf: [], records: {},
            settings: { ...DEFAULT_SETTINGS }, assistance: { ...DEFAULT_ASSISTANCE },
            location: isOwner && openingComplete ? "HUB" : "OPENING",
            freeBuildUnlocked: isOwner ? v1.freeBuildUnlocked === true || openingComplete : false,
            restorationSeen: [], visitorsMet: [], experiments: []
        };
        // Missions finished before rewards existed still earn their completion rewards (parts, tools, badges…).
        const rewarded = isOwner ? grantRewardsTo(base, completionRewardIds(motionDone)).profile : base;
        const withMetrics = isOwner && v1.openingMetrics ? { ...rewarded, openingMetrics: v1.openingMetrics } : rewarded;
        return isOwner && v1.lastBuild ? { ...withMetrics, lastBuild: v1.lastBuild } : withMetrics;
    });
    const guestKeepsProgress = profiles.length === 0;
    const out = {
        schemaVersion: 2,
        revision: 0,
        firstLaunchCompleted: v1.firstLaunchCompleted === true,
        firstTestCompleted: v1.firstTestCompleted === true,
        entitlement: typeof v1.entitlement === "string" ? v1.entitlement : "UNKNOWN",
        profiles,
        deviceSettings: { ...DEFAULT_SETTINGS },
        freeBuildUnlocked: guestKeepsProgress ? v1.freeBuildUnlocked === true : false,
        myInventionsCount: 0,
        openingStep: guestKeepsProgress ? openingStep : 1,
        openingComplete: guestKeepsProgress ? openingComplete : false,
        motionCompletedLevelIds: guestKeepsProgress ? motionDone : [],
        motionDiscoveries: guestKeepsProgress ? discoveries : []
    };
    if (owner && profiles.some(p => p.id === owner))
        out.activeProfileId = owner;
    if (guestKeepsProgress && v1.lastBuild)
        out.lastBuild = v1.lastBuild;
    if (guestKeepsProgress && v1.openingMetrics)
        out.openingMetrics = v1.openingMetrics;
    return out;
};
/**
 * v2 (M10–M11) → v3: inventor maker looks.
 * - Inventors with a painted portrait (BLUE/PINK/GREEN) keep it: no look is added.
 * - Inventors from before the painted portraits (ORANGE/PURPLE) had only a plain badge; they get the
 *   default dressed look so they show as a real inventor. They can change it with the pencil.
 * - Anything in a `look` field that isn't a valid look is dropped (never guessed at).
 */
const v2ToV3 = (v2) => {
    const profiles = asArray(v2.profiles).map(raw => {
        if (!raw || typeof raw !== "object")
            return raw;
        const p = { ...raw };
        if (p.look !== undefined && !validateLook(p.look))
            delete p.look;
        if (p.look === undefined && !PAINTED_AVATARS.includes(p.avatarStyle))
            p.look = { ...DEFAULT_LOOK };
        return p;
    });
    return { ...v2, schemaVersion: 3, profiles };
};
/**
 * v3 (M12–M21) → v4: the Experiment Lab (M22). Every inventor gets an empty list of saved experiments.
 * Nothing else changes; an `experiments` field that somehow already exists is kept only if every entry is valid.
 */
const v3ToV4 = (v3) => {
    const profiles = asArray(v3.profiles).map(raw => {
        if (!raw || typeof raw !== "object")
            return raw;
        const p = { ...raw };
        const list = asArray(p.experiments);
        p.experiments = list.length <= MAX_EXPERIMENTS && list.every(e => validateExperiment(e)) ? list : [];
        return p;
    });
    return { ...v3, schemaVersion: 4, profiles };
};
export const SAVE_MIGRATIONS = Object.freeze({ 1: v1ToV2, 2: v2ToV3, 3: v3ToV4 });
export function migrateAppSave(input) {
    if (!input || typeof input !== "object" || Array.isArray(input))
        return { ok: false, reason: "NOT_A_SAVE" };
    let current = structuredClone(input);
    const fromVersion = current.schemaVersion;
    if (!Number.isInteger(fromVersion) || fromVersion < 1)
        return { ok: false, reason: "NOT_A_SAVE" };
    if (fromVersion > CURRENT_SAVE_SCHEMA)
        return { ok: false, reason: "FUTURE_VERSION", fromVersion: fromVersion };
    let version = fromVersion;
    while (version < CURRENT_SAVE_SCHEMA) {
        const step = SAVE_MIGRATIONS[version];
        if (!step)
            return { ok: false, reason: "NO_MIGRATION_PATH", fromVersion: fromVersion };
        current = step(current);
        version = current.schemaVersion;
    }
    return { ok: true, save: current, fromVersion: fromVersion, migrated: fromVersion !== CURRENT_SAVE_SCHEMA };
}
