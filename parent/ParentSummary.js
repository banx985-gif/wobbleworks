import { MOTION_PARENT_MAPPINGS } from "../motion/MotionYard.js";
import { GEAR_PARENT_MAPPINGS } from "../gears/GearGarage.js";
import { STRUCTURE_PARENT_MAPPINGS } from "../structures/BuilderBay.js";
import { LAB_MODULES } from "../labs/Labs.js";
import { CHAIN_PARENT_MAPPINGS } from "../chain/ChainWorkshop.js";
import { EXPERIMENT_PARENT_MAPPINGS } from "../experiment/ExperimentLab.js";
import { experimentTemplate } from "../experiment/ExperimentTemplates.js";
import { CHALLENGE_LAB, CONTRACT_BOARD, CREATURE_MUSIC, GRAND_HALL, MAIN_LABS, PROTOTYPE_LAB } from "../progression/CampaignData.js";
import { labCleared } from "../progression/LabProgression.js";
import { campaignComplete } from "../progression/Campus.js";
export const PARENT_CONCEPT_GROUPS = [
    { concept: "Force & Motion", mappings: MOTION_PARENT_MAPPINGS },
    { concept: "Gears & Mechanisms", mappings: GEAR_PARENT_MAPPINGS },
    { concept: "Structures & Forces", mappings: STRUCTURE_PARENT_MAPPINGS },
    ...LAB_MODULES.map(m => ({ concept: m.concept, mappings: m.parentMappings })),
    { concept: "Cause and effect", mappings: CHAIN_PARENT_MAPPINGS },
    { concept: "Fair tests", mappings: EXPERIMENT_PARENT_MAPPINGS }
];
/** The programming concepts (Robot Lab): shown in their own section. */
export const PROGRAMMING_GROUP = "Coding & Robots";
/** Things to try away from the screen, one set per concept area. Shown only for areas the child has explored. */
export const ACTIVITY_IDEAS = {
    "Force & Motion": ["Make a ramp from a book and roll a toy car down it. Then add another book — does the car go further?", "Roll a ball across carpet, then across a smooth floor. Where does it stop sooner, and why?"],
    "Gears & Mechanisms": ["Look at a bicycle together: turn the pedals slowly and count how often the back wheel turns.", "Find gears in a tin opener, an egg whisk or an old clock."],
    "Structures & Forces": ["Build a bridge from paper between two piles of books. Fold the paper into a zig-zag and test it again with coins.", "Spot the triangles in bridges, cranes and roofs on a walk."],
    "Electricity & Circuits": ["Look for switches around the home and talk about what each one turns on and off.", "If you have a torch, open it (with a grown-up) and find the battery, the switch and the bulb."],
    "Magnetism": ["Use a fridge magnet to sort a handful of objects: which ones stick, and are they all metal?", "Feel two magnets push apart and pull together — then turn one round."],
    "Water & Flow": ["In the bath or sink, pour water from different heights and through a funnel. Can you make it go uphill?", "Water a plant and watch where the water goes."],
    "Flight": ["Make paper aeroplanes with different wings and test which flies furthest.", "Drop a flat sheet of paper and a scrunched-up one at the same time. Why is one slower?"],
    "Coding & Robots": ["Play 'robot': one person gives step-by-step instructions to cross the room, the other follows them exactly.", "Add an IF rule to the game: 'IF you reach a chair, THEN turn left'."],
    "Space": ["Drop a ball and a feather-light piece of paper. Talk about why the Moon would be different.", "Look at the Moon on a clear evening and find out why astronauts bounce there."],
    "Cause and effect": ["Set up a line of dominoes or books and knock over the first one.", "Build a chain reaction with toys: something rolls, hits something, which falls on something else."],
    "Fair tests": ["Test two paper aeroplanes, changing only one thing. Is that a fair test?", "Ask 'which melts faster?' and test it fairly with two ice cubes."]
};
/** Words the Parent Dashboard must never use about a child (tested against everything it shows). */
export const JUDGEMENT_WORDS = ["grade", "score", "iq", "gifted", "talented", "smart", "clever", "genius", "behind", "struggl", "slow learner", "below average", "above average", "diagnos", "disorder", "ability", "abilities", "rank", "test result", "bad at", "good at", "better than", "worse than"];
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
function completed(p) { return new Set(Object.entries(p.levels).filter(([, r]) => r.completed).map(([id]) => id)); }
export function childSummary(save, p) {
    var _a, _b;
    const found = new Set(p.discoveries);
    const done = completed(p);
    const groups = PARENT_CONCEPT_GROUPS.map(g => ({ concept: g.concept, evidence: g.mappings.filter(m => found.has(m.discoveryId)).map(m => m.evidence) })).filter(g => g.evidence.length);
    const programming = (_b = (_a = groups.find(g => g.concept === PROGRAMMING_GROUP)) === null || _a === void 0 ? void 0 : _a.evidence) !== null && _b !== void 0 ? _b : [];
    const labs = [];
    for (const lab of MAIN_LABS) {
        const n = lab.missions.filter(m => done.has(m.id)).length;
        if (!n)
            continue;
        const mega = lab.missions.find(m => m.slot === "MEGA");
        const restored = labCleared(lab, done);
        labs.push({ title: lab.title, line: `${restored ? "Restored" : "In progress"} · ${n} of ${lab.missions.length} missions finished${mega && done.has(mega.id) ? " · built the Mega Build" : ""}` });
    }
    for (const [set, what] of [[GRAND_HALL, "Grand Hall challenges"], [PROTOTYPE_LAB, "Prototype Lab challenges"], [CREATURE_MUSIC, "creature and music machines"], [CHALLENGE_LAB, "Challenge Lab challenges"], [CONTRACT_BOARD, "jobs for campus visitors"]]) {
        const n = set.missions.filter(m => done.has(m.id)).length;
        if (n)
            labs.push({ title: set.title, line: `${n} of ${set.missions.length} ${what} finished` });
    }
    if (campaignComplete(save) && p.id === save.activeProfileId)
        labs.push({ title: "WobbleWorks campus", line: "Ran the Great WobbleWorks Machine — the whole campus is restored" });
    const experiments = [];
    if (p.experiments.length) {
        const questions = [...new Set(p.experiments.map(e => { var _a; return (_a = experimentTemplate(e.templateId)) === null || _a === void 0 ? void 0 : _a.question; }).filter((q) => Boolean(q)))];
        experiments.push(`Saved ${plural(p.experiments.length, "experiment")} with ${plural(p.experiments.reduce((n, e) => n + e.trials.length, 0), "measured test")}`);
        const guessed = p.experiments.filter(e => e.prediction).length;
        if (guessed)
            experiments.push(`Made a prediction before testing in ${plural(guessed, "experiment")}`);
        for (const q of questions)
            experiments.push(`Asked: “${q}”`);
    }
    const making = [];
    if (p.inventions.length)
        making.push(`Saved ${plural(p.inventions.length, "invention")} (${plural(p.inventions.reduce((n, i) => n + i.versions.length, 0), "version")} in all)`);
    if (p.fairs.length)
        making.push(`Entered ${plural(p.fairs.length, "Science Fair project")}`);
    const longest = p.records["chain.longest"];
    if (longest)
        making.push(`Built a chain reaction ${plural(longest, "step")} long`);
    const made = save.customChallenges.filter(c => c.creatorProfileId === p.id).length;
    if (made)
        making.push(`Made ${plural(made, "challenge")} for others to play — and solved each one first`);
    const tryAtHome = groups.map(g => { var _a; return ({ concept: g.concept, ideas: (_a = ACTIVITY_IDEAS[g.concept]) !== null && _a !== void 0 ? _a : [] }); }).filter(t => t.ideas.length);
    return { name: p.name, lastPlayed: p.lastPlayedAtMs > 1e12 ? new Date(p.lastPlayedAtMs).toLocaleDateString() : "", concepts: groups, programming, labs, experiments, making, tryAtHome };
}
/** Plain-language information for grown-ups. Every statement here must stay true of the build (see tests). */
export const PRIVACY_POINTS = [
    "Everything is saved on this device only. There are no accounts and no sign-in.",
    "WobbleWorks has no adverts, no chat and no in-game messages from strangers.",
    "The game does not send your child's name, progress or creations anywhere. It only downloads its own pictures and levels.",
    "Spoken narration uses your device's own voices. Some browsers use an online voice service for this — you can switch narration off in Settings.",
    "Backups are files you choose to save yourself. Challenges your child makes stay on this device.",
    "Photos made in Photo Mode are saved only where you choose to save them."
];
export const HELP_POINTS = [
    "Children build with parts from the tray, press TEST to see what happens, and STOP to put everything back. Failing is part of the fun — every test teaches something.",
    "Stuck? The 💡 Clue button gives an idea first, then shows useful parts, then part of one working answer. Using it never costs stars.",
    "Each child has their own inventor profile with their own progress. Settings like text size, narration and reduced motion are in ⚙️ Settings.",
    "Make a backup now and then (below). Importing a backup replaces what is on this device, and keeps a safety copy first.",
    "The free part of the game is the opening, the whole Motion Yard and the Empty Workshop. The full game opens the rest of the campus."
];
export const ABOUT_POINTS = [
    "WobbleWorks — made with love by Banx Games.",
    "The science in WobbleWorks is simplified for play, but each lab follows a written 'truth contract' so it never teaches something false.",
    "Version details and the full terms and privacy notice will be published with the store release."
];
