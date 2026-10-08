/**
 * Room backdrops for the labs added from M14 on. Code-drawn behind `env.<lab>` ids until each lab's
 * environment painting arrives (docs/ART_NEEDED.md). Drawing only. Logical canvas 1600 × 820 (+ floor).
 */
const INK = "#203040";
const THEMES = {
    "power-lab": { title: "POWER LAB", top: "#2b3a55", bottom: "#495b7a", wall: "#3b4c6b", floor: "#5c677d", accent: "#ffd43b", motif: (c, t) => {
            // Wall cables with slow pulses, and a big lightning sign.
            c.strokeStyle = "#1c2536";
            c.lineWidth = 10;
            for (const y of [210, 260]) {
                c.beginPath();
                c.moveTo(0, y);
                c.bezierCurveTo(500, y + 40, 1100, y - 40, 1600, y);
                c.stroke();
            }
            c.fillStyle = "#ffd43b";
            for (let k = 0; k < 6; k++) {
                const x = ((t * 120 + k * 280) % 1700) - 50;
                c.beginPath();
                c.arc(x, 210 + Math.sin(x / 260) * 14, 5, 0, Math.PI * 2);
                c.fill();
            }
            c.globalAlpha = 0.18;
            c.fillStyle = "#ffd43b";
            c.beginPath();
            c.moveTo(1400, 300);
            c.lineTo(1340, 470);
            c.lineTo(1390, 470);
            c.lineTo(1350, 620);
            c.lineTo(1470, 420);
            c.lineTo(1415, 420);
            c.lineTo(1460, 300);
            c.closePath();
            c.fill();
            c.globalAlpha = 1;
        } }
};
/** Magnet Factory: steel walls, a scrap conveyor line and a giant horseshoe magnet. */
THEMES["magnet-factory"] = { title: "MAGNET FACTORY", top: "#5f3dc4", bottom: "#9775fa", wall: "#7950f2", floor: "#495057", accent: "#e599f7", motif: (c, t) => {
        c.fillStyle = "#6741d9";
        for (let x = 0; x < 1600; x += 200)
            c.fillRect(x + 10, 140, 8, 560);
        c.globalAlpha = 0.25;
        c.lineWidth = 46;
        c.lineCap = "butt";
        c.strokeStyle = "#e03131";
        c.beginPath();
        c.arc(1380, 360, 120, Math.PI, Math.PI * 1.5);
        c.stroke();
        c.strokeStyle = "#1c7ed6";
        c.beginPath();
        c.arc(1380, 360, 120, Math.PI * 1.5, Math.PI * 2);
        c.stroke();
        c.fillStyle = "#e03131";
        c.fillRect(1237, 360, 46, 120);
        c.fillStyle = "#1c7ed6";
        c.fillRect(1477, 360, 46, 120);
        c.globalAlpha = 1;
        c.strokeStyle = "#5f3dc4";
        c.lineWidth = 4;
        for (let k = 0; k < 12; k++) {
            const x = ((t * 40 + k * 140) % 1700) - 50;
            c.strokeRect(x, 230, 40, 26);
        }
    } };
export function hasLabBackdrop(labId) { return labId in THEMES; }
export function drawLabBackdrop(c, labId, time) {
    const th = THEMES[labId];
    if (!th)
        return;
    const g = c.createLinearGradient(0, 0, 0, 820);
    g.addColorStop(0, th.top);
    g.addColorStop(1, th.bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, 1600, 820);
    c.fillStyle = th.wall;
    c.fillRect(0, 130, 1600, 570);
    th.motif(c, time);
    c.fillStyle = th.floor;
    c.fillRect(0, 700, 1600, 120);
    c.fillStyle = "#ffffff18";
    for (let x = 0; x < 1600; x += 160)
        c.fillRect(x, 700, 150, 120);
    c.fillStyle = th.accent;
    c.fillRect(0, 812, 1600, 10);
    c.fillStyle = INK;
    for (let x = 0; x < 1600; x += 60)
        c.fillRect(x, 812, 30, 10);
    c.fillStyle = "#ffffffdd";
    c.strokeStyle = INK;
    c.lineWidth = 5;
    c.beginPath();
    c.roundRect(60, 40, 330, 90, 26);
    c.fill();
    c.stroke();
    c.fillStyle = INK;
    c.textAlign = "center";
    let size = 40;
    c.font = `900 ${size}px system-ui`;
    while (c.measureText(th.title).width > 300 && size > 22) {
        size -= 2;
        c.font = `900 ${size}px system-ui`;
    }
    c.fillText(th.title, 225, 85 + size / 4);
}
/** Labs register their room theme here as they are built. */
export function registerLabTheme(labId, theme) { THEMES[labId] = theme; }
