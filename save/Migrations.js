import { completionRewardIds, grantRewardsTo } from "../progression/Rewards.js";
import { CURRENT_SAVE_SCHEMA, DEFAULT_ASSISTANCE, DEFAULT_SETTINGS, MAX_CHALLENGES_ON_DEVICE, MAX_EXPERIMENTS, MAX_FAIR_ENTRIES, validateCustomChallenge, MAX_INVENTIONS, validateFairEntry, OPENING_STARTER_PARTS, PAINTED_AVATARS, isSafeId, sanitizeProfileName, validateExperiment, validateInvention } from "../app/AppState.js";
import { cleanInventionName, contentChecksum, contentOf } from "../inventions/Inventions.js";
import { DEFAULT_LOOK, validateLook } from "../inventor/InventorLook.js";
function asArray(v) { return Array.isArray(v) ? v : []; }
function asStrings(v) { return asArray(v).filter((x) => typeof x === "string"); }
/** v1 (M7–M9): flat root, profiles were {id,name,avatarStyle?}, progress lived on the root. */
const v1ToV2 = (v1) => {
    var _a;
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
    const owner = activeId !== null && activeId !== void 0 ? activeId : (_a = rawProfiles[0]) === null || _a === void 0 ? void 0 : _a.id;
    const profiles = rawProfiles.map((raw, index) => {
        var _a, _b;
        const isOwner = raw.id === owner;
        const style = typeof raw.avatarStyle === "string" && ["ORANGE", "BLUE", "GREEN", "PURPLE"].includes(raw.avatarStyle) ? raw.avatarStyle : "ORANGE";
        const base = {
            id: String((_a = raw.id) !== null && _a !== void 0 ? _a : `profile-migrated-${index}`), name: sanitizeProfileName(String((_b = raw.name) !== null && _b !== void 0 ? _b : "Inventor")), avatarStyle: style,
            createdAtMs: now, lastPlayedAtMs: isOwner ? now : now - 1,
            openingStep: isOwner ? openingStep : 1, openingComplete: isOwner ? openingComplete : false,
            levels: isOwner ? levels : {}, discoveries: isOwner ? discoveries : [],
            unlockedParts: isOwner && openingComplete ? [...OPENING_STARTER_PARTS] : [], unlockedTools: [],
            rewards: [], unseenRewards: [], equipped: {}, shelf: [], records: {},
            settings: { ...DEFAULT_SETTINGS }, assistance: { ...DEFAULT_ASSISTANCE },
            location: isOwner && openingComplete ? "HUB" : "OPENING",
            freeBuildUnlocked: isOwner ? v1.freeBuildUnlocked === true || openingComplete : false,
            restorationSeen: [], visitorsMet: [], experiments: [], inventions: [], fairs: []
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
        customChallenges: [],
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
/**
 * v4 (M22–M23) → v5: My Inventions (M24). Every inventor gets an invention library. Each invention already on the
 * Workshop shelf becomes an invention with that build as its Version 1, and the shelf item is linked to it, so
 * nothing anyone saved is lost and the shelf shows the same things as before. A library that somehow already
 * exists is kept only if every entry is valid.
 */
const v4ToV5 = (v4) => {
    const profiles = asArray(v4.profiles).map(raw => {
        var _a;
        if (!raw || typeof raw !== "object")
            return raw;
        const p = { ...raw };
        const existing = asArray(p.inventions);
        if (existing.length && existing.length <= MAX_INVENTIONS && existing.every(i => validateInvention(i)))
            return p;
        const inventions = [];
        const shelf = [];
        for (const item of asArray(p.shelf)) {
            if (!item || typeof item !== "object")
                continue;
            const s = { ...item };
            const b = s.build;
            const { inventionId: _i, versionN: _n, ...plain } = s;
            if (inventions.length >= MAX_INVENTIONS || !isSafeId(s.id) || !b || !Array.isArray(b.parts) || !Array.isArray(b.connections)) {
                shelf.push(plain);
                continue;
            }
            const content = contentOf(b);
            const at = Number.isFinite(s.savedAtMs) ? s.savedAtMs : 0;
            const inv = { id: s.id, name: cleanInventionName(String((_a = s.title) !== null && _a !== void 0 ? _a : "")), createdAtMs: at, environment: isSafeId(s.sourceLevelId) ? `lab:${s.sourceLevelId}` : "workshop", versions: [{ n: 1, savedAtMs: at, base: content, checksum: contentChecksum(content), partCount: content.parts.length }] };
            if (!validateInvention(inv)) {
                shelf.push(plain);
                continue;
            }
            inventions.push(inv);
            shelf.push({ ...plain, inventionId: inv.id, versionN: 1 });
        }
        p.inventions = inventions;
        p.shelf = shelf;
        return p;
    });
    return { ...v4, schemaVersion: 5, profiles };
};
/**
 * v5 (M24–M27) → v6: Science Fairs (M28). Every inventor gets an empty fair history. A history that somehow already
 * exists is kept only if every entry is valid; nothing else changes.
 */
const v5ToV6 = (v5) => {
    const profiles = asArray(v5.profiles).map(raw => {
        if (!raw || typeof raw !== "object")
            return raw;
        const p = { ...raw };
        const list = asArray(p.fairs);
        p.fairs = list.length <= MAX_FAIR_ENTRIES && list.every(e => validateFairEntry(e)) ? list : [];
        return p;
    });
    return { ...v5, schemaVersion: 6, profiles };
};
/** v6 (M28–M30) → v7: creator challenges (M31) live on the device. Starts empty; a list that already exists is kept only if every entry is valid. */
const v6ToV7 = (v6) => {
    const list = asArray(v6.customChallenges);
    return { ...v6, schemaVersion: 7, customChallenges: list.length <= MAX_CHALLENGES_ON_DEVICE && list.every(c => validateCustomChallenge(c)) ? list : [] };
};
/** v7 (M31–M34) → v8: volume levels and the left-handed layout (M35) join every settings block — the device's and each
 *  inventor's. A value that is already there and valid is kept; anything missing or broken gets the default. */
const withV8Settings = (raw) => {
    if (!raw || typeof raw !== "object")
        return raw;
    const s = { ...raw };
    const vol = (v, d) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : d;
    return { ...s, sfxVolume: vol(s.sfxVolume, DEFAULT_SETTINGS.sfxVolume), musicVolume: vol(s.musicVolume, DEFAULT_SETTINGS.musicVolume), voiceVolume: vol(s.voiceVolume, DEFAULT_SETTINGS.voiceVolume), leftHanded: typeof s.leftHanded === "boolean" ? s.leftHanded : DEFAULT_SETTINGS.leftHanded };
};
const v7ToV8 = (v7) => ({ ...v7, schemaVersion: 8, deviceSettings: withV8Settings(v7.deviceSettings), profiles: asArray(v7.profiles).map(p => p && typeof p === "object" ? { ...p, settings: withV8Settings(p.settings) } : p) });
export const SAVE_MIGRATIONS = Object.freeze({ 1: v1ToV2, 2: v2ToV3, 3: v3ToV4, 4: v4ToV5, 5: v5ToV6, 6: v6ToV7, 7: v7ToV8 });
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
