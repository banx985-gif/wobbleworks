/**
 * Space Centre parts (M19). Rockets, rovers, gravity zones, planets and launchers are solved by the SpaceSystem
 * (src/space/); solar panels and the radio are Power Lab circuit parts; the robot arm runs Robot Lab programs.
 * Drop a booster, fins, nose cone, capsule or landing legs next to a rocket, or wheels, a drive motor, a battery, a
 * solar panel or a cargo pod next to a rover, and it clips on. Code-drawn behind these ids until the space art arrives
 * (docs/ART_NEEDED.md, Batch S).
 */
const part = (id, familyId, displayName, behaviours) => ({ id, familyId, displayName, category: "SPACE", behaviours, ports: [] });
const body = (bodyType, width, height, density, friction = 0.5, restitution = 0.05, shape = "BOX") => ({ kind: "RIGID_BODY", bodyType, shape, width, height, density, friction, restitution });
const T = (x, y) => ({ x, y });
export const SPACE_PARTS = [
    // Vessels
    part("space.rocket", "space.rocket", "Rocket", [body("DYNAMIC", 0.44, 1.5, 1.2, 0.6, 0.02), { kind: "VESSEL", vessel: "ROCKET", dragArea: 0.12 }]),
    part("space.lander", "space.rocket", "Lander", [body("DYNAMIC", 0.8, 0.9, 1.1, 0.6, 0.02), { kind: "VESSEL", vessel: "ROCKET", dragArea: 0.25 }]),
    part("space.rover", "space.rover", "Rover", [body("DYNAMIC", 0.7, 0.7, 3, 0.05, 0.02, "CIRCLE"), { kind: "VESSEL", vessel: "ROVER", dragArea: 0.1 }]),
    // Rocket parts
    part("space.booster", "space.booster", "Booster", [{ kind: "SPACE", part: "BOOSTER", mass: 0.3, thrust: 18, burn: 1.5 }]),
    part("space.fins", "space.rocket", "Fins", [{ kind: "SPACE", part: "FINS", mass: 0.1 }]),
    part("space.nose-cone", "space.rocket", "Nose Cone", [{ kind: "SPACE", part: "NOSE", mass: 0.05 }]),
    part("space.capsule", "space.rocket", "Capsule", [{ kind: "SPACE", part: "CAPSULE", mass: 0.3 }]),
    part("space.landing-legs", "space.rocket", "Landing Legs", [{ kind: "SPACE", part: "LEGS", mass: 0.15 }]),
    // Rover parts
    part("space.wheel", "space.rover", "Smooth Wheel", [{ kind: "SPACE", part: "WHEEL", mass: 0.1, grip: 0.45 }]),
    part("space.grip-wheel", "space.rover", "Grippy Wheel", [{ kind: "SPACE", part: "WHEEL", mass: 0.12, grip: 1.0 }]),
    part("space.drive-motor", "space.rover", "Drive Motor", [{ kind: "SPACE", part: "DRIVE", mass: 0.2, force: 4, speed: 1.6 }]),
    part("space.cargo-pod", "space.rover", "Cargo Pod", [{ kind: "SPACE", part: "CARGO", mass: 0.5 }]),
    // Power (Power Lab circuit parts that live in space)
    part("space.solar-panel", "space.solar", "Solar Panel", [{ kind: "CIRCUIT", role: "BATTERY", volts: 3, ohms: 0.5, terminals: [T(-0.4, 0.32), T(0.4, 0.32)] }, { kind: "SOLAR_PANEL" }, { kind: "SPACE", part: "SOLAR", mass: 0.1 }]),
    part("space.radio", "space.solar", "Radio", [{ kind: "CIRCUIT", role: "LOAD", load: "DEVICE", ohms: 6, terminals: [T(-0.35, 0.4), T(0.35, 0.4)] }]),
    part("space.igniter", "space.booster", "Igniter", [{ kind: "CIRCUIT", role: "LOAD", load: "DEVICE", ohms: 6, terminals: [T(-0.3, 0.25), T(0.3, 0.25)] }]),
    // The environment
    part("space.gravity-zone", "space.environment", "Gravity Zone", [{ kind: "GRAVITY_ZONE", g: 1.62, air: false }]),
    part("space.sun", "space.environment", "Sun", [{ kind: "SUN" }]),
    part("space.planet", "space.environment", "Planet", [body("STATIC", 1.6, 1.6, 1, 0.5, 0.2, "CIRCLE"), { kind: "PLANET", pull: 14, radius: 0.9, range: 9 }]),
    part("space.launcher", "space.booster", "Launcher", [body("STATIC", 0.8, 0.3, 1, 0, 0), { kind: "LAUNCHER", speeds: [1.6, 2.25, 2.9, 3.6] }]),
    part("space.launch-pad", "space.environment", "Launch Pad", [body("STATIC", 1.6, 0.3, 1, 0.8, 0.02)]),
    part("space.landing-pad", "space.environment", "Landing Pad", [body("STATIC", 2.2, 0.3, 1, 0.8, 0.02)]),
    part("space.moon-plateau", "space.environment", "Moon Rock", [body("STATIC", 4, 2, 1, 0.1, 0.02)]),
    part("space.marker", "space.environment", "Marker Flag", []),
    part("space.moon-base", "space.environment", "Moon Base", []),
    part("space.satellite", "space.solar", "Satellite", []),
    // Robot arm (runs a Robot Lab program; zero-g station cells)
    part("space.robot-arm", "space.robot-arm", "Robot Arm", [{ kind: "ROBOT", speed: 1 }]),
    part("space.repair-module", "space.robot-arm", "Repair Module", [{ kind: "ARENA", thing: "BOX" }]),
    part("space.repair-slot", "space.robot-arm", "Repair Slot", [{ kind: "ARENA", thing: "DROP" }]),
    part("space.hull", "space.robot-arm", "Station Hull", [{ kind: "ARENA", thing: "WALL" }])
];
