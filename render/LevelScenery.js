const S = (art, x, bottom, w, alpha) => ({ art: `level.${art}`, x, bottom, w, ...(alpha !== undefined ? { alpha } : {}) });
export const LEVEL_SCENERY = {
    // Motion Yard
    "motion.roll-with-it": [S("bucket", 10.5, 8.25, 1.3)],
    "motion.too-fast": [S("barrier", 13.2, 8.25, 1.5)],
    "motion.bounce-around": [S("button-target", 11.6, 6.2, 1.0)],
    "motion.duck-cannon": [S("duck-bath", 10.3, 5.95, 2.4)],
    "motion.giant-marble-delivery": [S("marble-run", 14.8, 8.25, 1.7)],
    "motion.runaway-test-cart": [S("hazard-sign", 13.4, 8.25, 1.2)],
    // Gear Garage
    "gear.turn-the-door": [S("boarded-door", 8.6, 8.2, 2.2)],
    "gear.clockwork-trouble": [S("clockwork", 9.4, 7.6, 2.8)],
    "gear.three-fans": [S("three-fans", 10.2, 8.2, 3)],
    "gear.the-clockwork-carnival": [S("carnival-ride", 10.6, 8.2, 3.3)],
    "gear.jammed-factory-drive": [S("factory-line", 9.4, 8.2, 3.8)],
    "gear.conveyor-rescue": [S("factory-line", 13.9, 8.2, 2.6)],
    // Builder Bay
    "builder.build-a-crane": [S("rope-anchors", 12.2, 8.2, 2.2)],
    "builder.roof-rescue": [S("braced-roof", 12.3, 8.2, 3)],
    "builder.tallest-tower": [S("scaffold-tower", 2.2, 8.2, 1.9)],
    "builder.keep-the-egg-safe": [S("egg-cushion", 12.6, 8.2, 2.2)],
    "builder.the-robot-parade-bridge": [S("parade-bridge", 14.1, 5.25, 2.1)],
    "builder.collapsing-workshop-roof": [S("rope-anchors", 8, 1.75, 1.6), S("hazard-sign", 15.3, 8.2, 1.1)],
    // Power Lab
    "power.light-it-up": [S("three-bulbs", 13.2, 8.2, 2)],
    "power.broken-loop": [S("broken-targets", 13.2, 8.2, 2)],
    "power.push-the-button": [S("button-target", 14, 8.2, 1.2)],
    "power.two-lights": [S("three-bulbs", 14.4, 8.2, 1.8)],
    "power.restore-the-power-grid": [S("power-grid", 14.6, 8.2, 2)],
    "power.blackout": [S("hazard-sign", 15, 8.2, 1.1)]
};
/** Picture aspect ratios (width / height), so the layout can be checked without loading pictures. */
export const SCENERY_ASPECT = {
    "level.duck-bath": 0.97, "level.marble-run": 0.89, "level.hazard-sign": 1.01, "level.boarded-door": 0.93, "level.three-fans": 1.06, "level.clockwork": 0.97,
    "level.factory-line": 1.05, "level.carnival-ride": 0.88, "level.rope-anchors": 1.29, "level.braced-roof": 1.04, "level.scaffold-tower": 0.61, "level.egg-cushion": 1.03,
    "level.bucket": 1.05, "level.barrier": 1.14, "level.button-target": 1.02, "level.parade-bridge": 1.07, "level.three-bulbs": 0.98, "level.broken-targets": 1.09,
    "level.power-grid": 1.02, "level.hoops": 0.92, "level.hover-pads": 1.37, "level.cargo-parachute": 0.85, "level.wind-spinner": 1.17, "level.robot-gate": 1.18,
    "level.fountain": 0.82, "level.spray-targets": 0.97, "level.garden-beds": 1.08, "level.leaky-pipe": 1.27, "level.scrap-pile": 1.0, "level.sorter-chutes": 1.31,
    "level.magnet-targets": 1.09, "level.dance-pads": 1.08, "level.supply-crates": 1.12, "level.dance-stage": 0.99, "level.moon-flags": 0.96, "level.landing-pad": 1.48,
    "level.prototype-machine": 1.01
};
export function sceneryRect(p) {
    const h = p.w / (SCENERY_ASPECT[p.art] ?? 1);
    return { x: p.x - p.w / 2, y: p.bottom - h, width: p.w, height: h };
}
export function drawLevelScenery(c, levelId, art) {
    for (const p of (levelId ? LEVEL_SCENERY[levelId] : undefined) ?? []) {
        const img = art(p.art);
        if (!img)
            continue;
        const r = sceneryRect(p);
        c.save();
        c.globalAlpha = p.alpha ?? 0.92;
        c.drawImage(img, r.x * 100, r.y * 100, r.width * 100, r.height * 100);
        c.restore();
    }
}
