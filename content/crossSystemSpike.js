import { createBuildSnapshot } from "../core/BuildSnapshot.js";
const part = (id, definitionId, x, y) => ({ id, definitionId, position: { x, y }, rotation: 0, parameters: {} });
export const CROSS_SYSTEM_PARTS = [
    part("battery", "power.battery", 1, 2), part("motor", "power.motor", 2.2, 2), part("gear", "gear.gear", 3.3, 2),
    part("pulley", "gear.pulley", 4.5, 2), part("switch", "logic.switch", 5.5, 2), part("logic", "logic.controller", 6.5, 2),
    part("pump", "water.pump", 7.5, 2), part("waterwheel", "water.wheel", 9, 2), part("output", "motion.wheel", 10.4, 2), part("generator", "power.generator", 11.2, 2),
    part("anchor", "structure.block", 4.4, 4.5), part("breakable", "structure.breakable", 5.4, 4.5), part("magnet", "magnet.bar", 11.8, 4), part("electromagnet", "magnet.electro", 12.8, 4),
    part("fan", "air.fan", 2, 6), part("actuator", "logic.actuator", 7, 5)
];
const c = (id, fromPartId, fromPortId, toPartId, toPortId, config) => ({ id, fromPartId, fromPortId, toPartId, toPortId, config });
export const CROSS_SYSTEM_CONNECTIONS = [
    c("c-power-motor", "battery", "power-out", "motor", "power-in", { kind: "ELECTRICAL", channel: "main" }),
    c("c-motor-gear", "motor", "shaft", "gear", "axle", { kind: "ROTATIONAL", relationship: "GEAR", ratio: 0.75, invertDirection: true }),
    c("c-gear-pulley", "gear", "axle", "pulley", "axle", { kind: "ROTATIONAL", relationship: "BELT", ratio: 1.5, invertDirection: false }),
    c("c-switch-logic", "switch", "signal-out", "logic", "signal-in", { kind: "LOGIC", signalType: "BOOL", channel: "trigger" }),
    c("c-power-pump", "battery", "power-out", "pump", "power-in", { kind: "ELECTRICAL", channel: "main" }),
    c("c-logic-pump", "logic", "signal-out", "pump", "signal-in", { kind: "LOGIC", signalType: "BOOL", channel: "pump.enabled" }),
    c("c-pump-wheel", "pump", "water-out", "waterwheel", "water-in", { kind: "FLUID", channel: "water", maxFlow: 0.7 }),
    c("c-water-output", "waterwheel", "axle", "output", "axle", { kind: "ROTATIONAL", relationship: "DIRECT", ratio: 1, invertDirection: false }),
    c("c-output-generator", "output", "axle", "generator", "shaft", { kind: "ROTATIONAL", relationship: "DIRECT", ratio: 1, invertDirection: false }),
    c("c-generator-signal", "generator", "power-out", "electromagnet", "power-in", { kind: "ELECTRICAL", channel: "generated" }),
    c("c-breakable", "anchor", "joint", "breakable", "joint", { kind: "STRUCTURAL", breakStrength: 0.08, stiffness: 1 }),
    c("c-power-fan", "battery", "power-out", "fan", "power-in", { kind: "ELECTRICAL", channel: "main" }),
    c("c-logic-actuator", "logic", "signal-out", "actuator", "signal-in", { kind: "LOGIC", signalType: "BOOL", channel: "pump.enabled" })
];
export function createCrossSystemSnapshot(revision = 1) { return createBuildSnapshot({ id: "spike.cross-system", revision, createdAtMs: 1000, parts: CROSS_SYSTEM_PARTS, connections: CROSS_SYSTEM_CONNECTIONS }); }
