/**
 * THE part-art map (9 Oct art, assets/parts/): which painted picture each part uses, in one place.
 * The build tray, the playfield (every lab) and Free Build all read it. A part with no entry keeps its code-drawn shape.
 *
 * Drawing only. A picture is fitted inside the part's real size and never changes physics, hit testing or success rules.
 * Sizes are in metres (100 px per metre), in the part's own turned frame, centred on the part's position.
 */
const W = (art, box, more = {}) => ({ art, ...(box ? { box } : {}), ...more });
export const PART_PICTURES = {
    // Motion Yard (physics-body parts: fitted by PART_ART_FIT)
    "motion.ball": W("motion.ball"), "motion.cart": W("motion.cart"), "motion.wheel": W("motion.wheel"), "motion.axle": W("motion.axle"),
    "motion.roller": W("motion.roller"), "motion.ramp": W("motion.ramp"), "motion.spring": W("motion.spring-pad"),
    "motion.friction-high": W("motion.friction-high"), "motion.friction-low": W("motion.friction-low"), "motion.bounce-pad": W("motion.bounce-pad"),
    "motion.platform": W("structure.platform"), "motion.switch-pad": W("power.push-button"), "motion.parcel": W("structure.crate"),
    "structure.block": W("structure.block"), "structure.breakable": W("structure.beam-wood-long"),
    "silly.duck": W("duck.plain"), "builder.elephant": W("toy.elephant"), "silly.bolt": W("char.bolt.wave"),
    // Older all-purpose parts (Free Build tray)
    "power.motor": W("power.motor"), "power.generator": W("power.generator"), "gear.gear": W("gear.medium"), "gear.pulley": W("gear.pulley"),
    "water.wheel": W("water.water-wheel"), "water.pump": W("water.pump", [0.86, 0.9]), "logic.actuator": W("motion.plunger"),
    "magnet.bar": W("magnet.bar-pivot", [1.05, 0.4], { crop: [0, 0, 1, 0.52], mirror: true }),
    "magnet.electro": W("magnet.electromagnet", [0.8, 0.86], { pin: [0.5, 0.45] }),
    "air.fan": W("air.fan-motor", [0.82, 0.84], { spin: "MARKS", hub: [0.73, 0.32, 0.26] }),
    // Gear Garage: smallest to largest picture for smallest to largest gear (decided 9 Oct, replaces the old three)
    "gear.small": W("gear.small", undefined, { spin: "WHOLE" }), "gear.medium": W("gear.medium", undefined, { spin: "WHOLE" }),
    "gear.large": W("gear.large", undefined, { spin: "WHOLE" }), "gear.door-wheel": W("gear.xlarge", undefined, { spin: "WHOLE" }),
    "gear.belt-pulley": W("gear.pulley", undefined, { spin: "MARKS", hub: [0.5, 0.55, 0.42] }),
    "gear.belt-pulley-big": W("gear.pulley", undefined, { spin: "MARKS", hub: [0.5, 0.55, 0.42] }),
    "gear.crank": W("gear.crank", [1.25, 1.25], { pin: [0.18, 0.78], turn: -0.8, spin: "WHOLE" }),
    "gear.motor": W("robot.gearbox-motor", [0.95, 0.66]),
    // The fan on a gear shaft (M44): the smaller desk fan, drawn in FRONT of the gears (CanvasRenderer draw order), its head over the shaft.
    "gear.fan-shaft": W("air.fan", [0.9, 1.05], { pin: [0.53, 0.31], spin: "MARKS", hub: [0.53, 0.31, 0.3] }),
    "gear.heavy-crate": W("structure.crate"),
    // Builder Bay (beams are laid along their length in StructureRenderer)
    "builder.beam-wood": W("structure.beam-wood-long"), "builder.beam-metal": W("structure.beam-metal-long"),
    "builder.brace": W("structure.connector-bar"), "builder.column": W("structure.post"), "builder.anchor": W("structure.hinge"),
    // Power Lab (box = the size the circuit part takes up between its terminals)
    "circuit.battery": W("power.battery-small", [0.92, 0.42], { turn: Math.PI / 2 }),
    "circuit.battery-big": W("power.battery-large", [1.2, 0.56], { turn: Math.PI / 2 }),
    "circuit.power-station": W("power.meter", [0.5, 0.82], { pin: [0.5, 0.55] }),
    "circuit.switch": W("power.button-lever"), "circuit.button": W("power.big-button"),
    "circuit.bulb": W("power.bulb", [0.56, 0.86], { pin: [0.5, 0.56] }),
    "circuit.generator": W("power.generator", [0.98, 0.74]),
    "circuit.motor": W("power.motor", [0.9, 0.73]),
    "circuit.buzzer": W("sound.bell", [0.6, 0.62], { pin: [0.5, 0.55] }),
    "music.horn": W("sound.horn", [0.74, 0.66], { mirror: true }),
    "music.timer": W("logic.speed-gauge", [0.5, 0.5], { pin: [0.5, 0.45] }),
    // Magnet Factory
    "magnetic.bar": W("magnet.bar-pivot", [1.1, 0.42], { crop: [0, 0, 1, 0.52], mirror: true }),
    "magnetic.puck": W("magnet.horseshoe", [0.62, 0.62], { mirror: true }),
    "magnetic.electromagnet": W("magnet.electromagnet", [0.76, 0.9], { pin: [0.5, 0.45] }),
    "scrap.steel-ball": W("magnet.steel-ball", [0.38, 0.38]), "scrap.rubber-duck": W("duck.plain", [0.58, 0.5]),
    // Water Works
    "plumb.source": W("water.tap-nozzle", [1.1, 0.9], { pin: [0.55, 0.19], mirror: true }),
    "plumb.tank": W("water.tank-large", [1.0, 1.3]),
    "plumb.valve": W("water.pipe-valve", [0.8, 0.8], { pin: [0.5, 0.72] }),
    "plumb.pump": W("water.pump", [0.86, 0.9]),
    "plumb.nozzle": W("water.nozzle-launcher", [0.8, 0.8], { pin: [0.45, 0.5], turn: Math.PI / 4 }),
    "plumb.drain": W("water.drain", [0.78, 0.62], { pin: [0.5, 0.28] }),
    "plumb.wheel": W("water.water-wheel", [1.34, 1.34], { spin: "WHOLE" }),
    "plumb.splitter": W("water.pipe-tee", [0.5, 0.4], { pin: [0.5, 0.42] }),
    "plumb.sprinkler": W("water.sprinkler", [0.86, 0.76], { pin: [0.5, 0.62] }),
    "plumb.rotor-nozzle": W("water.sprinkler", [0.86, 0.76], { pin: [0.5, 0.62], spin: "MARKS", hub: [0.5, 0.33, 0.22] }),
    // Flight Hangar
    "flight.fan": W("air.fan-motor", [0.82, 0.84], { spin: "MARKS", hub: [0.73, 0.32, 0.26] }),
    "flight.balloon": W("air.balloon", [0.52, 0.64], { pin: [0.5, 0.48] }),
    "flight.cargo": W("structure.crate", [0.54, 0.54]),
    // Clip-on flight parts, drawn where they sit on the glider (the wing pictures also tilt with the wing's angle)
    "flight.wing-small": W("air.wing-small", [0.44, 0.22]), "flight.wing-large": W("air.wing-large", [0.64, 0.4]), "flight.wing-steep": W("air.wing-large", [0.64, 0.4]),
    "flight.tail": W("air.tail-fin", [0.46, 0.46], { pin: [0.55, 0.7] }),
    "flight.propeller": W("air.propeller", [0.5, 0.5], { spin: "WHOLE" }),
    "flight.power-pack": W("power.battery-small", [0.4, 0.2], { turn: Math.PI / 2 }),
    "flight.parachute": W("air.parachute", [1.3, 1.4], { pin: [0.5, 0.4] }),
    // Robot Lab (top-down arena)
    "robot.box": W("structure.crate", [0.62, 0.62]), "robot.button": W("power.push-button", [0.76, 0.66]),
    "robot.lamp": W("logic.light", [0.56, 0.56]),
    // Space Centre
    "space.wheel": W("motion.wheel-small", [0.5, 0.5], { spin: "WHOLE" }), "space.grip-wheel": W("robot.wheel-big", [0.56, 0.56], { spin: "WHOLE" }),
    "space.drive-motor": W("robot.drive-motor", [0.5, 0.44]), "space.solar-panel": W("power.solar-panel", [0.9, 0.9]),
    "space.capsule": W("space.capsule", [0.56, 0.6], { pin: [0.5, 0.56] }), "space.cargo-pod": W("space.orb-pod", [0.5, 0.5]),
    "space.landing-pad": W("level.landing-pad", [2.3, 1.56], { pin: [0.5, 0.53] }),
    // Chain Reaction, Free Build objects, creatures and the Prototype Lab
    "chain.seesaw": W("motion.seesaw", [2.1, 1.4], { pin: [0.56, 0.6] }),
    "chain.bell": W("sound.bell-frame", [0.68, 0.72], { pin: [0.5, 0.42] }),
    "chain.cannon": W("launch.cannon", [0.84, 0.88], { pin: [0.5, 0.62] }),
    "sandbox.balloon": W("air.balloon", [0.52, 0.66], { pin: [0.5, 0.45] }),
    "sandbox.moving-platform": W("structure.platform-yellow", [2.0, 0.66], { pin: [0.5, 0.2], stretch: true }),
    "creature.claw": W("robot.claw", [0.5, 0.5], { turn: -Math.PI / 2 }),
    "creature.motor": W("robot.gearbox-motor", [0.46, 0.32]),
    "music.drum": W("sound.drum", [0.62, 0.66], { pin: [0.5, 0.5] }), "music.chime": W("sound.chimes", [0.6, 0.9], { pin: [0.5, 0.42] }),
    "music.tone-block": W("sound.woodblock", [0.64, 0.56]),
    "scrap.glass-vase": W("toy.glass-vase", [0.5, 0.72]),
    "proto.super-spring": W("motion.spring-heavy", [0.8, 0.42], { pin: [0.5, 0.38], stretch: true }),
    "proto.worm-gear": W("gear.worm", [0.62, 0.32]),
    "proto.bubble-blower": W("toy.bubble-blower", [0.66, 0.7], { mirror: true })
};
/** A part shown a second way: the Space Centre solar panel standing on its own (not clipped to a rover) uses the panel-on-a-stand picture. */
export const STANDING_PICTURES = {
    "space.solar-panel": W("power.solar-stand", [0.9, 0.92], { pin: [0.5, 0.4] })
};
/**
 * Tray pictures that differ from the playfield: bendy parts drawn in code on the playfield on purpose (rope, pipes, conveyor
 * belt), and the brace, which is laid along its length as a bar but is easiest to recognise in the tray as a triangle.
 */
