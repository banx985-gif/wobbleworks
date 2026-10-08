/**
 * Water Works parts (M16). Pipes and components are solved by the FluidSystem (src/water/).
 * Ports are local offsets. Painted where art exists (valves, tanks, nozzle); the rest are code-drawn behind
 * these ids (docs/ART_NEEDED.md, Batch W).
 */
const fluidPort = (id) => ({ id, family: "FLUID", capabilities: ["WATER"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "MANY" });
const elec = (id) => ({ id, family: "ELECTRICAL", capabilities: ["POWER"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "MANY" });
const T = (x, y) => ({ x, y });
const part = (id, familyId, displayName, behaviours, ports = [fluidPort("a"), fluidPort("b")]) => ({ id, familyId, displayName, category: "WATER", behaviours, ports });
const target = (id, familyId, displayName, width, height) => part(id, familyId, displayName, [{ kind: "WATER_TARGET", width, height }], []);
export const WATER_PARTS = [
    part("plumb.source", "water.tank", "Water Main", [{ kind: "FLUID", role: "SOURCE", head: 1.5, ports: [T(0.55, 0.35)] }], [fluidPort("out")]),
    part("plumb.tank", "water.tank", "Tank", [{ kind: "FLUID", role: "TANK", capacity: 5, height: 1.2, width: 0.9, ports: [T(-0.55, 0.5), T(0, -0.68)] }]),
    part("plumb.pipe", "water.pipe", "Pipe", [{ kind: "PIPE", length: 1.5, conductance: 1 }]),
    part("plumb.pipe-narrow", "water.pipe", "Narrow Pipe", [{ kind: "PIPE", length: 1.5, conductance: 0.2 }]),
    part("plumb.valve", "water.valve", "Valve", [{ kind: "FLUID", role: "VALVE", ports: [T(-0.35, 0), T(0.35, 0)] }]),
    part("plumb.pump", "water.pump", "Water Pump", [{ kind: "FLUID", role: "PUMP", ports: [T(-0.45, 0.15), T(0.45, 0.15)] }, { kind: "CIRCUIT", role: "LOAD", load: "PUMP", ohms: 4, terminals: [T(-0.3, -0.38), T(0.3, -0.38)] }], [fluidPort("in"), fluidPort("out"), elec("plus"), elec("minus")]),
    part("plumb.nozzle", "water.nozzle", "Nozzle", [{ kind: "FLUID", role: "NOZZLE", ports: [T(0, 0)] }], [fluidPort("in")]),
    part("plumb.rotor-nozzle", "water.sprinkler", "Spinning Sprayer", [{ kind: "GEAR", role: "SHAFT", radius: 0.18, teeth: 0 }, { kind: "GEAR_OUTPUT", output: "FAN", load: 0.1 }, { kind: "FLUID", role: "NOZZLE", ports: [T(0, 0.35)] }], [fluidPort("in")]),
    part("plumb.sprinkler", "water.sprinkler", "Sprinkler", [{ kind: "FLUID", role: "SPRINKLER", ports: [T(0, -0.25)] }], [fluidPort("in")]),
    part("plumb.drain", "water.drain", "Drain", [{ kind: "FLUID", role: "DRAIN", ports: [T(0, -0.15)] }], [fluidPort("in")]),
    part("plumb.wheel", "water.water-wheel", "Water Wheel", [{ kind: "GEAR", role: "SHAFT", radius: 0.18, teeth: 0 }, { kind: "GEAR_DRIVER", driver: "MOTOR", speed: 3, torque: 4, hydraulic: true }, { kind: "FLUID", role: "WHEEL", ports: [T(-0.45, -0.75)] }], [fluidPort("in")]),
    part("plumb.splitter", "water.t-junction", "Pipe Joint", [{ kind: "FLUID", role: "JUNCTION", ports: [T(0, 0)] }], [fluidPort("hub")]),
    target("plumb.bed", "water.sprinkler", "Garden Bed", 1.4, 0.45),
    target("plumb.target", "water.nozzle", "Spray Target", 0.7, 0.7),
    target("plumb.equipment", "water.drain", "Electrical Box", 1.2, 1.1),
    target("plumb.pool", "water.tank", "Pool", 2.2, 0.5)
];
