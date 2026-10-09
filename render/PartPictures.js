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
    "gear.motor": W("power.motor", [0.9, 0.73]),
    "gear.fan-shaft": W("air.wind-turbine", [1.7, 2.1], { pin: [0.6, 0.37], spin: "MARKS", hub: [0.6, 0.37, 0.56] }),
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
    // Flight Hangar
    "flight.fan": W("air.fan-motor", [0.82, 0.84], { spin: "MARKS", hub: [0.73, 0.32, 0.26] }),
    "flight.balloon": W("air.balloon", [0.52, 0.64], { pin: [0.5, 0.48] }),
    "flight.cargo": W("structure.crate", [0.54, 0.54]),
    // Robot Lab (top-down arena)
    "robot.box": W("structure.crate", [0.62, 0.62]), "robot.button": W("power.push-button", [0.76, 0.66]),
    // Space Centre
    "space.wheel": W("motion.wheel-small", [0.5, 0.5], { spin: "WHOLE" }), "space.grip-wheel": W("motion.wheel-large", [0.54, 0.54], { spin: "WHOLE" }),
    "space.drive-motor": W("power.motor", [0.5, 0.4]), "space.solar-panel": W("power.solar-panel", [0.9, 0.9]),
    "space.landing-pad": W("level.landing-pad", [2.3, 1.56], { pin: [0.5, 0.53] }),
    // Chain Reaction, Free Build objects, creatures and the Prototype Lab
    "chain.seesaw": W("motion.seesaw", [2.1, 1.4], { pin: [0.56, 0.6] }),
    "sandbox.balloon": W("air.balloon", [0.52, 0.66], { pin: [0.5, 0.45] }),
    "sandbox.moving-platform": W("structure.platform-yellow", [2.0, 0.66], { pin: [0.5, 0.2], stretch: true }),
    "creature.claw": W("robot.claw", [0.5, 0.5], { turn: -Math.PI / 2 }),
    "proto.super-spring": W("motion.spring-heavy", [0.8, 0.42], { pin: [0.5, 0.38], stretch: true }),
    "proto.worm-gear": W("gear.worm", [0.62, 0.32])
};
/**
 * Tray pictures that differ from the playfield: bendy parts drawn in code on the playfield on purpose (rope, pipes, conveyor
 * belt), and the brace, which is laid along its length as a bar but is easiest to recognise in the tray as a triangle.
 */
