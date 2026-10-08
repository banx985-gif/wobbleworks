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
/** Water Works: tiled walls, big pipes along the top and a water gauge. */
THEMES["water-works"] = { title: "WATER WORKS", top: "#1864ab", bottom: "#4dabf7", wall: "#a5d8ff", floor: "#74c0fc", accent: "#228be6", motif: (c, t) => {
        c.strokeStyle = "#d0ebff";
        c.lineWidth = 2;
        for (let x = 0; x < 1600; x += 50) {
            c.beginPath();
            c.moveTo(x, 130);
            c.lineTo(x, 700);
            c.stroke();
        }
        for (let y = 130; y < 700; y += 50) {
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(1600, y);
            c.stroke();
        }
        c.fillStyle = "#868e96";
        c.fillRect(0, 150, 1600, 26);
        c.fillStyle = "#adb5bd";
        for (let x = 60; x < 1600; x += 260)
            c.fillRect(x, 142, 22, 42);
        c.fillStyle = "#e7f5ff";
        for (let k = 0; k < 10; k++) {
            const x = ((t * 80 + k * 170) % 1700) - 50;
            c.beginPath();
            c.arc(x, 163, 4, 0, Math.PI * 2);
            c.fill();
        }
    } };
/** Flight Hangar: a tall hangar with a big open door onto the sky and a windsock. */
THEMES["flight-hangar"] = { title: "FLIGHT HANGAR", top: "#a5d8ff", bottom: "#d0ebff", wall: "#dee2e6", floor: "#868e96", accent: "#74c0fc", motif: (c, t) => {
        c.fillStyle = "#c9e8ff";
        c.fillRect(380, 150, 840, 520);
        c.fillStyle = "#ffffff";
        for (let k = 0; k < 4; k++) {
            const x = ((t * 20 + k * 260) % 1000) + 300;
            c.beginPath();
            c.ellipse(x, 220 + k * 40, 60, 18, 0, 0, Math.PI * 2);
            c.fill();
        }
        c.strokeStyle = "#adb5bd";
        c.lineWidth = 8;
        for (let x = 0; x < 1600; x += 160) {
            c.beginPath();
            c.moveTo(x, 130);
            c.lineTo(x + 80, 150);
            c.lineTo(x + 160, 130);
            c.stroke();
        }
        c.save();
        c.translate(1450, 260);
        c.rotate(Math.sin(t) * 0.1);
        c.fillStyle = "#ff922b";
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(110, 10);
        c.lineTo(110, 40);
        c.lineTo(0, 50);
        c.closePath();
        c.fill();
        c.restore();
    } };
/** Robot Lab: a bright test floor seen from above (the arena grid is drawn on top by the robot renderer). */
THEMES["robot-lab"] = { title: "ROBOT LAB", top: "#0ca678", bottom: "#38d9a9", wall: "#63e6be", floor: "#20c997", accent: "#12b886", topDown: true, motif: c => {
        c.fillStyle = "#e6fcf5";
        c.fillRect(50, 50, 1500, 800);
        c.strokeStyle = "#96f2d7";
        c.lineWidth = 2;
        for (let x = 50; x <= 1550; x += 100) {
            c.beginPath();
            c.moveTo(x, 50);
            c.lineTo(x, 850);
            c.stroke();
        }
        for (let y = 50; y <= 850; y += 100) {
            c.beginPath();
            c.moveTo(50, y);
            c.lineTo(1550, y);
            c.stroke();
        }
    } };
/** Space Centre: a launch site at night — stars, a gantry and the Moon low in the sky. */
THEMES["space-centre"] = { title: "SPACE CENTRE", top: "#0b1026", bottom: "#24305e", wall: "#1b2448", floor: "#495057", accent: "#ffd43b", motif: (c, t) => {
        c.fillStyle = "#ffffff";
        for (let i = 0; i < 90; i++) {
            const x = (i * 173) % 1600, y = 140 + (i * 67) % 520;
            c.globalAlpha = 0.4 + 0.4 * Math.abs(Math.sin(t * 1.5 + i));
            c.beginPath();
            c.arc(x, y, 1.6 + (i % 3) * 0.6, 0, Math.PI * 2);
            c.fill();
        }
        c.globalAlpha = 1;
        c.fillStyle = "#f1f3f5";
        c.beginPath();
        c.arc(1380, 250, 70, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#ced4da";
        for (const [a, b, r] of [[1360, 230, 14], [1405, 270, 18], [1395, 215, 8]]) {
            c.beginPath();
            c.arc(a, b, r, 0, Math.PI * 2);
            c.fill();
        }
        c.strokeStyle = "#868e9688";
        c.lineWidth = 6;
        for (const gx of [180, 260]) {
            c.beginPath();
            c.moveTo(gx, 700);
            c.lineTo(gx, 300);
            c.stroke();
        }
        for (let y = 320; y < 700; y += 50) {
            c.beginPath();
            c.moveTo(180, y);
            c.lineTo(260, y + 40);
            c.moveTo(260, y);
            c.lineTo(180, y + 40);
            c.stroke();
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
    if (th.topDown) {
        th.motif(c, time);
        c.fillStyle = "#ffffffdd";
        c.strokeStyle = INK;
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(60, 6, 220, 38, 14);
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        c.textAlign = "center";
        c.font = "900 24px system-ui";
        c.fillText(th.title, 170, 34);
        return;
    }
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
