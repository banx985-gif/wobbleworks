import { METRICS } from "../core/types.js";
/**
 * Metric Registry (master guide §23 / M22). The ONLY measurements the game may advertise or compare. Each one has a
 * real measuring rule here, read from what the simulation did — nothing is estimated or made up. Experiments,
 * challenges and records may use a metric only if `isRegisteredMetric` says so and `canMeasure` has a rule for it.
 */
export const METRIC_REGISTRY = METRICS;
export function isRegisteredMetric(id) { return METRICS.includes(id); }
/** How each metric reads in child-friendly words ("A went farther"), and its unit for the optional numbers. */
export const METRIC_WORDS = {
    distanceTravelled: { more: "went farther", less: "stopped sooner", unit: "m", decimals: 1 },
    maximumHeight: { more: "went higher", less: "stayed lower", unit: "m", decimals: 2 },
    elapsedTime: { more: "took longer", less: "was faster", unit: "s", decimals: 1 },
    averageSpeed: { more: "turned faster", less: "turned slower", unit: "turns/s", decimals: 2 },
    peakSpeed: { more: "went faster", less: "went slower", unit: "m/s", decimals: 1 },
    supportedLoad: { more: "held more", less: "held less", unit: "load", decimals: 1 },
    energyUsed: { more: "used more power", less: "used less power", unit: "energy", decimals: 1 },
    programBlockCount: { more: "used more blocks", less: "used fewer blocks", unit: "blocks", decimals: 0 },
    peakImpact: { more: "hit harder", less: "landed softer", unit: "m/s", decimals: 1 }
};
/** Watches subjects during a TEST, tick by tick, and turns what happened into registered metrics. */
export class MetricRecorder {
    subjects;
    finishLines;
    start = new Map();
    far = new Map();
    low = new Map();
    peak = new Map();
    speedSum = new Map();
    stillSince = new Map();
    moved = new Set();
    bounced = new Map();
    lastVy = new Map();
    crossed = new Map();
    ticks = 0;
    /** `finishLines`: a subject's time is when it first reaches this x (a finish flag), if it has one. */
    constructor(subjects, finishLines = {}) {
        this.subjects = subjects;
        this.finishLines = finishLines;
    }
    sample(runtime) {
        this.ticks++;
        for (const id of this.subjects) {
            // Gears turn rather than travel: their speed is how fast they turn.
            if (runtime.gears.nodes.some(n => n.id === id)) {
                const w = Math.abs(runtime.gears.omega(id)) / (Math.PI * 2);
                const a = this.speedSum.get(id) ?? { sum: 0, n: 0 };
                if (w > 0.001 || a.n) {
                    a.sum += w;
                    a.n++;
                    this.speedSum.set(id, a);
                }
                this.peak.set(id, Math.max(this.peak.get(id) ?? 0, w));
                continue;
            }
            let st;
            try {
                st = runtime.physics.state(id);
            }
            catch {
                continue;
            }
            if (!this.start.has(id))
                this.start.set(id, { x: st.x, y: st.y });
            const fx = this.finishLines[id];
            if (fx !== undefined && !this.crossed.has(id) && st.x >= fx)
                this.crossed.set(id, this.ticks / 60);
            const s0 = this.start.get(id);
            const speed = Math.hypot(st.vx, st.vy);
            // A glider's distance is how far it flew; anything else, how far it got from where it started.
            const craft = runtime.flight.craft(id);
            const d = craft ? Math.max(0, craft.maxX - s0.x) : Math.abs(st.x - s0.x);
            this.far.set(id, Math.max(this.far.get(id) ?? 0, d));
            this.low.set(id, Math.min(this.low.get(id) ?? s0.y, st.y));
            this.peak.set(id, Math.max(this.peak.get(id) ?? 0, speed));
            if (speed > 0.05) {
                this.moved.add(id);
                const a = this.speedSum.get(id) ?? { sum: 0, n: 0 };
                a.sum += speed;
                a.n++;
                this.speedSum.set(id, a);
                this.stillSince.delete(id);
            }
            else if (!this.stillSince.has(id))
                this.stillSince.set(id, this.ticks);
            // Bounce: after the first time it comes down onto something, how high does it rise again?
            const lv = this.lastVy.get(id) ?? 0;
            this.lastVy.set(id, st.vy);
            const b = this.bounced.get(id);
            if (!b && lv > 0.5 && st.vy <= 0)
                this.bounced.set(id, { afterY: st.y, rise: 0 });
            else if (b)
                b.rise = Math.max(b.rise, b.afterY - st.y);
        }
    }
    /** True once every subject has stopped moving for half a second (or never moved). */
    settled() { return this.subjects.every(id => (this.finishLines[id] !== undefined && this.crossed.has(id)) || !this.moved.has(id) || (this.stillSince.has(id) && this.ticks - this.stillSince.get(id) >= 30)); }
    /** A registered metric for one subject, measured from this run. Undefined when there is nothing honest to report. */
    measure(metric, id, runtime, build) {
        switch (metric) {
            case "distanceTravelled": return this.far.get(id);
            case "maximumHeight": {
                const b = this.bounced.get(id);
                if (b)
                    return Math.max(0, b.rise);
                const s = this.start.get(id), l = this.low.get(id);
                return s && l !== undefined ? Math.max(0, s.y - l) : undefined;
            }
            case "peakSpeed": return this.peak.get(id);
            case "averageSpeed": {
                const a = this.speedSum.get(id);
                return a && a.n ? a.sum / a.n : undefined;
            }
            case "elapsedTime": return this.crossed.get(id) ?? finishTime(id, runtime);
            case "supportedLoad": {
                const l = runtime.structures.load(id);
                return l?.done ? l.held : undefined;
            }
            case "energyUsed": {
                const lane = build.getPart(id)?.tags?.find(t => t.startsWith("lane."));
                const batteries = build.allParts().filter(p => p.tags?.includes(lane ?? "") && runtime.circuits.source(p.id));
                return batteries.length ? batteries.reduce((t, p) => t + (runtime.circuits.source(p.id)?.energyUsed ?? 0), 0) : undefined;
            }
            case "programBlockCount": return runtime.robots.robot(id)?.blocks;
            case "peakImpact": return runtime.flight.peakImpact(id);
            case "partCount": return build.allParts().length;
            case "chainLength": return runtime.chain.longest();
            case "uniqueMechanismCount": return runtime.chain.families().length;
            case "survivalState": return runtime.causalEvents.some(e => e.kind === "STRUCTURE_BROKE" && (e.sourceId === id || e.targetId === id)) ? 0 : 1;
            case "forbiddenContactCount": return runtime.causalEvents.filter(e => e.kind === "PHYSICS_CONTACT" && (e.sourceId === id || e.targetId === id)).length;
            case "stabilityVariance": {
                const c = runtime.flight.craft(id);
                return c ? c.pitchSpread : undefined;
            }
            default: return undefined;
        }
    }
}
/** When a subject finished: a tank filling, a robot arriving, a body landing — whichever applies to it. */
function finishTime(id, runtime) {
    const fill = runtime.water.fillTime(id, 0.75);
    if (fill !== undefined)
        return fill;
    const r = runtime.robots.robot(id);
    if (r?.doneAt !== undefined && !r.crashed)
        return r.doneAt;
    const fall = runtime.space.fallTime(id);
    if (fall !== undefined)
        return fall;
    return undefined;
}
/** Which registered metrics have a measuring rule (an experiment or challenge may only use these). */
export const MEASURABLE_METRICS = ["distanceTravelled", "maximumHeight", "peakSpeed", "averageSpeed", "elapsedTime", "supportedLoad", "energyUsed", "programBlockCount", "peakImpact", "partCount", "chainLength", "uniqueMechanismCount", "survivalState", "forbiddenContactCount", "stabilityVariance"];
export function canMeasure(metric) { return isRegisteredMetric(metric) && MEASURABLE_METRICS.includes(metric); }