export const TRAY_ONLY_PICTURES = {
    "builder.brace": "structure.brace-triangle", "builder.rope": "structure.rope", "plumb.pipe": "water.pipe-straight", "plumb.pipe-narrow": "water.pipe-straight", "motion.conveyor": "motion.conveyor",
    // M44: a picture that suits the tray button but not the playfield part (a group of things, or a whole machine for one piece of it)
    "motion.goal-zone": "target.bullseye", "motion.marble": "toy.marbles", "scrap.wood-block": "toy.blocks", "flight.nose-weight": "toy.weights",
    "flight.glider": "air.plane", "space.booster": "air.rocket", "chain.confetti": "sound.party-horn", "chain.counter": "logic.screen"
};
/** Free Build "Drop something in" buttons (M44): the group pictures (several toys in one) belong here, on buttons only. */
export const SPAWN_PICTURES = {
    "motion.ball": "toy.balls", "motion.marble": "toy.marbles", "gear.heavy-crate": "toy.crates", "sandbox.egg": "toy.eggs", "silly.duck": "toy.ducks",
    "sandbox.toy-car": "toy.cars", "sandbox.balloon": "toy.balloons", "sandbox.weight": "toy.weights", "sandbox.bowling-ball": "toy.bowling-balls",
    "sandbox.feather": "toy.feathers", "scrap.wood-block": "toy.blocks", "motion.goal-zone": "target.bullseye", "chain.bell": "sound.bell-frame",
    "circuit.switch": "power.button-lever", "scrap.glass-vase": "toy.glass-vase", "sandbox.toy-animal": "toy.bunny", "silly.bolt": "char.bolt.wave",
    "plumb.tank": "water.tank-large", "flight.fan": "air.fan", "motion.ramp": "motion.ramp"
};
/** Robot program buttons (M44), by the button's label. */
export const PROGRAM_PICTURES = {
    "Repeat": "logic.loop", "Repeat until": "logic.colour-sensor", "If": "logic.decision", "Wait": "logic.speed-gauge", "Grab": "robot.arm-claw", "Press": "logic.big-button", "start": "logic.start"
};
/**
 * Tray parts with no part picture, and why. "ON PURPOSE" ones stay code-drawn; "ART NEEDED" ones are waiting for a
 * picture and are listed in docs/ART_NEEDED.md ("Part pictures still needed").
 */
