import { activeProfile, updateProfile, withMotionProgress, MAX_SHELF_ITEMS, newId } from "../app/AppState.js";
import { MAIN_LABS } from "./CampaignData.js";
import { clearedLabIds } from "./Campus.js";
import { MISSION_REWARDS, evaluateStars, grantRewardsTo, rewardById } from "./Rewards.js";
import { pendingRestorationMoments, restorationStage, VISITOR_HOOKS } from "./Restoration.js";
function grant(p, rewardIds) { return grantRewardsTo(p, rewardIds); }
export function recordMissionSuccess(save, levelId, evidence) {
    const p = activeProfile(save);
    if (!p) {
        // Guest play (no inventor yet): keep the legacy completion record so nothing is lost; rewards wait for a profile.
        const done = [...new Set([...(save.motionCompletedLevelIds ?? []), levelId])];
        const next = withMotionProgress(save, done, [...(save.motionDiscoveries ?? []), ...evidence.discoveries]);
        return { save: next, firstCompletion: !(save.motionCompletedLevelIds ?? []).includes(levelId), stars: ["solve"], newStars: ["solve"], newRewards: [], restoration: [] };
    }
    const clearedBefore = new Set(clearedLabIds(save));
    const prev = p.levels[levelId];
    const runStars = evaluateStars(levelId, evidence);
    const stars = ["solve", "efficient", "advanced"].filter(s => runStars.includes(s) || (prev?.stars ?? []).includes(s));
    const newStars = stars.filter(s => !(prev?.stars ?? []).includes(s));
    const record = {
        completed: true, stars, completions: (prev?.completions ?? 0) + 1,
        bestPartCount: Math.min(prev?.bestPartCount ?? Number.MAX_SAFE_INTEGER, evidence.playerPartCount)
    };
    let profile = { ...p, levels: { ...p.levels, [levelId]: record }, discoveries: [...new Set([...p.discoveries, ...evidence.discoveries])] };
    const rule = MISSION_REWARDS[levelId];
    const toGrant = [...(!prev?.completed ? rule?.onComplete ?? [] : []), ...(stars.length === 3 ? rule?.onAllStars ?? [] : [])];
    const granted = grant(profile, toGrant);
    profile = granted.profile;
    let next = updateProfile(save, p.id, () => profile);
    const clearedAfter = clearedLabIds(next);
    const labCleared = clearedAfter.find(id => !clearedBefore.has(id));
    if (labCleared)
        next = updateProfile(next, p.id, q => ({ ...q, location: "HUB" }));
    return { save: next, firstCompletion: !prev?.completed, stars, newStars, newRewards: granted.added, ...(labCleared ? { labCleared } : {}), restoration: labCleared ? pendingRestorationMoments(next) : [] };
}
export function markRewardsSeen(save, ids) {
    const p = activeProfile(save);
    if (!p)
        return save;
    return updateProfile(save, p.id, q => ({ ...q, unseenRewards: ids ? q.unseenRewards.filter(id => !ids.includes(id)) : [] }));
}
export function markRestorationSeen(save, moments) {
    const p = activeProfile(save);
    if (!p)
        return save;
    return updateProfile(save, p.id, q => ({ ...q, restorationSeen: [...new Set([...q.restorationSeen, ...moments.map(m => `restore.${m.stage}`)])] }));
}
export function meetVisitor(save, visitorId) {
    const p = activeProfile(save);
    const v = VISITOR_HOOKS.find(x => x.id === visitorId);
    if (!p || !v || p.visitorsMet.includes(v.id))
        return { save };
    const granted = v.gift ? grant(p, [v.gift]) : { profile: p, added: [] };
    const next = updateProfile(save, p.id, () => ({ ...granted.profile, visitorsMet: [...granted.profile.visitorsMet, v.id] }));
    return granted.added[0] ? { save: next, gift: granted.added[0] } : { save: next };
}
const SLOT_FOR_KIND = { AVATAR: "avatar", BOLT_COSTUME: "bolt", SPROCKET_ACCESSORY: "sprocket", FRAME: "frame" };
/** Equip (or with `undefined`, take off) a cosmetic in the customisation locker. Only owned items. */
export function equipCosmetic(save, slot, rewardId) {
    const p = activeProfile(save);
    if (!p)
        return save;
    if (rewardId !== undefined) {
        const reward = rewardById(rewardId);
        if (!reward || !p.rewards.includes(rewardId) || SLOT_FOR_KIND[reward.kind] !== slot)
            throw new Error(`Cannot equip ${rewardId} in ${slot}`);
    }
    return updateProfile(save, p.id, q => {
        const equipped = { ...q.equipped };
        if (rewardId === undefined)
            delete equipped[slot];
        else
            equipped[slot] = rewardId;
        return { ...q, equipped };
    });
}
export function lockerItems(save, slot) {
    const p = activeProfile(save);
    if (!p)
        return [];
    return p.rewards.filter(id => { const r = rewardById(id); return r !== undefined && SLOT_FOR_KIND[r.kind] === slot; });
}
/** Put a build on the Workshop invention shelf. Shelf is capped; the oldest item is never silently removed. */
export function addToShelf(save, title, build, sourceLevelId, nowMs = Date.now()) {
    const p = activeProfile(save);
    if (!p)
        return { save, full: false };
    if (p.shelf.length >= MAX_SHELF_ITEMS)
        return { save, full: true };
    const cleanTitle = title.replace(/[^\p{L}\p{N} !?'&_-]/gu, "").trim().slice(0, 40) || "My Invention";
    const item = { id: newId("inv"), title: cleanTitle, savedAtMs: nowMs, build, ...(sourceLevelId ? { sourceLevelId } : {}), ...(p.equipped.frame ? { frameId: p.equipped.frame } : {}) };
    return { save: updateProfile(save, p.id, q => ({ ...q, shelf: [...q.shelf, item] })), item, full: false };
}
export function removeFromShelf(save, inventionId) {
    // A chain saved to the shelf kept its chain numbers in `records` (M21): they go with it.
    const p0 = activeProfile(save);
    if (p0 && Object.keys(p0.records).some(k => k.startsWith(`chain.shelf.${inventionId}.`)))
        save = updateProfile(save, p0.id, q => ({ ...q, records: Object.fromEntries(Object.entries(q.records).filter(([k]) => !k.startsWith(`chain.shelf.${inventionId}.`))) }));
    const p = activeProfile(save);
    if (!p)
        return save;
    return updateProfile(save, p.id, q => ({ ...q, shelf: q.shelf.filter(s => s.id !== inventionId) }));
}
export function progressSummary(save) {
    const p = activeProfile(save);
    const levels = p ? Object.values(p.levels) : [];
    const possible = MAIN_LABS.reduce((n, lab) => n + lab.missions.length * 3, 0);
    return {
        totalStars: levels.reduce((n, r) => n + r.stars.length, 0), possibleStars: possible,
        missionsDone: levels.filter(r => r.completed).length, labsCleared: clearedLabIds(save).length, stage: restorationStage(save),
        trophies: p ? p.rewards.filter(id => id.startsWith("badge.")) : [], stickers: p ? p.rewards.filter(id => id.startsWith("sticker.")) : []
    };
}
