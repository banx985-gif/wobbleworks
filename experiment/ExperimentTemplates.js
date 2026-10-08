import { MAIN_LABS } from "../progression/CampaignData.js";
/**
 * Experiment Lab (M22): the 11 locked experiment templates (master guide §10). Each one asks ONE question, changes
 * ONE thing between Build A and Build B, and compares them with ONE Metric Registry measurement. The rig (content/
 * experiment/*.json) is the same for A and B except the part called var-a / var-b, so every trial is a fair test.
 * Truth (truth.experiment.v1): results come only from what the simulation measured; "about the same" is a real answer.
 */
export const EXPERIMENT_TRUTH_CONTRACT = Object.freeze({
    id: "truth.experiment.v1",
    domain: "Fair tests",
    preserve: ["change one thing at a time", "measure with the same registered metric for A and B", "about the same is a real result"],
    simplify: ["each experiment has a small set of choices for the thing you change"],
    neverImply: ["one test proves something for ever", "a guess is the same as a result"]
});
const lane = (ax, ay, subject, finishX) => ({ anchor: { x: ax, y: ay }, subject, ...(finishX !== undefined ? { finishX } : {}) });
const ROUTE_UP = JSON.stringify([{ op: "FORWARD", n: 4 }, { op: "TURN", dir: "L" }, { op: "FORWARD", n: 1 }, { op: "TURN", dir: "R" }, { op: "FORWARD", n: 2 }, { op: "TURN", dir: "R" }, { op: "FORWARD", n: 1 }, { op: "TURN", dir: "L" }, { op: "FORWARD", n: 4 }]);
const ROUTE_DOWN = JSON.stringify([{ op: "FORWARD", n: 4 }, { op: "TURN", dir: "R" }, { op: "FORWARD", n: 2 }, { op: "TURN", dir: "L" }, { op: "FORWARD", n: 2 }, { op: "TURN", dir: "L" }, { op: "FORWARD", n: 2 }, { op: "TURN", dir: "R" }, { op: "FORWARD", n: 4 }]);
const PLANK = [{ definitionId: "builder.beam-wood", x: 0, y: 0, parameters: { length: 2 } }];
const TRUSS = [{ definitionId: "builder.beam-wood", x: -0.5, y: 0, parameters: { length: 1 } }, { definitionId: "builder.beam-wood", x: 0.5, y: 0, parameters: { length: 1 } },
    { definitionId: "builder.beam-wood", x: -0.5, y: -0.5, rotation: -Math.PI / 4, parameters: { length: Math.SQRT2 } }, { definitionId: "builder.beam-wood", x: 0.5, y: -0.5, rotation: Math.PI / 4, parameters: { length: Math.SQRT2 } },
    { definitionId: "builder.beam-wood", x: 0, y: -0.5, rotation: Math.PI / 2, parameters: { length: 1 } }];
