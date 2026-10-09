/**
 * Creature & Music Machines parts (M29). Creature parts clip onto a creature body like rover parts clip onto a rover
 * (only the body has a physics body of its own). Instruments are played by the normal systems: something hitting
 * them, a beater on a gear shaft, a water jet, or electricity. Code-drawn for now (docs/ART_NEEDED.md, Batch M).
 */
const part = (id, displayName, category, behaviours, familyId = id) => ({ id, familyId, displayName, category, behaviours, ports: [] });
const T = (x, y) => ({ x, y });
export const CREATURE_PARTS = [
    part("creature.body", "Creature Body", "SILLY", [{ kind: "RIGID_BODY", bodyType: "DYNAMIC", shape: "BOX", width: 1.2, height: 0.45, density: 0.9, friction: 0.6, restitution: 0.05 }, { kind: "CREATURE", part: "BODY", mass: 0.5 }]),
    part("creature.leg", "Leg", "SILLY", [{ kind: "CREATURE", part: "LEG", mass: 0.08 }]),
    part("creature.big-leg", "Big Leg", "SILLY", [{ kind: "CREATURE", part: "BIG_LEG", mass: 0.25 }]),
    part("creature.spring-leg", "Spring Leg", "SILLY", [{ kind: "CREATURE", part: "SPRING_LEG", mass: 0.1 }]),
    part("creature.wing", "Flapping Wing", "SILLY", [{ kind: "CREATURE", part: "WING", mass: 0.06 }]),
    part("creature.claw", "Claw", "SILLY", [{ kind: "CREATURE", part: "CLAW", mass: 0.15 }]),
    part("creature.segment", "Body Segment", "SILLY", [{ kind: "CREATURE", part: "SEGMENT", mass: 0.2 }]),
    part("creature.motor", "Creature Motor", "SILLY", [{ kind: "CREATURE", part: "MOTOR", mass: 0.2 }]),
    // Instruments. The note (1–8) is a setting: tap the instrument to change it.
    part("music.drum", "Drum", "MUSICAL", [{ kind: "MUSIC", family: "DRUM" }]),
    part("music.chime", "Chime", "MUSICAL", [{ kind: "MUSIC", family: "CHIME" }, { kind: "WATER_TARGET", width: 0.6, height: 0.9 }]),
    part("music.tone-block", "Tone Block", "MUSICAL", [{ kind: "MUSIC", family: "TONE_BLOCK" }]),
    part("music.horn", "Electric Horn", "MUSICAL", [{ kind: "CIRCUIT", role: "LOAD", load: "HORN", ohms: 6, terminals: [T(-0.35, 0.3), T(0.35, 0.3)] }, { kind: "MUSIC", family: "HORN" }]),
    // A beater is a hammer on a shaft: put it on a turning gear or motor and it strikes once every turn.
    part("music.beater", "Beater", "MUSICAL", [{ kind: "GEAR", role: "SHAFT", radius: 0.12, teeth: 0 }, { kind: "MUSIC", family: "BEATER" }]),
    // A timer switch closes for a moment at a steady rate (every 0.5, 1 or 2 seconds — tap to change).
    part("music.timer", "Timer Switch", "LOGIC", [{ kind: "CIRCUIT", role: "SWITCH", terminals: [T(-0.4, 0.15), T(0.4, 0.15)] }, { kind: "MUSIC", family: "TIMER", every: 1 }])
];
