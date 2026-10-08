import { activeProfile, updateProfile } from "../app/AppState.js";
import { MAIN_LABS } from "../progression/CampaignData.js";
import { clearedLabIds } from "../progression/Campus.js";
/** The founder's old recordings and Bolt's memories, one set per lab (campaign order). */
const LAB_STORY = {
    "motion-yard": { entry: ["This is where every invention starts: rolling, pushing and bumping.", "The test track has been asleep for ages. Let's wake it up!"],
        recording: ["Note to self: marbles roll further on smooth floors.", "Note to self, number two: stop leaving marbles on smooth floors."],
        system: "Motion", clue: "The great machine starts with a push: a ball rolling down a ramp sets everything going.",
        memory: ["I remember racing carts down this track with someone in a big lab coat.", "She always cheered when they crashed. Was that… a good thing?"] },
    "gear-garage": { entry: ["Gears! Big ones, little ones — all stuck.", "Something in here makes the whole campus turn."],
        recording: ["Day forty-one. Small gear turns a big gear: the big one goes slow but strong.", "Like me before breakfast."],
        system: "Gears", clue: "Gears and belts carry the turning from one end of the great machine to the other.",
        memory: ["I used to oil these gears every morning with a tiny oil can.", "I wonder where it went…"] },
    "builder-bay": { entry: ["Careful — wobbly roof!", "Builder Bay is where the campus learned to stand up straight."],
        recording: ["Triangles, team. Always triangles.", "Squares are lovely, but squares fall over."],
        system: "Structures", clue: "The great machine needs a tall frame to hold it up — braced with triangles.",
        memory: ["I remember holding a ladder while she built a very, VERY tall tower.", "I wasn't allowed to wobble."] },
    "power-lab": { entry: ["It's so dark in here!", "The Power Lab sends electricity all over campus — when it works."],
        recording: ["Electricity only flows round a complete loop.", "I tested this by leaving a gap. Nothing happened. Science!"],
        system: "Electricity", clue: "A battery and a switch wake the motors that drive the great machine.",
        memory: ["I remember my very first charge.", "Someone said: “Welcome to the team, Bolt.” That's me! I'm Bolt!"] },
    "magnet-factory": { entry: ["Ooh — everything in here wants to stick to me.", "The Magnet Factory sorts metal for the whole campus."],
        recording: ["Opposite ends pull together. Same ends push apart.", "Bolt and my spoons: always pulling together. Mysteriously."],
        system: "Magnetism", clue: "Magnets in the great machine lift and sort its metal parts without touching them.",
        memory: ["I remember a magnet pulled me right across this floor.", "Very fast. Very sideways."] },
    "water-works": { entry: ["Drip… drip… the pipes are leaking!", "Water Works keeps the campus watered and the wheels turning."],
        recording: ["Water always goes downhill, unless you pump it.", "I tried asking it nicely. It still went downhill."],
        system: "Water", clue: "Water runs down through the great machine and turns a water wheel on the way.",
        memory: ["I remember the fountain on the first day of spring.", "Everyone got splashed. I got a bit rusty. Worth it."] },
    "flight-hangar": { entry: ["Look up! The old planes are covered in dust.", "Let's make something fly."],
        recording: ["Wings lift, tails steady, propellers push.", "Remember that — and don't fly into the coffee machine. Again."],
        system: "Air", clue: "Fans and balloons carry things up through the air to the great machine's top floor.",
        memory: ["I remember a paper plane looping all the way round this hangar.", "She said it was the best day ever. She said that a lot."] },
    "robot-lab": { entry: ["My cousins! Well… sort of.", "These robots can't do anything until someone writes them a program."],
        recording: ["Robots do EXACTLY what you tell them.", "I told one to fetch the tea. It fetched the kettle. And the table."],
        system: "Programming", clue: "Robots follow programs to keep every part of the great machine working in the right order.",
        memory: ["I wrote my first program right here.", "It was one block long. It said “Forward”. I'm very proud of it."] },
    "space-centre": { entry: ["The Space Centre! The launch tower is broken…", "…but the sky is still up there, waiting for us."],
        recording: ["On the Moon you weigh less — but you're still just as much YOU.", "Same mass, different weight. Note: bring snacks."],
        system: "Everything together", clue: "Last piece: the great machine isn't one machine at all. It's EVERY system working together — so it must be rebuilt carefully, one safe step at a time.",
        memory: ["I remember now. The great machine got too wobbly, so she switched everything off to keep us all safe.", "She left me charging so I could help the next inventor. That's YOU!"] }
};
export const FOUNDER = "Professor Wobble";
const LAB_ICON_ART = { "motion-yard": "icon.speed", "gear-garage": "icon.gear-yellow", "builder-bay": "level.scaffold-tower", "power-lab": "icon.battery-charge", "magnet-factory": "icon.magnet", "water-works": "icon.water-drop", "flight-hangar": "icon.biplane", "robot-lab": "icon.robot", "space-centre": "icon.rocket" };
/** Reading time: about two and a half words a second plus a moment to look, never under 5 or over 20 seconds. */
export function sceneSeconds(lines) {
    const words = lines.join(" ").split(/\s+/).filter(Boolean).length;
    return Math.max(5, Math.min(20, Math.round(words / 2.5 + 2.5)));
}
function scene(id, kind, labId, kicker, title, speaker, lines, art) {
    return { id, kind, labId, kicker, title, speaker, lines, art, seconds: sceneSeconds(lines), skippable: true };
}
export function labStoryScenes(labId) {
    const s = LAB_STORY[labId];
    const lab = MAIN_LABS.find(l => l.id === labId);
    if (!s || !lab)
        throw new Error(`No story for ${labId}`);
    const art = LAB_ICON_ART[labId] ?? "ui.icon.tools";
    return {
        entry: scene(`entry.${labId}`, "ENTRY", labId, "NEW LAB", lab.title, "Bolt", s.entry, art),
        recording: scene(`recording.${labId}`, "RECORDING", labId, "OLD INVENTOR RECORDING", `${FOUNDER}'s ${lab.title} notes`, FOUNDER, s.recording, "ui.icon.voice-bubble"),
        blueprint: scene(`blueprint.${labId}`, "BLUEPRINT", labId, "BLUEPRINT FRAGMENT", `The great machine: ${s.system}`, "Bolt", [s.clue], "ui.icon.blueprint"),
        memory: scene(`memory.${labId}`, "MEMORY", labId, "BOLT REMEMBERS", "A memory comes back", "Bolt", s.memory, "hub.prop.bolt-charger")
    };
}
export const CENTRAL_MACHINE_SYSTEMS = MAIN_LABS.map(l => LAB_STORY[l.id].system);
export const FINALE_CLUE = scene("finale.blueprint", "FINALE", "grand-invention-hall", "BLUEPRINT COMPLETE", "The Great WobbleWorks Machine", "Bolt", ["All nine pieces fit together!", "The great machine needs motion, gears, structures, electricity, magnets, water, air and programs — all at once.", "It's waiting in the Grand Invention Hall."], "ui.icon.blueprint");
function seen(save) { return new Set(activeProfile(save)?.restorationSeen ?? []); }
function megaDone(save, labId) { const lab = MAIN_LABS.find(l => l.id === labId); const p = activeProfile(save); const mega = lab?.missions.find(m => m.slot === "MEGA"); return Boolean(p && mega && p.levels[mega.id]?.completed); }
/** Every story piece this inventor has found so far, in campaign order (derived from progress). */
export function collectedStory(save) {
    const cleared = new Set(clearedLabIds(save));
    const recordings = [], blueprints = [], memories = [];
    for (const lab of MAIN_LABS) {
        const s = labStoryScenes(lab.id);
        if (megaDone(save, lab.id))
            recordings.push(s.recording);
        if (cleared.has(lab.id)) {
            blueprints.push(s.blueprint);
            memories.push(s.memory);
        }
    }
    return { recordings, blueprints, memories, complete: blueprints.length === MAIN_LABS.length };
}
/** The first-visit moment for a lab, if this inventor hasn't watched it yet. */
export function pendingEntryScene(save, labId) {
    if (!activeProfile(save) || !LAB_STORY[labId])
        return undefined;
    const s = labStoryScenes(labId).entry;
    return seen(save).has(`story.${s.id}`) ? undefined : s;
}
/** Story moments earned but not watched yet (recordings, then blueprint + memory per lab, then the finale clue). */
export function pendingStoryScenes(save) {
    if (!activeProfile(save))
        return [];
    const c = collectedStory(save);
    const done = seen(save);
    const out = [];
    for (const lab of MAIN_LABS)
        for (const s of [c.recordings, c.blueprints, c.memories].flatMap(list => list.filter(x => x.labId === lab.id)))
            if (!done.has(`story.${s.id}`))
                out.push(s);
    if (c.complete && !done.has(`story.${FINALE_CLUE.id}`))
        out.push(FINALE_CLUE);
    return out;
}
export function markStorySeen(save, scenes) {
    const p = activeProfile(save);
    if (!p)
        return save;
    return updateProfile(save, p.id, q => ({ ...q, restorationSeen: [...new Set([...q.restorationSeen, ...scenes.map(s => `story.${s.id}`)])] }));
}