export const EXPERIMENT_TEMPLATES = [
    { id: "exp.which-ramp-wins", domain: "Motion", title: "Which Ramp Wins?", question: "Which ball reaches the flag first?", variable: "how steep the ramp is", metric: "elapsedTime", asks: "LESS",
        options: [{ label: "Gentle", rotation: 0.18 }, { label: "Medium", rotation: 0.3 }, { label: "Steep", rotation: 0.45 }],
        lanes: { a: lane(0, 0, "ball-a", 6.6), b: lane(8, 0, "ball-b", 14.6) }, seconds: 8, sameWithin: 0.05, labId: "motion-yard" },
    { id: "exp.grip-test", domain: "Friction", title: "Grip Test", question: "Which cart stops sooner?", variable: "the floor it slides on", metric: "distanceTravelled", asks: "LESS",
        options: [{ label: "Grippy mat", parameters: { friction: 1.0 } }, { label: "Plain floor", parameters: { friction: 0.35 } }, { label: "Icy floor", parameters: { friction: 0.04 } }],
        lanes: { a: lane(0, 0, "cart-a"), b: lane(8, 0, "cart-b") }, seconds: 8, sameWithin: 0.06, labId: "motion-yard" },
    { id: "exp.big-gear-vs-small-gear", domain: "Gears", title: "Big Gear vs Small Gear", question: "Which output gear turns faster?", variable: "the size of the output gear", metric: "averageSpeed", asks: "MORE",
        options: [{ label: "Small gear", definitionId: "gear.small", dx: 0 }, { label: "Medium gear", definitionId: "gear.medium", dx: 0.2 }, { label: "Large gear", definitionId: "gear.large", dx: 0.5 }],
        lanes: { a: lane(0, 0, "var-a"), b: lane(8, 0, "var-b") }, seconds: 4, sameWithin: 0.05, labId: "gear-garage" },
    { id: "exp.which-bridge-holds-more", domain: "Structures", title: "Which Bridge Holds More?", question: "Which bridge holds more weight?", variable: "the shape of the bridge", metric: "supportedLoad", asks: "MORE",
        options: [{ label: "Plain plank", remove: true, add: PLANK }, { label: "Triangle truss", remove: true, add: TRUSS }],
        lanes: { a: lane(4, 6, "weight-a"), b: lane(12, 6, "weight-b") }, seconds: 7, sameWithin: 0.08, labId: "builder-bay" },
    { id: "exp.one-battery-or-two", domain: "Electricity", title: "One Battery or Two?", question: "Which bulb's circuit uses more power?", variable: "how many batteries push", metric: "energyUsed", asks: "MORE",
        options: [{ label: "One battery", parameters: { volts: 3 } }, { label: "Two batteries", parameters: { volts: 6 } }],
        lanes: { a: lane(0, 0, "bulb-a"), b: lane(8, 0, "bulb-b") }, seconds: 5, sameWithin: 0.05, labId: "power-lab" },
    { id: "exp.which-materials-move", domain: "Magnetism", title: "Which Materials Move?", question: "Which one does the magnet move more?", variable: "what the sample is made of", metric: "distanceTravelled", asks: "MORE",
        options: [{ label: "Iron", definitionId: "scrap.iron-block", dy: 0 }, { label: "Wood", definitionId: "scrap.wood-block", dy: 0 }, { label: "Aluminium", definitionId: "scrap.aluminium-can", dy: -0.025 }, { label: "Nickel", definitionId: "scrap.nickel-coin", dy: 0.165 }, { label: "Copper", definitionId: "scrap.copper-coin", dy: 0.165 }],
        lanes: { a: lane(0, 0, "var-a"), b: lane(8, 0, "var-b") }, seconds: 4, sameWithin: 0.1, labId: "magnet-factory" },
    { id: "exp.which-pipe-fills-faster", domain: "Water", title: "Which Pipe Fills Faster?", question: "Which tank fills first?", variable: "how wide the pipe is", metric: "elapsedTime", asks: "LESS",
        options: [{ label: "Wide pipe", definitionId: "plumb.pipe" }, { label: "Narrow pipe", definitionId: "plumb.pipe-narrow" }],
        lanes: { a: lane(0, 0, "tank-a"), b: lane(0, 3, "tank-b") }, seconds: 45, sameWithin: 0.05, labId: "water-works" },
    { id: "exp.which-wing-flies-farther", domain: "Flight", title: "Which Wing Flies Farther?", question: "Which glider flies farther?", variable: "the wing", metric: "distanceTravelled", asks: "MORE",
        options: [{ label: "Small wing", definitionId: "flight.wing-small" }, { label: "Big wing", definitionId: "flight.wing-large" }, { label: "Steep wing", definitionId: "flight.wing-steep" }],
        lanes: { a: lane(0, 0, "glider-a"), b: lane(0, 0, "glider-b") }, seconds: 10, sameWithin: 0.06, labId: "flight-hangar" },
    { id: "exp.which-route-is-faster", domain: "Robotics", title: "Which Route Is Faster?", question: "Which robot reaches its flag first?", variable: "the route in the program", metric: "elapsedTime", asks: "LESS",
        options: [{ label: "Up and over", parameters: { program: ROUTE_UP } }, { label: "Down and under", parameters: { program: ROUTE_DOWN } }],
        lanes: { a: lane(0, 0, "var-a"), b: lane(0, 4, "var-b") }, seconds: 20, sameWithin: 0.04, labId: "robot-lab" },
    { id: "exp.bounce-grip-or-slide", domain: "Materials", title: "Bounce, Grip or Slide?", question: "Which one bounces higher?", variable: "what the dropped thing is made of", metric: "maximumHeight", asks: "MORE",
        options: [{ label: "Rubber ball", definitionId: "motion.ball" }, { label: "Marble", definitionId: "motion.marble" }, { label: "Steel ball", definitionId: "scrap.steel-ball" }, { label: "Wooden block", definitionId: "scrap.wood-block" }],
        lanes: { a: lane(0, 0, "var-a"), b: lane(8, 0, "var-b") }, seconds: 4, sameWithin: 0.08, labId: "motion-yard" },
    { id: "exp.earth-gravity-vs-moon-gravity", domain: "Low Gravity", title: "Earth Gravity vs Moon Gravity", question: "Which ball takes longer to land?", variable: "how strong gravity is", metric: "elapsedTime", asks: "MORE",
        options: [{ label: "Earth gravity", parameters: { g: 9.81, label: "EARTH", air: true } }, { label: "Moon gravity", parameters: { g: 1.62, label: "MOON", air: false } }, { label: "Mars gravity", parameters: { g: 3.71, label: "MARS", air: true } }],
        lanes: { a: lane(0, 0, "ball-a"), b: lane(8, 0, "ball-b") }, seconds: 6, sameWithin: 0.05, labId: "space-centre" }
];
export function experimentTemplate(id) { return EXPERIMENT_TEMPLATES.find(t => t.id === id); }
export function experimentLab(templateId) { return MAIN_LABS.find(l => l.id === experimentTemplate(templateId)?.labId); }
/**
 * The rig with A set to option `a` and B to option `b`: the variable parts are swapped/moved/removed and each
 * choice's extra parts added at its lane's anchor. Everything else is untouched, so A and B differ in one thing only.
 */
