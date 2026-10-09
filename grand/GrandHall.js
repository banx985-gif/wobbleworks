import { activeProfile, updateProfile } from "../app/AppState.js";
import { campaignComplete, regionStatus } from "../progression/Campus.js";
import { recordMissionSuccess } from "../progression/ProgressionManager.js";
export const GRAND_HALL_ID = "grand-invention-hall";
export const FINAL_CHALLENGE_ID = "grand.great-wobbleworks-machine";
/** The final campus switch: the last stage of the Great WobbleWorks Machine (its own room, content/grand). */
export const CAMPUS_SWITCH_ROOM = "grand.campus-switch";
const S = (baseLevelId, line, seconds) => ({ baseLevelId, line, ...(seconds !== undefined ? { seconds } : {}) });
export const GRAND_CHALLENGES = [
    { id: "grand.ultimate-delivery", title: "Ultimate Delivery Machine", icon: "📦", story: "Three deliveries, three different ways: rolling, motor power and magnets.", stages: [
            S("motion.giant-marble-delivery", "First, the giant marble has to roll all the way to the bin!"),
            S("power.motor-power", "Now a motor has to do the carrying."),
            S("magnet.magnet-transport", "Last one: move it with a magnet — no hands!")
        ] },
    { id: "grand.three-system-rescue", title: "Three-System Rescue", icon: "🛟", story: "Gears, a bridge and a ramp — three rescues in a row.", stages: [
            S("gear.lift-bolt", "Help! Lift me up with gears, please!"),
            S("builder.bridge-the-gap", "Now build a bridge across the gap."),
            S("motion.ramp-rescue", "And roll the stranded ball home with a ramp!")
        ] },
    { id: "grand.egg-extreme", title: "Keep the Egg Safe — Extreme", icon: "🥚", story: "Two drops. One very nervous egg.", stages: [
            S("flight.safe-landing", "Drop number one: bring it down gently!"),
            S("builder.keep-the-egg-safe", "Drop number two: build something to protect it!")
        ] },
    { id: "grand.power-saving-factory", title: "The Power-Saving Factory", icon: "🔋", story: "Run the factory without wasting a drop of power.", stages: [
            S("power.save-the-battery", "Only switch things on when they're needed."),
            S("power.blackout", "Uh-oh, a blackout! Get the lights back."),
            S("gear.jammed-factory-drive", "And now the factory drive is jammed — get it turning!")
        ] },
    { id: "grand.magnetic-water-lift", title: "Magnetic Water Lift", icon: "🧲", story: "Lift with magnets, then lift with water.", stages: [
            S("magnet.electromagnet-crane", "Switch the electromagnet on to pick up the crates."),
            S("water.pump-it-up", "Now pump the water all the way up!")
        ] },
    { id: "grand.autonomous-bridge", title: "Autonomous Bridge Builder", icon: "🤖", story: "A robot to fetch the parts, and a bridge strong enough for the parade.", stages: [
            S("robot.carry-the-box", "Program the robot to carry the box over."),
            S("builder.the-robot-parade-bridge", "Then build a bridge the whole robot parade can cross!")
        ] },
    { id: "grand.flight-robot-relay", title: "Flight + Robot Relay", icon: "✈️", story: "Fly it across, then hand over to the robot.", stages: [
            S("flight.cross-the-canyon", "Fly across the canyon!"),
            S("robot.carry-the-box", "Robot, your turn: carry it the rest of the way.")
        ] },
    { id: "grand.great-bell-machine", title: "The Great Bell Machine", icon: "🔔", story: "Ring every bell, then ring through three systems.", stages: [
            S("chain.bell-ringer", "One push — all the bells!"),
            S("chain.three-domains", "Now make the chain pass through three different systems.")
        ] },
    { id: "grand.bolt-rescue", title: "Bolt Rescue", icon: "🦺", story: "Bolt is stuck on the roof — and the roof is wobbling!", stages: [
            S("builder.roof-rescue", "Get me down off the roof, please!"),
            S("builder.collapsing-workshop-roof", "Quick, hold the roof up before it falls!")
        ] },
    { id: "grand.sprockets-shortcut", title: "Sprocket's Impossible Shortcut", icon: "🐕", story: "Sprocket wants to get there FAST. Beat the clock!", stages: [
            S("flight.flying-sprocket", "Get Sprocket flying — in 6 seconds!", 6),
            S("flight.through-the-hoops", "Through the hoops — in 4 seconds!", 4)
        ] },
    { id: "grand.giant-chain-reaction", title: "The Giant Chain Reaction", icon: "⛓️", story: "The biggest chain reactions on campus.", stages: [
            S("chain.no-repeats", "A long chain where no step repeats!"),
            S("chain.up-down-around", "Up, down and around!")
        ] },
    { id: FINAL_CHALLENGE_ID, title: "The Great WobbleWorks Machine", icon: "🏛️", story: "Every system, all at once — the machine that wakes up the whole campus.", stages: [
            S("motion.make-it-farther", "Motion! Send it far."),
            S("gear.three-fans", "Gears! Spin all three fans."),
            S("builder.tallest-tower", "Structures! Build it tall."),
            S("power.restore-the-power-grid", "Electricity! Power the grid."),
            S("magnet.the-giant-scrap-sorter", "Magnets! Sort the scrap."),
            S("water.the-grand-fountain", "Water! Start the fountain."),
            S("flight.the-canyon-flyer", "Air! Fly the canyon."),
            S("robot.automated-factory", "Programs! Run the factory."),
            S("space.launch-straight", "Space! Launch it straight up."),
            S(CAMPUS_SWITCH_ROOM, "The final campus switch! Make enough power to light the great beacon.")
        ] }
];
export function grandChallengeById(id) { return GRAND_CHALLENGES.find(c => c.id === id); }
/** The level id of a stage (n counts from 0): content/grand/<challenge>.<n + 1>.json. */
export function grandStageLevelId(challengeId, n) { return `${challengeId}.${n + 1}`; }
export const GRAND_STAGE_LEVEL_IDS = GRAND_CHALLENGES.flatMap(c => c.stages.map((_, n) => grandStageLevelId(c.id, n)));
/** Which challenge and stage a stage level belongs to. */
export function grandStageOf(levelId) {
    for (const c of GRAND_CHALLENGES)
        for (let n = 0; n < c.stages.length; n++)
            if (grandStageLevelId(c.id, n) === levelId)
                return { challenge: c, stage: n };
    return undefined;
}
const stageKey = (id) => `${id}.stage`;
/** The stage this inventor is on (0 = the first). Kept in their records, so leaving and coming back carries on. */
export function grandStage(save, id) {
    const c = grandChallengeById(id);
    const v = activeProfile(save)?.records[stageKey(id)] ?? 0;
    return c ? Math.max(0, Math.min(c.stages.length - 1, Math.floor(v))) : 0;
}
export function withGrandStage(save, id, n) {
    const p = activeProfile(save);
    const c = grandChallengeById(id);
    if (!p || !c)
        return save;
    const v = Math.max(0, Math.min(c.stages.length - 1, Math.floor(n)));
    return updateProfile(save, p.id, q => ({ ...q, records: { ...q.records, [stageKey(id)]: v } }));
}
/**
 * A stage was solved. Every stage but the last just moves the challenge on to the next stage. The last one completes
 * the challenge itself (its sticker, or for the Great WobbleWorks Machine the campus-restored badge) and sets the
 * stage back to the start, so playing it again starts from stage 1.
 */
export function completeGrandStage(save, id, stage, evidence) {
    const c = grandChallengeById(id);
    if (!c)
        return { save };
    if (stage < c.stages.length - 1)
        return { save: withGrandStage(save, id, stage + 1), next: stage + 1 };
    const outcome = recordMissionSuccess(withGrandStage(save, id, 0), id, evidence);
    return { save: outcome.save, outcome };
}
/** The Hall opens once every lab is restored, in the full game. */
export function grandHallOpen(save, installed) { const st = regionStatus(save, GRAND_HALL_ID, installed); return st === "OPEN" || st === "CLEARED"; }
/** The first 11 challenges can be played in any order; the Great WobbleWorks Machine waits for all of them. */
export function grandChallengeOpen(save, id, completed) {
    if (!grandChallengeById(id))
        return false;
    if (id !== FINAL_CHALLENGE_ID)
        return true;
    return GRAND_CHALLENGES.every(c => c.id === FINAL_CHALLENGE_ID || completed.has(c.id));
}
export { campaignComplete };
