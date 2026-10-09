import { PartRegistry } from "../data/PartRegistry.js";
import { POWER_PARTS } from "./powerParts.js";
import { MAGNET_PARTS } from "./magnetParts.js";
import { WATER_PARTS } from "./waterParts.js";
import { FLIGHT_PARTS } from "./flightParts.js";
import { ROBOT_PARTS } from "./robotParts.js";
import { SPACE_PARTS } from "./spaceParts.js";
import { CHAIN_PARTS } from "./chainParts.js";
import { EXPERIMENT_PARTS } from "./experimentParts.js";
import { SANDBOX_PARTS } from "./sandboxParts.js";
import { CREATURE_PARTS } from "./creatureParts.js";
import { PROTOTYPE_PARTS } from "./prototypeParts.js";
export { POWER_PARTS, MAGNET_PARTS, WATER_PARTS, FLIGHT_PARTS, ROBOT_PARTS, SPACE_PARTS, CHAIN_PARTS, EXPERIMENT_PARTS, SANDBOX_PARTS, CREATURE_PARTS };
const mechanicalPort = (id) => ({ id, family: "ROTATIONAL", capabilities: ["ROTATE"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "ONE" });
const electricalPort = (id, direction) => ({ id, family: "ELECTRICAL", capabilities: ["POWER"], direction, offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "MANY" });
const fluidPort = (id, direction) => ({ id, family: "FLUID", capabilities: ["WATER"], direction, offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "MANY" });
const logicPort = (id, direction) => ({ id, family: "LOGIC", capabilities: ["BOOL", "NUMBER"], direction, offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "MANY" });
export const DEFAULT_PARTS = [
    { id: "motion.ball", familyId: "motion.ball", displayName: "Ball", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 0.6, height: 0.6, density: 1, friction: 0.25, restitution: 0.55 }], ports: [] },
    { id: "motion.cart", familyId: "motion.cart", displayName: "Cart", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 1.2, height: 0.5, density: 1.2, friction: 0.45, restitution: 0.1 }], ports: [mechanicalPort("axle")] },
    { id: "motion.wheel", familyId: "motion.wheel", displayName: "Wheel", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 0.75, height: 0.75, density: 0.8, friction: 0.8, restitution: 0.15 }], ports: [mechanicalPort("axle")] },
    { id: "motion.ramp", familyId: "motion.ramp", displayName: "Ramp", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "RAMP", width: 2.2, height: 0.28, density: 1, friction: 0.85, restitution: 0.05 }], ports: [] },
    { id: "motion.spring", familyId: "motion.spring", displayName: "Spring", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 0.8, height: 0.32, density: 1, friction: 0.8, restitution: 0.15 }, { kind: "SPRING_PAD", force: 18, range: 1.05 }], ports: [] },
    { id: "motion.axle", familyId: "motion.axle", displayName: "Axle", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 0.9, height: 0.18, density: 0.7, friction: 0.45, restitution: 0.05 }], ports: [mechanicalPort("shaft")] },
    { id: "motion.roller", familyId: "motion.roller", displayName: "Roller", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 0.52, height: 0.52, density: 0.75, friction: 0.75, restitution: 0.12 }], ports: [mechanicalPort("axle")] },
    { id: "motion.friction-high", familyId: "motion.friction-pad", displayName: "Grip Pad", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 1.6, height: 0.22, density: 1, friction: 1.0, restitution: 0.02 }], ports: [] },
    { id: "motion.friction-low", familyId: "motion.friction-surface", displayName: "Slide Pad", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 2.4, height: 0.22, density: 1, friction: 0.03, restitution: 0.02 }], ports: [] },
    { id: "motion.bounce-pad", familyId: "motion.bounce-pad", displayName: "Bounce Pad", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 1.35, height: 0.25, density: 1, friction: 0.45, restitution: 0.92 }], ports: [] },
    { id: "motion.parcel", familyId: "motion.parcel", displayName: "Parcel", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 0.62, height: 0.5, density: 0.85, friction: 0.55, restitution: 0.16 }], ports: [] },
    { id: "motion.marble", familyId: "motion.ball", displayName: "Marble", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 0.38, height: 0.38, density: 1, friction: 0.18, restitution: 0.45 }], ports: [] },
    { id: "silly.duck", familyId: "silly.duck", displayName: "Duck", category: "SILLY", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 0.7, height: 0.48, density: 0.45, friction: 0.4, restitution: 0.5 }], ports: [] },
    { id: "motion.goal-zone", familyId: "motion.goal-zone", displayName: "Target", category: "MOTION", behaviours: [], ports: [] },
    { id: "motion.barrier", familyId: "motion.barrier", displayName: "Barrier", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 0.34, height: 2.0, density: 1, friction: 0.8, restitution: 0.08 }], ports: [] },
    { id: "motion.platform", familyId: "motion.platform", displayName: "Platform", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 2.0, height: 0.3, density: 1, friction: 0.8, restitution: 0.05 }], ports: [] },
    { id: "motion.switch-pad", familyId: "logic.switch-pad", displayName: "Switch", category: "LOGIC", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 0.9, height: 0.28, density: 1, friction: 0.8, restitution: 0.05 }, { kind: "SWITCH", initiallyClosed: false }, { kind: "SENSOR", sensorType: "TOUCH" }], ports: [logicPort("signal-out", "OUT")] },
    { id: "silly.bolt", familyId: "silly.bolt", displayName: "Bolt", category: "SILLY", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 0.72, height: 0.92, density: 0.7, friction: 0.55, restitution: 0.35 }], ports: [] },
    { id: "structure.block", familyId: "structure.block", displayName: "Block", category: "STRUCTURE", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 1.2, height: 0.45, density: 1, friction: 0.75, restitution: 0.05 }], ports: [{ id: "joint", family: "STRUCTURAL", capabilities: ["RIGID"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.4, multiplicity: "MANY" }] },
    { id: "structure.breakable", familyId: "structure.beam", displayName: "Break Beam", category: "STRUCTURE", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 1.4, height: 0.25, density: 0.7, friction: 0.6, restitution: 0.05 }, { kind: "BREAKABLE", threshold: 5 }], ports: [{ id: "joint", family: "STRUCTURAL", capabilities: ["RIGID"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.4, multiplicity: "MANY" }] },
    { id: "power.battery", familyId: "power.battery", displayName: "Battery", category: "POWER", behaviours: [{ kind: "BATTERY", supply: 1 }], ports: [electricalPort("power-out", "OUT")] },
    { id: "power.motor", familyId: "power.motor", displayName: "Motor", category: "POWER", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 0.7, height: 0.7, density: 1, friction: 0.6, restitution: 0.1 }, { kind: "MOTOR", maxTorque: 8, targetSpeed: 2 }], ports: [electricalPort("power-in", "IN"), mechanicalPort("shaft")] },
    { id: "power.generator", familyId: "power.generator", displayName: "Generator", category: "POWER", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 0.72, height: 0.72, density: 1, friction: 0.6, restitution: 0.05 }, { kind: "GENERATOR", efficiency: 0.8 }], ports: [mechanicalPort("shaft"), electricalPort("power-out", "OUT")] },
    { id: "gear.gear", familyId: "gear.spur", displayName: "Gear", category: "GEAR", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 0.9, height: 0.9, density: 1, friction: 0.7, restitution: 0.05 }], ports: [mechanicalPort("axle")] },
    { id: "gear.pulley", familyId: "gear.pulley", displayName: "Pulley", category: "GEAR", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 0.85, height: 0.85, density: 1, friction: 0.7, restitution: 0.05 }], ports: [mechanicalPort("axle"), { id: "rope", family: "ROPE", capabilities: ["TENSION"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.4, multiplicity: "MANY" }] },
    { id: "logic.switch", familyId: "logic.switch", displayName: "Switch", category: "LOGIC", behaviours: [{ kind: "SWITCH", initiallyClosed: true }, { kind: "SENSOR", sensorType: "TOUCH" }], ports: [electricalPort("power-in", "IN"), electricalPort("power-out", "OUT"), logicPort("signal-out", "OUT")] },
    { id: "logic.controller", familyId: "logic.controller", displayName: "Logic", category: "LOGIC", behaviours: [{ kind: "LOGIC_CONTROLLER", program: [{ op: "SET", channel: "pump.enabled", value: true }] }], ports: [logicPort("signal-in", "IN"), logicPort("signal-out", "OUT")] },
    { id: "water.pump", familyId: "water.pump", displayName: "Pump", category: "WATER", behaviours: [{ kind: "PUMP", maxFlow: 0.7 }], ports: [electricalPort("power-in", "IN"), logicPort("signal-in", "IN"), fluidPort("water-out", "OUT")] },
    { id: "water.wheel", familyId: "water.wheel", displayName: "Water Wheel", category: "WATER", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "CIRCLE", width: 1.0, height: 1.0, density: 1, friction: 0.7, restitution: 0.05 }, { kind: "WATER_WHEEL", efficiency: 3 }], ports: [fluidPort("water-in", "IN"), mechanicalPort("axle")] },
    { id: "magnet.bar", familyId: "magnet.bar", displayName: "Bar Magnet", category: "MAGNET", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 1.0, height: 0.35, density: 1, friction: 0.5, restitution: 0.1 }, { kind: "MAGNET", poleA: "N", strength: 6 }], ports: [] },
    { id: "magnet.electro", familyId: "magnet.electro", displayName: "Electromagnet", category: "MAGNET", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 0.8, height: 0.55, density: 1, friction: 0.6, restitution: 0 }, { kind: "ELECTROMAGNET", strength: 8 }], ports: [electricalPort("power-in", "IN"), logicPort("signal-in", "IN")] },
    { id: "air.fan", familyId: "air.fan", displayName: "Fan", category: "AIR", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 0.8, height: 0.8, density: 1, friction: 0.6, restitution: 0 }, { kind: "FAN", force: 15, range: 4 }], ports: [electricalPort("power-in", "IN"), logicPort("signal-in", "IN"), mechanicalPort("shaft")] },
    { id: "logic.actuator", familyId: "logic.actuator", displayName: "Actuator", category: "LOGIC", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 0.9, height: 0.4, density: 1, friction: 0.5, restitution: 0.1 }, { kind: "ACTUATOR", mode: "LINEAR", strength: 6 }], ports: [logicPort("signal-in", "IN")] }
];
/**
 * Gear Garage parts (M12). No physics body: the GearSystem turns them (see src/gears/GearSystem.ts).
 * Drawn in code behind these ids until the gear art arrives (docs/ART_NEEDED.md).
 */
