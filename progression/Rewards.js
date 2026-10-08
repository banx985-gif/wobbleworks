export const REWARDS = [
    // parts (Free Build tray) — Motion starter set comes from the opening
    { id: "part.motion.roller", kind: "PART", title: "Roller", icon: "⚪", description: "A free-spinning roller for your builds." },
    { id: "part.motion.friction-high", kind: "PART", title: "Grip Pad", icon: "🟫", description: "A grippy surface that slows sliding." },
    { id: "part.motion.friction-low", kind: "PART", title: "Slide Pad", icon: "🧊", description: "A slippery surface for fast slides." },
    { id: "part.motion.bounce-pad", kind: "PART", title: "Bounce Pad", icon: "🟣", description: "A springy pad that bounces things back up." },
    { id: "part.motion.axle", kind: "PART", title: "Axle", icon: "➖", description: "Joins wheels to carts and frames." },
    // tools
    { id: "tool.force-scanner", kind: "TOOL", title: "Force Scanner", icon: "🔍", description: "Shows the pushes and pulls on moving things — now in Free Build too." },
    // stickers
    { id: "sticker.first-roll", kind: "STICKER", title: "First Roll", icon: "🎱", description: "You rolled a ball into the bucket." },
    { id: "sticker.safe-landing", kind: "STICKER", title: "Safe Landing", icon: "🪂", description: "Bolt got down gently." },
    { id: "sticker.brake-master", kind: "STICKER", title: "Brake Master", icon: "🛑", description: "You slowed a speeding cart." },
    { id: "sticker.special-delivery", kind: "STICKER", title: "Special Delivery", icon: "📦", description: "A parcel, launched by spring." },
    { id: "sticker.slip-n-grip", kind: "STICKER", title: "Slip & Grip", icon: "🧦", description: "You crossed grippy and slippy ground." },
    { id: "sticker.boing", kind: "STICKER", title: "Boing!", icon: "🦘", description: "A bounce hit the switch." },
    { id: "sticker.heavy-light", kind: "STICKER", title: "Heavy & Light", icon: "⚖️", description: "Same push, different results." },
    { id: "sticker.far-out", kind: "STICKER", title: "Far Out", icon: "📏", description: "Your cart went the distance." },
    { id: "sticker.scientist", kind: "STICKER", title: "Fair Test", icon: "🧪", description: "You compared two ramps fairly." },
    // badges
    { id: "badge.motion-yard", kind: "BADGE", title: "Motion Yard Restored", icon: "🏅", description: "The Motion Yard is running again!" },
    { id: "badge.mega-marble", kind: "BADGE", title: "Marble Mover", icon: "🔵", description: "You built the Giant Marble Delivery Machine." },
    // cosmetics
    { id: "avatar.hard-hat", kind: "AVATAR", title: "Hard Hat", icon: "⛑️", description: "Safety first, inventor." },
    { id: "avatar.goggles", kind: "AVATAR", title: "Lab Goggles", icon: "🥽", description: "For serious experiments." },
    { id: "avatar.cap", kind: "AVATAR", title: "Speedy Cap", icon: "🧢", description: "Goes great with fast carts." },
    { id: "bolt.racing-stripes", kind: "BOLT_COSTUME", title: "Racing Stripes", icon: "🏁", description: "Bolt feels 12% faster. (Bolt is not faster.)" },
    { id: "bolt.duck-floatie", kind: "BOLT_COSTUME", title: "Duck Floatie", icon: "🦆", description: "Bolt is ready for bath time." },
    { id: "sprocket.bandana", kind: "SPROCKET_ACCESSORY", title: "Rescue Bandana", icon: "🧣", description: "Sprocket helped stop the runaway cart. Sort of." },
    { id: "sprocket.spring-collar", kind: "SPROCKET_ACCESSORY", title: "Spring Collar", icon: "🌀", description: "Boing-boing." },
    // workshop props + frames
    { id: "prop.bath-tub", kind: "PROP", title: "Giant Bath Tub", icon: "🛁", description: "The Duck Cannon target, now in your workshop." },
    { id: "prop.test-flag", kind: "PROP", title: "Test Track Flag", icon: "🚩", description: "Flies over the test track." },
    { id: "frame.wood", kind: "FRAME", title: "Wooden Frame", icon: "🖼️", description: "A frame for your invention shelf." },
    { id: "frame.gold", kind: "FRAME", title: "Golden Frame", icon: "🌟", description: "For your finest inventions." },
    { id: "prop.rubber-duck", kind: "PROP", title: "Champion Rubber Duck", icon: "🐤", description: "It has seen things. Mostly bathwater." },
    { id: "sticker.postie-thanks", kind: "STICKER", title: "Special Thanks", icon: "💌", description: "A thank-you from the campus post room." },
    // hidden prototype lab key pieces — one from a silly mission in each of the first three labs (exploration, never stars)
    { id: "key.prototype-1", kind: "KEY_PIECE", title: "Strange Key Piece", icon: "🗝️", description: "A piece of something. It hums." },
    { id: "key.prototype-2", kind: "KEY_PIECE", title: "Another Strange Key Piece", icon: "🗝️", description: "It fits the first one. Sort of." },
    { id: "key.prototype-3", kind: "KEY_PIECE", title: "Last Strange Key Piece", icon: "🗝️", description: "Somewhere, a door is waiting." }
];
export function rewardById(id) { return REWARDS.find(r => r.id === id); }
export const MISSION_REWARDS = Object.freeze({
    "motion.roll-with-it": { onComplete: ["sticker.first-roll"], onAllStars: ["avatar.cap"] },
    "motion.ramp-rescue": { onComplete: ["sticker.safe-landing", "part.motion.axle"] },
    "motion.too-fast": { onComplete: ["sticker.brake-master", "part.motion.friction-high"], onAllStars: ["avatar.hard-hat"] },
    "motion.spring-delivery": { onComplete: ["sticker.special-delivery", "frame.wood"] },
    "motion.slippery-business": { onComplete: ["sticker.slip-n-grip", "part.motion.friction-low"] },
    "motion.bounce-around": { onComplete: ["sticker.boing", "part.motion.bounce-pad"], onAllStars: ["sprocket.spring-collar"] },
    "motion.heavy-or-light": { onComplete: ["sticker.heavy-light", "tool.force-scanner"] },
    "motion.make-it-farther": { onComplete: ["sticker.far-out", "part.motion.roller"] },
    "motion.which-ramp-wins": { onComplete: ["sticker.scientist", "avatar.goggles"] },
    "motion.duck-cannon": { onComplete: ["prop.bath-tub", "bolt.duck-floatie", "key.prototype-1"], onAllStars: ["prop.rubber-duck"] },
    "motion.giant-marble-delivery": { onComplete: ["badge.mega-marble", "bolt.racing-stripes"], onAllStars: ["frame.gold"] },
    "motion.runaway-test-cart": { onComplete: ["badge.motion-yard", "sprocket.bandana", "prop.test-flag"] },
    // Later labs (content arrives at M12/M13): their silly missions hold the other two key pieces.
    "gear.spin-sprocket": { onComplete: ["key.prototype-2"] },
    "builder.elephant-robot-parade": { onComplete: ["key.prototype-3"] }
});
/** Rewards owed for missions already completed (used when old saves or guest progress move into a profile). */
export function completionRewardIds(levelIds) {
    return [...new Set(levelIds.flatMap(id => MISSION_REWARDS[id]?.onComplete ?? []))].filter(id => rewardById(id) !== undefined);
}
/** Pure reward grant: adds owned + unseen ids and unlocks the matching parts/tools. Returns only the newly added ids. */
export function grantRewardsTo(p, rewardIds) {
    const owned = new Set(p.rewards);
    const added = [...new Set(rewardIds)].filter(id => !owned.has(id) && rewardById(id));
    if (added.length === 0)
        return { profile: p, added };
    const parts = added.filter(id => id.startsWith("part.")).map(id => id.slice("part.".length));
    const tools = added.filter(id => id.startsWith("tool."));
    return { added, profile: { ...p, rewards: [...p.rewards, ...added], unseenRewards: [...new Set([...p.unseenRewards, ...added])], unlockedParts: [...new Set([...p.unlockedParts, ...parts])], unlockedTools: [...new Set([...p.unlockedTools, ...tools])] } };
}
const wild = (min = 3) => ({ kind: "DISCOVERY_COUNT", min, label: `WILD INVENTION — show ${min} science ideas in one TEST` });
const budget = (n) => ({ kind: "PART_BUDGET", maxPlayerParts: n, label: n === 1 ? "TINY MACHINE — solve it adding just 1 part" : `TINY MACHINE — solve it adding ${n} parts or fewer` });
export const MISSION_STARS = Object.freeze({
    "motion.roll-with-it": { efficient: budget(1), advanced: wild() },
    "motion.ramp-rescue": { efficient: budget(3), advanced: { kind: "DISCOVERY", discoveryId: "motion.friction-grip", label: "PERFECT LANDING — use grip to slow Bolt down" } },
    "motion.too-fast": { efficient: budget(1), advanced: wild() },
    "motion.spring-delivery": { efficient: budget(1), advanced: wild() },
    "motion.slippery-business": { efficient: budget(1), advanced: { kind: "DISCOVERY", discoveryId: "motion.surface-comparison", label: "SLIP & GRIP — use both surfaces in one run" } },
    "motion.bounce-around": { efficient: budget(1), advanced: { kind: "DISCOVERY", discoveryId: "motion.bounce", label: "MAXIMUM WOBBLE — bounce on the way" } },
    "motion.heavy-or-light": { efficient: budget(1), advanced: { kind: "DISCOVERY", discoveryId: "motion.mass-inertia", label: "FAIR TEST — see the same push move light and heavy differently" } },
    "motion.make-it-farther": { efficient: budget(4), advanced: wild() },
    "motion.which-ramp-wins": { efficient: budget(1), advanced: { kind: "DISCOVERY", discoveryId: "motion.slope-effect", label: "SLOPE SPOTTER — see the slope change the motion" } },
    "motion.duck-cannon": { efficient: budget(1), advanced: wild() },
    "motion.giant-marble-delivery": { efficient: budget(2), advanced: wild(4) },
    "motion.runaway-test-cart": { efficient: budget(1), advanced: wild() }
});
export function evaluateStars(levelId, evidence) {
    const stars = ["solve"];
    const goals = MISSION_STARS[levelId];
    if (!goals)
        return stars;
    if (goalMet(goals.efficient, evidence))
        stars.push("efficient");
    if (goalMet(goals.advanced, evidence))
        stars.push("advanced");
    return stars;
}
export function goalMet(goal, evidence) {
    if (goal.kind === "PART_BUDGET")
        return evidence.playerPartCount <= goal.maxPlayerParts;
    if (goal.kind === "DISCOVERY_COUNT")
        return new Set(evidence.discoveries).size >= goal.min;
    return evidence.discoveries.includes(goal.discoveryId);
}
