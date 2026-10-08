/**
 * Power Lab parts (M14). Wires and components are solved by the CircuitSystem (src/power/).
 * Terminals are local offsets: a battery's terminal 0 is −, terminal 1 is +.
 * Painted where art exists (big button, lever switch); the rest are code-drawn behind these ids (docs/ART_NEEDED.md, Batch P).
 */
const elec = (id) => ({ id, family: "ELECTRICAL", capabilities: ["POWER"], direction: "BIDIRECTIONAL", offset: { x: 0, y: 0 }, angle: 0, snapRadius: 0.35, multiplicity: "MANY" });
const part = (id, familyId, displayName, behaviours, ports = [elec("a"), elec("b")]) => ({ id, familyId, displayName, category: "POWER", behaviours, ports });
const T = (x, y) => ({ x, y });
export const POWER_PARTS = [
    part("circuit.battery", "power.battery", "Battery", [{ kind: "CIRCUIT", role: "BATTERY", volts: 3, ohms: 0.5, capacity: 400, terminals: [T(-0.5, 0), T(0.5, 0)] }]),
    part("circuit.battery-big", "power.battery", "Big Battery", [{ kind: "CIRCUIT", role: "BATTERY", volts: 3, ohms: 0.5, capacity: 1600, terminals: [T(-0.6, 0), T(0.6, 0)] }]),
    part("circuit.power-station", "power.battery", "Power Station", [{ kind: "CIRCUIT", role: "BATTERY", volts: 3, ohms: 0.1, capacity: 100000, terminals: [T(-0.6, 0.5), T(0.6, 0.5)] }]),
    part("circuit.wire", "power.wire", "Wire", [{ kind: "WIRE", length: 1.5, ohms: 0.02 }]),
    part("circuit.switch", "power.switch", "Switch", [{ kind: "CIRCUIT", role: "SWITCH", terminals: [T(-0.4, 0.15), T(0.4, 0.15)] }]),
    part("circuit.button", "power.button", "Button", [{ kind: "RIGID_BODY", bodyType: "STATIC", shape: "BOX", width: 0.8, height: 0.3, density: 1, friction: 0.8, restitution: 0.05 }, { kind: "CIRCUIT", role: "BUTTON", terminals: [T(-0.45, 0.05), T(0.45, 0.05)] }]),
    part("circuit.bulb", "power.bulb", "Bulb", [{ kind: "CIRCUIT", role: "LOAD", load: "BULB", ohms: 6, terminals: [T(-0.2, 0.42), T(0.2, 0.42)] }]),
    part("circuit.buzzer", "power.buzzer", "Buzzer", [{ kind: "CIRCUIT", role: "LOAD", load: "BUZZER", ohms: 8, terminals: [T(-0.3, 0.3), T(0.3, 0.3)] }]),
    part("circuit.motor", "power.motor", "Electric Motor", [{ kind: "CIRCUIT", role: "LOAD", load: "MOTOR", ohms: 4, terminals: [T(-0.38, 0.42), T(0.38, 0.42)] }, { kind: "GEAR", role: "SHAFT", radius: 0.18, teeth: 0 }, { kind: "GEAR_DRIVER", driver: "MOTOR", speed: 4, torque: 6, electric: true }]),
    part("circuit.splitter", "power.splitter", "Splitter", [{ kind: "CIRCUIT", role: "JUNCTION", terminals: [T(0, 0)] }], [elec("hub")]),
    part("circuit.device", "power.power-meter", "Gadget", [{ kind: "CIRCUIT", role: "LOAD", load: "DEVICE", ohms: 6, terminals: [T(-0.35, 0.45), T(0.35, 0.45)] }])
];