const gearPart = (id, displayName, role, radius, teeth, extra = []) => ({ id, familyId: id, displayName, category: "GEAR", behaviours: [{ kind: "GEAR", role, radius, teeth }, ...extra], ports: [mechanicalPort("axle")] });
export const GEAR_PARTS = [
    gearPart("gear.small", "Small Gear", "GEAR", 0.3, 8),
    gearPart("gear.medium", "Medium Gear", "GEAR", 0.5, 12),
    gearPart("gear.large", "Large Gear", "GEAR", 0.8, 20),
    gearPart("gear.belt-pulley", "Pulley", "PULLEY", 0.3, 0),
    gearPart("gear.belt-pulley-big", "Big Pulley", "PULLEY", 0.6, 0),
    gearPart("gear.crank", "Hand Crank", "SHAFT", 0.18, 0, [{ kind: "GEAR_DRIVER", driver: "CRANK", speed: 3, torque: 4 }]),
    gearPart("gear.motor", "Gear Motor", "SHAFT", 0.18, 0, [{ kind: "GEAR_DRIVER", driver: "MOTOR", speed: 4, torque: 6 }]),
    gearPart("gear.door-wheel", "Door Wheel", "GEAR", 0.8, 20, [{ kind: "GEAR_OUTPUT", output: "DOOR", load: 0.5 }]),
    gearPart("gear.fan-shaft", "Fan", "SHAFT", 0.18, 0, [{ kind: "GEAR_OUTPUT", output: "FAN", load: 0.2 }]),
    gearPart("gear.winch", "Winch", "SHAFT", 0.18, 0, [{ kind: "GEAR_OUTPUT", output: "WINCH", load: 0.1, drum: 0.3 }]),
    gearPart("gear.conveyor-drum", "Conveyor Drum", "SHAFT", 0.18, 0, [{ kind: "GEAR_OUTPUT", output: "CONVEYOR", load: 0.3, drum: 0.35 }]),
    gearPart("gear.carousel", "Carousel", "SHAFT", 0.18, 0, [{ kind: "GEAR_OUTPUT", output: "CAROUSEL", load: 0.4 }]),
    gearPart("gear.clock", "Clock", "SHAFT", 0.18, 0, [{ kind: "GEAR_OUTPUT", output: "CLOCK", load: 0.1 }]),
    gearPart("gear.factory-drive", "Factory Line", "SHAFT", 0.18, 0, [{ kind: "GEAR_OUTPUT", output: "FACTORY", load: 1.2 }]),
    gearPart("gear.ride", "Big Wheel Ride", "SHAFT", 0.18, 0, [{ kind: "GEAR_OUTPUT", output: "RIDE", load: 0.4 }]),
    { id: "motion.conveyor", familyId: "motion.conveyor", displayName: "Conveyor", category: "MOTION", behaviours: [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 5, height: 0.25, density: 1, friction: 0.6, restitution: 0.02 }, { kind: "CONVEYOR" }], ports: [] },
    { id: "gear.heavy-crate", familyId: "gear.heavy-crate", displayName: "Heavy Crate", category: "GEAR", behaviours: [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 0.9, height: 0.9, density: 4, friction: 0.7, restitution: 0.05 }], ports: [] }
];
/**
 * Builder Bay parts (M13). Beams, ropes and braces are solved by the StructureSystem (src/structures/).
 * Code-drawn behind these ids until the structure art arrives (docs/ART_NEEDED.md, Batch S).
 */
