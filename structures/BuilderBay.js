import { assertLevelDefinition } from "../data/validation.js";
import { evaluateLevelOutcome } from "../core/OutcomeEvaluator.js";
import { MAIN_LABS } from "../progression/CampaignData.js";
import { MATERIALS, STRUCTURE_TRUTH_CONTRACT } from "./StructureSystem.js";
/**
 * Lab 3 — Builder Bay (M13). Missions, content loading, evidence-backed discoveries, parent mappings and
 * real-world connection moments. Every claim maps to STRUCTURE_TRUTH_CONTRACT and to something the
 * StructureSystem measured during a TEST.
 */
export { STRUCTURE_TRUTH_CONTRACT };
export const BUILDER_MISSIONS = MAIN_LABS.find(l => l.id === "builder-bay").missions;
export async function loadBuilderBayLevels(registry) {
    const known = new Set(registry.all().map(part => part.id));
    const levels = new Map();
    for (const mission of BUILDER_MISSIONS) {
        const response = await fetch(`./content/builder/${mission.id}.json`, { cache: "no-store" });
        if (!response.ok)
            throw new Error(`Builder Bay content failed to load: ${mission.id}`);
        const value = await response.json();
        assertLevelDefinition(value, known);
        levels.set(mission.id, value);
    }
    return levels;
}
export function runSummary(build, runtime) {
    const s = runtime.structures;
    return { maxWobble: s.maxWobble(), collapsed: s.memberStates().some(m => m.breakMode === "COLLAPSE" || m.breakMode === "UNSUPPORTED"), braced: hasBrace(build) };
}
function hasBrace(build) { return build.allParts().some(p => p.definitionId === "builder.brace" || ((p.definitionId.startsWith("builder.beam") || p.definitionId === "builder.rope") && Math.abs(Math.sin(p.rotation)) > 0.2 && Math.abs(Math.cos(p.rotation)) > 0.2)); }
/** Ticks of steady loading needed before anything counts as evidence. */
export const EVIDENCE_TICKS = 60;
export function collectStructureDiscoveries(build, runtime, previous) {
    const s = runtime.structures;
    const out = new Set();
    const events = runtime.causalEvents;
    const states = s.memberStates();
    const standing = states.filter(m => !m.broken);
    const steady = s.calmTicksBelow(0.1) >= EVIDENCE_TICKS;
    // Bracing evidence (design §"Structural bracing evidence"): the child CHANGED the structure and measured stability improved, using bracing.
    if (previous && steady && hasBrace(build) && !previous.braced && (previous.collapsed || s.maxWobble() < previous.maxWobble * 0.5))
        out.add("structure.bracing");
    // A closed triangle carried load and kept its shape.
    if (steady && hasTriangle(s))
        out.add("structure.triangle");
    // Pulled and squashed at the same time, both carrying real load.
    if (steady && standing.some(m => m.mode === "TENSION" && m.peakRatio >= 0.15) && standing.some(m => m.mode === "COMPRESSION" && m.peakRatio >= 0.15))
        out.add("structure.tension-compression");
    // A metal member carried a force that would have broken the same wooden one.
    for (const m of standing) {
        const mem = s.members.find(x => x.id === m.id);
        if (mem.material !== "METAL" || m.peakRatio < 0.3)
            continue;
        const woodCap = m.axial >= 0 ? MATERIALS.WOOD.tension : Math.min(MATERIALS.WOOD.compression, MATERIALS.WOOD.buckle / (mem.length * mem.length));
        if (Math.abs(m.axial) > woodCap || m.peakRatio * MATERIALS.METAL.bending / MATERIALS.WOOD.bending > 1) {
            out.add("structure.material");
            break;
        }
    }
    if (states.some(m => m.breakMode === "BENDING"))
        out.add("structure.span");
    if (states.some(m => m.breakMode === "BUCKLE"))
        out.add("structure.buckle");
    if (events.some(e => e.kind === "TRAVELLER_ARRIVED") && events.some(e => e.kind === "TRAVELLER_START") && s.travellerStates().some(t => t.arrived && runtime.structures.walkedOnStructure(t.id)))
        out.add("structure.load-path");
    if (s.eggStates().some(e => e.landed && e.onStructure && e.impact !== undefined && e.onMember !== undefined && s.members.find(m => m.id === e.onMember)?.material === "ROPE"))
        out.add("structure.soft-landing");
    if (events.some(e => e.kind === "WINCH_LIFT") && build.allParts().some(p => p.parameters.mountOnStructure === true) && !events.some(e => e.kind === "WINCH_UNSUPPORTED"))
        out.add("combo.crane");
    if (s.travellerStates().some(t => t.arrived && runtime.structures.climbedRamp(t.id) && runtime.structures.walkedOnStructure(t.id)))
        out.add("combo.ramp-bridge");
    if (states.filter(m => m.broken).length >= 5)
        out.add("secret.mega-collapse");
    const top = s.topY();
    if (top !== undefined && top <= 2.0 && steady)
        out.add("secret.sky-tower");
    return [...out];
}
function hasTriangle(s) {
    const live = s.members.filter(m => !s.memberState(m.id).broken);
    const supported = (j) => s.layout.joints[j].supported;
    for (let i = 0; i < live.length; i++)
        for (let k = i + 1; k < live.length; k++) {
            const a = live[i], b = live[k];
            const shared = [a.a, a.b].find(j => j === b.a || j === b.b);
            if (shared === undefined)
                continue;
            const ea = a.a === shared ? a.b : a.a, eb = b.a === shared ? b.b : b.a;
            // Closed by a third member, or by the ground/wall when both far ends are fixed supports.
            if (live.some(c => (c.a === ea && c.b === eb) || (c.a === eb && c.b === ea)) || (supported(ea) && supported(eb) && !supported(shared)))
                return true;
        }
    return false;
}
export function evaluateBuilderMission(level, build, runtime, previous) {
    if (!runtime)
        return { levelId: level.id, success: false, discoveries: [] };
    return { levelId: level.id, success: evaluateLevelOutcome(level, build, runtime).complete, discoveries: collectStructureDiscoveries(build, runtime, previous) };
}
export const STRUCTURE_PARENT_MAPPINGS = Object.freeze([
    { concept: "Structures & Forces", evidence: "made a structure steadier by bracing it", discoveryId: "structure.bracing" },
    { concept: "Structures & Forces", evidence: "used triangles to hold a shape", discoveryId: "structure.triangle" },
    { concept: "Structures & Forces", evidence: "saw parts being pulled and squashed", discoveryId: "structure.tension-compression" },
    { concept: "Structures & Forces", evidence: "compared how strong materials are", discoveryId: "structure.material" },
    { concept: "Structures & Forces", evidence: "carried a load across a bridge to the ground", discoveryId: "structure.load-path" }
]);
export const STRUCTURE_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "structure.triangle", title: "Triangles everywhere", example: "Bridges, cranes and roof frames are full of triangles because a triangle can't be squashed out of shape without breaking a side." },
    { discoveryId: "structure.bracing", title: "Braced buildings", example: "Tall buildings use diagonal braces so the wind can't push them into a lean." },
    { discoveryId: "structure.tension-compression", title: "Pull and push", example: "In a suspension bridge the cables are pulled tight while the towers are squashed down." },
    { discoveryId: "structure.material", title: "Choosing materials", example: "Builders use steel where loads are huge and wood where light, cheap parts are enough." },
    { discoveryId: "structure.load-path", title: "Where the weight goes", example: "A bridge carries every car's weight along its beams and down its supports into the ground." },
    { discoveryId: "structure.soft-landing", title: "Safety nets", example: "Circus nets and trampolines stretch to slow you down gently instead of stopping you suddenly." }
]);
