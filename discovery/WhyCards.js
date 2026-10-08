export const WHY_CHOICES = {
    TOO_FAST: { label: "Too fast", icon: "💨" },
    NOT_ENOUGH_FORCE: { label: "Not enough push", icon: "🪶" },
    TOO_MUCH_FORCE: { label: "Too much push", icon: "💥" },
    WRONG_DIRECTION: { label: "Wrong way", icon: "↩️" },
    NOT_CONNECTED: { label: "Not connected", icon: "🔗" },
    UNSTABLE: { label: "Wobbly / tipped", icon: "🙃" },
    TOO_HEAVY: { label: "Too heavy", icon: "🏋️" },
    TOO_LIGHT: { label: "Too light", icon: "🎈" },
    TOO_SLOW: { label: "Too slow", icon: "🐌" },
    JAMMED: { label: "Jammed", icon: "🔒" },
    BLOCKED: { label: "In the way", icon: "🚧" },
    TOO_SHORT: { label: "Not tall enough", icon: "📏" },
    SAME: { label: "About the same", icon: "⚖️" },
    SHORTCUT: { label: "Took a shortcut", icon: "⚡" },
    ALWAYS_ON: { label: "Always on", icon: "💡" },
    USED_TOO_MUCH: { label: "Used too much power", icon: "🔋" },
    OVERLOAD: { label: "Too much at once", icon: "🔌" },
    WRONG_POLE: { label: "Wrong end facing", icon: "🧲" },
    TOUCHED: { label: "Something touched it", icon: "✋" },
    NOT_MAGNETIC: { label: "Not magnetic", icon: "🪵" },
    TOO_HIGH: { label: "Too high to reach", icon: "⛰️" },
    LEAKING: { label: "Leaking", icon: "💧" },
    MISSED: { label: "Missed the target", icon: "🎯" }
};
function tagged(build, tag) { return build.allParts().find(p => p.tags?.includes(tag)); }
function state(runtime, id) { try {
    return runtime.physics.state(id);
}
catch {
    return undefined;
} }
function nameOf(part) {
    const n = part.definitionId.replace(/^[a-z]+\./, "").replaceAll("-", " ");
    return n === "bolt" ? "Bolt" : `the ${n}`;
}
const m = (v) => `${v.toFixed(1)} m`;
/** Picks two other answers deterministically so the same failure shows the same card. */
function choicesFor(reason) {
    if (["TOO_HIGH", "LEAKING", "MISSED"].includes(reason)) {
        const pool = ["TOO_HIGH", "LEAKING", "MISSED", "NOT_CONNECTED", "TOO_SLOW", "WRONG_DIRECTION"].filter(r => r !== reason);
        const seed = reason.length;
        const three = [reason, pool[seed % pool.length], pool[(seed + 2) % pool.length]];
        return [three[seed % 3], three[(seed + 1) % 3], three[(seed + 2) % 3]];
    }
    const power = ["SHORTCUT", "ALWAYS_ON", "USED_TOO_MUCH", "OVERLOAD", "WRONG_POLE", "TOUCHED", "NOT_MAGNETIC"].includes(reason);
    const magnetPool = ["WRONG_POLE", "TOUCHED", "NOT_MAGNETIC", "NOT_ENOUGH_FORCE", "UNSTABLE", "TOO_MUCH_FORCE"];
    if (power) {
        const pool = (["WRONG_POLE", "TOUCHED", "NOT_MAGNETIC"].includes(reason) ? magnetPool : ["NOT_CONNECTED", "SHORTCUT", "ALWAYS_ON", "OVERLOAD", "NOT_ENOUGH_FORCE", "USED_TOO_MUCH"]).filter(r => r !== reason);
        const seed = reason.length;
        const three = [reason, pool[seed % pool.length], pool[(seed + 2) % pool.length]];
        return [three[seed % 3], three[(seed + 1) % 3], three[(seed + 2) % 3]];
    }
    const structure = ["BLOCKED", "TOO_SHORT", "SAME", "UNSTABLE"].includes(reason);
    const gear = ["JAMMED", "TOO_SLOW", "TOO_HEAVY"].includes(reason);
    const pool = (structure ? ["UNSTABLE", "TOO_HEAVY", "NOT_CONNECTED", "BLOCKED", "TOO_SHORT", "TOO_FAST"] : gear ? ["TOO_FAST", "TOO_SLOW", "WRONG_DIRECTION", "NOT_CONNECTED", "JAMMED", "TOO_HEAVY"] : ["TOO_FAST", "NOT_ENOUGH_FORCE", "TOO_MUCH_FORCE", "WRONG_DIRECTION", "NOT_CONNECTED", "UNSTABLE"]).filter(r => r !== reason);
    const seed = reason.length;
    const a = pool[seed % pool.length], b = pool[(seed + 2) % pool.length];
    const three = [reason, a, b];
    return [three[seed % 3], three[(seed + 1) % 3], three[(seed + 2) % 3]];
}
/**
 * Diagnoses a failed run from its real evidence. Returns undefined when nothing clear was measured —
 * then Bolt simply doesn't ask (no made-up reasons).
 */
