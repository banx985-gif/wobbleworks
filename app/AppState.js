import { completionRewardIds, grantRewardsTo } from "../progression/Rewards.js";
import { validateLook } from "../inventor/InventorLook.js";
/**
 * WobbleWorks root save — schema version 6 (v2 = Milestone 10; v3 adds the inventor maker look; v4 experiments; v5 My Inventions; v6 Science Fair history; v7 creator challenges).
 *
 * Root fields that are not inside a profile are the *guest* progress made before the
 * first inventor is created (the opening is played before any profile exists).
 * When the first inventor is created, that guest progress moves into the profile.
 * Every later profile owns its own campaign, unlocks, rewards, shelf, settings and assistance.
 */
export const CURRENT_SAVE_SCHEMA = 7;
/** BLUE, PINK and GREEN are the three painted inventors (Aaron's art, 8 Oct). ORANGE/PURPLE remain valid for older saves. */
export const AVATAR_STYLES = ["ORANGE", "BLUE", "GREEN", "PURPLE", "PINK"];
export const PAINTED_AVATARS = ["BLUE", "PINK", "GREEN"];
export const MAX_EXPERIMENTS = 40;
export const MAX_TRIALS = 12;
export const MAX_FAIR_ENTRIES = 60;
export const MAX_CHALLENGES_ON_DEVICE = 30;
export const MAX_INVENTIONS = 40;
export const MAX_VERSIONS = 25;
export const INVENTION_NAME_MAX = 40;
export const DEFAULT_SETTINGS = Object.freeze({ textScale: 1, reducedMotion: false, highContrast: false, subtitles: true, narration: true, soundEffects: true, music: true, vibration: true });
export const DEFAULT_ASSISTANCE = Object.freeze({ snapAssist: true, boltTips: true });
export const MAX_PROFILES = 6;
export const MAX_SHELF_ITEMS = 24;
export const PROFILE_NAME_MAX = 16;
export const OPENING_STARTER_PARTS = ["motion.ball", "motion.cart", "motion.wheel", "motion.ramp", "motion.spring", "structure.block"];
export function createDefaultAppSave() {
    return {
        schemaVersion: CURRENT_SAVE_SCHEMA,
        revision: 0,
        firstLaunchCompleted: false,
        firstTestCompleted: false,
        entitlement: "UNKNOWN",
        profiles: [],
        deviceSettings: { ...DEFAULT_SETTINGS },
        freeBuildUnlocked: false,
        myInventionsCount: 0,
        openingStep: 1,
        openingComplete: false,
        motionCompletedLevelIds: [],
        motionDiscoveries: [],
        customChallenges: []
    };
}
export function sanitizeProfileName(raw) {
    return raw.replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, " ").trim().slice(0, PROFILE_NAME_MAX) || "Inventor";
}
let idCounter = 0;
export function newId(prefix) {
    const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}-${random}`;
}
export function createProfile(name, avatarStyle, nowMs = Date.now(), id = newId("profile")) {
    const style = AVATAR_STYLES.includes(avatarStyle) ? avatarStyle : "ORANGE";
    return {
        id, name: sanitizeProfileName(name), avatarStyle: style, createdAtMs: nowMs, lastPlayedAtMs: nowMs,
        openingStep: 1, openingComplete: false, levels: {}, discoveries: [], unlockedParts: [], unlockedTools: [],
        rewards: [], unseenRewards: [], equipped: {}, shelf: [], records: {}, settings: { ...DEFAULT_SETTINGS },
        assistance: { ...DEFAULT_ASSISTANCE }, location: "OPENING", freeBuildUnlocked: false, restorationSeen: [], visitorsMet: [], experiments: [], inventions: [], fairs: []
    };
}
// ------------------------------------------------------------------ validation
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:_-]{0,95}$/;
export function isSafeId(value) { return typeof value === "string" && SAFE_ID.test(value); }
function isStringArray(v, idsOnly = false) { return Array.isArray(v) && v.every(x => typeof x === "string" && (!idsOnly || isSafeId(x))); }
function isBool(v) { return typeof v === "boolean"; }
function isCount(v) { return Number.isInteger(v) && v >= 0; }
function isBuild(v) {
    const b = v;
    return Boolean(b && typeof b === "object" && Array.isArray(b.parts) && Array.isArray(b.connections));
}
function isLocation(v) {
    return v === "OPENING" || v === "HUB" || v === "MAP" || (typeof v === "string" && /^LAB:[a-z0-9-]{1,48}$/.test(v));
}
export function validateSettings(s) {
    const v = s;
    return Boolean(v) && typeof v.textScale === "number" && v.textScale >= 0.8 && v.textScale <= 1.6 &&
        isBool(v.reducedMotion) && isBool(v.highContrast) && isBool(v.subtitles) && isBool(v.narration) && isBool(v.soundEffects) &&
        (v.music === undefined || isBool(v.music)) && (v.vibration === undefined || isBool(v.vibration));
}
function validateMetrics(m) {
    if (!isCount(m.testPresses) || !isCount(m.stopPresses) || !isCount(m.retries))
        return false;
    if (m.firstInteractionDelayMs !== undefined && (!Number.isFinite(m.firstInteractionDelayMs) || m.firstInteractionDelayMs < 0))
        return false;
    if (m.firstTestDelayMs !== undefined && (!Number.isFinite(m.firstTestDelayMs) || m.firstTestDelayMs < 0))
        return false;
    return Array.isArray(m.completedSteps) && m.completedSteps.every(step => Number.isInteger(step) && step >= 1 && step <= 6);
}
export function validateProfile(p) {
    if (!p || typeof p !== "object")
        return false;
    if (!isSafeId(p.id) || typeof p.name !== "string" || p.name.length < 1 || p.name.length > PROFILE_NAME_MAX)
        return false;
    if (sanitizeProfileName(p.name) !== p.name)
        return false;
    if (!AVATAR_STYLES.includes(p.avatarStyle))
        return false;
    if (p.look !== undefined && !validateLook(p.look))
        return false;
    if (!Number.isFinite(p.createdAtMs) || !Number.isFinite(p.lastPlayedAtMs))
        return false;
    if (!Number.isInteger(p.openingStep) || p.openingStep < 1 || p.openingStep > 6 || !isBool(p.openingComplete))
        return false;
    if (p.openingMetrics !== undefined && !validateMetrics(p.openingMetrics))
        return false;
    if (!p.levels || typeof p.levels !== "object" || Array.isArray(p.levels))
        return false;
    for (const [id, rec] of Object.entries(p.levels)) {
        if (!isSafeId(id) || !rec || !isBool(rec.completed) || !isStringArray(rec.stars, true) || rec.stars.length > 3 || !isCount(rec.completions))
            return false;
        if (rec.bestPartCount !== undefined && !isCount(rec.bestPartCount))
            return false;
    }
    if (!isStringArray(p.discoveries, true) || !isStringArray(p.unlockedParts, true) || !isStringArray(p.unlockedTools, true))
        return false;
    if (!isStringArray(p.rewards, true) || !isStringArray(p.unseenRewards, true))
        return false;
    if (!p.equipped || typeof p.equipped !== "object")
        return false;
    for (const slot of ["avatar", "bolt", "sprocket", "frame"]) {
        const item = p.equipped[slot];
        if (item !== undefined && (!isSafeId(item) || !p.rewards.includes(item)))
            return false;
    }
    if (!Array.isArray(p.shelf) || p.shelf.length > MAX_SHELF_ITEMS)
        return false;
    if (!p.shelf.every(s => isSafeId(s.id) && typeof s.title === "string" && s.title.length <= 40 && Number.isFinite(s.savedAtMs) && isBuild(s.build) && (s.frameId === undefined || isSafeId(s.frameId)) && (s.sourceLevelId === undefined || isSafeId(s.sourceLevelId))))
        return false;
    if (new Set(p.shelf.map(s => s.id)).size !== p.shelf.length)
        return false;
    if (!Array.isArray(p.inventions) || p.inventions.length > MAX_INVENTIONS || !p.inventions.every(validateInvention))
        return false;
    if (new Set(p.inventions.map(i => i.id)).size !== p.inventions.length)
        return false;
    if (!Array.isArray(p.fairs) || p.fairs.length > MAX_FAIR_ENTRIES || !p.fairs.every(validateFairEntry))
        return false;
    // A shelf item that shows an invention must point at one that exists (and at one of its versions).
    if (!p.shelf.every(s => s.inventionId === undefined ? s.versionN === undefined : isSafeId(s.inventionId) && p.inventions.some(i => i.id === s.inventionId && (s.versionN === undefined || i.versions.some(v => v.n === s.versionN)))))
        return false;
    if (!p.records || typeof p.records !== "object" || !Object.entries(p.records).every(([k, v]) => isSafeId(k) && Number.isFinite(v)))
        return false;
    if (!validateSettings(p.settings))
        return false;
    if (!p.assistance || !isBool(p.assistance.snapAssist) || !isBool(p.assistance.boltTips))
        return false;
    if (!isLocation(p.location))
        return false;
    if (p.lastBuild !== undefined && !isBuild(p.lastBuild))
        return false;
    if (!isBool(p.freeBuildUnlocked))
        return false;
    if (!isStringArray(p.restorationSeen, true) || !isStringArray(p.visitorsMet, true))
        return false;
    if (!Array.isArray(p.experiments) || p.experiments.length > MAX_EXPERIMENTS || !p.experiments.every(validateExperiment))
        return false;
    if (p.mastery !== undefined) {
        if (!p.mastery || typeof p.mastery !== "object" || Array.isArray(p.mastery))
            return false;
        const entries = Object.entries(p.mastery);
        if (entries.length > 200 || !entries.every(([k, v]) => isSafeId(k) && isStringArray(v, true) && v.length <= 24))
            return false;
    }
    if (p.guidance !== undefined && (!p.guidance || !isCount(p.guidance.unaidedSolves) || !isCount(p.guidance.helpedSolves) || !isCount(p.guidance.hintsUsed)))
        return false;
    return true;
}
function isContent(v) { const c = v; return Boolean(c && typeof c === "object" && Array.isArray(c.parts) && Array.isArray(c.connections) && c.parts.every(p => p && isSafeId(p.id) && typeof p.definitionId === "string")); }
/** An invention's shape: safe ids, a name, and 1–25 versions numbered upward where only version 1 keeps a whole build. */
export function validateInvention(i) {
    if (!i || typeof i !== "object" || !isSafeId(i.id) || typeof i.name !== "string" || i.name.length < 1 || i.name.length > INVENTION_NAME_MAX)
        return false;
    if (!Number.isFinite(i.createdAtMs) || !isSafeId(i.environment) || (i.copiedFrom !== undefined && !isSafeId(i.copiedFrom)))
        return false;
    if (!Array.isArray(i.versions) || i.versions.length < 1 || i.versions.length > MAX_VERSIONS)
        return false;
    let last = 0;
    for (const [k, v] of i.versions.entries()) {
        if (!v || !Number.isInteger(v.n) || v.n <= last || !Number.isFinite(v.savedAtMs) || typeof v.checksum !== "string" || !isCount(v.partCount))
            return false;
        last = v.n;
        if (k === 0 ? !isContent(v.base) || v.delta !== undefined : v.base !== undefined || !v.delta || !Array.isArray(v.delta.add) || !Array.isArray(v.delta.change) || !isStringArray(v.delta.remove, true) || (v.delta.connections !== undefined && !Array.isArray(v.delta.connections)) || (v.delta.order !== undefined && !isStringArray(v.delta.order, true)))
            return false;
        if (v.restoredFrom !== undefined && (!Number.isInteger(v.restoredFrom) || v.restoredFrom < 1))
            return false;
        if (v.metrics !== undefined && (!v.metrics || typeof v.metrics !== "object" || !Object.entries(v.metrics).every(([key, x]) => isSafeId(key) && Number.isFinite(x))))
            return false;
    }
    return true;
}
/** A fair entry: safe ids, a short title and award labels written in capitals (measurable award names). */
export function validateFairEntry(e) {
    return Boolean(e) && typeof e === "object" && isSafeId(e.id) && isSafeId(e.fairId) && Number.isFinite(e.savedAtMs) && typeof e.title === "string" && e.title.length >= 1 && e.title.length <= 40 &&
        Array.isArray(e.awards) && e.awards.length <= 10 && e.awards.every(a => typeof a === "string" && /^[A-Z][A-Z !'-]{1,30}$/.test(a)) && (e.inventionId === undefined || isSafeId(e.inventionId));
}
/** A saved experiment: safe ids, a real guess (if any) and 1–12 trials of finite measured numbers. */
export function validateExperiment(e) {
    if (!e || typeof e !== "object" || !isSafeId(e.id) || !isSafeId(e.templateId) || !Number.isFinite(e.savedAtMs))
        return false;
    if (e.prediction !== undefined && !["A", "B", "SAME"].includes(e.prediction))
        return false;
    return Array.isArray(e.trials) && e.trials.length >= 1 && e.trials.length <= MAX_TRIALS && e.trials.every(t => t && Number.isInteger(t.a) && Number.isInteger(t.b) && t.a >= 0 && t.b >= 0 && t.a < 10 && t.b < 10 && Number.isFinite(t.valueA) && Number.isFinite(t.valueB) && ["A", "B", "SAME"].includes(t.verdict));
}
export function validateAppSave(value) {
    if (!value || typeof value !== "object" || value.schemaVersion !== CURRENT_SAVE_SCHEMA)
        return false;
    if (!isCount(value.revision))
        return false;
    if (!isBool(value.firstLaunchCompleted) || !isBool(value.firstTestCompleted))
        return false;
    if (!["UNKNOWN", "OWNED", "OFFLINE_GRACE", "LOCKED"].includes(value.entitlement))
        return false;
    if (!Array.isArray(value.profiles) || value.profiles.length > MAX_PROFILES || !value.profiles.every(validateProfile))
        return false;
    if (new Set(value.profiles.map(p => p.id)).size !== value.profiles.length)
        return false;
    if (value.activeProfileId !== undefined && !value.profiles.some(p => p.id === value.activeProfileId))
        return false;
    if (!validateSettings(value.deviceSettings))
        return false;
    if (!isBool(value.freeBuildUnlocked))
        return false;
    if (!isCount(value.myInventionsCount))
        return false;
    if (value.openingStep !== undefined && (!Number.isInteger(value.openingStep) || value.openingStep < 1 || value.openingStep > 6))
        return false;
    if (value.openingComplete !== undefined && !isBool(value.openingComplete))
        return false;
    if (value.openingMetrics !== undefined && !validateMetrics(value.openingMetrics))
        return false;
    if (value.motionCompletedLevelIds !== undefined && !isStringArray(value.motionCompletedLevelIds))
        return false;
    if (value.motionDiscoveries !== undefined && !isStringArray(value.motionDiscoveries))
        return false;
    if (value.lastBuild !== undefined && !isBuild(value.lastBuild))
        return false;
    if (!Array.isArray(value.customChallenges) || value.customChallenges.length > MAX_CHALLENGES_ON_DEVICE || !value.customChallenges.every(validateCustomChallenge))
        return false;
    if (new Set(value.customChallenges.map(c => c.id)).size !== value.customChallenges.length)
        return false;
    return true;
}
/** A creator challenge's shape — strict, because it may come from a backup: safe ids, a short name, sizes inside the sandbox budgets, parts inside the room. */
export function validateCustomChallenge(c) {
    if (!c || typeof c !== "object" || !isSafeId(c.id) || !isSafeId(c.creatorProfileId) || !isSafeId(c.roomId) || !Number.isFinite(c.createdAtMs))
        return false;
    if (typeof c.name !== "string" || c.name.length < 1 || c.name.length > 40 || typeof c.creatorName !== "string" || c.creatorName.length > PROFILE_NAME_MAX)
        return false;
    if (!Array.isArray(c.fixed) || c.fixed.length < 2 || c.fixed.length > 40)
        return false;
    if (!c.fixed.every(p => p && isSafeId(p.id) && isSafeId(p.definitionId) && p.position && Number.isFinite(p.position.x) && Number.isFinite(p.position.y) && p.position.x >= -1 && p.position.x <= 17 && p.position.y >= -1 && p.position.y <= 10 && Number.isFinite(p.rotation) && p.parameters && typeof p.parameters === "object" && p.parameters.locked === true && (p.tags === undefined || isStringArray(p.tags, true))))
        return false;
    if (!c.fixed.some(p => p.tags?.includes("start")) || c.fixed.filter(p => p.tags?.includes("goal")).length !== 1)
        return false;
    if (!isStringArray(c.allowedParts, true) || c.allowedParts.length < 1 || c.allowedParts.length > 40)
        return false;
    if (![0, 3, 5, 10].includes(c.partLimit))
        return false;
    const pr = c.proof;
    return Boolean(pr) && typeof pr.roomHash === "string" && typeof pr.buildHash === "string" && isCount(pr.partsUsed) && Number.isFinite(pr.seconds) && pr.seconds >= 0 && (c.partLimit === 0 || pr.partsUsed <= c.partLimit);
}
// ------------------------------------------------------------------ profile access
export function activeProfile(save) {
    return save.activeProfileId ? save.profiles.find(p => p.id === save.activeProfileId) : undefined;
}
export function mostRecentProfile(save) {
    return activeProfile(save) ?? [...save.profiles].sort((a, b) => b.lastPlayedAtMs - a.lastPlayedAtMs)[0];
}
export function updateProfile(save, id, change) {
    if (!save.profiles.some(p => p.id === id))
        throw new Error(`Unknown profile ${id}`);
    return { ...save, profiles: save.profiles.map(p => p.id === id ? change(p) : p) };
}
function updateActive(save, change) {
    const p = activeProfile(save);
    return p ? updateProfile(save, p.id, change) : undefined;
}
export function profileSummaries(save) {
    return save.profiles.map(p => ({ id: p.id, name: p.name, avatarStyle: p.avatarStyle }));
}
/** Completed lab level ids for the active profile, or guest progress when none. */
export function completedLevelIds(save) {
    const p = activeProfile(save);
    if (!p)
        return save.motionCompletedLevelIds ?? [];
    return Object.entries(p.levels).filter(([, r]) => r.completed).map(([id]) => id);
}
export function currentOpening(save) {
    const p = activeProfile(save);
    return p ? { step: p.openingStep, complete: p.openingComplete } : { step: save.openingStep ?? 1, complete: save.openingComplete ?? false };
}
export function currentSettings(save) {
    return activeProfile(save)?.settings ?? save.deviceSettings;
}
export function currentAssistance(save) {
    return activeProfile(save)?.assistance ?? DEFAULT_ASSISTANCE;
}
export function currentLastBuild(save) {
    const p = activeProfile(save);
    return p ? p.lastBuild : save.lastBuild;
}
export function titleVisibility(save) {
    const hasProfiles = save.profiles.length > 0;
    const recent = mostRecentProfile(save);
    // Guest progress that still exists (a build, or opening beats past the first). Deleting the last
    // inventor clears it, so the title correctly falls back to START BUILDING instead of an empty menu.
    const guestStarted = save.lastBuild !== undefined || (save.openingStep ?? 1) > 1 || save.openingComplete === true;
    const returning = guestStarted || hasProfiles;
    return {
        startBuilding: !returning,
        continueGame: returning && (recent !== undefined || guestStarted),
        profiles: returning && hasProfiles,
        freeBuild: returning && (recent ? recent.freeBuildUnlocked : save.freeBuildUnlocked),
        myInventions: returning && (recent ? recent.shelf.length > 0 || recent.inventions.length > 0 : save.myInventionsCount > 0)
    };
}
// ------------------------------------------------------------------ mutations (pure)
export function withBuild(save, lastBuild) {
    const base = { ...save, firstLaunchCompleted: true };
    return updateActive(base, p => ({ ...p, lastBuild })) ?? { ...base, lastBuild };
}
export function withFirstTest(save, lastBuild) {
    return withBuild({ ...save, firstTestCompleted: true }, lastBuild);
}
export function withOpeningProgress(save, openingStep, openingComplete = false) {
    const updated = updateActive(save, p => {
        const complete = p.openingComplete || openingComplete;
        return {
            ...p, openingStep, openingComplete: complete, location: complete ? p.location === "OPENING" ? "HUB" : p.location : "OPENING",
            freeBuildUnlocked: p.freeBuildUnlocked || complete,
            unlockedParts: complete ? [...new Set([...p.unlockedParts, ...OPENING_STARTER_PARTS])] : p.unlockedParts
        };
    });
    return updated ?? ({ ...save, openingStep, openingComplete: (save.openingComplete ?? false) || openingComplete, freeBuildUnlocked: save.freeBuildUnlocked || openingComplete });
}
export function withOpeningMetrics(save, metrics) {
    const copy = { ...metrics, completedSteps: [...metrics.completedSteps] };
    return updateActive(save, p => ({ ...p, openingMetrics: copy })) ?? { ...save, openingMetrics: copy };
}
/**
 * Creates an inventor and makes it active. The very first inventor inherits the guest progress made
 * during the opening (Create Inventor appears after opening beat 3), and the guest slot is cleared.
 */
export function withCreatedProfile(save, name, avatarStyle, nowMs = Date.now(), look) {
    if (save.profiles.length >= MAX_PROFILES)
        throw new Error("Profile limit reached");
    if (look !== undefined && !validateLook(look))
        throw new Error("Invalid look");
    let profile = createProfile(name, avatarStyle, nowMs);
    if (look)
        profile = { ...profile, look: { ...look } };
    const inheritsGuest = save.profiles.length === 0;
    if (inheritsGuest) {
        const levels = {};
        for (const id of save.motionCompletedLevelIds ?? [])
            levels[id] = { completed: true, stars: ["solve"], completions: 1 };
        const complete = save.openingComplete ?? false;
        profile = {
            ...profile,
            openingStep: save.openingStep ?? 1, openingComplete: complete,
            ...(save.openingMetrics ? { openingMetrics: save.openingMetrics } : {}),
            ...(save.lastBuild ? { lastBuild: save.lastBuild } : {}),
            levels, discoveries: [...new Set(save.motionDiscoveries ?? [])], settings: { ...save.deviceSettings },
            freeBuildUnlocked: save.freeBuildUnlocked, location: complete ? "HUB" : "OPENING",
            unlockedParts: complete ? [...OPENING_STARTER_PARTS] : []
        };
        profile = grantRewardsTo(profile, completionRewardIds(save.motionCompletedLevelIds ?? [])).profile;
    }
    const base = inheritsGuest
        ? (() => {
            const { lastBuild: _lb, openingMetrics: _om, ...rest } = save;
            return { ...rest, openingStep: 1, openingComplete: false, motionCompletedLevelIds: [], motionDiscoveries: [], freeBuildUnlocked: false, myInventionsCount: 0 };
        })()
        : save;
    return { ...base, profiles: [...base.profiles, profile], activeProfileId: profile.id };
}
/**
 * Edit an inventor's nickname and look (the pencil on the inventor card).
 * `look`: a maker look to save, `null` to go back to the painted portrait, undefined to leave it as it is.
 */
export function withEditedProfile(save, id, name, avatarStyle, look) {
    const style = AVATAR_STYLES.includes(avatarStyle) ? avatarStyle : undefined;
    if (look && !validateLook(look))
        throw new Error("Invalid look");
    return updateProfile(save, id, p => {
        const base = { ...p, name: sanitizeProfileName(name), ...(style ? { avatarStyle: style } : {}) };
        if (look === null) {
            const { look: _old, ...rest } = base;
            return rest;
        }
        return look ? { ...base, look: { ...look } } : base;
    });
}
export function withActiveProfile(save, id, nowMs = Date.now()) {
    return { ...updateProfile(save, id, p => ({ ...p, lastPlayedAtMs: nowMs })), activeProfileId: id };
}
export function withoutActiveProfile(save) {
    const { activeProfileId: _a, ...rest } = save;
    return rest;
}
export function withDeletedProfile(save, id) {
    const profiles = save.profiles.filter(p => p.id !== id);
    const next = { ...save, profiles };
    return save.activeProfileId === id ? withoutActiveProfile(next) : next;
}
export function withSettings(save, settings) {
    if (!validateSettings(settings))
        throw new Error("Invalid settings");
    return updateActive(save, p => ({ ...p, settings: { ...settings } })) ?? { ...save, deviceSettings: { ...settings } };
}
export function withAssistance(save, assistance) {
    return updateActive(save, p => ({ ...p, assistance: { ...assistance } })) ?? save;
}
export function withLocation(save, location) {
    return updateActive(save, p => ({ ...p, location })) ?? save;
}
/** Legacy M9 entry point: records completed Motion ids + discoveries on the active profile or guest. */
export function withMotionProgress(save, completedLevelIds, discoveries) {
    const updated = updateActive(save, p => {
        const levels = { ...p.levels };
        for (const id of completedLevelIds) {
            const prev = levels[id];
            levels[id] = prev?.completed ? prev : { completed: true, stars: ["solve"], completions: Math.max(1, prev?.completions ?? 0) };
        }
        return { ...p, levels, discoveries: [...new Set([...p.discoveries, ...discoveries])] };
    });
    return updated ?? { ...save, motionCompletedLevelIds: [...new Set(completedLevelIds)], motionDiscoveries: [...new Set(discoveries)] };
}
export function withEntitlement(save, entitlement) {
    return { ...save, entitlement };
}
