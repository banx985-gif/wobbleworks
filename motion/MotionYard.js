import { evaluateLevelOutcome } from "../core/OutcomeEvaluator.js";
export const MOTION_TRUTH_CONTRACT = Object.freeze({
    id: "truth.motion.v1",
    preserve: ["gravity direction", "mass/inertia relationship", "friction", "momentum", "slope effects"],
    simplify: ["cartoon magnitudes", "capped speeds", "forgiving collisions"],
    neverImply: ["heavier objects always fall faster in the same gravity"]
});
export const MOTION_MISSIONS = [
    { id: "motion.roll-with-it", title: "Roll With It", slot: "ORDINARY", ordinaryNumber: 1, objective: "Place or adjust a ramp so the ball reaches the bucket.", requiredForProgression: true },
    { id: "motion.ramp-rescue", title: "Ramp Rescue", slot: "ORDINARY", ordinaryNumber: 2, objective: "Get Bolt down from the raised platform without a hard arrival.", requiredForProgression: true },
    { id: "motion.too-fast", title: "Too Fast!", slot: "ORDINARY", ordinaryNumber: 3, objective: "Slow the cart before the barrier using motion parts.", requiredForProgression: true },
    { id: "motion.spring-delivery", title: "Spring Delivery", slot: "ORDINARY", ordinaryNumber: 4, objective: "Launch the parcel onto the target platform.", requiredForProgression: false },
    { id: "motion.slippery-business", title: "Slippery Business", slot: "ORDINARY", ordinaryNumber: 5, objective: "Cross both grip and slide surfaces and reach the goal.", requiredForProgression: false },
    { id: "motion.bounce-around", title: "Bounce Around", slot: "ORDINARY", ordinaryNumber: 6, objective: "Use a bounce to reach the switch target.", requiredForProgression: false },
    { id: "motion.heavy-or-light", title: "Heavy or Light?", slot: "ORDINARY", ordinaryNumber: 7, objective: "Compare how the same push changes light and heavy objects.", requiredForProgression: false },
    { id: "motion.make-it-farther", title: "Make It Farther", slot: "ORDINARY", ordinaryNumber: 8, objective: "Improve the cart until it travels far enough.", requiredForProgression: false },
    { id: "motion.which-ramp-wins", title: "Which Ramp Wins?", slot: "EXPERIMENT", objective: "Compare two ramp setups and observe travel distance.", requiredForProgression: false },
    { id: "motion.duck-cannon", title: "Duck Cannon", slot: "SILLY", objective: "Launch the rubber duck into the giant bath target.", requiredForProgression: false },
    { id: "motion.giant-marble-delivery", title: "The Giant Marble Delivery Machine", slot: "MEGA", objective: "Use multiple mechanisms to carry the marble across the yard.", requiredForProgression: true },
    { id: "motion.runaway-test-cart", title: "Runaway Test Cart", slot: "EMERGENCY", objective: "Stop the runaway cart before the hazard without wall-blocking it.", requiredForProgression: true }
];
const CHOICE_IDS = MOTION_MISSIONS.filter(m => { var _a; return m.slot === "ORDINARY" && ((_a = m.ordinaryNumber) !== null && _a !== void 0 ? _a : 0) >= 4; }).map(m => m.id);
export function createMotionProgress(completed = []) {
    const known = new Set(MOTION_MISSIONS.map(m => m.id));
    return { completed: [...new Set(completed.filter(id => known.has(id)))] };
}
export function isMotionMissionUnlocked(id, progress) {
    const done = new Set(progress.completed);
    if (id === "motion.roll-with-it")
        return true;
    if (id === "motion.ramp-rescue")
        return done.has("motion.roll-with-it");
    if (id === "motion.too-fast")
        return done.has("motion.ramp-rescue");
    const firstThree = done.has("motion.roll-with-it") && done.has("motion.ramp-rescue") && done.has("motion.too-fast");
    if (CHOICE_IDS.includes(id) || id === "motion.which-ramp-wins" || id === "motion.duck-cannon")
        return firstThree;
    if (id === "motion.giant-marble-delivery")
        return firstThree && CHOICE_IDS.some(choice => done.has(choice));
    if (id === "motion.runaway-test-cart")
        return done.has("motion.giant-marble-delivery");
    return false;
}
export function completeMotionMission(progress, id) {
    if (!MOTION_MISSIONS.some(m => m.id === id))
        throw new Error(`Unknown Motion Yard mission ${id}`);
    if (!isMotionMissionUnlocked(id, progress) && !progress.completed.includes(id))
        throw new Error(`Motion Yard mission is locked: ${id}`);
    return createMotionProgress([...progress.completed, id]);
}
export function motionVerticalSliceComplete(progress) {
    return progress.completed.includes("motion.runaway-test-cart");
}
export function nextRequiredMotionMission(progress) {
    const done = new Set(progress.completed);
    if (!done.has("motion.roll-with-it"))
        return "motion.roll-with-it";
    if (!done.has("motion.ramp-rescue"))
        return "motion.ramp-rescue";
    if (!done.has("motion.too-fast"))
        return "motion.too-fast";
    if (!CHOICE_IDS.some(id => done.has(id)))
        return "motion.spring-delivery";
    if (!done.has("motion.giant-marble-delivery"))
        return "motion.giant-marble-delivery";
    if (!done.has("motion.runaway-test-cart"))
        return "motion.runaway-test-cart";
    return undefined;
}
function hasEvent(runtime, kind) { return runtime.causalEvents.some(event => event.kind === kind); }
function hasDefinition(build, id) { return build.allParts().some(part => part.definitionId === id); }
export function collectMotionObservations(_level, build, runtime) {
    const observations = new Set();
    const states = runtime.physics.states();
    if (states.some(s => { var _a, _b; return s.y > ((_b = (_a = build.getPart(s.id)) === null || _a === void 0 ? void 0 : _a.position.y) !== null && _b !== void 0 ? _b : s.y) + 0.2; }))
        observations.add("gravity pulled an object downward");
    if (hasEvent(runtime, "RAMP_CONTACT"))
        observations.add("a slope changed motion");
    if (hasEvent(runtime, "FRICTION_SLOWED"))
        observations.add("friction reduced sliding speed");
    if (hasEvent(runtime, "BOUNCE_PAD_CONTACT"))
        observations.add("a bouncy surface changed direction");
    if (hasEvent(runtime, "SPRING_LAUNCH"))
        observations.add("a spring applied a push");
    if (hasEvent(runtime, "EXTERNAL_FORCE_APPLIED"))
        observations.add("the same push can create different acceleration when mass differs");
    if (states.some(state => { var _a; const start = (_a = build.getPart(state.id)) === null || _a === void 0 ? void 0 : _a.position; return start ? Math.hypot(state.x - start.x, state.y - start.y) > 1.5 && Math.hypot(state.vx, state.vy) > .15 : false; }))
        observations.add("moving objects keep moving until forces and contacts change them");
    return [...observations];
}
export function collectMotionDiscoveries(level, build, runtime) {
    const observations = collectMotionObservations(level, build, runtime);
    const discoveries = [];
    if (observations.includes("gravity pulled an object downward"))
        discoveries.push("motion.gravity-down");
    if (observations.includes("a slope changed motion"))
        discoveries.push("motion.slope-effect");
    if (observations.includes("friction reduced sliding speed"))
        discoveries.push("motion.friction-grip");
    if (observations.includes("a bouncy surface changed direction"))
        discoveries.push("motion.bounce");
    if (observations.includes("the same push can create different acceleration when mass differs"))
        discoveries.push("motion.mass-inertia");
    if (observations.includes("moving objects keep moving until forces and contacts change them"))
        discoveries.push("motion.momentum");
    if (hasDefinition(build, "motion.friction-high") && hasDefinition(build, "motion.friction-low") && hasEvent(runtime, "PHYSICS_CONTACT"))
        discoveries.push("motion.surface-comparison");
    return [...new Set(discoveries)];
}
export function evaluateMotionMission(level, build, runtime) {
    const outcome = evaluateLevelOutcome(level, build, runtime);
    if (!runtime)
        return { levelId: level.id, success: false, discoveries: [], observations: [] };
    return { levelId: level.id, success: outcome.complete, discoveries: collectMotionDiscoveries(level, build, runtime), observations: collectMotionObservations(level, build, runtime) };
}
export const MOTION_PARENT_MAPPINGS = Object.freeze([
    { concept: "Force & Motion", evidence: "ramps explored", discoveryId: "motion.slope-effect" },
    { concept: "Force & Motion", evidence: "friction compared", discoveryId: "motion.friction-grip" },
    { concept: "Force & Motion", evidence: "mass/inertia compared", discoveryId: "motion.mass-inertia" },
    { concept: "Force & Motion", evidence: "bouncing observed", discoveryId: "motion.bounce" },
    { concept: "Force & Motion", evidence: "momentum observed", discoveryId: "motion.momentum" }
]);
export const MOTION_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "motion.slope-effect", title: "Ramps in the world", example: "Wheelchair ramps and loading ramps trade height for a longer sloped path." },
    { discoveryId: "motion.friction-grip", title: "Grip changes motion", example: "Shoe soles and tyres use grip to reduce unwanted sliding." },
    { discoveryId: "motion.mass-inertia", title: "Same push, different response", example: "A loaded trolley usually needs more push to change its motion than an empty one." },
    { discoveryId: "motion.bounce", title: "Materials can bounce differently", example: "Sports balls are designed to return energy differently when they hit a surface." },
    { discoveryId: "motion.momentum", title: "Moving things keep going", example: "A rolling trolley keeps moving until friction, a push, or a collision changes its motion." }
]);
