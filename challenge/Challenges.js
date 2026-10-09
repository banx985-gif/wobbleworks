import { activeProfile, updateProfile } from "../app/AppState.js";
import { clearedLabIds, ownsFullGame } from "../progression/Campus.js";
import { CHALLENGE_LAB, MAIN_LABS } from "../progression/CampaignData.js";
import { FLOOR_Y } from "../structures/StructureSystem.js";
import { canMeasure } from "../experiment/MetricRegistry.js";
const fewer = { metric: "partCount", better: "LESS", decimals: 0, name: "fewer parts" };
const tiny = (n) => ({ label: "TINY MACHINE", on: "PARTS", atMost: n, because: `you added ${n === 1 ? "just 1 part" : `${n} parts or fewer`}` });
export const BUILD_PRICES = { "builder.rope": 1, "builder.brace": 2, "builder.column": 2, "builder.beam-wood": 3, "builder.beam-metal": 6 };
export const CHALLENGES = [
    { id: "challenge.fastest-vehicle", number: 1, title: "Fastest Vehicle", icon: "🏎️", labId: "motion-yard", baseLevelId: "motion.make-it-farther", goal: "Get the cart past the finish flag as fast as you can.",
        metric: "elapsedTime", better: "LESS", decimals: 2, unit: "s", measureName: "Time to the finish", tieBreak: fewer, windowSeconds: 25,
        capture: { kind: "FINISH_LINE", subject: "cart", finishX: 7.7 }, ratings: [{ label: "SPEEDY SOLUTION", on: "VALUE", atMost: 4, because: "it reached the finish in 4 seconds or less" }, tiny(2)] },
    { id: "challenge.tallest-tower", number: 2, title: "Tallest Tower", icon: "🗼", labId: "builder-bay", baseLevelId: "builder.tallest-tower", goal: "Build the tallest tower that stands steady in the wind for 3 seconds.",
        metric: "maximumHeight", better: "MORE", decimals: 2, unit: "m", measureName: "Height", tieBreak: fewer, windowSeconds: 20,
        capture: { kind: "TOWER" }, ratings: [{ label: "SKY HIGH", on: "VALUE", atLeast: 5, because: "it stood 5 metres tall or more" }, tiny(2)] },
    { id: "challenge.longest-jump", number: 3, title: "Longest Jump", icon: "🦘", labId: "motion-yard", baseLevelId: "challenge.longest-jump", goal: "Build a slide that sends the cart flying off the cliff. How far can it jump?",
        metric: "distanceTravelled", better: "MORE", decimals: 2, unit: "m", measureName: "Jump from the cliff edge", tieBreak: fewer, windowSeconds: 15,
        capture: { kind: "JUMP", subject: "cart", edgeX: 6, ledgeTopY: 4.4 }, ratings: [{ label: "SUPER JUMP", on: "VALUE", atLeast: 3.5, because: "it landed 3.5 metres or more past the edge" }, tiny(2)] },
    { id: "challenge.longest-glide", number: 4, title: "Longest Glide", icon: "🪁", labId: "flight-hangar", baseLevelId: "flight.long-glide", goal: "Give the glider wings that carry it as far as possible.",
        metric: "distanceTravelled", better: "MORE", decimals: 2, unit: "m", measureName: "Glide distance", tieBreak: fewer, windowSeconds: 20,
        capture: { kind: "GLIDE", subject: "glider" }, ratings: [{ label: "SKY SAILOR", on: "VALUE", atLeast: 11, because: "it glided 11 metres or more" }, tiny(2)] },
    { id: "challenge.heavy-hauler", number: 5, title: "Heavy Hauler", icon: "🚚", labId: "builder-bay", baseLevelId: "builder.heavy-delivery", goal: "Choose how heavy the cargo is, then build a bridge that gets it across.",
        metric: "supportedLoad", better: "MORE", decimals: 0, unit: "load", measureName: "Cargo carried across", tieBreak: fewer, windowSeconds: 30,
        capture: { kind: "CARGO", subject: "cart", choices: [10, 15, 20, 25, 30, 35, 40] }, ratings: [{ label: "SUPER STRONG", on: "VALUE", atLeast: 25, because: "your bridge carried 25 or more" }] },
    { id: "challenge.low-power-lift", number: 6, title: "Low Power Lift", icon: "🔋", labId: "power-lab", baseLevelId: "power.power-the-lift", goal: "Lift the crate into the bay using as little battery as you can.",
        metric: "energyUsed", better: "LESS", decimals: 1, unit: "energy", measureName: "Battery used", tieBreak: { metric: "elapsedTime", better: "LESS", decimals: 2, name: "a quicker lift" }, windowSeconds: 30,
        capture: { kind: "ENERGY" }, ratings: [{ label: "LOW POWER", on: "VALUE", atMost: 9, because: "it used 9 energy or less" }] },
    { id: "challenge.fewest-parts", number: 7, title: "Fewest Parts", icon: "🧩", labId: "motion-yard", baseLevelId: "motion.ramp-rescue", goal: "Get Bolt down safely, adding as few parts as you can.",
        metric: "partCount", better: "LESS", decimals: 0, unit: "parts", measureName: "Parts added", tieBreak: { metric: "elapsedTime", better: "LESS", decimals: 2, name: "a quicker finish" }, windowSeconds: 25,
        capture: { kind: "PARTS" }, ratings: [tiny(3)] },
    { id: "challenge.budget-builder", number: 8, title: "Budget Builder", icon: "🪙", labId: "builder-bay", baseLevelId: "builder.bridge-the-gap", goal: "Get Bolt across the gap with the cheapest bridge. Rope 1, brace 2, column 2, wood beam 3, metal beam 6 coins.",
        metric: "buildCost", better: "LESS", decimals: 0, unit: "coins", measureName: "Bridge cost", tieBreak: fewer, windowSeconds: 30,
        capture: { kind: "COST", prices: BUILD_PRICES }, ratings: [{ label: "BARGAIN BRIDGE", on: "VALUE", atMost: 3, because: "it cost 3 coins or less" }] },
    { id: "challenge.egg-drop", number: 9, title: "Egg Drop", icon: "🥚", labId: "builder-bay", baseLevelId: "builder.keep-the-egg-safe", goal: "Catch the falling egg without breaking it — the softer the landing, the better.",
        metric: "peakImpact", better: "LESS", decimals: 2, unit: "m/s", measureName: "Landing bump", tieBreak: fewer, windowSeconds: 15,
        capture: { kind: "EGG", subject: "egg" }, ratings: [{ label: "PERFECT LANDING", on: "VALUE", atMost: 3, because: "the egg landed at 3 m/s or gentler" }] },
    { id: "challenge.chain-master", number: 10, title: "Chain Master", icon: "⛓️", labId: "motion-yard", baseLevelId: "chain.first-domino", goal: "One push. How long a chain reaction can you make? Loops don't count twice.",
        metric: "chainLength", better: "MORE", decimals: 0, unit: "steps", measureName: "Chain length", tieBreak: { metric: "uniqueMechanismCount", better: "MORE", decimals: 0, name: "more different kinds of steps" }, windowSeconds: 40,
        capture: { kind: "CHAIN", settleSeconds: 3 }, ratings: [{ label: "CHAIN REACTION!", on: "VALUE", atLeast: 5, because: "it was 5 steps or longer" }] },
    { id: "challenge.robot-efficiency", number: 11, title: "Robot Efficiency", icon: "🤖", labId: "robot-lab", baseLevelId: "robot.turn-the-corner", goal: "Program the robot to reach the goal using as few blocks as you can.",
        metric: "programBlockCount", better: "LESS", decimals: 0, unit: "blocks", measureName: "Program blocks", tieBreak: { metric: "elapsedTime", better: "LESS", decimals: 2, name: "a quicker arrival" }, windowSeconds: 40,
        capture: { kind: "ROBOT", subject: "bot" }, ratings: [{ label: "TINY PROGRAM", on: "VALUE", atMost: 3, because: "it used 3 blocks or fewer" }] },
    { id: "challenge.stable-platform", number: 12, title: "Stable Platform", icon: "🧘", labId: "builder-bay", baseLevelId: "builder.stop-the-wobble", goal: "Hold the sandbag up and keep the platform as steady as you can.",
        metric: "stabilityVariance", better: "LESS", decimals: 3, unit: "m", measureName: "Biggest wobble", tieBreak: fewer, windowSeconds: 20,
        capture: { kind: "WOBBLE" }, ratings: [{ label: "SUPER STABLE", on: "VALUE", atMost: 0.02, because: "it never wobbled more than 2 cm" }, tiny(1)] }
];
export function challengeById(id) { return CHALLENGES.find(c => c.id === id); }
/** Every challenge is scored by a registered metric that has a real measuring rule. */
export function challengesAreMeasurable() { return CHALLENGES.every(c => canMeasure(c.metric) && canMeasure(c.tieBreak.metric)); }
// ------------------------------------------------------------------ unlocks
/** The Challenge Lab opens with the full game once the Motion Yard is restored. */
export function challengeLabOpen(save) { return Boolean(activeProfile(save)) && ownsFullGame(save.entitlement) && clearedLabIds(save).includes(MAIN_LABS[0].id); }
/** Each challenge also needs the lab whose parts it uses. */
export function challengeOpen(save, id) { const c = challengeById(id); return Boolean(c) && challengeLabOpen(save) && clearedLabIds(save).includes(c.labId); }
export const CHALLENGE_MISSIONS = CHALLENGE_LAB.missions;
const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
/** Parts the player added: not room parts (locked) and not the parts the challenge starts with (`seeded`). */
export function playerParts(build, seeded = new Set()) { return build.allParts().filter(p => p.parameters.locked !== true && !seeded.has(p.id)); }
export function buildCost(build, prices, seeded = new Set()) { return playerParts(build, seeded).reduce((t, p) => t + (prices[p.definitionId] ?? 0), 0); }
function batteryEnergy(build, runtime) { return build.allParts().reduce((t, p) => t + (runtime.circuits.source(p.id)?.energyUsed ?? 0), 0); }
/**
 * Watches one TEST and takes the score at the exact tick the challenge says. Call `tick` after every simulation step
 * with whether the challenge's rules are met right now. `result` is set once, and never changes afterwards.
 */