export const CODE_DRAWN_ON_PURPOSE = {
    "motion.goal-zone": "ON PURPOSE: a glowing target ring, not a part",
    "circuit.wire": "ON PURPOSE: a wire bends between any two points and shows current flowing",
    "circuit.splitter": "ON PURPOSE: a tiny joining dot",
    "builder.rope": "ON PURPOSE: a rope sags and goes tight as it is loaded (tray shows the rope picture)",
    "plumb.pipe": "ON PURPOSE: a pipe is any length and shows water flowing (tray shows the pipe picture)",
    "plumb.pipe-narrow": "ON PURPOSE: a pipe is any length and shows water flowing (tray shows the pipe picture)",
    // Waiting for a picture of their own (docs/ART_NEEDED.md). Those marked "tray" already show a tray picture (TRAY_ONLY_PICTURES).
    "motion.marble": "ART NEEDED: marble", "motion.barrier": "ART NEEDED: barrier wall",
    "magnetic.floater": "ART NEEDED: ring magnet", "scrap.iron-block": "ART NEEDED: iron block", "scrap.wood-block": "ART NEEDED: wooden block",
    "flight.glider": "ART NEEDED: glider body", "flight.nose-weight": "ART NEEDED: nose weight",
    "space.booster": "ART NEEDED: booster", "space.fins": "ART NEEDED: fins", "space.nose-cone": "ART NEEDED: nose cone",
    "space.landing-legs": "ART NEEDED: landing legs",
    "magnetic.reed-switch": "ART NEEDED: magnet switch",
    "chain.domino": "ART NEEDED: domino", "chain.trapdoor": "ART NEEDED: trapdoor",
    "chain.confetti": "ART NEEDED: confetti ring", "chain.counter": "ART NEEDED: chain counter",
    "creature.body": "ART NEEDED: creature body", "creature.leg": "ART NEEDED: leg", "creature.big-leg": "ART NEEDED: big leg",
    "creature.spring-leg": "ART NEEDED: spring leg", "creature.wing": "ART NEEDED: flapping wing", "creature.segment": "ART NEEDED: body segment",
    "music.beater": "ART NEEDED: beater"
};
/** The picture a part uses on the playfield, if it has one. */
export function partPictureArt(partId) { var _a; return (_a = PART_PICTURES[partId]) === null || _a === void 0 ? void 0 : _a.art; }
/** The picture a part's tray button shows (its playfield picture, or a tray-only one for bendy parts). */
export function trayPictureArt(partId) { var _a, _b; return (_a = TRAY_ONLY_PICTURES[partId]) !== null && _a !== void 0 ? _a : (_b = PART_PICTURES[partId]) === null || _b === void 0 ? void 0 : _b.art; }
/** Picture aspect ratios (width / height) of the part art, so fitting can be checked without loading pictures. */
export const PICTURE_ASPECT = {
    "air.balloon": 0.81, "air.fan-motor": 0.97, "air.wind-turbine": 0.81, "gear.crank": 1.1, "gear.large": 0.98, "gear.medium": 1.0, "gear.pulley": 0.85,
    "gear.small": 0.93, "gear.worm": 2.04, "gear.xlarge": 1.01, "magnet.bar-pivot": 1.64, "magnet.electromagnet": 0.81, "magnet.horseshoe": 0.99,
    "magnet.steel-ball": 1.0, "motion.plunger": 1.23, "motion.seesaw": 1.51, "motion.spring-heavy": 0.9, "motion.spring-pad": 0.77,
    "motion.wheel-large": 0.99, "motion.wheel-small": 0.97, "power.battery-large": 0.57, "power.battery-small": 0.4, "power.bulb": 0.65,
    "power.generator": 1.32, "power.meter": 0.46, "power.motor": 1.24, "power.push-button": 1.18, "power.solar-panel": 0.98, "robot.claw": 0.75,
    "structure.crate": 1.03, "structure.platform": 1.51, "structure.platform-yellow": 1.43, "water.drain": 1.25, "water.nozzle-launcher": 0.99,
    "water.pipe-tee": 1.27, "water.pipe-valve": 1.11, "water.pump": 0.91, "water.tank-large": 0.77, "water.tap-nozzle": 1.28, "water.water-wheel": 0.99,
    "duck.plain": 0.93, "structure.beam-wood-long": 1.71, "level.landing-pad": 1.48,
    // M44 (sheets 81–90)
    "air.wing-small": 2.01, "air.wing-large": 1.58, "air.tail-fin": 0.95, "air.propeller": 0.97, "air.parachute": 0.93, "water.sprinkler": 1.12,
    "sound.bell": 0.71, "sound.horn": 1.08, "logic.speed-gauge": 0.96, "logic.light": 0.98, "robot.wheel-big": 0.95, "robot.drive-motor": 1.15,
    "space.capsule": 0.64, "space.orb-pod": 0.91, "sound.bell-frame": 0.94, "launch.cannon": 0.95, "robot.gearbox-motor": 1.45, "sound.drum": 0.86,
    "sound.chimes": 0.68, "sound.woodblock": 1.07, "toy.glass-vase": 0.73, "toy.bubble-blower": 0.93, "power.solar-stand": 0.97, "air.fan": 0.85
};
/**
 * Where a boxed picture is drawn, in pixels, in the part's frame (before `turn`/`mirror`). It keeps the picture's shape and is
 * as big as fits in the box; the pin point lands on the part's position.
 */
