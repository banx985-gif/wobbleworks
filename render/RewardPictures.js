/**
 * THE reward and card picture map (M45, sheets 91–100). Every sticker, badge, key piece and picture card the menus show
 * comes from here, keyed by the reward's or screen's own id, so swapping a picture later is a one-line change.
 * Pictures only: nothing here changes how a reward is earned or what counts as a win. A picture that fails to load falls
 * back to the reward's emoji.
 */
/** Each reward id → its picture (stickers, badges, key pieces, and the aviator cap). Others keep their emoji. */
export const REWARD_PICTURES = {
    "sticker.first-roll": "sticker.star-face", "sticker.safe-landing": "sticker.star-face", "sticker.brake-master": "sticker.star-face",
    "sticker.special-delivery": "sticker.star-face", "sticker.slip-n-grip": "sticker.star-face", "sticker.boing": "sticker.star-face",
    "sticker.heavy-light": "sticker.star-face", "sticker.far-out": "sticker.star-face", "sticker.scientist": "sticker.atom",
    "badge.motion-yard": "badge.gold-star", "badge.mega-marble": "badge.winged-star", "sticker.postie-thanks": "sticker.heart",
    "sticker.fair-1": "badge.rosette-star", "sticker.fair-2": "badge.rosette-star", "sticker.fair-3": "badge.rosette-star",
    "sticker.fair-4": "badge.rosette-star", "sticker.fair-5": "badge.rosette-star", "sticker.visitor-chef": "sticker.heart",
    "sticker.visitor-builder": "sticker.heart", "sticker.visitor-farmer": "sticker.heart", "sticker.visitor-firefighter": "sticker.heart",
    "sticker.visitor-delivery": "sticker.heart", "sticker.visitor-astronaut": "sticker.heart", "sticker.visitor-zookeeper": "sticker.heart",
    "sticker.visitor-pirate": "sticker.heart", "sticker.visitor-musician": "sticker.heart", "sticker.visitor-park": "sticker.heart",
    "sticker.visitor-mechanic": "sticker.heart", "sticker.visitor-scientist": "sticker.heart", "sticker.door-opener": "sticker.star-happy",
    "sticker.wrong-way": "sticker.star-happy", "sticker.speedy-spin": "sticker.star-happy", "sticker.strongman": "sticker.star-happy",
    "sticker.going-up": "sticker.star-happy", "sticker.triple-breeze": "sticker.star-happy", "sticker.clock-fixer": "sticker.star-happy",
    "sticker.conveyor": "sticker.star-happy", "sticker.gear-scientist": "sticker.atom", "badge.clockwork-carnival": "badge.gear-wrench",
    "badge.gear-garage": "badge.gold-star", "sticker.bridge-builder": "sticker.star-burst", "sticker.steady": "sticker.star-burst",
    "sticker.triangle": "sticker.star-burst", "sticker.heavy-hauler": "sticker.star-burst", "sticker.crane-operator": "sticker.star-burst",
    "sticker.roof-rescuer": "sticker.star-burst", "sticker.sky-high": "sticker.star-burst", "sticker.egg-saver": "sticker.star-burst",
    "sticker.bridge-scientist": "sticker.atom", "badge.parade-bridge": "badge.gear-wrench", "badge.builder-bay": "badge.gold-star",
    "sticker.first-light": "sticker.lightbulb", "sticker.loop-fixer": "sticker.lightbulb", "sticker.button-pusher": "sticker.lightbulb",
    "sticker.motor-power": "sticker.lightbulb", "sticker.two-lights": "sticker.lightbulb", "sticker.path-finder": "sticker.lightbulb",
    "sticker.lift-power": "sticker.lightbulb", "sticker.battery-saver": "sticker.lightbulb", "sticker.battery-scientist": "sticker.atom",
    "badge.power-grid": "badge.gear-wrench", "sticker.magnet-pull": "sticker.atom", "sticker.magnet-push": "sticker.atom",
    "sticker.metal-sorter": "sticker.atom", "sticker.no-touch": "sticker.atom", "sticker.scrap-sorter": "sticker.atom",
    "sticker.magnet-train": "sticker.atom", "sticker.floating": "sticker.atom", "sticker.crane-magnet": "sticker.atom",
    "sticker.material-scientist": "sticker.atom", "badge.scrap-sorter": "badge.gear-wrench", "badge.magnet-factory": "badge.gold-star",
    "sticker.tank-filler": "sticker.rainbow", "sticker.downhill": "sticker.rainbow", "sticker.valve-master": "sticker.rainbow",
    "sticker.leak-fixer": "sticker.rainbow", "sticker.gardener": "sticker.sun", "sticker.water-wheel": "sticker.rainbow",
    "sticker.pump-up": "sticker.rainbow", "sticker.sharpshooter": "sticker.rainbow", "sticker.pipe-scientist": "sticker.atom",
    "badge.grand-fountain": "badge.winged-star", "badge.water-works": "badge.gold-star", "sticker.breezy": "sticker.rocket",
    "sticker.long-glide": "sticker.rocket", "sticker.soft-landing": "sticker.rocket", "sticker.balloon-lift": "sticker.rocket",
    "sticker.hoops": "sticker.rocket", "sticker.balanced": "sticker.rocket", "sticker.propeller": "sticker.rocket",
    "sticker.canyon": "sticker.rocket", "sticker.wing-scientist": "sticker.atom", "avatar.aviator-cap": "cos.avatar.aviator-cap",
    "badge.canyon-flyer": "badge.winged-star", "badge.flight-hangar": "badge.gold-star", "sticker.first-program": "sticker.robot-wrench",
    "sticker.corner": "sticker.robot-wrench", "sticker.patience": "sticker.robot-wrench", "sticker.wall-sense": "sticker.robot-wrench",
    "sticker.colour-coder": "sticker.robot-wrench", "sticker.button-bot": "sticker.robot-wrench",
    "sticker.delivery-bot": "sticker.robot-wrench", "sticker.factory-bot": "sticker.robot-wrench", "sticker.route-scientist": "sticker.atom",
    "badge.automated-factory": "badge.gear-wrench", "badge.robot-lab": "badge.gold-star", "sticker.moon-rover": "sticker.rocket",
    "sticker.crater": "sticker.rocket", "sticker.straight-up": "sticker.rocket", "sticker.bullseye": "sticker.rocket",
    "sticker.sunny": "sticker.sun", "sticker.space-mechanic": "sticker.robot-wrench", "sticker.moon-delivery": "sticker.rocket",
    "sticker.fair-test": "sticker.atom", "badge.wobbleworks-explorer": "badge.winged-star", "badge.space-centre": "badge.gold-star",
    "sticker.first-domino": "sticker.star-happy", "sticker.bell-ringer": "sticker.star-happy", "sticker.up-down": "sticker.star-happy",
    "sticker.power-change": "sticker.lightbulb", "sticker.wet-wild": "sticker.star-happy", "sticker.magnet-middle": "sticker.star-happy",
    "sticker.robot-relay": "sticker.robot-wrench", "sticker.air-mail": "sticker.star-happy", "sticker.three-domains": "sticker.star-happy",
    "sticker.no-repeats": "sticker.star-happy", "sticker.long-haul": "sticker.star-happy", "badge.chain-master": "badge.silver-crown",
    "sticker.exp-ramp": "sticker.atom", "sticker.exp-grip": "sticker.atom", "sticker.exp-gear": "sticker.atom",
    "sticker.exp-bridge": "sticker.atom", "sticker.exp-battery": "sticker.atom", "sticker.exp-magnet": "sticker.atom",
    "sticker.exp-pipe": "sticker.atom", "sticker.exp-wing": "sticker.atom", "sticker.exp-route": "sticker.atom",
    "sticker.exp-bounce": "sticker.atom", "sticker.exp-gravity": "sticker.atom", "badge.fair-tester": "badge.science",
    "badge.power-lab": "badge.gold-star", "key.prototype-1": "key.gear-piece.badge", "key.prototype-2": "key.gear-piece.badge",
    "key.prototype-3": "key.gear-piece.badge", "sticker.grand-ultimate-delivery": "sticker.trophy",
    "sticker.grand-three-system-rescue": "sticker.trophy", "sticker.grand-egg-extreme": "sticker.trophy",
    "sticker.grand-power-saving-factory": "sticker.trophy", "sticker.grand-magnetic-water-lift": "sticker.trophy",
    "sticker.grand-autonomous-bridge": "sticker.trophy", "sticker.grand-flight-robot-relay": "sticker.trophy",
    "sticker.grand-great-bell-machine": "sticker.trophy", "sticker.grand-bolt-rescue": "sticker.trophy",
    "sticker.grand-sprockets-shortcut": "sticker.trophy", "sticker.grand-giant-chain-reaction": "sticker.trophy",
    "sticker.proto-reverse-conveyor": "sticker.star-burst", "sticker.proto-super-spring": "sticker.star-burst",
    "sticker.proto-magnet-maze": "sticker.star-burst", "sticker.proto-worm-gear-box": "sticker.star-burst",
    "sticker.proto-tiny-factory": "sticker.star-burst", "sticker.proto-no-wheels-allowed": "sticker.star-burst",
    "sticker.proto-five-systems": "sticker.star-burst", "sticker.proto-sprocket-shortcut": "sticker.star-burst",
    "badge.prototype-lab": "badge.diamond", "badge.campus-restored": "badge.laurel-crown"
};
/** The three prototype key pieces: not found yet, the one you're working towards, found. */
export const KEY_PIECE_PICTURES = { locked: "key.gear-piece.locked", filling: "key.gear-piece.filling", found: "key.gear-piece.badge" };
/** Discovery Book: a mystery card stands in for anything not found yet (by kind of discovery). */
export const MYSTERY_CARDS = { CONCEPT: "card.mystery.flask", COMBINATION: "card.mystery.creature", SECRET: "card.mystery.box" };
/** Discovery Book section and tab cards, and the small card beside each "in the real world" line. */
export const BOOK_CARDS = {
    CONCEPT: "card.tile.magnify-leaf", COMBINATION: "card.wavy.chemistry", SECRET: "card.wavy.telescope", PARTS: "card.tile.inventor-boy", REAL_WORLD: "card.wavy.earth-water"
};
/** The "Why did that happen?" card. */
export const WHY_CARD_PICTURE = "card.tile.inventor-girl";
/** Mission tiles that show a picture card: the five Science Fairs, the Experiment Lab and the Creature & Music labs. */
export const FAIR_CARDS = {
    "fair.motion-makers": "card.star.apple", "fair.strong-and-powered": "card.wavy.lightbulb", "fair.water-and-air-show": "card.star.evaporation",
    "fair.smart-machines": "card.wavy.robot", "fair.anything-goes": "card.tile.earth-cycle"
};
export const EXPERIMENT_CARD = "card.compare-flasks";
export const EXPERIMENT_CARDS = { "exp.which-pipe-fills-faster": "card.tile.water-clean-vs-dirty" };
export const CREATURE_CARD = "card.creature-pack";
/** M52: Job Board tiles whose job matches a spare nature card (a vegetable garden, a solar panel, water to pump). */
export const CONTRACT_CARDS = { "contract.water-the-rows": "card.wavy.sprout", "contract.panel-deployment": "card.tab.sun", "contract.pump-to-the-roof": "card.tab.water-drop", "contract.fountain-fix": "card.tab.water-drop" };
export function missionCard(labId, missionId) {
    var _a;
    if (labId === "contract-board")
        return CONTRACT_CARDS[missionId];
    if (labId === "science-fair")
        return FAIR_CARDS[missionId];
    if (labId === "experiment-lab")
        return (_a = EXPERIMENT_CARDS[missionId]) !== null && _a !== void 0 ? _a : EXPERIMENT_CARD;
    if (labId === "creature-music")
        return CREATURE_CARD;
    return undefined;
}
/** My Inventions: each invention card sits in the blank card frame. The "Make your own" button shows the toolbox. */
export const INVENTION_CARD_FRAME = "card.blank";
export const MAKE_YOUR_OWN_ICON = "ui.icon.toolbox";
/** Folder of each picture family (matches assets/manifest.json; checked by the tests). */
export function picturePath(art) {
    const folder = /^(sticker|badge|card|key|ui)\./.test(art) ? "ui" : art.startsWith("cos.") ? "inventor" : art.startsWith("char.") ? "char" : art.startsWith("level.") ? "level" : "parts";
    return `./assets/${folder}/${art}.webp`;
}
/** A picture with an emoji fallback (shown if the picture is missing or can't load). */
export function pictureOrEmoji(art, emoji, className) {
    const span = document.createElement("span");
    span.className = className;
    if (!art) {
        span.textContent = emoji;
        return span;
    }
    const img = document.createElement("img");
    img.src = picturePath(art);
    img.alt = "";
    img.className = "reward-pic";
    img.decoding = "async";
    img.addEventListener("error", () => { img.remove(); span.textContent = emoji; });
    span.append(img);
    return span;
}
/** A reward's picture (or its emoji). */
export function rewardIcon(reward, className) { return pictureOrEmoji(REWARD_PICTURES[reward.id], reward.icon, className); }