export function diagnoseRun(level, build, runtime) {
    if (!runtime || runtime.tick < 20)
        return undefined;
    const card = (reason, evidence) => ({ reason, evidence, choices: choicesFor(reason) });
    const rules = level?.outcomeRules ?? [];
    // Power Lab: the circuit's own measurements.
    const powerCard = diagnosePower(rules, build, runtime, card);
    if (powerCard)
        return powerCard;
    const magnetCard = diagnoseMagnets(rules, build, runtime, card);
    if (magnetCard)
        return magnetCard;
    const waterCard = diagnoseWater(rules, build, runtime, card);
    if (waterCard)
        return waterCard;
    // Builder Bay: the structure's own measurements.
    const structureCard = diagnoseStructures(rules, build, runtime, card);
    if (structureCard)
        return structureCard;
    // Gear Garage: the gear train's own measurements explain most failures.
    const gearCard = diagnoseGears(rules, build, runtime, card);
    if (gearCard)
        return gearCard;
    // Structure first: a broken joint or a cart on its roof explains everything after it.
    if (runtime.causalEvents.some(e => e.kind === "STRUCTURE_BROKE"))
        return card("UNSTABLE", "A joint snapped during the test, so the machine came apart.");
    for (const cart of build.allParts().filter(p => p.definitionId === "motion.cart")) {
        const s = state(runtime, cart.id);
        if (!s)
            continue;
        const tilt = Math.abs(Math.atan2(Math.sin(s.angle), Math.cos(s.angle)));
        if (tilt > 1.2)
            return card("UNSTABLE", `The cart tipped over — it ended up turned ${Math.round(tilt * 180 / Math.PI)}°.`);
    }
    // A wheel sitting right next to a cart but never attached to it.
    for (const wheel of build.allParts().filter(p => p.definitionId === "motion.wheel")) {
        const near = build.allParts().find(p => p.definitionId === "motion.cart" && Math.hypot(p.position.x - wheel.position.x, p.position.y - wheel.position.y) < 1.65);
        const joined = near && build.allConnections().some(c => (c.fromPartId === near.id && c.toPartId === wheel.id) || (c.toPartId === near.id && c.fromPartId === wheel.id));
        if (near && !joined)
            return card("NOT_CONNECTED", "The wheel was next to the cart, but it wasn't attached, so they moved separately.");
    }
    // Crashing into a hazard (a barrier or danger line) means it arrived too fast to stop.
    const hazards = build.allParts().filter(p => p.tags?.some(t => t.startsWith("hazard.")));
    for (const subject of build.allParts().filter(p => p.tags?.some(t => t.startsWith("subject.")))) {
        const hit = runtime.causalEvents.find(e => e.kind === "PHYSICS_CONTACT" && hazards.some(h => (e.sourceId === h.id && e.targetId === subject.id) || (e.targetId === h.id && e.sourceId === subject.id)));
        if (hit)
            return card("TOO_FAST", `${cap(nameOf(subject))} crashed into the barrier at ${(hit.tick / 60).toFixed(1)}s — it was still going too fast to stop.`);
    }
    for (const rule of rules) {
        if (rule.kind === "FORBIDDEN_CONTACT" || rule.kind === "OBJECT_STOPS_BEFORE_X") {
            const tag = rule.kind === "FORBIDDEN_CONTACT" ? rule.aTag : rule.objectTag;
            const part = tagged(build, tag);
            const s = part && state(runtime, part.id);
            if (!part || !s)
                continue;
            const v = Math.hypot(s.vx, s.vy);
            if (rule.kind === "OBJECT_STOPS_BEFORE_X" && s.x > rule.maxX)
                return card("TOO_FAST", `${cap(nameOf(part))} rolled ${m(s.x - rule.maxX)} past the danger line — it was still too fast.`);
            if (rule.kind === "OBJECT_STOPS_BEFORE_X" && v > rule.maxSpeed && runtime.elapsedTime >= rule.minElapsed)
                return card("TOO_FAST", `${cap(nameOf(part))} was still moving at ${v.toFixed(1)} m/s — it needs to slow down more.`);
        }
        if (rule.kind === "OBJECT_ENTERS_ZONE") {
            const subject = tagged(build, rule.objectTag), zone = tagged(build, rule.zoneTag);
            const s = subject && state(runtime, subject.id);
            if (!subject || !zone || !s)
                continue;
            const startD = Math.hypot(subject.position.x - zone.position.x, subject.position.y - zone.position.y);
            const nowD = Math.hypot(s.x - zone.position.x, s.y - zone.position.y);
            const v = Math.hypot(s.vx, s.vy);
            const moved = Math.hypot(s.x - subject.position.x, s.y - subject.position.y);
            if (nowD <= rule.radius && rule.maxSpeed !== undefined && v > rule.maxSpeed)
                return card("TOO_FAST", `${cap(nameOf(subject))} reached the spot at ${v.toFixed(1)} m/s — too fast for a safe landing.`);
            const dirToZone = Math.sign(zone.position.x - subject.position.x);
            const passed = dirToZone !== 0 && Math.sign(zone.position.x - s.x) === -dirToZone;
            if (s.x < -0.5 || s.x > 16.5)
                return card("TOO_MUCH_FORCE", `${cap(nameOf(subject))} flew right off the edge of the yard!`);
            if (v > 0.15) {
                if (passed && nowD > rule.radius && Math.sign(s.vx) === dirToZone)
                    return card("TOO_FAST", `${cap(nameOf(subject))} zoomed past the goal at ${v.toFixed(1)} m/s and kept going.`);
                continue; // still moving: no verdict yet
            }
            if (subject.position.y > zone.position.y + 0.8 && s.y > zone.position.y + 0.8)
                return card("NOT_ENOUGH_FORCE", `${cap(nameOf(subject))} never got up high enough — the goal is ${m(s.y - zone.position.y)} higher than where it ended.`);
            if (moved < 0.3)
                return card("NOT_ENOUGH_FORCE", `${cap(nameOf(subject))} hardly moved (${m(moved)}). Nothing pushed it toward the goal.`);
            const went = Math.sign(s.x - subject.position.x);
            if (nowD > startD + 0.5 && dirToZone !== 0 && went === -dirToZone)
                return card("WRONG_DIRECTION", `${cap(nameOf(subject))} went the other way — it ended ${m(nowD - startD)} farther from the goal than where it started.`);
            if (passed && nowD > rule.radius)
                return card("TOO_MUCH_FORCE", `${cap(nameOf(subject))} overshot — it landed ${m(nowD)} past the goal.`);
            if (nowD > rule.radius)
                return card("NOT_ENOUGH_FORCE", `${cap(nameOf(subject))} stopped ${m(nowD)} short of the goal.`);
        }
        if (rule.kind === "DISTANCE_FROM_START") {
            const subject = tagged(build, rule.objectTag);
            const s = subject && state(runtime, subject.id);
            if (!subject || !s)
                continue;
            const d = Math.hypot(s.x - subject.position.x, s.y - subject.position.y);
            if (Math.hypot(s.vx, s.vy) < 0.1 && d < rule.minDistance)
                return card("NOT_ENOUGH_FORCE", `${cap(nameOf(subject))} travelled ${m(d)}, but the goal is ${m(rule.minDistance)}. Something slowed it down.`);
        }
    }
    return undefined;
}
const WHO = { BOLT: "Bolt", ELEPHANT: "the elephant robot", CART: "the cart", ROBOT: "a parade robot" };
function diagnoseStructures(rules, build, runtime, card) {
    const st = runtime.structures;
    const ev = runtime.causalEvents;
    const n = (v) => v.toFixed(1);
    if (ev.some(e => e.kind === "WINCH_UNSUPPORTED"))
        return card("NOT_CONNECTED", "The winch had nothing holding it up, so it couldn't lift anything.");
    const isStructLevel = rules.some(r => r.kind.startsWith("STRUCT_"));
    if (!isStructLevel && !st.members.length)
        return undefined;
    const material = (id) => { const m = st.members.find(x => x.id === id); return m ? m.material === "WOOD" ? "wooden" : m.material === "METAL" ? "metal" : "rope" : ""; };
    // A beam with a loose end (resting on nothing, joined to nothing) just tips down: that is "not connected", not "no triangles".
    const dangling = st.members.find(m => { const ms = st.memberState(m.id); if (ms.breakMode !== "COLLAPSE" && ms.breakMode !== "UNSUPPORTED")
        return false; return [m.a, m.b].some(j => !st.layout.joints[j].supported && st.members.filter(x => x.a === j || x.b === j).length === 1); });
    if (dangling)
        return card("NOT_CONNECTED", "One end of a beam wasn't resting on anything or joined to anything, so it tipped down.");
    // Experiments: the comparison itself is the lesson, so report it before any breakage.
    for (const r of rules)
        if (r.kind === "STRUCT_COMPARE") {
            const ta = tagged(build, r.aTag), tb = tagged(build, r.bTag);
            const la = ta && st.load(ta.id), lb = tb && st.load(tb.id);
            if (la?.done && lb?.done && la.held > 0 && lb.held > 0 && Math.max(la.held, lb.held) / Math.min(la.held, lb.held) < r.minRatio)
                return card("SAME", `A held ${n(la.held)} and B held ${n(lb.held)} — almost the same. Make the two bridges different.`);
        }
    // Whatever gave way FIRST is the cause; later collapses are just the result.
    const firstFailure = ev.find(e => e.kind === "STRUCT_COLLAPSE" || e.kind === "STRUCT_BREAK");
    const collapse = firstFailure?.kind === "STRUCT_COLLAPSE" ? firstFailure : undefined;
    if (collapse)
        return card("UNSTABLE", "Part of the structure leaned over and fell down — it had no triangles to stop it changing shape.");
    const brk = firstFailure?.kind === "STRUCT_BREAK" ? firstFailure : undefined;
    if (brk) {
        const mode = String(brk.data?.mode ?? "");
        const mat = material(brk.sourceId);
        const what = mode === "BENDING" ? "bent too much in the middle and snapped" : mode === "BUCKLE" ? "was squashed until it buckled sideways" : mode === "TENSION" ? "was pulled until it snapped" : "was squashed until it broke";
        return card("TOO_HEAVY", `A ${mat} beam ${what}. Stronger material, a shorter span or a triangle would share the load.`);
    }
    const blocked = ev.find(e => e.kind === "TRAVELLER_BLOCKED");
    if (blocked) {
        const who = WHO[registryWho(build, blocked.sourceId)] ?? "someone";
        return card("BLOCKED", `Something you built was in the way, so ${who} couldn't get past.`);
    }
    const fell = ev.find(e => e.kind === "TRAVELLER_FELL");
    if (fell) {
        const who = WHO[registryWho(build, fell.sourceId)] ?? "someone";
        return card("NOT_CONNECTED", `${cap(who)} walked off the edge at ${n(Number(fell.data?.x ?? 0))} m — the path didn't reach all the way.`);
    }
    for (const r of rules) {
        if (r.kind === "STRUCT_EGG_SAFE") {
            const egg = tagged(build, r.eggTag);
            const e = egg && st.egg(egg.id);
            if (e?.landed) {
                if (!e.onStructure)
                    return card("NOT_CONNECTED", "Nothing caught the egg — it fell all the way to the floor.");
                if ((e.impact ?? 0) > r.maxImpact)
                    return card("TOO_FAST", `The egg landed with a bump of ${n(e.impact ?? 0)}; it can only take ${n(r.maxImpact)}. A shorter drop or a softer catch helps.`);
            }
        }
        if (r.kind === "STRUCT_HEIGHT") {
            const top = st.topY();
            if (top === undefined || top > r.aboveY)
                return card("TOO_SHORT", top === undefined ? "Nothing was left standing." : `The top reached ${n(8.2 - top)} m high, but the flag is at ${n(8.2 - r.aboveY)} m.`);
            if (st.wobble() > r.maxWobble)
                return card("UNSTABLE", `The tower swayed ${n(st.wobble() * 100)} cm in the wind — it needs to stay steadier.`);
        }
        if (r.kind === "STRUCT_STABLE" && st.wobble() > r.maxWobble)
            return card("UNSTABLE", `It moved ${n(st.wobble() * 100)} cm under the load. Bracing makes it stiffer.`);
        if (r.kind === "STRUCT_COMPARE") {
            const a = tagged(build, r.aTag), b = tagged(build, r.bTag);
            const la = a && st.load(a.id), lb = b && st.load(b.id);
            if (la?.done && lb?.done && la.held > 0 && lb.held > 0 && Math.max(la.held, lb.held) / Math.min(la.held, lb.held) < r.minRatio)
                return card("SAME", `A held ${n(la.held)} and B held ${n(lb.held)} — almost the same. Make the two bridges different.`);
            if ((la?.fell && la.held === 0) || (lb?.fell && lb.held === 0))
                return card("NOT_CONNECTED", "A test weight had no bridge under it and dropped straight into the canyon.");
        }
    }
    return undefined;
}
function registryWho(build, id) { const p = build.getPart(id); return p?.definitionId === "builder.elephant" ? "ELEPHANT" : p?.definitionId === "builder.cart" ? "CART" : p?.definitionId === "builder.robot" ? "ROBOT" : "BOLT"; }
function diagnoseGears(rules, build, runtime, card) {
    const g = runtime.gears;
    const n = (v) => v.toFixed(1);
    const targets = rules.flatMap((r) => r.kind === "GEAR_OUTPUT" ? [{ rule: r, tag: r.targetTag }] : r.kind === "GEAR_COMPARE" ? [{ rule: r, tag: r.aTag }, { rule: r, tag: r.bTag }] : []);
    // Any jam or stall anywhere is the headline.
    const jam = runtime.causalEvents.find(e => e.kind === "GEAR_JAMMED");
    if (jam)
        return card("JAMMED", jam.data?.reason === "CLASH" ? "Two gears were overlapping, so their teeth crashed and nothing could turn." : jam.data?.reason === "FIGHT" ? "Two drivers were trying to turn the same gears in different ways." : "Gears were meshed in a ring: each one tried to turn its neighbour the wrong way, so they all locked.");
    const stall = runtime.causalEvents.find(e => e.kind === "GEAR_STALLED");
    if (stall)
        return card("TOO_HEAVY", `The load needed ${n(Number(stall.data?.required ?? 0))} units of turning force but the driver only had ${n(Number(stall.data?.available ?? 0))}. A slower gear set-up is stronger.`);
    for (const { rule, tag } of targets) {
        const part = tagged(build, tag);
        if (!part)
            continue;
        const st = g.state(part.id);
        if (!st)
            continue;
        if (st.omega === 0) {
            const near = g.analysis.nearMisses.filter(m => m.a === part.id || m.b === part.id || g.analysis.axleOf.get(m.a) === g.analysis.axleOf.get(part.id) || g.analysis.axleOf.get(m.b) === g.analysis.axleOf.get(part.id)).sort((p, q) => p.gap - q.gap)[0];
            return card("NOT_CONNECTED", near ? `A gear here was ${n(near.gap)} m away from touching the next one, so the turning never arrived.` : "Nothing was turning this part — no gear touched it and joined it to the driver.");
        }
        if (rule.kind !== "GEAR_OUTPUT")
            continue;
        if (rule.direction === "CW" && st.omega < 0)
            return card("WRONG_DIRECTION", "It turned anticlockwise, but it needed to turn clockwise. Each pair of touching gears swaps the direction.");
        if (rule.direction === "CCW" && st.omega > 0)
            return card("WRONG_DIRECTION", "It turned clockwise, but it needed to turn anticlockwise. Each pair of touching gears swaps the direction.");
        if (rule.maxSpeed !== undefined && Math.abs(st.omega) > rule.maxSpeed)
            return card("TOO_FAST", `It spun at ${n(Math.abs(st.omega))} turns-speed — faster than the safe ${n(rule.maxSpeed)}.`);
        if (rule.minSpeed !== undefined && Math.abs(st.omega) < rule.minSpeed)
            return card("TOO_SLOW", `It turned at ${n(Math.abs(st.omega))}, but it needs at least ${n(rule.minSpeed)}. It was ${n(Math.abs(st.factor))} times the driver's speed.`);
    }
    const cmp = rules.find(r => r.kind === "GEAR_COMPARE");
    if (cmp?.kind === "GEAR_COMPARE") {
        const a = tagged(build, cmp.aTag), b = tagged(build, cmp.bTag);
        const wa = a ? Math.abs(g.omega(a.id)) : 0, wb = b ? Math.abs(g.omega(b.id)) : 0;
        if (wa && wb && Math.max(wa, wb) / Math.min(wa, wb) < cmp.minRatio)
            return card("TOO_SLOW", `A turned at ${n(wa)} and B at ${n(wb)} — almost the same. Make the two set-ups different.`);
    }
    return undefined;
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function diagnosePower(rules, build, runtime, card) {
    const c = runtime.circuits;
    if (!c.layout.elements.length)
        return undefined;
    const events = runtime.causalEvents;
    const pct = (v) => `${Math.round(v * 100)}%`;
    const tripped = events.find(e => e.kind === "BREAKER_TRIPPED");
    if (tripped)
        return card("OVERLOAD", `Everything together wanted ${tripped.data?.power} units of power, but the station can only give ${tripped.data?.limit}. It switched off to stay safe.`);
    for (const r of rules)
        if (r.kind === "ENERGY_AT_MOST" && c.energyUsed() > r.maxEnergy)
            return card("USED_TOO_MUCH", `The machine used ${c.energyUsed().toFixed(1)} units of battery energy. The limit was ${r.maxEnergy}.`);
    for (const r of rules)
        if (r.kind === "CIRCUIT_CONTROLLED") {
            for (const load of build.allParts().filter(p => p.tags?.includes(r.targetTag)))
                for (const ctl of build.allParts().filter(p => p.tags?.includes(r.controlTag))) {
                    const t = c.controlTally(ctl.id, load.id);
                    if (t.openOn > 3)
                        return card("ALWAYS_ON", `It was on for ${(t.openOn / 60).toFixed(1)} s while the button wasn't pressed — the button isn't part of its loop.`);
                }
        }
    const bypass = events.find(e => e.kind === "LOAD_BYPASSED");
    if (bypass)
        return card("SHORTCUT", `The current went through a plain wire beside ${nameOf(build.getPart(bypass.sourceId))} instead of through it, so it got almost nothing.`);
    const stalled = events.find(e => e.kind === "GEAR_STALLED" && runtime.gears.isElectric(e.sourceId));
    if (stalled)
        return card("TOO_HEAVY", `The motor could only turn with ${stalled.data?.available} units of force, but the load needed ${stalled.data?.required}.`);
    const targets = rules.flatMap(r => r.kind === "CIRCUIT_POWERED" || r.kind === "CIRCUIT_CONTROLLED" ? [r.targetTag] : r.kind === "CIRCUIT_COMPARE" ? [r.aTag, r.bTag] : []);
    const motors = runtime.gears.nodes.filter(n => runtime.gears.isElectric(n.id)).map(n => n.id);
    const loose = c.layout.terminals.filter(t => !t.isWire && c.layout.terminals.filter(u => u.node === t.node).length < 2).length;
    for (const tag of targets)
        for (const p of build.allParts().filter(q => q.tags?.includes(tag))) {
            const l = c.load(p.id);
            if (!l)
                continue;
            if (!l.everOn)
                return card("NOT_CONNECTED", `${nameOf(p)} got no electricity at all — its loop has a gap${loose ? ` (${loose} dot${loose === 1 ? "" : "s"} with nothing plugged in)` : ""}.`);
        }
    for (const r of rules)
        if (r.kind === "CIRCUIT_POWERED") {
            const dim = build.allParts().filter(p => p.tags?.includes(r.targetTag)).map(p => c.load(p.id)).filter(l => l && l.on && l.peakLevel < r.minLevel);
            if (dim.length)
                return card("NOT_ENOUGH_FORCE", `It only got ${pct(dim[0].peakLevel)} power — ${dim.length > 1 ? "the bulbs are sharing one battery's push in one long loop" : "not enough push reached it"}.`);
        }
    for (const r of rules)
        if (r.kind === "CIRCUIT_COMPARE") {
            const a = build.allParts().find(p => p.tags?.includes(r.aTag)), b = build.allParts().find(p => p.tags?.includes(r.bTag));
            const la = a && c.load(a.id), lb = b && c.load(b.id);
            if (la?.on && lb?.on && lb.power / Math.max(la.power, 1e-6) < r.minRatio)
                return card("SAME", `Bulb A got ${pct(la.level)} and bulb B got ${pct(lb.level)} — about the same. Is B really using both batteries?`);
        }
    for (const id of motors) {
        const drive = c.motorDrive(id);
        const zone = rules.find(r => r.kind === "OBJECT_ENTERS_ZONE");
        if (drive < 0 && zone?.kind === "OBJECT_ENTERS_ZONE")
            return card("WRONG_DIRECTION", "The motor turned backwards, so the machine moved the wrong way. Swap which wire goes to + and which to −.");
        if (drive === 0 && !c.load(id)?.everOn)
            return card("NOT_CONNECTED", "The motor never got any electricity — its loop isn't complete" + (build.allParts().some(p => p.definitionId === "circuit.switch" && !c.isClosed(p.id)) ? " (is the switch on?)." : "."));
    }
    return undefined;
}
function diagnoseMagnets(rules, build, runtime, card) {
    const m = runtime.magnets;
    if (!m.hasMagnets())
        return undefined;
    const events = runtime.causalEvents;
    const tag = (t) => build.allParts().filter(p => p.tags?.includes(t));
    const pos = (id, fallback) => { try {
        const s = runtime.physics.state(id);
        return { x: s.x, y: s.y };
    }
    catch {
        return fallback;
    } };
    for (const r of rules)
        if (r.kind === "STAYS_PUT")
            for (const p of tag(r.objectTag)) {
                const q = pos(p.id, p.position);
                const d = Math.hypot(q.x - p.position.x, q.y - p.position.y);
                if (d > r.maxMove)
                    return card("UNSTABLE", `${nameOf(p)} got knocked ${m2(d)} — the scrap slid sideways into it.`);
            }
    if (build.allParts().some(p => p.definitionId === "magnetic.electromagnet") && !events.some(e => e.kind === "ELECTROMAGNET_ON"))
        return card("NOT_CONNECTED", "The electromagnet never switched on — no electricity reached it.");
    for (const r of rules)
        if (r.kind === "FLOAT_STABLE")
            for (const p of tag(r.objectTag))
                if (m.floatingTicks(p.id) < 30) {
                    if (events.some(e => e.kind === "MAGNET_ATTRACT" && (e.sourceId === p.id || e.targetId === p.id)))
                        return card("WRONG_POLE", `Opposite ends were facing, so ${nameOf(p)} was pulled down instead of pushed up.`);
                    return card("NOT_ENOUGH_FORCE", `${nameOf(p)} never got enough push to float.`);
                }
    for (const r of rules)
        if (r.kind === "NO_PUSHING")
            for (const p of tag(r.objectTag)) {
                const touch = events.find(e => e.kind === "PHYSICS_CONTACT" && (e.sourceId === p.id || e.targetId === p.id) && [e.sourceId, e.targetId].some(o => o && o !== p.id && (runtime.isDynamicBody(o) || runtime.partDefinition(o)?.behaviours.some(b => b.kind === "MAGNET_BAR"))));
                if (touch) {
                    const other = build.getPart(touch.sourceId === p.id ? touch.targetId : touch.sourceId);
                    const attracted = events.some(e => e.kind === "MAGNET_ATTRACT" && (e.sourceId === p.id || e.targetId === p.id));
                    return attracted ? card("WRONG_POLE", `Opposite ends were facing, so ${nameOf(p)} was pulled in until it bumped ${other ? nameOf(other) : "the magnet"}.`) : card("TOUCHED", `${other ? nameOf(other) : "Something"} touched ${nameOf(p)} — it has to move by magnetic force only.`);
                }
            }
    for (const r of rules)
        if (r.kind === "OBJECT_ENTERS_ZONE")
            for (const p of tag(r.objectTag)) {
                const zone = tag(r.zoneTag)[0];
                if (!zone)
                    continue;
                const q = pos(p.id, p.position);
                const away = Math.hypot(q.x - zone.position.x, q.y - zone.position.y) > Math.hypot(p.position.x - zone.position.x, p.position.y - zone.position.y) + 0.3;
                if (away && events.some(e => e.kind === "MAGNET_REPEL" && (e.sourceId === p.id || e.targetId === p.id)))
                    return card("WRONG_POLE", `The ends facing each other were the same, so they pushed ${nameOf(p)} away from the target.`);
                if (away && events.some(e => e.kind === "MAGNET_ATTRACT" && (e.sourceId === p.id || e.targetId === p.id)))
                    return card("WRONG_POLE", `Opposite ends were facing, so ${nameOf(p)} was pulled the wrong way.`);
            }
    const magnetic = (id) => ["IRON", "STEEL", "NICKEL"].includes(String(runtime.partDefinition(id)?.behaviours.find(b => b.kind === "MATERIAL")?.kind === "MATERIAL" ? runtime.partDefinition(id).behaviours.find(b => b.kind === "MATERIAL").material : ""));
    for (const r of rules)
        if (r.kind === "ALL_IN_ZONE" || r.kind === "MATERIALS_SORTED") {
            const items = tag(r.kind === "ALL_IN_ZONE" ? r.objectTag : r.sampleTag);
            for (const p of items) {
                const q = pos(p.id, p.position);
                const moved = Math.hypot(q.x - p.position.x, q.y - p.position.y);
                if (magnetic(p.id) && moved < 0.2 && !events.some(e => e.kind === "MAGNET_PULL_MATERIAL" && e.targetId === p.id))
                    return card("NOT_ENOUGH_FORCE", `${nameOf(p)} didn't move: no magnet was close enough to pull it (magnets only reach about 3 m).`);
            }
            if (r.kind === "ALL_IN_ZONE" && items.some(p => !magnetic(p.id)) && events.some(e => e.kind === "MAGNET_NO_EFFECT"))
                return card("NOT_MAGNETIC", "The magnet didn't pull those things at all — they aren't made of a magnetic material.");
        }
    return undefined;
}
function m2(v) { return `${v.toFixed(1)} m`; }
function diagnoseWater(rules, build, runtime, card) {
    const w = runtime.water;
    if (!w.layout.ports.length)
        return undefined;
    const events = runtime.causalEvents;
    const tag = (t) => build.allParts().filter(p => p.tags?.includes(t));
    for (const r of rules)
        if (r.kind === "WATER_RECEIVED" && r.max !== undefined)
            for (const p of tag(r.targetTag))
                if (w.waterReceived(p.id) > r.max)
                    return card("LEAKING", `${w.waterReceived(p.id).toFixed(1)} litres of water landed on ${nameOf(p)}. Where is it coming from?`);
    for (const r of rules)
        if (r.kind === "TANK_LEVEL" && r.maxFraction !== undefined)
            for (const p of tag(r.tankTag)) {
                const t = w.tank(p.id);
                if (t && t.fraction > r.maxFraction)
                    return card("WRONG_DIRECTION", `Water went into ${nameOf(p)} (${Math.round(t.fraction * 100)}% full) — the way to it was open.`);
            }
    const pumps = build.allParts().filter(p => p.definitionId === "plumb.pump");
    const piped = (id) => { const ports = w.layout.ports.filter(q => q.partId === id); return ports.length > 0 && ports.every(q => w.layout.ports.filter(o => o.node === q.node).length >= 2); };
    if (pumps.length && !events.some(e => e.kind === "PUMP_LIFT")) {
        if (pumps.some(p => piped(p.id) && (runtime.circuits.load(p.id)?.everOn ?? false) === false))
            return card("NOT_CONNECTED", "The pump never got any electricity, so it couldn't push.");
    }
    const airlock = events.find(e => e.kind === "WATER_AIRLOCK");
    if (airlock)
        return card("TOO_HIGH", `The water couldn't climb up to the pipe at ${(8.4 - Number(airlock.data?.y ?? 0)).toFixed(1)} m high — water can't go higher than where it starts on its own.`);
    const spill = events.find(e => e.kind === "WATER_SPILL");
    const spilled = w.totalSpilled();
    for (const r of rules)
        if (r.kind === "TANK_LEVEL" && r.minFraction !== undefined)
            for (const p of tag(r.tankTag)) {
                const t = w.tank(p.id);
                if (!t || t.fraction >= r.minFraction)
                    continue;
                if (spill && spilled > 0.3)
                    return card("LEAKING", `${spilled.toFixed(1)} litres poured out of an open or broken pipe instead of reaching ${nameOf(p)}.`);
                if (t.volume <= 0.01)
                    return card("NOT_CONNECTED", `No water reached ${nameOf(p)} — there's no complete path to it.`);
                return card("TOO_SLOW", `${nameOf(p)} only got to ${Math.round(t.fraction * 100)}% full.`);
            }
    for (const r of rules)
        if (r.kind === "WATER_RECEIVED" && r.min !== undefined)
            for (const p of tag(r.targetTag)) {
                if (w.waterReceived(p.id) >= r.min)
                    continue;
                const jet = w.jetStates()[0];
                if (jet && !jet.hitTarget) {
                    const end = jet.points[jet.points.length - 1];
                    return card("MISSED", `The jet landed at ${end.x.toFixed(1)} m across, but ${nameOf(p)} is at ${p.position.x.toFixed(1)} m. Try aiming ${end.x < p.position.x ? "further" : "shorter"}.`);
                }
                if (spill && spilled > 0.3)
                    return card("LEAKING", `${spilled.toFixed(1)} litres spilled from an open pipe end instead.`);
                return card("NOT_CONNECTED", `${nameOf(p)} got only ${w.waterReceived(p.id).toFixed(1)} litres — no water was sent its way.`);
            }
    for (const r of rules)
        if (r.kind === "FILL_COMPARE") {
            const a = tag(r.aTag)[0], b = tag(r.bTag)[0];
            const ta = a && w.fillTime(a.id, r.fillFraction), tb = b && w.fillTime(b.id, r.fillFraction);
            if (ta && tb)
                return card("SAME", `Tank A took ${ta.toFixed(1)} s and tank B took ${tb.toFixed(1)} s — about the same. Are the two pipes different?`);
        }
    const wheels = runtime.gears.nodes.filter(n => runtime.gears.isHydraulic(n.id));
    for (const n of wheels) {
        if ((runtime.gears.state(n.id)?.runTicks ?? 0) === 0)
            return card("NOT_CONNECTED", "No water reached the water wheel, so it never turned.");
        if (rules.some(r => r.kind === "GEAR_OUTPUT"))
            return card("NOT_CONNECTED", "The water wheel turned, but nothing passed its turning on to the machine.");
    }
    return undefined;
}
