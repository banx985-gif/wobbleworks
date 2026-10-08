/**
 * Flight Hangar parts (M17). Crafts and wind are solved by the FlightSystem (src/flight/). Drop a wing, tail, propeller,
 * battery pack, parachute, balloon or nose weight next to a glider and it clips on.
 * Code-drawn behind these ids until the flight art arrives (docs/ART_NEEDED.md, Batch F); the fan uses `air.fan-motor`.
 */
const part = (id, familyId, displayName, behaviours) => ({ id, familyId, displayName, category: "AIR", behaviours, ports: [] });
const body = (bodyType, width, height, density, friction = 0.5, restitution = 0.1) => ({ kind: "RIGID_BODY", bodyType, shape: "BOX", width, height, density, friction, restitution });
export const FLIGHT_PARTS = [
    part("flight.glider", "air.glider-body", "Glider Body", [body("DYNAMIC", 1.0, 0.22, 0.6, 0.15, 0.05), { kind: "CRAFT", dragArea: 0.09 }]),
    part("flight.basket", "air.glider-body", "Basket", [body("DYNAMIC", 0.6, 0.35, 0.5, 0.6, 0.05), { kind: "CRAFT", dragArea: 0.08 }]),
    part("flight.wing-small", "air.wing", "Small Wing", [{ kind: "AERO", part: "WING", area: 0.22, incidence: 0.06, mass: 0.03 }]),
    part("flight.wing-large", "air.wing", "Big Wing", [{ kind: "AERO", part: "WING", area: 0.45, incidence: 0.06, mass: 0.05 }]),
    part("flight.wing-steep", "air.wing", "Steep Wing", [{ kind: "AERO", part: "WING", area: 0.45, incidence: 0.42, mass: 0.05 }]),
    part("flight.tail", "air.tail", "Tail", [{ kind: "AERO", part: "TAIL", area: 0.2, incidence: -0.08, mass: 0.02 }]),
    part("flight.propeller", "air.rotor", "Propeller", [{ kind: "AERO", part: "PROPELLER", thrust: 3, mass: 0.06 }]),
    part("flight.power-pack", "air.rotor", "Battery Pack", [{ kind: "AERO", part: "POWER_PACK", mass: 0.1 }]),
    part("flight.parachute", "air.parachute", "Parachute", [{ kind: "AERO", part: "PARACHUTE", area: 1.6, mass: 0.04 }]),
    part("flight.balloon", "air.balloon", "Balloon", [{ kind: "AERO", part: "BALLOON", buoyancy: 1.2, mass: 0.01 }]),
    part("flight.nose-weight", "air.glider-body", "Nose Weight", [{ kind: "AERO", part: "WEIGHT", mass: 0.12 }]),
    part("flight.payload", "air.glider-body", "Payload", [{ kind: "AERO", part: "PAYLOAD", mass: 0.2 }]),
    part("flight.fan", "air.rotor", "Wind Fan", [{ kind: "WIND_FAN", speed: 7, range: 5, spread: 0.3 }]),
    part("flight.hoop", "air.glider-body", "Hoop", [{ kind: "GATE", height: 1.3 }]),
    part("flight.paper-box", "air.glider-body", "Paper Box", [body("DYNAMIC", 0.5, 0.4, 0.15, 0.4, 0.1)]),
    part("flight.cargo", "air.parachute", "Cargo Box", [body("DYNAMIC", 0.5, 0.5, 1.0, 0.6, 0.05), { kind: "CRAFT", dragArea: 0.15 }]),
    part("flight.cliff", "structure.block", "Cliff", [body("STATIC", 3, 4, 1, 0.1, 0.05)])
];
