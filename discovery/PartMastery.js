import { episodes } from "./Discoveries.js";
export const PART_CARDS = [
    { partId: "motion.spring", title: "Spring", uses: [{ id: "launch", label: "Launch" }, { id: "launch-heavy", label: "Launch something heavy" }] },
    { partId: "motion.ramp", title: "Ramp", uses: [{ id: "roll", label: "Roll things down" }, { id: "chain", label: "Ramp to ramp" }] },
    { partId: "motion.friction-high", title: "Grip Pad", uses: [{ id: "slow", label: "Slow things down" }, { id: "stop", label: "Stop a runaway" }] },
    { partId: "motion.friction-low", title: "Slide Pad", uses: [{ id: "glide", label: "Glide far" }] },
    { partId: "motion.bounce-pad", title: "Bounce Pad", uses: [{ id: "bounce", label: "Bounce up" }, { id: "double", label: "Bounce again and again" }] },
    { partId: "motion.wheel", title: "Wheel", uses: [{ id: "roll", label: "Roll along" }, { id: "carry", label: "Carry a cart" }] },
    { partId: "motion.cart", title: "Cart", uses: [{ id: "carry", label: "Ride on wheels" }] },
    { partId: "motion.ball", title: "Ball", uses: [{ id: "roll", label: "Roll" }, { id: "knock", label: "Knock into things" }] },
    { partId: "structure.block", title: "Block", uses: [{ id: "support", label: "Hold something up" }] },
    { partId: "gear.small", title: "Small Gear", uses: [{ id: "spin-fast", label: "Spin fast" }, { id: "drive-big", label: "Turn a big gear strongly" }] },
    { partId: "gear.medium", title: "Medium Gear", uses: [{ id: "pass-along", label: "Pass the turning along" }, { id: "flip", label: "Flip the direction" }] },
    { partId: "gear.large", title: "Large Gear", uses: [{ id: "drive-small", label: "Make a small gear zoom" }, { id: "strong", label: "Turn slowly and strongly" }] },
    { partId: "gear.belt-pulley", title: "Pulley", uses: [{ id: "belt", label: "Share a belt" }] },
    { partId: "builder.beam-wood", title: "Wooden Beam", uses: [{ id: "bridge", label: "Carry someone across" }, { id: "prop", label: "Hold up a load" }] },
    { partId: "builder.beam-metal", title: "Metal Beam", uses: [{ id: "heavy", label: "Carry a heavy load" }, { id: "tower", label: "Stand tall" }] },
    { partId: "builder.brace", title: "Triangle Brace", uses: [{ id: "triangle", label: "Make a triangle" }, { id: "squash", label: "Push back when squashed" }] },
    { partId: "builder.rope", title: "Rope", uses: [{ id: "tie", label: "Pull tight" }, { id: "net", label: "Catch softly" }] },
    { partId: "circuit.wire", title: "Wire", uses: [{ id: "loop", label: "Close a loop" }, { id: "branch", label: "Make a second path" }] },
    { partId: "circuit.switch", title: "Switch", uses: [{ id: "control", label: "Turn something on and off" }] },
    { partId: "circuit.motor", title: "Electric Motor", uses: [{ id: "turn", label: "Turn gears with electricity" }] }
];
const HEAVY = new Set(["motion.cart", "motion.parcel", "silly.bolt"]);
function speed(runtime, id) { try {
    const s = runtime.physics.state(id);
    return Math.hypot(s.vx, s.vy);
}
catch {
    return Infinity;
} }
function travelled(build, runtime, id) {
    const p = build.getPart(id);
    if (!p)
        return 0;
    try {
        const s = runtime.physics.state(id);
        return Math.hypot(s.x - p.position.x, s.y - p.position.y);
    }
    catch {
        return 0;
    }
}
function dynamic(runtime, id) { if (!id)
    return false; try {
    return Number.isFinite(runtime.physics.mass(id));
}
catch {
    return false;
} }
function partner(e, id) { return e.sourceId === id ? e.targetId : e.targetId === id ? e.sourceId : undefined; }
/** Every part use this TEST really showed. Pure read of the run; changes nothing. */
export function observePartUses(build, runtime) {
    const uses = [];
    const add = (partId, useId) => { if (!uses.some(u => u.partId === partId && u.useId === useId))
        uses.push({ partId, useId }); };
    const events = runtime.causalEvents;
    for (const part of build.allParts()) {
        const mine = events.filter(e => e.sourceId === part.id || e.targetId === part.id);
        switch (part.definitionId) {
            case "motion.spring": {
                const launches = mine.filter(e => e.kind === "SPRING_LAUNCH" && e.sourceId === part.id);
                if (launches.length)
                    add(part.definitionId, "launch");
                if (launches.some(e => HEAVY.has(build.getPart(e.targetId ?? "")?.definitionId ?? "")))
                    add(part.definitionId, "launch-heavy");
                break;
            }
            case "motion.ramp": {
                const movers = new Set(mine.filter(e => e.kind === "RAMP_CONTACT").map(e => partner(e, part.id)).filter(id => dynamic(runtime, id)));
                if (movers.size)
                    add(part.definitionId, "roll");
                // Ramp to ramp: one moving thing touched this ramp and another ramp.
                for (const m of movers)
                    if (events.some(e => e.kind === "RAMP_CONTACT" && partner(e, m) && partner(e, m) !== part.id && build.getPart(partner(e, m))?.definitionId === "motion.ramp")) {
                        add(part.definitionId, "chain");
                        break;
                    }
                break;
            }
            case "motion.friction-high": {
                const slowed = mine.filter(e => e.kind === "FRICTION_SLOWED");
                if (slowed.length >= 3)
                    add(part.definitionId, "slow");
                const movers = new Set(slowed.map(e => partner(e, part.id)).filter(id => dynamic(runtime, id)));
                if ([...movers].some(id => speed(runtime, id) < 0.08 && travelled(build, runtime, id) > 1))
                    add(part.definitionId, "stop");
                break;
            }
            case "motion.friction-low": {
                const movers = new Set(mine.filter(e => e.kind === "PHYSICS_CONTACT").map(e => partner(e, part.id)).filter(id => dynamic(runtime, id)));
                if ([...movers].some(id => travelled(build, runtime, id) > 3))
                    add(part.definitionId, "glide");
                break;
            }
            case "motion.bounce-pad": {
                const hits = mine.filter(e => e.kind === "BOUNCE_PAD_CONTACT");
                const byMover = new Map();
                for (const e of hits) {
                    const m = partner(e, part.id);
                    if (m && dynamic(runtime, m))
                        byMover.set(m, [...(byMover.get(m) ?? []), e]);
                }
                if (byMover.size)
                    add(part.definitionId, "bounce");
                if ([...byMover.values()].some(list => episodes(list) >= 2))
                    add(part.definitionId, "double");
                break;
            }
            case "motion.wheel": {
                let turned = 0;
                try {
                    turned = Math.abs(runtime.physics.state(part.id).angle - part.rotation);
                }
                catch { /* */ }
                if (travelled(build, runtime, part.id) > 1 && turned > Math.PI)
                    add(part.definitionId, "roll");
                const cart = build.allConnections().filter(c => c.config.kind === "HINGE" && (c.fromPartId === part.id || c.toPartId === part.id))
                    .map(c => build.getPart(c.fromPartId === part.id ? c.toPartId : c.fromPartId)).find(p => p?.definitionId === "motion.cart");
                if (cart && travelled(build, runtime, cart.id) > 1 && turned > Math.PI)
                    add(part.definitionId, "carry");
                break;
            }
            case "motion.cart": {
                const wheels = build.allConnections().filter(c => c.config.kind === "HINGE" && (c.fromPartId === part.id || c.toPartId === part.id)).length;
                if (wheels > 0 && travelled(build, runtime, part.id) > 1)
                    add(part.definitionId, "carry");
                break;
            }
            case "motion.ball": {
                if (travelled(build, runtime, part.id) > 1)
                    add(part.definitionId, "roll");
                if (mine.some(e => e.kind === "PHYSICS_CONTACT" && dynamic(runtime, partner(e, part.id))))
                    add(part.definitionId, "knock");
                break;
            }
            case "structure.block": {
                // Something moving came to rest on top of this block.
                const resting = new Set(mine.filter(e => e.kind === "PHYSICS_CONTACT").map(e => partner(e, part.id)).filter(id => dynamic(runtime, id)));
                if ([...resting].some(id => { try {
                    const s = runtime.physics.state(id);
                    return s.y < part.position.y && speed(runtime, id) < 0.08 && eventsSince(events, id, part.id, runtime.tick - 20);
                }
                catch {
                    return false;
                } }))
                    add(part.definitionId, "support");
                break;
            }
        }
    }
    // Gears: uses come from what the GearSystem measured (half a second of real turning).
    const gears = runtime.gears;
    const running = (id) => (gears.state(id)?.runTicks ?? 0) >= 30;
    for (const part of build.allParts()) {
        const st = gears.state(part.id);
        if (!st || !running(part.id))
            continue;
        const meshes = gears.analysis.links.filter(l => l.kind === "MESH" && (l.a === part.id || l.b === part.id));
        const partners = meshes.map(l => gears.node(l.a === part.id ? l.b : l.a)).filter(n => running(n.id));
        if (part.definitionId === "gear.small") {
            if (Math.abs(st.factor) >= 1.5)
                add(part.definitionId, "spin-fast");
            if (partners.some(n => n.radius > 0.6 && Math.abs(gears.omega(n.id)) < Math.abs(st.omega)))
                add(part.definitionId, "drive-big");
        }
        if (part.definitionId === "gear.medium") {
            if (partners.length >= 2)
                add(part.definitionId, "pass-along");
            if (partners.length >= 1)
                add(part.definitionId, "flip");
        }
        if (part.definitionId === "gear.large") {
            if (partners.some(n => n.radius < 0.4 && Math.abs(gears.omega(n.id)) > Math.abs(st.omega)))
                add(part.definitionId, "drive-small");
            if (Math.abs(st.factor) <= 0.7 && st.depth > 0)
                add(part.definitionId, "strong");
        }
        if (part.definitionId === "gear.belt-pulley" && gears.analysis.links.some(l => l.kind === "BELT" && (l.a === part.id || l.b === part.id)))
            add(part.definitionId, "belt");
    }
    // Structures: uses from what the StructureSystem measured.
    const st = runtime.structures;
    for (const m of st.members) {
        const ms = st.memberState(m.id);
        if (ms.broken)
            continue;
        const part = build.getPart(m.partId);
        if (!part)
            continue;
        const carried = st.travellerStates().some(t => t.arrived && st.walkedOnStructure(t.id));
        if (part.definitionId === "builder.beam-wood") {
            if (carried && ms.peakRatio > 0.1)
                add(part.definitionId, "bridge");
            if (ms.mode === "COMPRESSION" && ms.peakRatio > 0.15)
                add(part.definitionId, "prop");
        }
        if (part.definitionId === "builder.beam-metal") {
            if (ms.peakRatio > 0.3 && Math.abs(ms.axial) > 25)
                add(part.definitionId, "heavy");
            if (Math.abs(Math.sin(part.rotation)) > 0.8 && st.calmTicksBelow(0.1) >= 60)
                add(part.definitionId, "tower");
        }
        if (part.definitionId === "builder.brace") {
            if (st.calmTicksBelow(0.1) >= 60)
                add(part.definitionId, "triangle");
            if (ms.mode === "COMPRESSION" && ms.peakRatio > 0.1)
                add(part.definitionId, "squash");
        }
        if (part.definitionId === "builder.rope") {
            if (ms.mode === "TENSION" && ms.peakRatio > 0.05)
                add(part.definitionId, "tie");
            if (st.eggStates().some(e => e.onMember === m.id))
                add(part.definitionId, "net");
        }
    }
    // Circuits: uses from what the CircuitSystem measured.
    const c = runtime.circuits;
    if (c.layout.elements.length) {
        const lit = c.loadStates().filter(l => c.ticksAtLeast(l.id, 0.15) >= 30);
        for (const part of build.allParts()) {
            if (part.definitionId === "circuit.wire" && Math.abs(c.current(part.id)) > 0.05 && lit.length) {
                add(part.definitionId, "loop");
                const e = c.layout.elements.find(x => x.partId === part.id);
                if (e && lit.filter(l => { const le = c.layout.elements.find(x => x.partId === l.id); return le && (le.a === e.a || le.a === e.b || le.b === e.a || le.b === e.b); }).length >= 2 && c.layout.terminals.filter(t => t.node === e.a || t.node === e.b).length >= 4)
                    add(part.definitionId, "branch");
            }
            if (part.definitionId === "circuit.switch" && runtime.causalEvents.some(ev => ev.kind === "SWITCH_CHANGED" && ev.sourceId === part.id) && runtime.causalEvents.some(ev => ev.kind === "LOAD_ON" || ev.kind === "LOAD_OFF"))
                add(part.definitionId, "control");
            if (part.definitionId === "circuit.motor" && (runtime.gears.state(part.id)?.runTicks ?? 0) >= 30)
                add(part.definitionId, "turn");
        }
    }
    return uses.filter(u => PART_CARDS.some(c => c.partId === u.partId && c.uses.some(x => x.id === u.useId)));
}
function eventsSince(events, a, b, fromTick) {
    return events.some(e => e.tick >= fromTick && e.kind === "PHYSICS_CONTACT" && ((e.sourceId === a && e.targetId === b) || (e.sourceId === b && e.targetId === a)));
}
export function useLabel(partId, useId) { return PART_CARDS.find(c => c.partId === partId)?.uses.find(u => u.id === useId)?.label ?? useId; }
export function partTitle(partId) { return PART_CARDS.find(c => c.partId === partId)?.title ?? partId; }
