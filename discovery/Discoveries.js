import { collectMotionDiscoveries, MOTION_REAL_WORLD_CARDS } from "../motion/MotionYard.js";
import { collectGearDiscoveries, GEAR_REAL_WORLD_CARDS } from "../gears/GearGarage.js";
import { collectStructureDiscoveries, STRUCTURE_REAL_WORLD_CARDS } from "../structures/BuilderBay.js";
import { LAB_MODULES } from "../labs/Labs.js";
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
    { id: "secret.sprocket-fling", kind: "SECRET", title: "Sprocket Spin-Out", line: "Too fast! Sprocket went flying (into a soft cushion).", art: "gear.carousel", truthContractId: "truth.gears.v1" },
    // Builder Bay (M13) — every one measured by the StructureSystem (truth.structures.v1)
    { id: "structure.bracing", kind: "CONCEPT", title: "Bracing makes it steady", line: "You added a brace and your structure stopped wobbling.", art: "builder.brace", truthContractId: "truth.structures.v1" },
    { id: "structure.triangle", kind: "CONCEPT", title: "Triangles hold their shape", line: "A triangle can't lean or squash unless a side breaks.", art: "builder.brace", truthContractId: "truth.structures.v1" },
    { id: "structure.tension-compression", kind: "CONCEPT", title: "Pulled and squashed", line: "Some parts get pulled (tension) while others get squashed (compression).", art: "builder.beam-wood", truthContractId: "truth.structures.v1" },
    { id: "structure.material", kind: "CONCEPT", title: "Materials matter", line: "Metal held a load that would have broken wood — but metal is heavier too.", art: "builder.beam-metal", truthContractId: "truth.structures.v1" },
    { id: "structure.span", kind: "CONCEPT", title: "Long beams bend more", line: "A heavy load in the middle of a long beam bent it until it snapped.", art: "builder.beam-wood", truthContractId: "truth.structures.v1" },
    { id: "structure.buckle", kind: "CONCEPT", title: "Long thin posts buckle", line: "Squash a long thin post and it bends out sideways.", art: "builder.column", truthContractId: "truth.structures.v1" },
    { id: "structure.load-path", kind: "CONCEPT", title: "Weight goes down to the ground", line: "Everything that crossed your bridge pressed down through it into the ground.", art: "builder.beam-metal", truthContractId: "truth.structures.v1" },
    { id: "structure.soft-landing", kind: "CONCEPT", title: "Soft catches are gentle", line: "A rope net stretched and caught the egg gently.", art: "builder.rope", truthContractId: "truth.structures.v1" },
    { id: "combo.crane", kind: "COMBINATION", title: "Gears + tower = crane", line: "Your tower held the winch while the gears lifted the load.", art: "gear.winch", truthContractId: "truth.structures.v1" },
    { id: "combo.ramp-bridge", kind: "COMBINATION", title: "Ramp + bridge", line: "Up a Motion ramp and across your bridge in one go.", art: "motion.ramp", truthContractId: "truth.structures.v1" },
    { id: "secret.mega-collapse", kind: "SECRET", title: "Spectacular Collapse", line: "Five parts broke in one test! (That's how engineers learn.)", art: "builder.beam-wood", truthContractId: "truth.structures.v1" },
    // Power Lab (M14) — every one measured by the CircuitSystem (truth.electricity.v1)
    { id: "power.complete-circuit", kind: "CONCEPT", title: "Circuits need a loop", line: "Electricity flows out of the battery, through the load, and back again.", art: "icon.lightning", truthContractId: "truth.electricity.v1" },
    { id: "power.switch-control", kind: "CONCEPT", title: "Switches open the loop", line: "A switch or button makes a gap in the loop — or closes it.", art: "power.button-lever", truthContractId: "truth.electricity.v1" },
    { id: "power.series", kind: "CONCEPT", title: "Sharing one loop", line: "Bulbs in one long loop share the battery's push, so each is dimmer.", art: "icon.lightning", truthContractId: "truth.electricity.v1" },
    { id: "power.parallel", kind: "CONCEPT", title: "A path each", line: "Give each bulb its own path and they're all bright — the battery works harder.", art: "icon.power-burst", truthContractId: "truth.electricity.v1" },
    { id: "power.motor", kind: "CONCEPT", title: "Electricity makes things turn", line: "An electric motor turns when current flows through it.", art: "icon.cat-power", truthContractId: "truth.electricity.v1" },
    { id: "power.more-batteries", kind: "CONCEPT", title: "Two batteries push harder", line: "Batteries end to end push more electricity round the loop.", art: "icon.battery", truthContractId: "truth.electricity.v1" },
    { id: "power.easy-path", kind: "CONCEPT", title: "Electricity takes the easy path", line: "A plain wire next to a bulb carries the current around it, so the bulb goes out.", art: "icon.lightning", truthContractId: "truth.electricity.v1" },
    { id: "power.battery-drain", kind: "CONCEPT", title: "Batteries run down", line: "Everything that's switched on uses up the battery's stored energy.", art: "icon.battery-charge", truthContractId: "truth.electricity.v1" },
    { id: "combo.power-gears", kind: "COMBINATION", title: "Motor + gears", line: "An electric motor turned your gears and they did the work.", art: "icon.cat-gears", truthContractId: "truth.electricity.v1" },
    { id: "combo.power-conveyor", kind: "COMBINATION", title: "Electric conveyor", line: "Electricity ran the old Motion Yard conveyor.", art: "icon.energy-orb", truthContractId: "truth.electricity.v1" },
    { id: "secret.power-overload", kind: "SECRET", title: "Overload!", line: "Too much at once — the power station switched itself off to stay safe.", art: "icon.power-burst", truthContractId: "truth.electricity.v1" },
    { id: "secret.power-light-show", kind: "SECRET", title: "Light Show", line: "Five bulbs glowing at once!", art: "icon.lightning", truthContractId: "truth.electricity.v1" },
    { id: "secret.power-duck-alarm", kind: "SECRET", title: "Quack Attack Alarm", line: "A duck set off your alarm. Security is tight.", art: "icon.button", truthContractId: "truth.electricity.v1" },
    { id: "secret.sky-tower", kind: "SECRET", title: "Sky Scraper", line: "A tower so tall it nearly touched the ceiling — and it stood firm!", art: "builder.beam-metal", truthContractId: "truth.structures.v1" }
];
export function discoveryById(id) { return DISCOVERIES.find(d => d.id === id); }
export function realWorldCard(id) { return [...MOTION_REAL_WORLD_CARDS, ...GEAR_REAL_WORLD_CARDS, ...STRUCTURE_REAL_WORLD_CARDS, ...LAB_MODULES.flatMap(m => m.realWorldCards)].find(c => c.discoveryId === id); }
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
    "secret.sprocket-fling": "The carousel spun faster than Sprocket could hold on.",
    "structure.bracing": "After a brace was added, the measured wobble dropped by half or more compared with the last test.",
    "structure.triangle": "A closed triangle carried load and stayed steady for a second or more.",
    "structure.tension-compression": "One member was pulled and another squashed, both carrying real load.",
    "structure.material": "A metal member carried a force bigger than the same wooden one could take.",
    "structure.span": "A beam broke from bending under a load part-way along it.",
    "structure.buckle": "A long member failed by buckling when squashed.",
    "structure.load-path": "Something crossed a built structure and its weight was carried to the supports.",
    "structure.soft-landing": "The egg landed in a rope net.",
    "combo.crane": "A structure held a winch while gears lifted a load.",
    "combo.ramp-bridge": "A traveller climbed a ramp and crossed a built structure.",
    "secret.mega-collapse": "Five or more members broke in one test.",
    "secret.sky-tower": "A steady structure reached above 2 m from the top of the playfield."
};
/** Every discovery this TEST run has real evidence for (concept + combination + secret). */
export function evaluateRunDiscoveries(build, runtime, previous) {
    const concepts = [...collectMotionDiscoveries(undefined, build, runtime), ...collectGearDiscoveries(build, runtime), ...collectStructureDiscoveries(build, runtime, previous)].map(id => ({ id, evidence: CONCEPT_EVIDENCE[id] ?? "Seen in a test." }));
    for (const m of LAB_MODULES)
        for (const id of m.collectDiscoveries(build, runtime))
            concepts.push({ id, evidence: m.conceptEvidence[id] ?? "Seen in a test." });
    return [...concepts, ...collectSpecialDiscoveries(build, runtime)].filter(a => discoveryById(a.id));
}
export function eventsFor(runtime, partId, kind) {
    return runtime.causalEvents.filter(e => involves(e, partId) && (!kind || e.kind === kind));
}
export { other as otherParty };
