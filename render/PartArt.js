/**
 * How each painted part picture sits on its physics body (8 Oct art, assets/parts/).
 *
 * The pictures are chunky toy-style drawings, so they are not stretched to the thin physics boxes.
 * Each picture keeps its own shape and is scaled to the part's physics WIDTH, then lined up so the
 * surface things actually touch (the physics top edge) is where the picture's touching surface is.
 * Drawing only: nothing here changes physics, hit testing or success rules.
 */
/** Image aspect ratios (width / height) of the filed art, so layout can be checked without loading pictures. */
export const PART_ART_ASPECT = {
    "motion.ball": 1.01, "motion.wheel": 0.98, "motion.roller": 1.41, "motion.cart": 1.24, "motion.axle": 1.63,
    "motion.ramp": 1.24, "motion.spring": 0.61, "motion.friction-high": 1.53, "motion.friction-low": 1.56,
    "motion.bounce-pad": 1.0, "structure.block": 1.0, "silly.duck": 0.93, "builder.elephant": 1.03, "silly.bolt": 0.72, "structure.crate": 1.03, "air.balloon": 0.81
};
/** Parts whose picture has a different art id (characters filed under assets/char/). */
export const PART_ART_SOURCE = { "silly.duck": "duck.plain", "builder.elephant": "toy.elephant", "silly.bolt": "char.bolt.wave" };
export const PART_ART_FIT = {
    "silly.duck": { widthScale: 0.95, squash: 1, anchor: "CENTER", surface: 0 },
    "silly.bolt": { widthScale: 1.25, squash: 1, anchor: "CENTER", surface: 0 },
    "builder.elephant": { widthScale: 1.05, squash: 1, anchor: "CENTER", surface: 0 },
    "motion.ball": { widthScale: 1.04, squash: 1, anchor: "ROUND", surface: 0 },
    "motion.wheel": { widthScale: 1.04, squash: 1, anchor: "ROUND", surface: 0 },
    "motion.roller": { widthScale: 1.25, squash: 1, anchor: "ROUND", surface: 0 },
    "motion.cart": { widthScale: 1.08, squash: 1, anchor: "TOP", surface: 0.12 },
    "motion.axle": { widthScale: 1.0, squash: 1, anchor: "CENTER", surface: 0 },
    /** The ramp is placed by rampArtRect (it follows the plank), not by this table. */
    "motion.ramp": { widthScale: 1, squash: 1, anchor: "CENTER", surface: 0 },
    "motion.spring": { widthScale: 0.72, squash: 1, anchor: "TOP", surface: 0.04 },
    "motion.friction-high": { widthScale: 1.0, squash: 0.55, anchor: "TOP", surface: 0.36 },
    "motion.friction-low": { widthScale: 1.0, squash: 0.55, anchor: "TOP", surface: 0.36 },
    "motion.bounce-pad": { widthScale: 1.0, squash: 0.6, anchor: "TOP", surface: 0.34 },
    "structure.block": { widthScale: 1.0, squash: 0.62, anchor: "TOP", surface: 0.3 },
    "structure.crate": { widthScale: 1.0, squash: 1, anchor: "TOP", surface: 0.25 },
    "air.balloon": { widthScale: 1.0, squash: 1, anchor: "CENTER", surface: 0 }
};
/**
 * Picture rectangle in the part's own (rotated) frame, centred on the body. `w`/`h` are the physics
 * size in the same units. Returns undefined for parts that have no painted picture rule.
 */
export function partArtRect(id, w, h, aspect = PART_ART_ASPECT[id] ?? 1) {
    const fit = PART_ART_FIT[id];
    if (!fit || id === "motion.ramp")
        return undefined;
    if (fit.anchor === "ROUND") {
        const d = w * fit.widthScale;
        const ah = d / Math.max(aspect, 1);
        return { x: -d / 2, y: -ah / 2, width: d, height: ah };
    }
    const width = w * fit.widthScale;
    const height = width / aspect * fit.squash;
    if (fit.anchor === "CENTER")
        return { x: -width / 2, y: -height / 2, width, height };
    return { x: -width / 2, y: -h / 2 - fit.surface * height, width, height };
}
/**
 * The ramp is a plank in physics (a sloped line through its centre). The ramp picture is a slide, so it is
 * drawn upright (never tilted) and sized so its sliding surface runs exactly along that line: the low end of
 * the slide on the plank's low end, the top of the slide on the plank's high end.
 * Returns an axis-aligned rectangle in world units and whether to mirror the picture (slide goes down to the right).
 */
export const RAMP_SURFACE = Object.freeze({ low: { x: 0.05, y: 0.66 }, high: { x: 0.86, y: 0.12 } });
export function rampArtRect(cx, cy, width, angle) {
    const half = width / 2;
    const ex = Math.cos(angle) * half, ey = Math.sin(angle) * half;
    const a = { x: cx - ex, y: cy - ey }, b = { x: cx + ex, y: cy + ey };
    const low = a.y >= b.y ? a : b, high = low === a ? b : a;
    const mirror = low.x > high.x; // the picture's slide rises to the right; mirror it when the plank rises to the left
    const dx = Math.abs(high.x - low.x), dy = Math.max(Math.abs(high.y - low.y), width * 0.08);
    const sx = RAMP_SURFACE.high.x - RAMP_SURFACE.low.x, sy = RAMP_SURFACE.low.y - RAMP_SURFACE.high.y;
    const artW = Math.max(dx, width * 0.25) / sx, artH = dy / sy;
    // Place the picture so its "high" surface point lands on the plank's high end.
    const hx = mirror ? 1 - RAMP_SURFACE.high.x : RAMP_SURFACE.high.x;
    return { x: high.x - hx * artW, y: high.y - RAMP_SURFACE.high.y * artH, width: artW, height: artH, mirror };
}