export class ChallengeRun {
    def;
    build;
    seeded;
    result;
    everMet = false;
    metTick = -1;
    jumped = false;
    lastVy = 0;
    landedX;
    crossTick;
    startX;
    lastGrowth = 0;
    lastValue = -Infinity;
    /** `seeded`: ids of the parts the challenge starts with (they never count as parts added). */
    constructor(def, build, seeded = new Set()) {
        this.def = def;
        this.build = build;
        this.seeded = seeded;
    }
    get done() { return this.result !== undefined; }
    tick(runtime, rulesMet) {
        if (this.result)
            return;
        const t = runtime.tick;
        const c = this.def.capture;
        if (rulesMet && !this.everMet) {
            this.everMet = true;
            this.metTick = t;
        }
        const body = (id) => { try {
            return runtime.physics.state(id);
        }
        catch {
            return undefined;
        } };
        if (c.kind === "FINISH_LINE") {
            const s = body(c.subject);
            if (s && this.crossTick === undefined && s.x >= c.finishX)
                this.crossTick = t;
        }
        if (c.kind === "JUMP") {
            const s = body(c.subject);
            if (s) {
                if (s.x > c.edgeX && s.y < c.ledgeTopY + 0.3)
                    this.jumped = true;
                if (this.landedX === undefined && s.x > c.edgeX && s.y > c.ledgeTopY + 0.8 && this.lastVy > 1 && s.vy < 0.3)
                    this.landedX = s.x;
                this.lastVy = s.vy;
            }
            if (this.landedX !== undefined) {
                this.finish(this.everMet && this.jumped, this.landedX - c.edgeX, t, runtime);
                return;
            }
        }
        if (c.kind === "GLIDE" || c.kind === "CHAIN") {
            const v = c.kind === "GLIDE" ? this.glideDistance(runtime, c.subject) : runtime.chain.longest();
            if (v !== undefined && v > this.lastValue + 1e-6) {
                this.lastValue = v;
                this.lastGrowth = t;
            }
            const settle = c.kind === "GLIDE" ? 60 : Math.round(c.settleSeconds * 60);
            if (this.everMet && t - this.lastGrowth >= settle) {
                this.finish(true, this.lastValue, t, runtime);
                return;
            }
        }
        else if (this.everMet && c.kind !== "JUMP") {
            this.finish(true, this.valueNow(runtime), t, runtime);
            return;
        }
        if (t >= Math.round(this.def.windowSeconds * 60)) {
            if (this.everMet && (c.kind === "GLIDE" || c.kind === "CHAIN"))
                this.finish(true, this.lastValue, t, runtime);
            else
                this.result = { success: false, tick: t };
        }
    }
    glideDistance(runtime, id) {
        const craft = runtime.flight.craft(id);
        if (!craft)
            return undefined;
        if (this.startX === undefined) {
            try {
                this.startX = runtime.physics.state(id).x;
            }
            catch {
                return undefined;
            }
        }
        return Math.max(0, craft.maxX - this.startX);
    }
    valueNow(runtime) {
        const c = this.def.capture;
        switch (c.kind) {
            case "FINISH_LINE": return this.crossTick !== undefined ? this.crossTick / 60 : this.metTick / 60;
            case "TOWER": {
                const top = runtime.structures.topY();
                return top === undefined ? undefined : Math.max(0, FLOOR_Y - top);
            }
            case "CARGO": return Number(this.build.getPart(c.subject)?.parameters.weight ?? c.choices[0]);
            case "ENERGY": return batteryEnergy(this.build, runtime);
            case "PARTS": return playerParts(this.build, this.seeded).length;
            case "COST": return buildCost(this.build, c.prices, this.seeded);
            case "EGG": return runtime.structures.egg(c.subject)?.impact;
            case "ROBOT": return runtime.robots.robot(c.subject)?.blocks;
            case "WOBBLE": return runtime.structures.maxWobble();
            default: return undefined;
        }
    }
    tieNow(runtime, tick) {
        switch (this.def.tieBreak.metric) {
            case "partCount": return playerParts(this.build, this.seeded).length;
            case "elapsedTime": {
                const c = this.def.capture;
                if (c.kind === "ROBOT") {
                    const d = runtime.robots.robot(c.subject)?.doneAt;
                    if (d !== undefined)
                        return d;
                }
                return tick / 60;
            }
            case "uniqueMechanismCount": return runtime.chain.families().length;
            default: return undefined;
        }
    }
    finish(success, value, tick, runtime) {
        if (!success || value === undefined || !Number.isFinite(value)) {
            this.result = { success: false, tick };
            return;
        }
        const tie = this.tieNow(runtime, tick);
        this.result = { success: true, value: round(value, this.def.decimals), ...(tie !== undefined ? { tie: round(tie, this.def.tieBreak.decimals) } : {}), tick };
    }
}
const key = (id, k) => `${id}.${k}`;
export function challengeBest(save, id) {
    const r = activeProfile(save)?.records ?? {};
    const v = r[key(id, "best")];
    if (v === undefined)
        return undefined;
    const t = r[key(id, "tie")];
    return t === undefined ? { value: v } : { value: v, tie: t };
}
const beats = (better, a, b) => better === "LESS" ? a < b : a > b;
/** Compares a new score with the record: the main metric first, then the tie-break; an exact tie leaves the record as it is. */
export function compareWithBest(def, result, best) {
    if (!best)
        return "FIRST";
    if (beats(def.better, result.value, best.value))
        return "NEW_RECORD";
    if (result.value !== best.value)
        return "NOT_BEATEN";
    if (result.tie !== undefined && best.tie !== undefined && beats(def.tieBreak.better, result.tie, best.tie))
        return "NEW_RECORD";
    if (result.tie !== undefined && best.tie === undefined)
        return "NEW_RECORD";
    return result.tie === best.tie ? "MATCHED" : "NOT_BEATEN";
}
/** Saves a successful run's score if it is a personal record (and counts the try). */
export function withChallengeResult(save, def, result) {
    const p = activeProfile(save);
    if (!p)
        return { save };
    const tries = (p.records[key(def.id, "tries")] ?? 0) + 1;
    if (!result.success || result.value === undefined)
        return { save: updateProfile(save, p.id, q => ({ ...q, records: { ...q.records, [key(def.id, "tries")]: tries } })) };
    const previous = challengeBest(save, def.id);
    const verdict = compareWithBest(def, { value: result.value, ...(result.tie !== undefined ? { tie: result.tie } : {}) }, previous);
    const records = { ...p.records, [key(def.id, "tries")]: tries };
    if (verdict === "FIRST" || verdict === "NEW_RECORD") {
        records[key(def.id, "best")] = result.value;
        if (result.tie !== undefined)
            records[key(def.id, "tie")] = result.tie;
        else
            delete records[key(def.id, "tie")];
    }
    return { save: updateProfile(save, p.id, q => ({ ...q, records })), verdict, ...(previous ? { previous } : {}) };
}
// ------------------------------------------------------------------ celebration labels
/** Measurable ratings this run earned (each says exactly which number earned it). */
export function earnedRatings(def, result, partsAdded) {
    if (!result.success || result.value === undefined)
        return [];
    return def.ratings.filter(r => { const v = r.on === "VALUE" ? result.value : partsAdded; return (r.atMost === undefined || v <= r.atMost) && (r.atLeast === undefined || v >= r.atLeast); });
}
/** "Just for fun" labels: never saved, never a judgement — one is picked at random from those that fit. */
export const PERSONALITY_LABELS = ["SPROCKET'S FAVOURITE", "WILDEST INVENTION", "VERY WOBBLY", "DUCK APPROVED", "MOST MUSICAL"];
export function personalityLabel(build, runtime, random = Math.random) {
    const mine = playerParts(build);
    const all = build.allParts();
    const fits = ["SPROCKET'S FAVOURITE"];
    if (new Set(mine.map(p => p.definitionId)).size >= 4)
        fits.push("WILDEST INVENTION");
    if (runtime.structures.memberStates().length && runtime.structures.maxWobble() > 0.05)
        fits.push("VERY WOBBLY");
    if (all.some(p => /duck|cannon/.test(p.definitionId)))
        fits.push("DUCK APPROVED");
    if (all.some(p => /bell|buzzer|chime/.test(p.definitionId)))
        fits.push("MOST MUSICAL");
    return fits[Math.min(fits.length - 1, Math.floor(random() * fits.length))];
}
/** The score in plain words: "7.25 s", "3 parts". */
export function formatScore(def, value) { return `${value.toFixed(def.decimals)} ${def.unit}`; }
