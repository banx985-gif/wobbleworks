import { ValidationError } from "./validation.js";
export function directionsCompatible(a, b) {
    if (a.direction === "BIDIRECTIONAL" || b.direction === "BIDIRECTIONAL")
        return true;
    return a.direction !== b.direction;
}
export function portsCompatible(a, b) {
    if (a.family !== b.family)
        return false;
    if (!directionsCompatible(a, b))
        return false;
    if (a.capabilities.length === 0 || b.capabilities.length === 0)
        return true;
    return a.capabilities.some(cap => b.capabilities.includes(cap));
}
export function defaultConnectionConfig(family) {
    switch (family) {
        case "STRUCTURAL": return { kind: "STRUCTURAL", breakStrength: 100, stiffness: 1 };
        case "ROTATIONAL": return { kind: "ROTATIONAL", relationship: "DIRECT", ratio: 1, invertDirection: false };
        case "HINGE": return { kind: "HINGE" };
        case "ROPE": return { kind: "ROPE", maxLength: 3, breakStrength: 80 };
        case "ELECTRICAL": return { kind: "ELECTRICAL", channel: "power" };
        case "FLUID": return { kind: "FLUID", channel: "water", maxFlow: 1 };
        case "LOGIC": return { kind: "LOGIC", signalType: "BOOL", channel: "signal" };
    }
}
export function getPort(part, portId) {
    const port = part.ports.find(p => p.id === portId);
    if (!port)
        throw new ValidationError(`Unknown port ${part.id}.${portId}`);
    return port;
}
