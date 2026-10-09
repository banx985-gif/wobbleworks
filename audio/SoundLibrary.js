const L = (wave, freq, dur, gain, more = {}) => ({ wave, freq, dur, gain, ...more });
/** The 34 sound families the plan requires (§69), each with a synthesised stand-in. */
export const SOUND_FAMILIES = {
    pickup: { layers: [L("sine", 520, 0.07, 0.5, { freqEnd: 780 })] },
    drop: { layers: [L("sine", 420, 0.08, 0.5, { freqEnd: 260 }), L("noise", 0, 0.05, 0.15, { filter: { type: "lowpass", freq: 900 } })] },
    rotate: { layers: [L("triangle", 660, 0.05, 0.35), L("triangle", 880, 0.05, 0.3, { delay: 0.04 })] },
    snap: { layers: [L("square", 1400, 0.03, 0.22), L("sine", 900, 0.06, 0.35, { delay: 0.02 })] },
    unsnap: { layers: [L("sine", 900, 0.06, 0.35, { freqEnd: 500 }), L("square", 700, 0.03, 0.15)] },
    click: { layers: [L("square", 1800, 0.02, 0.2)] },
    clunk: { layers: [L("sine", 140, 0.18, 0.7, { freqEnd: 90 }), L("noise", 0, 0.08, 0.3, { filter: { type: "lowpass", freq: 500 } })] },
    "gear-engage": { layers: [L("square", 300, 0.04, 0.25), L("square", 340, 0.04, 0.25, { delay: 0.05 }), L("square", 380, 0.04, 0.25, { delay: 0.1 })] },
    "motor-hum": { layers: [L("sawtooth", 110, 0.5, 0.18, { freqEnd: 140, filter: { type: "lowpass", freq: 600 }, attack: 0.08 })] },
    "electric-buzz": { layers: [L("sawtooth", 120, 0.25, 0.22, { filter: { type: "bandpass", freq: 900 } })] },
    "bulb-ping": { layers: [L("sine", 1320, 0.25, 0.4), L("sine", 1980, 0.18, 0.15)] },
    "spring-boing": { layers: [L("sine", 180, 0.35, 0.6, { freqEnd: 620 }), L("triangle", 360, 0.25, 0.2, { freqEnd: 900 })] },
    "rope-tension": { layers: [L("sawtooth", 240, 0.3, 0.15, { freqEnd: 300, filter: { type: "bandpass", freq: 700 } })] },
    "beam-creak": { layers: [L("sawtooth", 90, 0.4, 0.2, { freqEnd: 70, filter: { type: "bandpass", freq: 400 } })] },
    "break-crack": { layers: [L("noise", 0, 0.18, 0.7, { filter: { type: "highpass", freq: 1500 } }), L("sine", 200, 0.15, 0.4, { freqEnd: 80 })] },
    "water-splash": { layers: [L("noise", 0, 0.35, 0.45, { filter: { type: "bandpass", freq: 1200 } }), L("sine", 600, 0.12, 0.2, { freqEnd: 300 })] },
    "pipe-flow": { layers: [L("noise", 0, 0.6, 0.18, { filter: { type: "lowpass", freq: 700 }, attack: 0.15 })] },
    pump: { layers: [L("sine", 160, 0.12, 0.45, { freqEnd: 120 }), L("sine", 160, 0.12, 0.45, { freqEnd: 120, delay: 0.2 })] },
    "magnet-thunk": { layers: [L("sine", 220, 0.12, 0.6, { freqEnd: 110 }), L("square", 880, 0.03, 0.15)] },
    "magnet-repel": { layers: [L("sine", 300, 0.2, 0.4, { freqEnd: 600 }), L("triangle", 450, 0.15, 0.2, { freqEnd: 900 })] },
    fan: { layers: [L("noise", 0, 0.7, 0.2, { filter: { type: "bandpass", freq: 500 }, attack: 0.2 })] },
    propeller: { layers: [L("sawtooth", 70, 0.5, 0.2, { freqEnd: 110, filter: { type: "lowpass", freq: 500 }, attack: 0.1 })] },
    "balloon-squeak": { layers: [L("sine", 900, 0.18, 0.35, { freqEnd: 1300 }), L("sine", 1300, 0.12, 0.25, { freqEnd: 1000, delay: 0.15 })] },
    "rocket-fizz": { layers: [L("noise", 0, 0.5, 0.35, { filter: { type: "highpass", freq: 2500 } })] },
    "rocket-whoosh": { layers: [L("noise", 0, 0.9, 0.5, { filter: { type: "bandpass", freq: 800 }, attack: 0.05 }), L("sine", 120, 0.8, 0.3, { freqEnd: 60 })] },
    "soft-crash": { layers: [L("noise", 0, 0.3, 0.4, { filter: { type: "lowpass", freq: 1200 } }), L("sine", 150, 0.25, 0.4, { freqEnd: 70 })] },
    confetti: { layers: [L("noise", 0, 0.08, 0.35, { filter: { type: "highpass", freq: 3000 } }), ...[0, 1, 2, 3].map(k => L("sine", 1500 + k * 250, 0.06, 0.15, { delay: 0.05 + k * 0.05 }))] },
    bell: { layers: [L("sine", 880, 0.9, 0.45), L("sine", 2210, 0.5, 0.15), L("sine", 1320, 0.7, 0.12)] },
    buzzer: { layers: [L("square", 220, 0.35, 0.22, { filter: { type: "lowpass", freq: 1500 } })] },
    "bolt-voice": { layers: [L("square", 700, 0.06, 0.12, { freqEnd: 950 }), L("square", 950, 0.06, 0.12, { freqEnd: 800, delay: 0.07 }), L("sine", 1200, 0.05, 0.15, { delay: 0.14 })] },
    "sprocket-bark": { layers: [L("square", 520, 0.07, 0.2, { freqEnd: 760 }), L("square", 600, 0.07, 0.2, { freqEnd: 820, delay: 0.12 })] },
    "success-sting": { layers: [523, 659, 784, 1047].map((f, k) => L("triangle", f, k === 3 ? 0.45 : 0.14, 0.4, { delay: k * 0.1 })) },
    "discovery-sting": { layers: [L("sine", 784, 0.15, 0.4), L("sine", 1175, 0.15, 0.4, { delay: 0.12 }), L("sine", 1568, 0.4, 0.35, { delay: 0.24 })] },
    "secret-sting": { layers: [L("triangle", 440, 0.2, 0.35), L("triangle", 554, 0.2, 0.35, { delay: 0.18 }), L("triangle", 698, 0.2, 0.35, { delay: 0.36 }), L("sine", 1397, 0.6, 0.3, { delay: 0.54 })] }
};
export const REQUIRED_SOUND_FAMILIES = Object.freeze(Object.keys(SOUND_FAMILIES));
/** What a machine does during a TEST → the sound it makes (only these events make a sound). */
export const EVENT_SOUNDS = {
    SPRING_LAUNCH: "spring-boing", BOUNCE_PAD_CONTACT: "spring-boing", BELL_RING: "bell", NOTE_PLAYED: "", CONFETTI_BURST: "confetti", CANNON_FIRE: "clunk",
    DOMINO_FALL: "click", DOMINO_DOWN: "click", SEESAW_FLIP: "clunk", TRAPDOOR_OPEN: "clunk", BUTTON_PRESSED: "click", SWITCH_CHANGED: "click",
    GEAR_TRAIN_RUNNING: "gear-engage", GEAR_JAMMED: "clunk", GEAR_STALLED: "beam-creak", WINCH_LIFT: "rope-tension", CONVEYOR_ON: "motor-hum", MACHINE_ON: "motor-hum",
    CIRCUIT_COMPLETE: "electric-buzz", LAMP_ON: "bulb-ping", SHORT_CIRCUIT: "buzzer", BREAKER_TRIPPED: "buzzer", GENERATOR_MAKING_POWER: "motor-hum",
    STRUCTURE_BROKE: "break-crack", OBJECT_BROKE: "break-crack", LOAD_TEST_DONE: "beam-creak",
    WATER_FLOWING: "pipe-flow", PUMP_LIFT: "pump", PUMP_MOVED_WATER: "pump", WATER_JET_PUSH: "water-splash", WATER_TARGET_WET: "water-splash", WATER_SPILL: "water-splash", TANK_FILLED: "bell",
    MAGNET_PULL_MATERIAL: "magnet-thunk", MAGNET_HOLD: "magnet-thunk", MAGNET_FLOATING: "magnet-repel",
    WIND_PUSH: "fan", PROPELLER_THRUST: "propeller", CRAFT_FLYING: "propeller", LANDING: "soft-crash", TOUCHDOWN: "soft-crash", HIT_GROUND: "soft-crash", CRAFT_TUMBLE: "soft-crash",
    BOOSTER_IGNITED: "rocket-fizz", ROCKET_LIFTOFF: "rocket-whoosh", ROCKET_TUMBLE: "soft-crash",
    ROBOT_STARTED: "bolt-voice", ROBOT_CRASH: "soft-crash", ROBOT_DONE: "success-sting", BOX_GRABBED: "magnet-thunk",
    CREATURE_HOP: "spring-boing", CREATURE_GRABBED: "magnet-thunk", SPROCKET_FLUNG: "sprocket-bark"
};
/** Map a runtime event to its sound id (undefined = silent). */
export function eventSound(kind) { const s = EVENT_SOUNDS[kind]; return s ? s : undefined; }
/** A sound can't repeat faster than this (seconds), so a chain of 50 dominoes ticks rather than roars. */
export const MIN_REPEAT_SECONDS = 0.07;
const MAJOR = [0, 2, 4, 5, 7, 9, 11], PENTA = [0, 2, 4, 7, 9], MIXO = [0, 2, 4, 5, 7, 9, 10], DORIAN = [0, 2, 3, 5, 7, 9, 10], LYDIAN = [0, 2, 4, 6, 7, 9, 11];
/** Each place has its own sound (§68): playful and clever, never nursery-like. */
export const MUSIC_THEMES = {
    title: { tempo: 112, scale: MAJOR, root: 261.6, lead: "marimba", melody: [[0, 2, 4, 2, 5, 4, 2, -1], [1, 3, 5, 3, 6, 5, 4, -1]], bass: [0, 4], drums: [1, 0, 2, 0, 1, 0, 2, 2] },
    hub: { tempo: 104, scale: PENTA, root: 293.7, lead: "marimba", melody: [[0, -1, 2, 3, 4, -1, 3, 2], [1, -1, 3, 4, 5, 4, 2, -1]], bass: [0, 3], drums: [1, 0, 2, 0, 1, 2, 2, 0] },
    "motion-yard": { tempo: 126, scale: MAJOR, root: 329.6, lead: "xylophone", melody: [[0, 2, 4, 6, 4, 2, 0, -1], [4, 5, 6, 7, 6, 4, 2, -1]], bass: [0, 4], drums: [1, 2, 2, 2, 1, 2, 2, 2] },
    "gear-garage": { tempo: 118, scale: MIXO, root: 220, lead: "pluck", melody: [[0, -1, 0, 2, -1, 2, 4, 3], [5, -1, 5, 4, -1, 2, 1, 0]], bass: [0, 6], drums: [1, 2, 1, 2, 1, 2, 1, 2] },
    "builder-bay": { tempo: 100, scale: MAJOR, root: 196, lead: "brass", melody: [[0, -1, 4, -1, 2, 4, 5, -1], [4, -1, 2, -1, 1, 2, 0, -1]], bass: [0, 3], drums: [1, 0, 0, 2, 1, 0, 2, 0] },
    "power-lab": { tempo: 132, scale: DORIAN, root: 233.1, lead: "pluck", melody: [[0, 2, 0, 4, 0, 5, 4, 2], [0, 2, 0, 6, 5, 4, 2, 1]], bass: [0, 5], drums: [1, 2, 2, 1, 2, 2, 1, 2] },
    "magnet-factory": { tempo: 116, scale: DORIAN, root: 207.7, lead: "marimba", melody: [[0, 4, -1, 2, 6, -1, 4, 2], [1, 5, -1, 3, 6, -1, 5, 3]], bass: [0, 4], drums: [1, 0, 2, 1, 0, 2, 2, 0] },
    "water-works": { tempo: 96, scale: PENTA, root: 349.2, lead: "bell", melody: [[0, 1, 2, -1, 4, 3, 2, -1], [2, 3, 4, -1, 5, 4, 3, -1]], bass: [0, 2], drums: [1, 0, 0, 2, 0, 0, 2, 0] },
    "flight-hangar": { tempo: 122, scale: LYDIAN, root: 293.7, lead: "xylophone", melody: [[0, 2, 4, 6, 7, 6, 4, 2], [3, 4, 6, 7, 8, 7, 6, 4]], bass: [0, 3], drums: [1, 0, 2, 0, 1, 0, 2, 0] },
    "robot-lab": { tempo: 128, scale: MIXO, root: 261.6, lead: "pluck", melody: [[0, 0, 4, 4, 2, 2, 6, -1], [5, 5, 4, 4, 2, 2, 0, -1]], bass: [0, 4], drums: [1, 2, 1, 2, 1, 2, 2, 2] },
    "space-centre": { tempo: 90, scale: LYDIAN, root: 174.6, lead: "bell", melody: [[0, -1, 4, -1, 6, -1, 4, -1], [2, -1, 6, -1, 8, -1, 6, -1]], bass: [0, 4], drums: [1, 0, 0, 0, 2, 0, 0, 0] },
    "grand-invention-hall": { tempo: 108, scale: MAJOR, root: 261.6, lead: "brass", melody: [[0, 2, 4, 7, -1, 4, 7, 9], [7, 6, 4, 2, -1, 4, 2, 0]], bass: [0, 4], drums: [1, 0, 2, 0, 1, 2, 2, 2] },
    "hidden-prototype-lab": { tempo: 98, scale: DORIAN, root: 196, lead: "pluck", melody: [[0, -1, 1, -1, 2, 6, -1, 5], [4, -1, 2, -1, 1, 0, -1, -1]], bass: [0, 5], drums: [1, 0, 2, 0, 0, 2, 1, 0] },
    workshop: { tempo: 110, scale: PENTA, root: 261.6, lead: "marimba", melody: [[0, 2, -1, 3, 4, -1, 2, 1], [0, 1, -1, 2, 4, -1, 3, 2]], bass: [0, 3], drums: [1, 0, 2, 0, 1, 0, 2, 0] }
};
/** The theme for a place: its own, or the workshop theme for creative modes. */
export function musicFor(placeId) { var _a; return (_a = MUSIC_THEMES[placeId]) !== null && _a !== void 0 ? _a : MUSIC_THEMES.workshop; }
/** Frequency of a scale step (wraps up the octave). */
export function stepHz(theme, step) { const n = theme.scale.length; const oct = Math.floor(step / n), idx = ((step % n) + n) % n; return theme.root * Math.pow(2, (theme.scale[idx] + 12 * oct) / 12); }
/** The three sliders are independent: each only ever changes its own sound. */
export function mixLevels(s) {
    const clamp = (v) => Math.max(0, Math.min(1, v));
    return { sfx: s.soundEffects ? clamp(s.sfxVolume) : 0, music: s.music !== false ? clamp(s.musicVolume) : 0, voice: s.narration ? clamp(s.voiceVolume) : 0 };
}
/** While Bolt is talking, music drops to this share so his words are clear. */
export const MUSIC_DUCK = 0.35;