export function buildExperimentRig(parts, template, a, b) {
    const out = [];
    for (const p of parts) {
        const laneKey = p.id === "var-a" ? "a" : p.id === "var-b" ? "b" : undefined;
        if (!laneKey) {
            out.push(p);
            continue;
        }
        const o = template.options[laneKey === "a" ? a : b];
        if (!o || o.remove)
            continue;
        out.push({ ...p, ...(o.definitionId ? { definitionId: o.definitionId } : {}), position: { x: round(p.position.x + (o.dx ?? 0)), y: round(p.position.y + (o.dy ?? 0)) }, rotation: o.rotation ?? p.rotation, parameters: { ...p.parameters, ...(o.parameters ?? {}) } });
    }
    for (const [laneKey, choice] of [["a", a], ["b", b]]) {
        const o = template.options[choice];
        const anchor = template.lanes[laneKey].anchor;
        (o?.add ?? []).forEach((x, i) => out.push({ id: `opt-${laneKey}-${i}`, definitionId: x.definitionId, position: { x: round(anchor.x + x.x), y: round(anchor.y + x.y) }, rotation: x.rotation ?? 0, parameters: { locked: true, ...(x.parameters ?? {}) }, tags: [`lane.${laneKey}`] }));
    }
    return out;
}
function round(v) { return Math.round(v * 1e6) / 1e6; }
/** Which lane has more / less of the metric, or "about the same" within the template's tolerance. */
export function verdict(template, valueA, valueB) {
    const big = Math.max(Math.abs(valueA), Math.abs(valueB));
    if (big === 0 || Math.abs(valueA - valueB) <= big * template.sameWithin)
        return "SAME";
    const aMore = valueA > valueB;
    return template.asks === "MORE" ? (aMore ? "A" : "B") : (aMore ? "B" : "A");
}
/** The result in child words: "B went farther!" / "They were about the same." */
export function verdictLine(template, words, v) {
    if (v === "SAME")
        return "They were about the same.";
    const w = template.asks === "MORE" ? words?.more ?? "had more" : words?.less ?? "had less";
    return `${v} ${w}!`;
}
