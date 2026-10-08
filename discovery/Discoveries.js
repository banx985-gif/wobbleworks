import { collectMotionDiscoveries, MOTION_REAL_WORLD_CARDS } from "../motion/MotionYard.js";
import { collectGearDiscoveries, GEAR_REAL_WORLD_CARDS } from "../gears/GearGarage.js";
export const DISCOVERIES = [
    { id: "motion.gravity-down", kind: "CONCEPT", title: "Gravity pulls down", line: "Let go of something and it falls.", art: "motion.ball", truthContractId: "truth.motion.v1" },
    { id: "motion.slope-effect", kind: "CONCEPT", title: "Slopes change motion", line: "A ramp turns falling into rolling.", art: "motion.ramp", truthContractId: "truth.motion.v1" },
    { id: "motion.friction-grip", kind: "CONCEPT", title: "Grip slows sliding", line: "Rough surfaces rub and slow things down.", art: "motion.friction-high", truthContractId: "truth.motion.v1" },
    { id: "motion.bounce", kind: "CONCEPT", title: "Bouncy surfaces push back", line: "A bouncy pad sends things back up.", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    { id: "motion.mass-inertia", kind: "CONCEPT", title: "Same push, different mass", line: "The same push moves a light thing more than a heavy one.", art: "motion.cart", truthContractId: "truth.motion.v1" },
    { id: "motion.momentum", kind: "CONCEPT", title: "Moving things keep moving", line: "Things keep rolling until something slows them.", art: "motion.wheel", truthContractId: "truth.motion.v1" },
    { id: "motion.surface-comparison", kind: "CONCEPT", title: "Rough or smooth?", line: "Grippy and slippy surfaces change how far things go.", art: "motion.friction-low", truthContractId: "truth.motion.v1" },
    { id: "combo.spring-ramp", kind: "COMBINATION", title: "Launch + Slope", line: "A spring pushed it, then a ramp guided it.", art: "motion.spring", truthContractId: "truth.motion.v1" },
    { id: "combo.spring-bounce", kind: "COMBINATION", title: "Double Boing", line: "A spring launch, then a bounce: two pushes in a row.", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    { id: "combo.slope-grip", kind: "COMBINATION", title: "Speed up, slow down", line: "A ramp sped it up and grip slowed it down.", art: "motion.friction-high", truthContractId: "truth.motion.v1" },
    { id: "combo.wheel-cart", kind: "COMBINATION", title: "Wheels carry loads", line: "Wheels on a cart turn as it rolls along.", art: "motion.cart", truthContractId: "truth.motion.v1" },
    { id: "secret.duck-trampoline", kind: "SECRET", title: "Duck Trampoline", line: "A rubber duck can bounce too!", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    { id: "secret.bounce-hat-trick", kind: "SECRET", title: "Bounce Hat-Trick", line: "Three bounces in one test!", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    { id: "secret.spring-relay", kind: "SECRET", title: "Spring Relay", line: "Two different springs launched the same thing.", art: "motion.spring", truthContractId: "truth.motion.v1" },
    { id: "secret.bolt-boing", kind: "SECRET", title: "Bolt Goes Boing", line: "Bolt bounced! (He says he meant to.)", art: "motion.bounce-pad", truthContractId: "truth.motion.v1" },
    // Gear Garage (M12) — every one measured by the GearSystem (truth.gears.v1)
    { id: "gear.direction-flip", kind: "CONCEPT", title: "Touching gears swap direction", line: "When one gear turns clockwise, the gear it touches turns the other way.", art: "gear.medium", truthContractId: "truth.gears.v1" },
    { id: "gear.speed-up", kind: "CONCEPT", title: "Big turns small = fast", line: "A big gear turning a small gear makes the small one spin faster.", art: "gear.small", truthContractId: "truth.gears.v1" },
    { id: "gear.slow-strong", kind: "CONCEPT", title: "Slower can be stronger", line: "A small gear turning a big gear goes slower but pushes harder.", art: "gear.large", truthContractId: "truth.gears.v1" },
    { id: "gear.chain", kind: "CONCEPT", title: "Gear trains pass turning along", line: "Turning can travel through a whole line of gears.", art: "gear.medium", truthContractId: "truth.gears.v1" },
    { id: "gear.same-way", kind: "CONCEPT", title: "Two flips make the same way", line: "With a gear in the middle, the last gear turns the same way as the first.", art: "gear.small", truthContractId: "truth.gears.v1" },
    { id: "gear.belt-same-way", kind: "CONCEPT", title: "Belts keep the direction", line: "Pulleys joined by a belt turn the same way.", art: "gear.belt-pulley", truthContractId: "truth.gears.v1" },
    { id: "gear.power-limit", kind: "CONCEPT", title: "Motors can only push so hard", line: "If a load needs more turning force than the motor has, everything stops.", art: "gear.motor", truthContractId: "truth.gears.v1" },
    { id: "combo.gear-conveyor", kind: "COMBINATION", title: "Gears + conveyor", line: "Gears turned the old conveyor and it carried the cargo.", art: "motion.conveyor", truthContractId: "truth.gears.v1" },
    { id: "combo.gear-winch", kind: "COMBINATION", title: "Gears + rope = lift", line: "A gear-driven winch wound up a rope and lifted a load.", art: "gear.winch", truthContractId: "truth.gears.v1" },
    { id: "secret.gear-gridlock", kind: "SECRET", title: "Gear Gridlock", line: "Three gears in a ring can't turn at all — each one blocks the next!", art: "gear.medium", truthContractId: "truth.gears.v1" },
    { id: "secret.super-spin", kind: "SECRET", title: "Super Spin", line: "A gear spun five times faster than the crank!", art: "gear.small", truthContractId: "truth.gears.v1" },
    { id: "secret.sprocket-fling", kind: "SECRET", title: "Sprocket Spin-Out", line: "Too fast! Sprocket went flying (into a soft cushion).", art: "gear.carousel", truthContractId: "truth.gears.v1" }
];
export function discoveryById(id) { return DISCOVERIES.find(d => d.id === id); }
export function realWorldCard(id) { return [...MOTION_REAL_WORLD_CARDS, ...GEAR_REAL_WORLD_CARDS].find(c => c.discoveryId === id); }
// ------------------------------------------------------------------ evidence helpers (read-only)
/** Separate touches: events on the same object more than `gap` ticks apart count as new episodes. */
export function episodes(events, gap = 12) {
    let count = 0, last = -Infinity;
    for (const e of [...events].sort((a, b) => a.tick - b.tick)) {
        if (e.tick - last > gap)
            count += 1;
        last = e.tick;
    }
    return count;
}
function other(event, partId) { return event.sourceId === partId ? event.targetId : event.targetId === partId ? event.sourceId : undefined; }
function involves(event, partId) { return event.sourceId === partId || event.targetId === partId; }
function defOf(build, id) { return id ? build.getPart(id)?.definitionId : undefined; }
function name(part) { return (part?.definitionId ?? "thing").replace(/^[a-z]+\./, "").replaceAll("-", " "); }
function seconds(tick) { return (tick / 60).toFixed(1); }
/** Events of a kind that touch a moving part, grouped by that moving part. Contacts list [a, b]; spring launches list [spring, target]. */
function byMover(build, runtime, kind, surfaceDef) {
    const out = new Map();
    for (const e of runtime.causalEvents) {
        if (e.kind !== kind)
            continue;
        for (const [mover, surface] of [[e.sourceId, e.targetId], [e.targetId, e.sourceId]]) {
            if (!mover || !surface)
                continue;
            const sd = defOf(build, surface);
            if (surfaceDef && sd !== surfaceDef)
                continue;
            if (kind === "SPRING_LAUNCH" && mover !== e.targetId)
                continue;
            if (!isMover(runtime, mover))
                continue;
            const list = out.get(mover) ?? [];
            list.push(e);
            out.set(mover, list);
        }
    }
    return out;
}
function isMover(runtime, id) {
    try {
        runtime.physics.state(id);
        return runtime.physics.mass(id) > 0 && Number.isFinite(runtime.physics.mass(id));
    }
    catch {
        return false;
    }
}
/** Combination and secret discoveries, each tied to one object that really experienced both effects. */
export function collectSpecialDiscoveries(build, runtime) {
    const awards = [];
    const springs = byMover(build, runtime, "SPRING_LAUNCH");
    const ramps = byMover(build, runtime, "RAMP_CONTACT");
    const bounces = byMover(build, runtime, "BOUNCE_PAD_CONTACT", "motion.bounce-pad");
    const grips = byMover(build, runtime, "FRICTION_SLOWED", "motion.friction-high");
    const first = (list) => list?.length ? Math.min(...list.map(e => e.tick)) : undefined;
    const last = (list) => list?.length ? Math.max(...list.map(e => e.tick)) : undefined;
    for (const [mover, launches] of springs) {
        const thing = name(build.getPart(mover));
        const rampAfter = (ramps.get(mover) ?? []).filter(e => e.tick > (first(launches) ?? Infinity));
        if (rampAfter.length)
            awards.push({ id: "combo.spring-ramp", evidence: `The ${thing} was launched by a spring at ${seconds(first(launches))}s, then rolled on a ramp at ${seconds(first(rampAfter))}s.` });
        const bounceAfter = (bounces.get(mover) ?? []).filter(e => e.tick > (first(launches) ?? Infinity));
        if (bounceAfter.length)
            awards.push({ id: "combo.spring-bounce", evidence: `The ${thing} was launched by a spring, then bounced on a bounce pad at ${seconds(first(bounceAfter))}s.` });
        const springIds = new Set(launches.map(e => e.sourceId));
        if (springIds.size >= 2)
            awards.push({ id: "secret.spring-relay", evidence: `${springIds.size} different springs launched the same ${thing}.` });
    }
    for (const [mover, slowed] of grips) {
        const r = ramps.get(mover);
        if (!r?.length)
            continue;
        // Order matters for the claim: the slope first (speeding up), then the grip (slowing down).
        if ((first(r) ?? Infinity) < (last(slowed) ?? -Infinity) && slowed.length >= 3)
            awards.push({ id: "combo.slope-grip", evidence: `The ${name(build.getPart(mover))} rolled down a ramp, then a grip pad slowed it for ${slowed.length} ticks.` });
    }
    for (const [mover, list] of bounces) {
        const def = defOf(build, mover);
        const count = episodes(list, 20);
        if (def === "silly.duck")
            awards.push({ id: "secret.duck-trampoline", evidence: `The duck bounced on a bounce pad at ${seconds(first(list))}s.` });
        if (def === "silly.bolt")
            awards.push({ id: "secret.bolt-boing", evidence: `Bolt bounced on a bounce pad at ${seconds(first(list))}s.` });
        if (count >= 3)
            awards.push({ id: "secret.bounce-hat-trick", evidence: `The ${name(build.getPart(mover))} bounced ${count} separate times.` });
    }
    // Wheel + cart: a wheel hinged to a cart, the cart travelled, and the wheel really turned.
    for (const c of build.allConnections()) {
        if (c.config.kind !== "HINGE")
            continue;
        const pair = [build.getPart(c.fromPartId), build.getPart(c.toPartId)];
        const cart = pair.find(p => p?.definitionId === "motion.cart"), wheel = pair.find(p => p?.definitionId === "motion.wheel");
        if (!cart || !wheel)
            continue;
        try {
            const cs = runtime.physics.state(cart.id), ws = runtime.physics.state(wheel.id);
            const travelled = Math.hypot(cs.x - cart.position.x, cs.y - cart.position.y), turned = Math.abs(ws.angle - wheel.rotation);
            if (travelled > 1 && turned > Math.PI) {
                awards.push({ id: "combo.wheel-cart", evidence: `The cart travelled ${travelled.toFixed(1)} m while its wheel turned ${(turned / (2 * Math.PI)).toFixed(1)} times.` });
                break;
            }
        }
        catch { /* not simulated */ }
    }
    const seen = new Set();
    return awards.filter(a => !seen.has(a.id) && (seen.add(a.id), true));
}
const CONCEPT_EVIDENCE = {
    "motion.gravity-down": "Something fell downward during the test.",
    "motion.slope-effect": "Something touched a ramp and its motion changed.",
    "motion.friction-grip": "A rough surface rubbed against something and slowed it.",
    "motion.bounce": "Something hit a bouncy pad and changed direction.",
    "motion.mass-inertia": "The same push was applied to different masses.",
    "motion.momentum": "Something kept moving across the yard after being set going.",
    "motion.surface-comparison": "Both a grip pad and a slide pad were touched in one test.",
    "gear.direction-flip": "Two meshed gears turned opposite ways for half a second or more.",
    "gear.speed-up": "A driven gear turned at least 1.5 times faster than the driver.",
    "gear.slow-strong": "A driven gear turned slower than the driver, with more turning force.",
    "gear.chain": "Three or more axles turned together in one gear train.",
    "gear.same-way": "A gear two steps along the train turned the same way as the driver.",
    "gear.belt-same-way": "Two belted pulleys turned the same way.",
    "gear.power-limit": "The load needed more turning force than the driver could give, so the train stopped.",
    "combo.gear-conveyor": "A gear-driven conveyor carried cargo more than 1 m.",
    "combo.gear-winch": "A gear-driven winch lifted a load.",
    "secret.gear-gridlock": "Gears meshed in a ring jammed.",
    "secret.super-spin": "A gear turned five times faster than its driver.",
    "secret.sprocket-fling": "The carousel spun faster than Sprocket could hold on."
};
/** Every discovery this TEST run has real evidence for (concept + combination + secret). */
export function evaluateRunDiscoveries(build, runtime) {
    const concepts = [...collectMotionDiscoveries(undefined, build, runtime), ...collectGearDiscoveries(build, runtime)].map(id => ({ id, evidence: CONCEPT_EVIDENCE[id] ?? "Seen in a test." }));
    return [...concepts, ...collectSpecialDiscoveries(build, runtime)].filter(a => discoveryById(a.id));
}
export function eventsFor(runtime, partId, kind) {
    return runtime.causalEvents.filter(e => involves(e, partId) && (!kind || e.kind === kind));
}
export { other as otherParty };