export function pictureRect(pic, fullAspect, box) {
    var _a, _b, _c, _d;
    if (fullAspect === void 0) { fullAspect = (_a = PICTURE_ASPECT[pic.art]) !== null && _a !== void 0 ? _a : 1; }
    if (box === void 0) { box = (_b = pic.box) !== null && _b !== void 0 ? _b : [1, 1]; }
    const aspect = pic.crop ? fullAspect * (pic.crop[2] - pic.crop[0]) / (pic.crop[3] - pic.crop[1]) : fullAspect;
    const sideways = Math.abs(Math.sin((_c = pic.turn) !== null && _c !== void 0 ? _c : 0)) > 0.7;
    const bw = (sideways ? box[1] : box[0]) * 100, bh = (sideways ? box[0] : box[1]) * 100;
    const width = pic.stretch ? bw : Math.min(bw, bh * aspect), height = pic.stretch ? bh : width / aspect;
    const [px, py] = (_d = pic.pin) !== null && _d !== void 0 ? _d : [0.5, 0.5];
    return { x: -px * width, y: -py * height, width, height };
}
/**
 * Draws a part's boxed picture at the current origin (already moved and turned to the part). `spinAngle` is how far a turning
 * part has turned. Returns false when the part has no boxed picture or it hasn't loaded, so the caller draws its code shape.
 */