export const TRAY_ONLY_PICTURES = {
    "builder.brace": "structure.brace-triangle", "builder.rope": "structure.rope", "plumb.pipe": "water.pipe-straight", "plumb.pipe-narrow": "water.pipe-straight", "motion.conveyor": "motion.conveyor"
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
    "motion.marble": "ART NEEDED: marble", "motion.barrier": "ART NEEDED: barrier wall", "circuit.buzzer": "ART NEEDED: buzzer",
    "magnetic.floater": "ART NEEDED: ring magnet", "scrap.iron-block": "ART NEEDED: iron block", "scrap.wood-block": "ART NEEDED: wooden block",
    "plumb.sprinkler": "ART NEEDED: sprinkler",
    "flight.glider": "ART NEEDED: glider body", "flight.wing-large": "ART NEEDED: big wing", "flight.wing-small": "ART NEEDED: small wing",
    "flight.wing-steep": "ART NEEDED: steep wing", "flight.tail": "ART NEEDED: tail", "flight.propeller": "ART NEEDED: propeller",
    "flight.power-pack": "ART NEEDED: battery pack", "flight.parachute": "ART NEEDED: parachute", "flight.nose-weight": "ART NEEDED: nose weight",
    "space.booster": "ART NEEDED: booster", "space.fins": "ART NEEDED: fins", "space.nose-cone": "ART NEEDED: nose cone",
    "space.landing-legs": "ART NEEDED: landing legs", "space.capsule": "ART NEEDED: capsule", "space.cargo-pod": "ART NEEDED: cargo pod",
    "magnetic.reed-switch": "ART NEEDED: magnet switch",
    "chain.domino": "ART NEEDED: domino", "chain.bell": "ART NEEDED: bell", "chain.trapdoor": "ART NEEDED: trapdoor",
    "chain.cannon": "ART NEEDED: duck cannon", "chain.confetti": "ART NEEDED: confetti ring", "chain.counter": "ART NEEDED: chain counter",
    "proto.bubble-blower": "ART NEEDED: bubble blower",
    "creature.body": "ART NEEDED: creature body", "creature.leg": "ART NEEDED: leg", "creature.big-leg": "ART NEEDED: big leg",
    "creature.spring-leg": "ART NEEDED: spring leg", "creature.wing": "ART NEEDED: flapping wing", "creature.segment": "ART NEEDED: body segment",
    "creature.motor": "ART NEEDED: creature motor",
    "music.drum": "ART NEEDED: drum", "music.chime": "ART NEEDED: chime", "music.tone-block": "ART NEEDED: tone block",
    "music.horn": "ART NEEDED: electric horn", "music.beater": "ART NEEDED: beater", "music.timer": "ART NEEDED: timer switch",
    "plumb.rotor-nozzle": "ART NEEDED: spinning sprayer"
};
/** The picture a part uses on the playfield, if it has one. */
export function partPictureArt(partId) { return PART_PICTURES[partId]?.art; }
/** The picture a part's tray button shows (its playfield picture, or a tray-only one for bendy parts). */
export function trayPictureArt(partId) { return TRAY_ONLY_PICTURES[partId] ?? PART_PICTURES[partId]?.art; }
/** Picture aspect ratios (width / height) of the part art, so fitting can be checked without loading pictures. */
export const PICTURE_ASPECT = {
    "air.balloon": 0.81, "air.fan-motor": 0.97, "air.wind-turbine": 0.81, "gear.crank": 1.1, "gear.large": 0.98, "gear.medium": 1.0, "gear.pulley": 0.85,
    "gear.small": 0.93, "gear.worm": 2.04, "gear.xlarge": 1.01, "magnet.bar-pivot": 1.64, "magnet.electromagnet": 0.81, "magnet.horseshoe": 0.99,
    "magnet.steel-ball": 1.0, "motion.plunger": 1.23, "motion.seesaw": 1.51, "motion.spring-heavy": 0.9, "motion.spring-pad": 0.77,
    "motion.wheel-large": 0.99, "motion.wheel-small": 0.97, "power.battery-large": 0.57, "power.battery-small": 0.4, "power.bulb": 0.65,
    "power.generator": 1.32, "power.meter": 0.46, "power.motor": 1.24, "power.push-button": 1.18, "power.solar-panel": 0.98, "robot.claw": 0.75,
    "structure.crate": 1.03, "structure.platform": 1.51, "structure.platform-yellow": 1.43, "water.drain": 1.25, "water.nozzle-launcher": 0.99,
    "water.pipe-tee": 1.27, "water.pipe-valve": 1.11, "water.pump": 0.91, "water.tank-large": 0.77, "water.tap-nozzle": 1.28, "water.water-wheel": 0.99,
    "duck.plain": 0.93, "structure.beam-wood-long": 1.71, "level.landing-pad": 1.48
};
/**
 * Where a boxed picture is drawn, in pixels, in the part's frame (before `turn`/`mirror`). It keeps the picture's shape and is
 * as big as fits in the box; the pin point lands on the part's position.
 */
export function pictureRect(pic, fullAspect = PICTURE_ASPECT[pic.art] ?? 1, box = pic.box ?? [1, 1]) {
    const aspect = pic.crop ? fullAspect * (pic.crop[2] - pic.crop[0]) / (pic.crop[3] - pic.crop[1]) : fullAspect;
    const sideways = Math.abs(Math.sin(pic.turn ?? 0)) > 0.7;
    const bw = (sideways ? box[1] : box[0]) * 100, bh = (sideways ? box[0] : box[1]) * 100;
    const width = pic.stretch ? bw : Math.min(bw, bh * aspect), height = pic.stretch ? bh : width / aspect;
    const [px, py] = pic.pin ?? [0.5, 0.5];
    return { x: -px * width, y: -py * height, width, height };
}
/**
 * Draws a part's boxed picture at the current origin (already moved and turned to the part). `spinAngle` is how far a turning
 * part has turned. Returns false when the part has no boxed picture or it hasn't loaded, so the caller draws its code shape.
 */
export function drawPartPicture(c, art, partId, opts = {}) {
    const pic = PART_PICTURES[partId];
    if (!pic?.box && !opts.box)
        return false;
    const img = art?.(pic.art);
    if (!img)
        return false;
    const r = pictureRect(pic, PICTURE_ASPECT[pic.art] ?? imageAspect(img), opts.box ?? pic.box);
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
        drawSpinMarks(c, pic, r, opts.spinAngle ?? 0);
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
