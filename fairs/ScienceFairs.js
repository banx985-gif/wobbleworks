import { activeProfile, updateProfile, newId, MAX_FAIR_ENTRIES } from "../app/AppState.js";
import { clearedLabIds, ownsFullGame } from "../progression/Campus.js";
import { MAIN_LABS, SCIENCE_FAIR } from "../progression/CampaignData.js";
import { personalityLabel } from "../challenge/Challenges.js";
import { VISITORS } from "../contracts/Contracts.js";
export const SCIENCE_FAIRS = [
    { id: "fair.motion-makers", number: 1, title: "Motion Makers", icon: "🛝", unlock: ["motion-yard"], seconds: 12,
        prompt: "Build a machine that moves in a way you love, using Motion parts.", rule: "Something made of Motion parts must really move at least a metre." },
    { id: "fair.strong-and-powered", number: 2, title: "Strong & Powered", icon: "🏋️", unlock: ["builder-bay", "power-lab"], seconds: 15,
        prompt: "Build something that lifts Bolt or carries a heavy load — using at least two kinds of science.", rule: "Lift Bolt at least 1 metre or move the heavy weight at least 2 metres, with parts from at least two areas of science working." },
    { id: "fair.water-and-air-show", number: 3, title: "Water & Air Show", icon: "💦", unlock: ["water-works", "flight-hangar"], seconds: 15,
        prompt: "Make a machine that clearly uses water or air — and ends in a celebration!", rule: "Water or air must do something, and after that a bell, confetti or the duck cannon must go off." },
    { id: "fair.smart-machines", number: 4, title: "Smart Machines", icon: "🤖", unlock: ["robot-lab"], seconds: 15,
        prompt: "Build an automatic invention that reacts to something it senses.", rule: "A sensor (a robot's sensor or a magnet switch) must notice something, and the machine must do something after it." },
    { id: "fair.anything-goes", number: 5, title: "Anything Goes", icon: "🎪", unlock: "ALL", seconds: 15,
        prompt: "The Everything Lab fair! Use any parts you've unlocked and build whatever you dream up.", rule: "Anything that does something counts!" }
];
export function fairById(id) { return SCIENCE_FAIRS.find(f => f.id === id); }
export const FAIR_MISSIONS = SCIENCE_FAIR.missions;
export function fairOpen(save, id) {
    const f = fairById(id);
    if (!f || !activeProfile(save) || !ownsFullGame(save.entitlement))
        return false;
    const cleared = clearedLabIds(save);
    return (f.unlock === "ALL" ? MAIN_LABS.map(l => l.id) : f.unlock).every(l => cleared.includes(l));
}
export function scienceFairOpen(save) { return SCIENCE_FAIRS.some(f => fairOpen(save, f.id)); }
export function domainOf(definitionId) {
    const p = definitionId.split(".")[0];
    if (["motion", "gear", "scrap", "silly", "sandbox", "chain", "structure"].includes(p ?? ""))
        return "Mechanics";
    if (p === "builder")
        return "Structures";
    if (p === "circuit" || p === "power")
        return "Electricity";
    if (p === "magnetic")
        return definitionId === "magnetic.reed-switch" ? "Electricity" : "Magnetism";
    if (p === "plumb" || p === "water")
        return "Water";
    if (p === "flight")
        return "Air";
    if (p === "robot" || p === "logic")
        return "Robots & Logic";
    if (p === "space")
        return "Space";
    return undefined;
}
const WATER = new Set(["WATER_FLOWING", "PUMP_MOVED_WATER", "PUMP_LIFT", "NOZZLE_HIT", "WATER_RECEIVED", "WATER_TARGET_WET", "WATER_DROVE_WHEEL", "WATER_JET_PUSH", "TANK_FILLED", "TANK_STARTED"]);
const AIR = new Set(["WING_LIFT", "PROPELLER_THRUST", "WIND_FAN", "WIND_PUSH", "BALLOON", "CRAFT_FLYING", "PARACHUTE"]);
const CELEBRATE = new Set(["BELL_RING", "CONFETTI_BURST", "CANNON_FIRE"]);
const SENSE = new Set(["SENSOR_DECISION", "MAGNET_SWITCH_CLOSED", "MAGNET_SWITCH_OPENED"]);
const ACT = new Set(["ROBOT_MOVED", "ROBOT_TURNED", "BOX_GRABBED", "BOX_DROPPED", "LOAD_ON", "CANNON_FIRE", "BELL_RING", "CONFETTI_BURST", "PUMP_MOVED_WATER", "BOOSTER_IGNITED", "ELECTROMAGNET_ON", "BUTTON_PRESSED"]);
/** Watches the fair TEST tick by tick. */
export class FairRun {
    fair;
    build;
    seeded;
    start = new Map();
    travel = new Map();
    peak = 0;
    lift = 0;
    ticks = 0;
    constructor(fair, build, seeded) {
        this.fair = fair;
        this.build = build;
        this.seeded = seeded;
    }
    get done() { return this.ticks >= Math.round(this.fair.seconds * 60); }
    get secondsLeft() { return Math.max(0, this.fair.seconds - this.ticks / 60); }
    sample(runtime) {
        if (this.done)
            return;
        this.ticks++;
        for (const s of runtime.physics.states()) {
            if (!runtime.physics.isDynamic(s.id))
                continue;
            const s0 = this.start.get(s.id);
            if (!s0) {
                this.start.set(s.id, { x: s.x, y: s.y });
                continue;
            }
            this.travel.set(s.id, Math.max(this.travel.get(s.id) ?? 0, Math.hypot(s.x - s0.x, s.y - s0.y)));
            const part = this.build.getPart(s.id);
            if (part?.definitionId === "silly.bolt")
                this.lift = Math.max(this.lift, s0.y - s.y);
            this.peak = Math.max(this.peak, Math.hypot(s.vx, s.vy));
        }
    }
    evidence(runtime) {
        const parts = this.build.allParts();
        const added = parts.filter(p => p.parameters.locked !== true && !this.seeded.has(p.id));
        const events = runtime.causalEvents;
        const kindOf = (id) => this.build.getPart(id)?.definitionId;
        const working = new Set();
        for (const e of events)
            for (const id of [e.sourceId, e.targetId]) {
                if (!id)
                    continue;
                const d = kindOf(id);
                const dom = d ? domainOf(d) : undefined;
                if (dom && (e.kind !== "PHYSICS_CONTACT" || (this.travel.get(id) ?? 0) > 0.3))
                    working.add(dom);
            }
        for (const [id, t] of this.travel) {
            const d = kindOf(id);
            const dom = d ? domainOf(d) : undefined;
            if (dom === "Mechanics" && t > 0.5)
                working.add(dom);
        }
        const motionMoved = Math.max(0, ...[...this.travel].filter(([id]) => /^motion\./.test(kindOf(id) ?? "")).map(([, t]) => t));
        const loadCarried = Math.max(0, ...[...this.travel].filter(([id]) => /^(sandbox\.weight|gear\.heavy-crate|builder\.sandbag)$/.test(kindOf(id) ?? "")).map(([, t]) => t));
        const firstTick = (set) => events.find(e => set.has(e.kind))?.tick;
        const wa = Math.min(firstTick(WATER) ?? Infinity, firstTick(AIR) ?? Infinity);
        const sense = firstTick(SENSE);
        const crafts = parts.filter(p => runtime.flight.craft(p.id)).map(p => runtime.flight.peakImpact(p.id)).filter((v) => v !== undefined && Number.isFinite(v));
        const s = runtime.structures;
        return {
            partsAdded: added.length, domainsWorking: [...working], motionMoved, peakSpeed: this.peak, boltLift: Math.max(0, this.lift), loadCarried,
            chainLength: runtime.chain.active ? runtime.chain.longest() : 0,
            hasStructure: s.memberStates().length > 0, maxWobble: s.maxWobble(), anythingBroke: events.some(e => e.kind === "STRUCTURE_BROKE" || e.kind === "OBJECT_BROKE"),
            anyLoadOn: events.some(e => e.kind === "LOAD_ON"), energyUsed: runtime.circuits.energyUsed(),
            ...(crafts.length ? { softestLanding: Math.min(...crafts) } : {}),
            water: firstTick(WATER) !== undefined, air: firstTick(AIR) !== undefined,
            celebrationAfter: Number.isFinite(wa) && events.some(e => CELEBRATE.has(e.kind) && e.tick >= wa),
            sensedThenActed: sense !== undefined && events.some(e => ACT.has(e.kind) && e.tick > sense)
        };
    }
}
/** The fair's entry rule (a rule of entry — never a score). Returns what is missing, if anything. */
export function entryCheck(fair, ev) {
    switch (fair.id) {
        case "fair.motion-makers": return ev.motionMoved >= 1 ? { ok: true } : { ok: false, missing: "Make something built from Motion parts move at least a metre." };
        case "fair.strong-and-powered": {
            const strong = ev.boltLift >= 1 || ev.loadCarried >= 2;
            const two = ev.domainsWorking.length >= 2;
            return strong && two ? { ok: true } : { ok: false, missing: !strong ? "Lift Bolt at least 1 metre, or move the heavy weight at least 2 metres." : "Use at least two areas of science, and make both of them do something (for example gears and electricity)." };
        }
        case "fair.water-and-air-show": return ev.celebrationAfter ? { ok: true } : { ok: false, missing: !ev.water && !ev.air ? "Make water or air do something." : "Finish with a celebration — a bell, confetti or the duck cannon — after the water or air." };
        case "fair.smart-machines": return ev.sensedThenActed ? { ok: true } : { ok: false, missing: "Use a sensor (a robot's sensor or a magnet switch) and make the machine do something when it notices." };
        default: return ev.domainsWorking.length > 0 || ev.motionMoved > 0.3 || ev.chainLength > 0 ? { ok: true } : { ok: false, missing: "Make something happen!" };
    }
}
export const MEASURABLE_AWARDS = [
    { label: "SPEEDY SOLUTION", test: e => e.peakSpeed >= 5 ? `something in your machine reached ${e.peakSpeed.toFixed(1)} m/s (5 m/s or faster)` : undefined },
    { label: "TINY MACHINE", test: e => e.partsAdded > 0 && e.partsAdded <= 4 ? `you added just ${e.partsAdded} part${e.partsAdded === 1 ? "" : "s"} (4 or fewer)` : undefined },
    { label: "SUPER STRONG", test: e => e.boltLift >= 2 ? `it lifted Bolt ${e.boltLift.toFixed(1)} m (2 m or more)` : e.loadCarried >= 4 ? `it moved the heavy weight ${e.loadCarried.toFixed(1)} m (4 m or more)` : undefined },
    { label: "SUPER STABLE", test: e => e.hasStructure && !e.anythingBroke && e.maxWobble <= 0.02 ? `its biggest wobble was ${(e.maxWobble * 100).toFixed(1)} cm (2 cm or less)` : undefined },
    { label: "CHAIN REACTION!", test: e => e.chainLength >= 5 ? `its chain reaction was ${e.chainLength} steps long (5 or more)` : undefined },
    { label: "PERFECT LANDING", test: e => e.softestLanding !== undefined && e.softestLanding <= 2 ? `it landed at ${e.softestLanding.toFixed(1)} m/s (2 m/s or gentler)` : undefined },
    { label: "LOW POWER", test: e => e.anyLoadOn && e.energyUsed <= 5 ? `it powered something using only ${e.energyUsed.toFixed(1)} energy (5 or less)` : undefined }
];
export function measurableAwards(ev) { return MEASURABLE_AWARDS.flatMap(a => { const because = a.test(ev); return because ? [{ label: a.label, because }] : []; }); }
/** Campus visitors you've met cheer from the crowd. Cheers are fun, never a verdict. */
const CHEERS = ["Wow, look at it go!", "I've never seen anything like it!", "Can I have a go next?", "Brilliant!", "What a clever idea!", "Again! Again!"];
export function crowdCheers(save, random = Math.random) {
    const met = VISITORS.filter(v => activeProfile(save)?.visitorsMet.includes(v.id));
    const out = [];
    for (let k = 0; k < Math.min(2, met.length); k++) {
        const v = met[Math.floor(random() * met.length)];
        const line = CHEERS[Math.floor(random() * CHEERS.length)];
        const cheer = `${v.icon} ${v.name}: “${line}”`;
        if (!out.includes(cheer))
            out.push(cheer);
    }
    return out;
}
export function judgeEntry(fair, ev, build, runtime, random = Math.random) {
    const c = entryCheck(fair, ev);
    if (!c.ok)
        return { accepted: false, ...(c.missing ? { missing: c.missing } : {}), awards: [] };
    return { accepted: true, awards: measurableAwards(ev), fun: personalityLabel(build, runtime, random) };
}
// ------------------------------------------------------------------ fair history (save v6)
/** Saves an accepted entry in the inventor's fair history (measurable awards only — fun labels are never saved). */
export function withFairEntry(save, fair, result, title, nowMs = Date.now(), inventionId) {
    const p = activeProfile(save);
    if (!p || !result.accepted)
        return save;
    const entry = { id: newId("fair"), fairId: fair.id, savedAtMs: nowMs, title: title.slice(0, 40) || fair.title, awards: result.awards.map(a => a.label), ...(inventionId ? { inventionId } : {}) };
    return updateProfile(save, p.id, q => ({ ...q, fairs: [...q.fairs, entry].slice(-MAX_FAIR_ENTRIES) }));
}
export function fairHistory(save, fairId) { return (activeProfile(save)?.fairs ?? []).filter(e => !fairId || e.fairId === fairId); }
