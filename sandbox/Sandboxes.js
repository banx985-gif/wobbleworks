import { activeProfile } from "../app/AppState.js";
import { campaignComplete, clearedLabIds, ownsFullGame } from "../progression/Campus.js";
export const CAMPAIGN_PART_CAP = 80;
export const SANDBOX_PART_CAP = 120;
export const EVERYTHING_PART_CAP = 180;
/** Warn when a build reaches this share of its cap. */
export const CAP_WARNING = 0.8;
const ALL_MODS = ["WIND", "RAIN", "SLIPPERY", "LOW_GRAVITY", "STRONG_GRAVITY", "MOVING_PLATFORMS", "WATER_AREA", "LIMITED_POWER", "UNEVEN_GROUND"];
export const SANDBOXES = [
    { id: "sandbox.empty-workshop", title: "Empty Workshop", icon: "🧰", theme: "workshop", free: true, modifiers: ["RAIN", "SLIPPERY", "UNEVEN_GROUND"], prompts: ["Build something that rolls all the way across the room.", "Can you make a ball land in a bucket?", "Make the longest slide you can."], templates: ["tpl.ramp-ball", "tpl.cart"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.test-track", title: "Test Track", icon: "🏁", theme: "motion", free: false, needs: "motion-yard", modifiers: ["WIND", "SLIPPERY", "RAIN", "UNEVEN_GROUND", "MOVING_PLATFORMS"], prompts: ["Which goes farther: a ball or a toy car?", "Build something that stops on the grippy strip.", "Race two things down the same ramp."], templates: ["tpl.ramp-ball", "tpl.cart"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.tall-tower-room", title: "Tall Tower Room", icon: "🗼", theme: "builder", free: false, needs: "builder-bay", modifiers: ["WIND", "STRONG_GRAVITY", "LOW_GRAVITY"], prompts: ["How tall can you build before it wobbles?", "Build a tower past the 5 metre sign.", "Turn on the wind. Does your tower stand?"], templates: ["tpl.braced-frame"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.water-room", title: "Water Room", icon: "🚿", theme: "water-works", free: false, needs: "water-works", modifiers: ["WATER_AREA", "LIMITED_POWER"], prompts: ["Fill the tank without spilling on the dry zone.", "Pump water uphill.", "Make a fountain."], templates: ["tpl.pump-loop"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.flight-room", title: "Flight Room", icon: "✈️", theme: "flight-hangar", free: false, needs: "flight-hangar", modifiers: ["WIND", "RAIN", "LOW_GRAVITY"], prompts: ["Fly through every hoop.", "Land gently in the landing zone.", "Turn on the wind. Can your glider still fly straight?"], templates: ["tpl.glider"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.robot-arena", title: "Robot Arena", icon: "🤖", theme: "robot-lab", free: false, needs: "robot-lab", modifiers: [], prompts: ["Program a robot to reach the flag.", "Make a robot follow the colours.", "Make two robots dance."], templates: ["tpl.robot"], partCap: SANDBOX_PART_CAP, robotFloor: true },
    { id: "sandbox.construction-yard", title: "Construction Yard", icon: "🏗️", theme: "builder", free: false, needs: "builder-bay", modifiers: ["WIND", "STRONG_GRAVITY", "UNEVEN_GROUND"], prompts: ["Bridge the gap so the load holds.", "Build a crane.", "Use the fewest beams that still hold."], templates: ["tpl.braced-frame"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.toy-city", title: "Toy City", icon: "🏙️", theme: "toy-city", free: false, needs: "gear-garage", modifiers: ["RAIN", "SLIPPERY", "MOVING_PLATFORMS", "UNEVEN_GROUND"], prompts: ["Deliver a parcel to the green target.", "Build a ramp from the rooftop to the street.", "Make a toy car jump the gap."], templates: ["tpl.cart", "tpl.gear-pair"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.windy-mountain", title: "Windy Mountain", icon: "🏔️", theme: "windy-mountain", free: false, needs: "flight-hangar", modifiers: ["WIND", "RAIN", "SLIPPERY", "UNEVEN_GROUND"], defaultModifiers: ["WIND"], prompts: ["Let the wind carry something to the far side.", "Build something the wind can't blow over.", "Fly a glider with the wind behind it."], templates: ["tpl.glider"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.water-test-tank", title: "Water Test Tank", icon: "🛁", theme: "water-works", free: false, needs: "water-works", modifiers: ["WATER_AREA"], defaultModifiers: ["WATER_AREA"], prompts: ["Build pipes that fill the tank evenly.", "Make the water go round a corner.", "Floating and sinking tests are coming in a later update."], templates: ["tpl.pump-loop"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.moon-lab", title: "Moon Lab", icon: "🌙", theme: "space-centre", free: false, needs: "space-centre", modifiers: ["MOVING_PLATFORMS", "UNEVEN_GROUND"], prompts: ["Drop a feather and a bowling ball together. Which lands first?", "Build a rover that crosses the room.", "How high can a spring throw a ball here?"], templates: ["tpl.rover"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.crazy-lab", title: "Crazy Lab", icon: "🎪", theme: "crazy-lab", free: false, needs: "magnet-factory", modifiers: ALL_MODS, defaultModifiers: ["MOVING_PLATFORMS"], prompts: ["Make the silliest machine you can.", "Bounce the duck into the bucket.", "Turn on EVERYTHING. What happens?"], templates: ["tpl.ramp-ball", "tpl.gear-pair"], partCap: SANDBOX_PART_CAP },
    { id: "sandbox.everything-lab", title: "Everything Lab", icon: "🌈", theme: "everything-lab", free: false, needs: "ALL", modifiers: ALL_MODS, prompts: ["Combine three different systems in one machine.", "Build a machine that uses every lab you've restored.", "Make a chain reaction that ends with a flying duck."], templates: ["tpl.ramp-ball", "tpl.gear-pair", "tpl.pump-loop", "tpl.circuit"], partCap: EVERYTHING_PART_CAP }
];
export function sandboxById(id) { return SANDBOXES.find(s => s.id === id); }
/** Is a room open to this inventor? Free rooms with Free Build; the rest with the full game and their lab restored. */
export function sandboxOpen(save, id) {
    const s = sandboxById(id);
    const p = activeProfile(save);
    if (!s || !p || !p.freeBuildUnlocked)
        return false;
    if (s.free)
        return true;
    if (!ownsFullGame(save.entitlement))
        return false;
    const cleared = new Set(clearedLabIds(save));
    // The Everything Lab is the campaign's reward: it opens when the Great WobbleWorks Machine runs (M32).
    return s.needs === "ALL" ? campaignComplete(save) : !s.needs || cleared.has(s.needs);
}
/** The locked sandbox spawn catalogue (§16): every object type maps to a real part. */
export const SPAWN_CATALOGUE = [
    { type: "Ball", definitionId: "motion.ball", icon: "⚽" }, { type: "Marble", definitionId: "motion.marble", icon: "🔮" }, { type: "Crate", definitionId: "gear.heavy-crate", icon: "📦" },
    { type: "Egg", definitionId: "sandbox.egg", icon: "🥚" }, { type: "Rubber duck", definitionId: "silly.duck", icon: "🦆" }, { type: "Toy car", definitionId: "sandbox.toy-car", icon: "🚗" },
    { type: "Balloon", definitionId: "sandbox.balloon", icon: "🎈" }, { type: "Weight", definitionId: "sandbox.weight", icon: "🏋️" }, { type: "Bowling ball", definitionId: "sandbox.bowling-ball", icon: "🎳" },
    { type: "Feather", definitionId: "sandbox.feather", icon: "🪶" }, { type: "Block", definitionId: "scrap.wood-block", icon: "🧱" }, { type: "Target", definitionId: "motion.goal-zone", icon: "🎯" },
    { type: "Bell", definitionId: "chain.bell", icon: "🔔" }, { type: "Switch", definitionId: "circuit.switch", icon: "🔘" }, { type: "Fragile vase", definitionId: "scrap.glass-vase", icon: "🏺" },
    { type: "Toy animal", definitionId: "sandbox.toy-animal", icon: "🐶" }, { type: "Bolt", definitionId: "silly.bolt", icon: "🤖" }, { type: "Sprocket", definitionId: "sandbox.sprocket", icon: "🐕" },
    { type: "Robot", definitionId: "robot.bot", icon: "🦾" }, { type: "Water tank", definitionId: "plumb.tank", icon: "🛢️" }, { type: "Fan", definitionId: "flight.fan", icon: "🌀" },
    { type: "Ramp", definitionId: "motion.ramp", icon: "📐" }, { type: "Obstacle", definitionId: "motion.barrier", icon: "🚧" }
];
/** What each modifier puts into the room (locked, tagged modifier.<id>). Rain and ponds are looks only. */
export const MODIFIER_PARTS = {
    WIND: [{ definitionId: "sandbox.wind-zone", x: 8, y: 4.5, parameters: { width: 16, height: 7.6, speed: 3, angle: 0 } }],
    RAIN: [{ definitionId: "sandbox.rain", x: 8, y: 1 }],
    SLIPPERY: [{ definitionId: "sandbox.ice-floor", x: 8, y: 8.34 }],
    LOW_GRAVITY: [{ definitionId: "space.gravity-zone", x: 8, y: 4.2, parameters: { width: 16, g: 1.62, air: true, label: "LOW GRAVITY" } }],
    STRONG_GRAVITY: [{ definitionId: "space.gravity-zone", x: 8, y: 4.2, parameters: { width: 16, g: 15, air: true, label: "SUPER GRAVITY" } }],
    MOVING_PLATFORMS: [{ definitionId: "sandbox.moving-platform", x: 8, y: 5.2, parameters: { dx: 4, period: 5 } }],
    WATER_AREA: [{ definitionId: "sandbox.water-area", x: 12.5, y: 7.6, parameters: { width: 5, height: 1.6 } }],
    LIMITED_POWER: [{ definitionId: "sandbox.power-limit", x: 15, y: 1.2, parameters: { capacity: 20 } }],
    UNEVEN_GROUND: [{ definitionId: "motion.ramp", x: 5.2, y: 8.16, rotation: -0.25 }, { definitionId: "motion.ramp", x: 7.3, y: 8.16, rotation: 0.25 }]
};
export const MODIFIER_LABELS = {
    WIND: { label: "Wind", icon: "🌬️" }, RAIN: { label: "Rain (just for looks)", icon: "🌧️" }, SLIPPERY: { label: "Icy floor", icon: "🧊" }, LOW_GRAVITY: { label: "Low gravity", icon: "🪐" }, STRONG_GRAVITY: { label: "Super gravity", icon: "⬇️" },
    MOVING_PLATFORMS: { label: "Moving platform", icon: "↔️" }, WATER_AREA: { label: "Pond (just for looks)", icon: "💧" }, LIMITED_POWER: { label: "Limited power", icon: "🪫" }, UNEVEN_GROUND: { label: "Bumpy ground", icon: "⛰️" }
};
/** Turn a modifier on or off: returns the parts with that modifier's room pieces added or removed. */
export function withModifier(parts, id, on) {
    const tag = `modifier.${id.toLowerCase()}`;
    const rest = parts.filter(p => { var _a; return !((_a = p.tags) === null || _a === void 0 ? void 0 : _a.includes(tag)); });
    if (!on)
        return rest;
    // Only one gravity at a time.
    const other = id === "LOW_GRAVITY" ? "modifier.strong_gravity" : id === "STRONG_GRAVITY" ? "modifier.low_gravity" : undefined;
    return [...rest.filter(p => { var _a; return !other || !((_a = p.tags) === null || _a === void 0 ? void 0 : _a.includes(other)); }), ...MODIFIER_PARTS[id].map((m, i) => { var _a, _b; return ({ id: `${tag}-${i}`, definitionId: m.definitionId, position: { x: m.x, y: m.y }, rotation: (_a = m.rotation) !== null && _a !== void 0 ? _a : 0, parameters: { locked: true, ...((_b = m.parameters) !== null && _b !== void 0 ? _b : {}) }, tags: [tag, "sandbox.room"] }); })];
}
export function activeModifiers(parts) { return Object.keys(MODIFIER_PARTS).filter(id => parts.some(p => { var _a; return (_a = p.tags) === null || _a === void 0 ? void 0 : _a.includes(`modifier.${id.toLowerCase()}`); })); }
/** Starter templates: small machines that drop in and work straight away (positions relative to where they land). */
export const SANDBOX_TEMPLATES = [
    { id: "tpl.ramp-ball", title: "Ramp and ball", parts: [{ definitionId: "motion.ramp", x: 0, y: 0, rotation: 0.35 }, { definitionId: "motion.ball", x: -0.8, y: -1.2 }] },
    { id: "tpl.cart", title: "Cart with wheels", parts: [{ definitionId: "sandbox.toy-car", x: 0, y: 0 }] },
    { id: "tpl.braced-frame", title: "Braced frame", parts: [{ definitionId: "builder.beam-wood", x: -1, y: 1, rotation: -Math.PI / 2, parameters: { length: 2 } }, { definitionId: "builder.beam-wood", x: 1, y: 1, rotation: -Math.PI / 2, parameters: { length: 2 } }, { definitionId: "builder.beam-wood", x: 0, y: 0, parameters: { length: 2 } }, { definitionId: "builder.brace", x: 0, y: 1, rotation: -Math.PI / 4, parameters: { length: 2 * Math.SQRT2 } }] },
    { id: "tpl.pump-loop", title: "Pump and tank", parts: [{ definitionId: "plumb.source", x: -3, y: 1 }, { definitionId: "plumb.tank", x: 2, y: 0 }] },
    { id: "tpl.glider", title: "Glider", parts: [{ definitionId: "flight.glider", x: 0, y: 0, parameters: { initialVx: 3 } }, { definitionId: "flight.wing-large", x: 0.1, y: -0.12 }, { definitionId: "flight.tail", x: -0.5, y: -0.16 }] },
    { id: "tpl.robot", title: "Robot", parts: [{ definitionId: "robot.bot", x: 0, y: 0, parameters: { heading: 0, program: "[]" } }] },
    { id: "tpl.rover", title: "Rover", parts: [{ definitionId: "space.rover", x: 0, y: 0 }, { definitionId: "space.grip-wheel", x: 0.5, y: 0.12 }, { definitionId: "space.grip-wheel", x: -0.5, y: 0.12 }, { definitionId: "space.drive-motor", x: 0, y: -0.02 }, { definitionId: "circuit.battery", x: -0.3, y: -0.38 }] },
    { id: "tpl.gear-pair", title: "Motor and gears", parts: [{ definitionId: "gear.motor", x: 0, y: 0 }, { definitionId: "gear.small", x: 0, y: 0 }, { definitionId: "gear.large", x: 1.1, y: 0 }] },
    { id: "tpl.circuit", title: "Bulb circuit", parts: [{ definitionId: "circuit.battery", x: 0, y: 1 }, { definitionId: "circuit.bulb", x: 0, y: -1 }, { definitionId: "circuit.wire", x: 0.35, y: 0.21, rotation: Math.atan2(-1.58, -0.3), parameters: { length: Math.hypot(0.3, 1.58) } }, { definitionId: "circuit.wire", x: -0.35, y: 0.21, rotation: Math.atan2(-1.58, 0.3), parameters: { length: Math.hypot(0.3, 1.58) } }] }
];
export function templateById(id) { return SANDBOX_TEMPLATES.find(t => t.id === id); }
/** The template's parts placed with their middle at (x, y). */
export function placeTemplate(t, x, y) {
    return t.parts.map(p => { var _a, _b; return ({ definitionId: p.definitionId, position: { x: Math.round((x + p.x) * 1e6) / 1e6, y: Math.round((y + p.y) * 1e6) / 1e6 }, rotation: (_a = p.rotation) !== null && _a !== void 0 ? _a : 0, parameters: (_b = p.parameters) !== null && _b !== void 0 ? _b : {} }); });
}
/** How full a build is: the parts the child added (room furniture doesn't count) against the room's cap. */
export function capStatus(parts, cap) {
    const count = parts.filter(p => { var _a; return !((_a = p.tags) === null || _a === void 0 ? void 0 : _a.includes("sandbox.room")) && p.parameters.locked !== true; }).length;
    return { count, cap, warn: count >= Math.floor(cap * CAP_WARNING), full: count >= cap };
}
/** Parts that come with an unlocked part in Free Build (a rocket comes with its boosters and fins; a rover with its wheels). */
export const COMPANION_PARTS = {
    "space.rocket": ["space.booster", "space.fins", "space.nose-cone", "space.landing-legs", "space.capsule"],
    "space.rover": ["space.wheel", "space.grip-wheel", "space.drive-motor", "space.solar-panel", "space.cargo-pod"],
    "magnetic.bar": ["magnetic.reed-switch"]
};
/** The tray in a Free Build room: everything unlocked, plus the parts that come with it. */
export function sandboxTrayParts(unlocked) { return [...new Set([...unlocked, ...unlocked.flatMap(id => { var _a; return (_a = COMPANION_PARTS[id]) !== null && _a !== void 0 ? _a : []; })])]; }