export function drawPartPicture(c, art, partId, opts = {}) {
    var _a, _b, _c, _d;
    const pic = (_a = opts.picture) !== null && _a !== void 0 ? _a : PART_PICTURES[partId];
    if (!(pic === null || pic === void 0 ? void 0 : pic.box) && !opts.box)
        return false;
    const img = art === null || art === void 0 ? void 0 : art(pic.art);
    if (!img)
        return false;
    const r = pictureRect(pic, (_b = PICTURE_ASPECT[pic.art]) !== null && _b !== void 0 ? _b : imageAspect(img), (_c = opts.box) !== null && _c !== void 0 ? _c : pic.box);
    c.save();
    if (pic.spin === "WHOLE" && opts.spinAngle)
        c.rotate(opts.spinAngle);
    if (pic.turn)
        c.rotate(pic.turn);
    if (pic.mirror)
        c.scale(-1, 1);
    if (opts.selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 24;
    }
    if (pic.crop) {
        const [l, t, rr, b] = pic.crop;
        const s = imageSize(img);
        c.drawImage(img, l * s[0], t * s[1], (rr - l) * s[0], (b - t) * s[1], r.x, r.y, r.width, r.height);
    }
    else
        c.drawImage(img, r.x, r.y, r.width, r.height);
    c.restore();
    if (pic.spin === "MARKS" && opts.spinning && pic.hub)
        drawSpinMarks(c, pic, r, (_d = opts.spinAngle) !== null && _d !== void 0 ? _d : 0);
    return true;
}
/** Curved motion marks round a painted hub, turning with the part (the blades are painted into their stand). */
function drawSpinMarks(c, pic, r, angle) {
    const [hx, hy, hr] = pic.hub;
    let cx = r.x + hx * r.width, cy = r.y + hy * r.height;
    const rad = hr * r.width;
    if (pic.mirror)
        cx = -cx;
    if (pic.turn) {
        const ca = Math.cos(pic.turn), sa = Math.sin(pic.turn);
        [cx, cy] = [cx * ca - cy * sa, cx * sa + cy * ca];
    }
    c.save();
    c.translate(cx, cy);
    c.rotate(angle);
    c.lineCap = "round";
    for (let k = 0; k < 3; k++) {
        const a = k * Math.PI * 2 / 3;
        c.strokeStyle = "#ffffffcc";
        c.lineWidth = 6;
        c.beginPath();
        c.arc(0, 0, rad, a, a + 0.9);
        c.stroke();
        c.strokeStyle = "#20304088";
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(0, 0, rad, a, a + 0.9);
        c.stroke();
    }
    c.restore();
}
function imageSize(img) {
    const i = img;
    return [i.naturalWidth || Number(i.width) || 1, i.naturalHeight || Number(i.height) || 1];
}
function imageAspect(img) { const [w, h] = imageSize(img); return w / h; }
