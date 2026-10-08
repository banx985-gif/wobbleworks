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
    c.font = "900 40px system-ui";
    c.textAlign = "center";
    c.fillText(th.title, 225, 95);
}
/** Labs register their room theme here as they are built. */
export function registerLabTheme(labId, theme) { THEMES[labId] = theme; }