const beam = (id, displayName, material, length, thickness) => ({ id, familyId: id, displayName, category: "STRUCTURE", behaviours: [{ kind: "BEAM", material, length, thickness }], ports: [{ id: "joint", family: "STRUCTURAL", capabilities: ["RIGID"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "MANY" }] });
const marker = (id, displayName, category, behaviours) => ({ id, familyId: id, displayName, category, behaviours, ports: [] });
export const STRUCTURE_PARTS = [
    beam("builder.beam-wood", "Wooden Beam", "WOOD", 2, 0.18),
    beam("builder.beam-metal", "Metal Beam", "METAL", 2, 0.16),
    beam("builder.brace", "Triangle Brace", "METAL", 1.4, 0.1),
    beam("builder.column", "Support Column", "WOOD", 2.2, 0.24),
    beam("builder.rope", "Rope", "ROPE", 2, 0.05),
    marker("builder.anchor", "Anchor Bolt", "STRUCTURE", [{ kind: "STRUCT_ANCHOR" }]),
    marker("builder.cliff", "Cliff", "STRUCTURE", [{ kind: "STRUCT_GROUND", width: 4, height: 3 }]),
    marker("builder.chasm", "Canyon", "STRUCTURE", [{ kind: "CHASM", width: 4 }]),
    marker("builder.bolt-walker", "Bolt", "SILLY", [{ kind: "TRAVELLER", who: "BOLT", weight: 4, speed: 1, height: 0.92 }]),
    marker("builder.elephant", "Elephant Robot", "SILLY", [{ kind: "TRAVELLER", who: "ELEPHANT", weight: 18, speed: 0.7, height: 1.3 }]),
    marker("builder.cart", "Heavy Cart", "MOTION", [{ kind: "TRAVELLER", who: "CART", weight: 10, speed: 0.9, height: 0.8 }]),
    marker("builder.robot", "Parade Robot", "SILLY", [{ kind: "TRAVELLER", who: "ROBOT", weight: 5, speed: 1, height: 0.9 }]),
    marker("builder.sandbag", "Sandbag", "STRUCTURE", [{ kind: "STRUCT_LOAD", weight: 6 }]),
    marker("builder.test-weight", "Test Weight", "STRUCTURE", [{ kind: "STRUCT_LOAD", weight: 30 }]),
    marker("builder.egg", "Egg", "SILLY", [{ kind: "EGG", weight: 0.3 }]),
    marker("builder.wind", "Wind", "AIR", [{ kind: "WIND", force: 1.5 }])
];
/** Parts added by the labs from M14 on (Power Lab, …), in campaign order. */
export const LAB_PARTS = [...POWER_PARTS, ...MAGNET_PARTS, ...WATER_PARTS, ...FLIGHT_PARTS, ...ROBOT_PARTS, ...SPACE_PARTS, ...CHAIN_PARTS, ...EXPERIMENT_PARTS, ...CREATURE_PARTS, ...SANDBOX_PARTS, ...PROTOTYPE_PARTS];
export function createDefaultRegistry() { const r = new PartRegistry(); for (const p of [...DEFAULT_PARTS, ...GEAR_PARTS, ...STRUCTURE_PARTS, ...LAB_PARTS])
    r.register(p); return r; }
