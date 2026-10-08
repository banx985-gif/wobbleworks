import { magnetBehaviour, materialOf, isMagnetic } from "../magnets/MagnetSystem.js";
/**
 * Magnet Factory drawing (M15). Code-drawn behind each part id until the magnet art arrives (docs/ART_NEEDED.md, Batch M);
 * the rubber duck uses its painted picture. Drawing only. 100 px per metre.
 */
const INK = "#203040", NORTH = "#e03131", SOUTH = "#1c7ed6";
export function isMagnetPart(def) { return Boolean(magnetBehaviour(def) || materialOf(def)) || def.id === "magnetic.guide"; }
export function drawMagnetPart(c, part, def, selected, ctx) {
    const st = ctx.states.get(part.id);
    const x = (st?.x ?? part.position.x) * 100, y = (st?.y ?? part.position.y) * 100;
    const bar = magnetBehaviour(def);
    const mat = materialOf(def);
    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 4;
    if (selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 22;
    }
    if (def.id === "magnetic.guide") {
        const h = Number(part.parameters.height ?? 2.5) * 100;
        c.fillStyle = "#ced4da";
        c.beginPath();
        c.roundRect(x - 6, y - h / 2, 12, h, 6);
        c.fill();
        c.stroke();
        c.fillStyle = "#868e96";
        c.beginPath();
        c.roundRect(x - 26, y + h / 2 - 8, 52, 14, 5);
        c.fill();
        c.stroke();
    }
    else if (bar) {
        const live = ctx.magnets?.magnet(part.id);
        const poleAngle = bar.poleAngle ?? 0;
        // The pole axis: from the live state (it knows about flips and currents), else from the part's rotation.
        const axis = live ? live.angle : part.rotation + poleAngle;
        const on = live ? live.on : !bar.electric;
        c.translate(x, y);
        if (bar.electric)
            drawElectromagnet(c, on, ctx.time);
        else if (def.id === "magnetic.floater")
            drawRing(c, axis);
        else
            drawBar(c, def, axis, part);
        if (on && ctx.scanner)
            drawFieldArcs(c, axis, bar.length * 100, ctx.time);
    }
    else if (mat) {
        c.translate(x, y);
        c.rotate(st?.angle ?? part.rotation);
        drawMaterial(c, def, mat, ctx.art);
        if (ctx.scanner) {
            c.rotate(-(st?.angle ?? part.rotation));
            c.fillStyle = isMagnetic(def) ? "#2f9e44" : "#868e96";
            c.font = "800 12px system-ui";
            c.textAlign = "center";
            c.fillText(isMagnetic(def) ? "MAGNETIC" : "not magnetic", 0, -40);
        }
    }
    c.restore();
    return true;
}
function drawBar(c, def, axis, part) {
    const r = def.behaviours.find(b => b.kind === "RIGID_BODY");
    const w = (r?.kind === "RIGID_BODY" ? r.width : 1) * 100, h = (r?.kind === "RIGID_BODY" ? r.height : 0.35) * 100;
    if (def.id === "magnetic.cart") {
        c.fillStyle = "#495057";
        for (const wx of [-w / 3, w / 3]) {
            c.beginPath();
            c.arc(wx, h / 2 - 2, 9, 0, Math.PI * 2);
            c.fill();
            c.stroke();
        }
    }
    c.save();
    c.rotate(axis);
    const len = def.id === "magnetic.cart" ? w * 0.9 : Math.max(w, h);
    const thick = def.id === "magnetic.cart" ? h * 0.7 : Math.min(w, h);
    c.fillStyle = NORTH;
    c.beginPath();
    c.roundRect(0, -thick / 2, len / 2, thick, [0, 8, 8, 0]);
    c.fill();
    c.stroke();
    c.fillStyle = SOUTH;
    c.beginPath();
    c.roundRect(-len / 2, -thick / 2, len / 2, thick, [8, 0, 0, 8]);
    c.fill();
    c.stroke();
    c.fillStyle = "#fff";
    c.font = `900 ${Math.round(Math.min(22, thick * 0.7))}px system-ui`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.save();
    c.translate(len / 4, 0);
    c.rotate(-axis);
    c.fillText("N", 0, 1);
    c.restore();
    c.save();
    c.translate(-len / 4, 0);
    c.rotate(-axis);
    c.fillText("S", 0, 1);
    c.restore();
    c.restore();
    if (part.parameters.locked === true && def.id === "magnetic.bar") {
        c.fillStyle = INK;
        c.font = "900 12px system-ui";
        c.textAlign = "center";
        c.fillText("tap to turn", 0, Math.max(w, h) / 2 + 18);
    }
}
function drawRing(c, axis) {
    const up = Math.sin(axis) < 0; // N on top?
    c.fillStyle = up ? NORTH : SOUTH;
    c.beginPath();
    c.ellipse(0, -4, 40, 9, 0, Math.PI, Math.PI * 2);
    c.lineTo(40, 0);
    c.ellipse(0, 4, 40, 9, 0, 0, Math.PI);
    c.closePath();
    c.fill();
    c.fillStyle = up ? SOUTH : NORTH;
    c.beginPath();
    c.roundRect(-40, 0, 80, 12, 6);
    c.fill();
    c.stroke();
    c.fillStyle = up ? NORTH : SOUTH;
    c.beginPath();
    c.roundRect(-40, -12, 80, 12, 6);
    c.fill();
    c.stroke();
    c.fillStyle = "#fff";
    c.font = "900 11px system-ui";
    c.textAlign = "center";
    c.fillText(up ? "N" : "S", 26, -2);
    c.fillText(up ? "S" : "N", 26, 10);
    c.fillStyle = "#f1f3f5";
    c.beginPath();
    c.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
}
function drawElectromagnet(c, on, time) {
    c.fillStyle = "#868e96";
    c.beginPath();
    c.roundRect(-34, -30, 68, 22, 6);
    c.fill();
    c.stroke();
    c.fillStyle = "#c92a2a";
    c.beginPath();
    c.roundRect(-30, -10, 60, 26, 8);
    c.fill();
    c.stroke();
    c.strokeStyle = "#f08c00";
    c.lineWidth = 3;
    for (let k = -24; k <= 24; k += 8) {
        c.beginPath();
        c.moveTo(k, -8);
        c.lineTo(k + 4, 14);
        c.stroke();
    }
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.fillStyle = "#495057";
    c.beginPath();
    c.roundRect(-36, 16, 72, 10, 4);
    c.fill();
    c.stroke();
    if (on) {
        c.strokeStyle = "#ffd43b";
        c.lineWidth = 3;
        c.globalAlpha = 0.6 + 0.4 * Math.sin(time * 10);
        for (let k = 1; k <= 2; k++) {
            c.beginPath();
            c.arc(0, 26, 14 * k, 0.2, Math.PI - 0.2);
            c.stroke();
        }
        c.globalAlpha = 1;
    }
    c.strokeStyle = "#495057";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, -30);
    c.lineTo(0, -60);
    c.stroke();
}
function drawFieldArcs(c, axis, len, time) {
    c.save();
    c.rotate(axis);
    c.strokeStyle = "#ffffffaa";
    c.lineWidth = 2;
    c.setLineDash([6, 6]);
    c.lineDashOffset = -time * 30;
    for (const k of [0.6, 1.0, 1.5]) {
        c.beginPath();
        c.ellipse(0, 0, len * 0.5 + 18 * k, 26 * k, 0, 0, Math.PI * 2);
        c.stroke();
    }
    c.restore();
}
function drawMaterial(c, def, mat, art) {
    const r = def.behaviours.find(b => b.kind === "RIGID_BODY");
    const w = (r?.kind === "RIGID_BODY" ? r.width : 0.4) * 100, h = (r?.kind === "RIGID_BODY" ? r.height : 0.4) * 100;
    if (def.id === "scrap.rubber-duck") {
        const img = art("duck.plain");
        if (img) {
            c.drawImage(img, -w / 2 - 4, -h / 2 - 6, w + 8, h + 10);
            return;
        }
    }
    if (def.id === "scrap.steel-ball") {
        const g = c.createRadialGradient(-w / 6, -h / 6, 2, 0, 0, w / 2);
        g.addColorStop(0, "#f8f9fa");
        g.addColorStop(1, "#868e96");
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, w / 2, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        return;
    }
    if (def.id === "scrap.glass-vase") {
        c.fillStyle = "#a5d8ffaa";
        c.beginPath();
        c.moveTo(-w / 4, -h / 2);
        c.lineTo(w / 4, -h / 2);
        c.quadraticCurveTo(w / 2 + 8, 0, w / 3, h / 2);
        c.lineTo(-w / 3, h / 2);
        c.quadraticCurveTo(-w / 2 - 8, 0, -w / 4, -h / 2);
        c.fill();
        c.stroke();
        c.fillStyle = "#e64980";
        c.beginPath();
        c.arc(0, -h / 2 - 6, 8, 0, Math.PI * 2);
        c.fill();
        return;
    }
    const fill = { IRON: "#868e96", STEEL: "#adb5bd", NICKEL: "#ced4da", ALUMINIUM: "#e9ecef", COPPER: "#d9480f", WOOD: "#d9a066", PLASTIC: "#f783ac", GLASS: "#a5d8ff", RUBBER: "#ffd43b" };
    c.fillStyle = fill[mat] ?? "#dee2e6";
    c.beginPath();
    if (def.id === "scrap.aluminium-can") {
        c.roundRect(-w / 2, -h / 2, w, h, 6);
        c.fill();
        c.stroke();
        c.fillStyle = "#74c0fc";
        c.fillRect(-w / 2 + 3, -h / 6, w - 6, h / 3);
    }
    else if (def.id.endsWith("-coin")) {
        c.ellipse(0, 0, w / 2, h / 2 + 3, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
    else if (def.id === "scrap.plastic-cup") {
        c.moveTo(-w / 2, -h / 2);
        c.lineTo(w / 2, -h / 2);
        c.lineTo(w / 3, h / 2);
        c.lineTo(-w / 3, h / 2);
        c.closePath();
        c.fill();
        c.stroke();
    }
    else {
        c.roundRect(-w / 2, -h / 2, w, h, 6);
        c.fill();
        c.stroke();
        if (mat === "IRON") {
            c.fillStyle = "#495057";
            for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
                c.beginPath();
                c.arc(px * (w / 2 - 8), py * (h / 2 - 8), 3, 0, Math.PI * 2);
                c.fill();
            }
        }
        if (mat === "WOOD") {
            c.strokeStyle = "#a0693a";
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(-w / 3, -h / 6);
            c.lineTo(w / 3, -h / 8);
            c.moveTo(-w / 3, h / 6);
            c.lineTo(w / 4, h / 5);
            c.stroke();
        }
    }
}
/** Magnet Scanner during a TEST: push/pull arrows on everything a magnet is acting on. */
export function drawMagnetForces(c, magnets, states) {
    c.save();
    c.lineWidth = 5;
    c.lineCap = "round";
    for (const [id, s] of states) {
        const f = magnets.force(id);
        if (!f)
            continue;
        const mag = Math.hypot(f.x, f.y);
        if (mag < 0.2)
            continue;
        const len = Math.min(90, 20 + mag * 12);
        const ux = f.x / mag, uy = f.y / mag;
        const x = s.x * 100, y = s.y * 100;
        c.strokeStyle = "#e64980";
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + ux * len, y + uy * len);
        c.stroke();
        c.fillStyle = "#e64980";
        c.beginPath();
        c.moveTo(x + ux * (len + 10), y + uy * (len + 10));
        c.lineTo(x + ux * len - uy * 8, y + uy * len + ux * 8);
        c.lineTo(x + ux * len + uy * 8, y + uy * len - ux * 8);
        c.closePath();
        c.fill();
    }
    c.restore();
}
