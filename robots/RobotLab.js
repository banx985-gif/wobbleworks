import { labMissions } from "../labs/LabModule.js";
import { ROBOTICS_TRUTH_CONTRACT } from "./RobotSystem.js";
/**
 * Lab 8 — Robot Lab (M18). Every discovery is measured by the RobotSystem in that TEST (truth.robotics.v1).
 */
export { ROBOTICS_TRUTH_CONTRACT };
export const ROBOT_MISSIONS = labMissions("robot-lab");
export function collectRobotDiscoveries(build, runtime) {
    const r = runtime.robots;
    const out = new Set();
    const events = runtime.causalEvents;
    if (!r.hasRobots())
        return [];
    const of = (kind) => events.filter(e => e.kind === kind);
    const has = (kind) => of(kind).length > 0;
    for (const v of r.robotViews()) {
        const moved = of("ROBOT_MOVED").some(e => e.sourceId === v.id), turned = of("ROBOT_TURNED").some(e => e.sourceId === v.id);
        if (v.done && v.blocks >= 2 && moved && turned)
            out.add("robot.sequence");
        // The same sensor gave different answers, and the program did different things because of it.
        const decisions = of("SENSOR_DECISION").filter(e => { var _a; return e.sourceId === v.id && ((_a = e.data) === null || _a === void 0 ? void 0 : _a.block) === "IF"; });
        if (decisions.some(e => { var _a; return ((_a = e.data) === null || _a === void 0 ? void 0 : _a.result) === true; }) && decisions.some(e => { var _a; return ((_a = e.data) === null || _a === void 0 ? void 0 : _a.result) === false; }))
            out.add("robot.condition");
        if (of("SENSOR_DECISION").some(e => e.sourceId === v.id))
            out.add("robot.sensor");
        if (of("LOOP_REPEAT").filter(e => e.sourceId === v.id).length >= 2)
            out.add("robot.loop");
        if (of("ROBOT_WAITED").some(e => e.sourceId === v.id) && build.allParts().some(p => p.definitionId === "robot.sweeper") && v.done && !v.crashed && v.bumps === 0)
            out.add("robot.timing");
        if (of("ROBOT_BUMP").some(e => e.sourceId === v.id))
            out.add("robot.literal");
        if (of("ROBOT_TURNED").filter(e => e.sourceId === v.id).length >= 8)
            out.add("secret.robot-dizzy");
    }
    if (has("BOX_GRABBED") || has("BUTTON_PRESSED"))
        out.add("robot.actuator");
    if (has("CONVEYOR_ON") && has("CONVEYOR_CARRY"))
        out.add("combo.robot-conveyor");
    if (has("PRODUCT_MADE"))
        out.add("combo.robot-factory");
    if (r.danceScore() >= 6)
        out.add("secret.robot-dance");
    return [...out];
}
export const ROBOT_PARENT_MAPPINGS = Object.freeze([
    { concept: "Coding & Robots", evidence: "wrote a sequence of instructions for a robot", discoveryId: "robot.sequence" },
    { concept: "Coding & Robots", evidence: "used a sensor so a program could react", discoveryId: "robot.sensor" },
    { concept: "Coding & Robots", evidence: "used IF / ELSE to choose between actions", discoveryId: "robot.condition" },
    { concept: "Coding & Robots", evidence: "used a loop to repeat instructions", discoveryId: "robot.loop" },
    { concept: "Coding & Robots", evidence: "used WAIT to time a robot with something moving", discoveryId: "robot.timing" }
]);
export const ROBOT_REAL_WORLD_CARDS = Object.freeze([
    { discoveryId: "robot.sequence", title: "Following steps", example: "A recipe is a sequence: do the steps in order and you get a cake. Robots follow programs the same way." },
    { discoveryId: "robot.sensor", title: "Robot vacuum cleaners", example: "Robot vacuums use sensors to notice walls and stairs, then their program decides what to do." },
    { discoveryId: "robot.condition", title: "Traffic lights", example: "Traffic-light controllers use rules like IF a car is waiting THEN change to green." },
    { discoveryId: "robot.loop", title: "Washing machines", example: "A washing machine repeats spin, pause, spin — a loop in its program." },
    { discoveryId: "robot.literal", title: "Computers do what they're told", example: "A robot does exactly what its program says — even if that means bumping into a wall. Programmers test and fix their code." },
    { discoveryId: "combo.robot-factory", title: "Factory robots", example: "Car factories use programmed robot arms and conveyor belts working together on a production line." }
]);
export const ROBOT_CONCEPT_EVIDENCE = {
    "robot.sequence": "A robot finished a program of two or more blocks that moved and turned it, in order.",
    "robot.sensor": "A program checked a sensor while it ran.",
    "robot.condition": "An IF block went one way when its sensor said yes and the other way when it said no.",
    "robot.loop": "A loop sent the robot round its blocks again at least twice.",
    "robot.timing": "A robot waited, then crossed a moving sweeper's path without being hit.",
    "robot.actuator": "A robot's gripper grabbed a box or its pusher pressed a button.",
    "robot.literal": "A robot drove into something because its program told it to go there.",
    "combo.robot-conveyor": "A robot switched on the old conveyor and the conveyor carried a box.",
    "combo.robot-factory": "A packing machine packed a box in a robot-run production line.",
    "secret.robot-dance": "The robots hit six dance-pad beats.",
    "secret.robot-dizzy": "A robot turned eight times in one program. Wheee."
};
export const ROBOT_LAB = {
    labId: "robot-lab", folder: "robot", concept: "Coding & Robots", scannerName: "Program Debugger", truthContractId: ROBOTICS_TRUTH_CONTRACT.id,
    parentMappings: ROBOT_PARENT_MAPPINGS, realWorldCards: ROBOT_REAL_WORLD_CARDS, conceptEvidence: ROBOT_CONCEPT_EVIDENCE,
    collectDiscoveries: collectRobotDiscoveries
};
