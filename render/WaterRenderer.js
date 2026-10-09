import { drawConnectionMark } from "./ConnectionMarks.js";
import { drawPartPicture } from "./PartPictures.js";
import { fluidBehaviour, fluidPorts, pipeBehaviour, pipeEnds, targetBehaviour } from "../water/FluidSystem.js";
/**
 * Water Works drawing (M16). Painted where the part-art map (PartPictures.ts) has a picture: water main tap, tank, valve,
 * pump, nozzle, drain, water wheel and pipe joint. Pipes, the pond, the sprinkler and the targets are code-drawn.
 * Water drops, jets and puddles are drawing only — the FluidSystem decides where the water really goes. 100 px per metre.
 */
const INK = "#203040", WATER = "#4dabf7", WATER_DARK = "#1c7ed6";
export function isWaterPart(def) { return Boolean(fluidBehaviour(def) || pipeBehaviour(def) || targetBehaviour(def)); }
/** Draws a water part. Returns false for the water wheel and spinning sprayer so the gear shaft is drawn on top. */
export function drawWaterPart(c, part, def, selected, ctx) {
    if (pipeBehaviour(def)) {
        drawPipe(c, part, def, selected, ctx);
        return true;
    }
    const x = part.position.x * 100, y = part.position.y * 100;
    const f = fluidBehaviour(def);
    const t = targetBehaviour(def);
    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 4;
    if (selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 22;
    }
    c.translate(x, y);
    const painted = (opts = {}) => drawPartPicture(c, ctx.art, def.id, opts);
    if (t)
        drawTarget(c, part, def, t.width * 100, t.height * 100, ctx);
    else if (f?.role === "SOURCE") {
        if (Number(part.parameters.head ?? 1.5) < 0.6 || !painted())
            drawSource(c, part);
    }
    else if (f?.role === "TANK") {
        if (painted())
            drawTankLevel(c, part, ctx);
        else
            drawTank(c, part, ctx);
    }
    else if (f?.role === "VALVE") {
        c.rotate(part.rotation);
        const open = ctx.water?.isOpen(part.id) ?? part.parameters.open === true;
        if (painted())
            valveLabel(c, open);
        else
            drawValve(c, open);
    }
    else if (f?.role === "PUMP") {
        const running = (ctx.water?.flowThrough(part.id) ?? 0) > 0.05;
        if (!painted())
            drawPump(c, running, ctx.time);
        else if (running)
            drawDrips(c, ctx.time);
    }
    else if (f?.role === "NOZZLE") {
        const a = part.rotation + ctx.gearAngle(part.id);
        c.save();
        c.rotate(a);
        const ok = def.id !== "plumb.rotor-nozzle" && painted();
        c.restore();
        if (!ok)
            drawNozzle(c, a, def.id === "plumb.rotor-nozzle");
    }
    else if (f?.role === "SPRINKLER")
        drawSprinkler(c);
    else if (f?.role === "DRAIN" && painted()) { /* painted drain */ }
    else if (f?.role === "WHEEL" && painted({ spinAngle: ctx.gearAngle(part.id) })) { /* painted wheel, turning with the water */ }
    else if (f?.role === "JUNCTION" && painted()) { /* painted pipe joint */ }
    else if (f?.role === "DRAIN") {
        c.fillStyle = "#495057";
        c.beginPath();
        c.roundRect(-34, -10, 68, 20, 6);
        c.fill();
        c.stroke();
        c.strokeStyle = "#adb5bd";
        c.lineWidth = 3;
        for (let k = -24; k <= 24; k += 12) {
            c.beginPath();
            c.moveTo(k, -6);
            c.lineTo(k, 6);
            c.stroke();
        }
    }
    else if (f?.role === "WHEEL")
        drawWheel(c, ctx.gearAngle(part.id));
    else if (f?.role === "JUNCTION") {
        c.fillStyle = "#74c0fc";
        c.beginPath();
        c.arc(0, 0, 12, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
    c.restore();
    return !(f?.role === "WHEEL" || def.id === "plumb.rotor-nozzle");
}
function drawSource(c, part) {
    const pond = Number(part.parameters.head ?? 1.5) < 0.6;
    if (pond) {
        c.fillStyle = WATER;
        c.beginPath();
        c.ellipse(0, 20, 70, 26, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = "#a5d8ff";
        c.beginPath();
        c.ellipse(-16, 14, 24, 7, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = INK;
        c.font = "900 13px system-ui";
        c.textAlign = "center";
        c.fillText("POND", 0, 60);
    }
    else {
        c.fillStyle = "#adb5bd";
        c.beginPath();
        c.roundRect(-46, -60, 92, 110, 14);
        c.fill();
        c.stroke();
        c.fillStyle = WATER;
        c.beginPath();
        c.roundRect(-38, -40, 76, 82, 10);
        c.fill();
        c.fillStyle = "#e7f5ff";
        c.font = "900 12px system-ui";
        c.textAlign = "center";
        c.fillText("WATER", 0, -6);
        c.fillText("MAIN", 0, 10);
        c.fillStyle = "#868e96";
        c.beginPath();
        c.roundRect(40, 26, 18, 18, 4);
        c.fill();
        c.stroke();
    }
}
/** Painted tank: the glass shows the real water level (from the FluidSystem), not the water painted in the picture. */
function drawTankLevel(c, part, ctx) {
    const st = ctx.water?.tank(part.id);
    const frac = st ? st.fraction : Math.min(1, Number(part.parameters.startVolume ?? 0) / 5);
    const gx = -37, gy = -36, gw = 74, gh = 78;
    c.save();
    c.shadowBlur = 0;
    c.beginPath();
    c.roundRect(gx, gy, gw, gh, 6);
    c.clip();
    const top = gy + gh * (1 - frac);
    c.fillStyle = "#eef7ffee";
    c.fillRect(gx, gy, gw, top - gy);
    if (frac > 0.01 && frac < 0.99) {
        c.strokeStyle = "#d0ebff";
        c.lineWidth = 3;
        c.beginPath();
        for (let k = gx; k <= gx + gw; k += 6)
            c.lineTo(k, top + Math.sin(ctx.time * 4 + k / 8) * 2);
        c.stroke();
    }
    c.restore();
    c.fillStyle = INK;
    c.font = "800 13px system-ui";
    c.textAlign = "center";
    c.fillText(`${Math.round(frac * 100)}%`, 0, -72);
}
function valveLabel(c, open) { c.shadowBlur = 0; c.fillStyle = open ? "#2f9e44" : "#e03131"; c.font = "900 12px system-ui"; c.textAlign = "center"; c.fillText(open ? "OPEN" : "SHUT", 0, 34); }
function drawDrips(c, time) { c.fillStyle = "#4dabf7"; for (let k = 0; k < 3; k++) {
    const t = (time * 1.5 + k / 3) % 1;
    c.beginPath();
    c.arc(-34 - t * 6, -8 + t * 26, 4, 0, Math.PI * 2);
    c.fill();
} }
function drawTank(c, part, ctx) {
    const st = ctx.water?.tank(part.id);
    const frac = st ? st.fraction : Math.min(1, Number(part.parameters.startVolume ?? 0) / 5);
    c.fillStyle = "#e7f5ffcc";
    c.beginPath();
    c.roundRect(-45, -60, 90, 120, 12);
    c.fill();
    c.save();
    c.beginPath();
    c.roundRect(-45, -60, 90, 120, 12);
    c.clip();
    const h = 120 * frac;
    c.fillStyle = WATER;
    c.fillRect(-45, 60 - h, 90, h);
    if (frac > 0.01) {
        c.strokeStyle = "#d0ebff";
        c.lineWidth = 3;
        c.beginPath();
        for (let k = -45; k <= 45; k += 6)
            c.lineTo(k, 60 - h + Math.sin(ctx.time * 4 + k / 8) * 2);
        c.stroke();
    }
    c.restore();
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.beginPath();
    c.roundRect(-45, -60, 90, 120, 12);
    c.stroke();
    c.fillStyle = INK;
    c.font = "800 13px system-ui";
    c.textAlign = "center";
    c.fillText(`${Math.round(frac * 100)}%`, 0, -66);
    for (let k = 1; k < 4; k++) {
        c.beginPath();
        c.moveTo(30, 60 - k * 30);
        c.lineTo(45, 60 - k * 30);
        c.stroke();
    }
}
function drawValve(c, open) {
    c.fillStyle = "#adb5bd";
    c.beginPath();
    c.roundRect(-35, -12, 70, 24, 8);
    c.fill();
    c.stroke();
    c.fillStyle = open ? "#40c057" : "#fa5252";
    c.beginPath();
    c.arc(0, -26, 16, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.save();
    c.translate(0, -26);
    c.rotate(open ? 0 : Math.PI / 2);
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(-12, 0);
    c.lineTo(12, 0);
    c.moveTo(0, -12);
    c.lineTo(0, 12);
    c.stroke();
    c.restore();
    c.fillStyle = open ? "#2f9e44" : "#e03131";
    c.font = "900 12px system-ui";
    c.textAlign = "center";
    c.fillText(open ? "OPEN" : "SHUT", 0, 30);
}
function drawPump(c, running, time) {
    c.fillStyle = "#4dabf7";
    c.beginPath();
    c.roundRect(-40, -30, 80, 56, 12);
    c.fill();
    c.stroke();
    c.save();
    c.translate(0, -2);
    if (running)
        c.rotate(time * 8);
    c.strokeStyle = "#fff";
    c.lineWidth = 4;
    for (let k = 0; k < 3; k++) {
        c.rotate(Math.PI * 2 / 3);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(14, 0);
        c.stroke();
    }
    c.restore();
    c.fillStyle = "#ffd43b";
    c.font = "900 14px system-ui";
    c.textAlign = "center";
    c.fillText("⚡", 26, -14);
    c.fillStyle = INK;
    c.font = "900 10px system-ui";
    c.fillText("PUMP", 0, 22);
}
function drawNozzle(c, angle, rotor) {
    if (rotor) {
        c.fillStyle = "#868e96";
        c.beginPath();
        c.roundRect(-8, 0, 16, 34, 4);
        c.fill();
        c.stroke();
    }
    c.save();
    c.rotate(angle);
    c.fillStyle = "#fab005";
    c.beginPath();
    c.moveTo(-14, -12);
    c.lineTo(34, -6);
    c.lineTo(34, 6);
    c.lineTo(-14, 12);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#495057";
    c.beginPath();
    c.arc(0, 0, 9, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.restore();
}
function drawSprinkler(c) { c.fillStyle = "#868e96"; c.beginPath(); c.roundRect(-6, -26, 12, 26, 3); c.fill(); c.stroke(); c.fillStyle = "#40c057"; c.beginPath(); c.ellipse(0, 4, 26, 10, 0, 0, Math.PI * 2); c.fill(); c.stroke(); }
function drawWheel(c, angle) {
    c.save();
    c.rotate(angle);
    c.fillStyle = "#a0522d";
    c.beginPath();
    c.arc(0, 0, 62, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = "#d9a066";
    for (let k = 0; k < 8; k++) {
        c.rotate(Math.PI / 4);
        c.beginPath();
        c.roundRect(40, -12, 32, 24, 4);
        c.fill();
        c.stroke();
    }
    c.fillStyle = "#e9c46a";
    c.beginPath();
    c.arc(0, 0, 30, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.restore();
}
function drawTarget(c, part, def, w, h, ctx) {
    const got = ctx.water?.waterReceived(part.id) ?? 0;
    if (def.id === "plumb.bed") {
        c.fillStyle = "#8d5524";
        c.beginPath();
        c.roundRect(-w / 2, -h / 2, w, h, 8);
        c.fill();
        c.stroke();
        const green = Math.min(1, got / 0.4);
        for (let k = -w / 2 + 16; k < w / 2; k += 26) {
            c.strokeStyle = green > 0.5 ? "#2f9e44" : "#adb5bd";
            c.lineWidth = 4;
            c.beginPath();
            c.moveTo(k, -h / 2);
            c.lineTo(k, -h / 2 - 12 - 22 * green);
            c.stroke();
            if (green >= 1) {
                c.fillStyle = "#f06595";
                c.beginPath();
                c.arc(k, -h / 2 - 36, 6, 0, Math.PI * 2);
                c.fill();
            }
        }
        c.strokeStyle = INK;
        c.lineWidth = 4;
    }
    else if (def.id === "plumb.equipment") {
        const wet = got > 0.01;
        c.fillStyle = "#ced4da";
        c.beginPath();
        c.roundRect(-w / 2, -h / 2, w, h, 10);
        c.fill();
        c.stroke();
        c.fillStyle = "#ffd43b";
        c.beginPath();
        c.moveTo(-10, -30);
        c.lineTo(-24, 4);
        c.lineTo(-4, 4);
        c.lineTo(-12, 34);
        c.lineTo(18, -8);
        c.lineTo(-2, -8);
        c.lineTo(8, -30);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        c.font = "800 12px system-ui";
        c.textAlign = "center";
        c.fillText("KEEP DRY", 0, h / 2 - 8);
        if (wet) {
            c.fillStyle = "#e03131";
            c.font = "900 16px system-ui";
            c.fillText(`WET! ${got.toFixed(1)} L`, 0, -h / 2 - 10);
        }
    }
    else if (def.id === "plumb.pool") {
        c.fillStyle = WATER;
        c.beginPath();
        c.roundRect(-w / 2, -h / 2, w, h, 12);
        c.fill();
        c.stroke();
        c.fillStyle = "#e7f5ff";
        c.font = "900 14px system-ui";
        c.textAlign = "center";
        c.fillText("POOL", 0, 5);
    }
    else {
        for (const [r, col] of [[w / 2, "#fa5252"], [w / 3, "#fff"], [w / 6, "#fa5252"]]) {
            c.fillStyle = col;
            c.beginPath();
            c.arc(0, 0, r, 0, Math.PI * 2);
            c.fill();
            c.stroke();
        }
        if (got > 0) {
            c.fillStyle = WATER_DARK;
            c.font = "900 14px system-ui";
            c.textAlign = "center";
            c.fillText(`${got.toFixed(1)} L`, 0, -h / 2 - 8);
        }
    }
}
function drawPipe(c, part, def, selected, ctx) {
    const e = pipeEnds(part, def);
    const narrow = def.id === "plumb.pipe-narrow";
    const q = ctx.water?.flowThrough(part.id) ?? 0;
    const broken = part.parameters.broken === true;
    const x1 = e.x1 * 100, y1 = e.y1 * 100, x2 = e.x2 * 100, y2 = e.y2 * 100;
    const wide = narrow ? 10 : 18;
    c.save();
    c.lineCap = "round";
    const seg = (ax, ay, bx, by) => { c.strokeStyle = selected ? "#ffd43b" : INK; c.lineWidth = wide + 6; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.strokeStyle = q > 0.02 ? WATER : "#ced4da"; c.lineWidth = wide; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); };
    if (broken) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ux = (x2 - x1) / (e.length * 100), uy = (y2 - y1) / (e.length * 100);
        seg(x1, y1, mx - ux * 14, my - uy * 14);
        seg(mx + ux * 14, my + uy * 14, x2, y2);
        c.fillStyle = "#e03131";
        c.font = "900 14px system-ui";
        c.textAlign = "center";
        c.fillText("CRACKED", mx, my - 22);
    }
    else
        seg(x1, y1, x2, y2);
    if (q > 0.02 && !broken) {
        c.strokeStyle = "#e7f5ff";
        c.lineWidth = narrow ? 3 : 5;
        c.setLineDash([10, 14]);
        c.lineDashOffset = -ctx.time * 60 * Math.min(3, q + 0.5);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.setLineDash([]);
    }
    if (ctx.scanner && q > 0.02) {
        c.fillStyle = INK;
        c.font = "800 12px system-ui";
        c.textAlign = "center";
        c.fillText(`${q.toFixed(1)} L/s`, (x1 + x2) / 2, (y1 + y2) / 2 - 16);
    }
    if (narrow) {
        c.fillStyle = INK;
        c.font = "800 10px system-ui";
        c.textAlign = "center";
        c.fillText("narrow", (x1 + x2) / 2, (y1 + y2) / 2 + 20);
    }
    c.restore();
}
/** Jets, spills and puddles (drawing only), on top of the parts during a TEST. */
export function drawWaterEffects(c, water, time) {
    c.save();
    for (const j of water.jetStates()) {
        c.strokeStyle = "#74c0fcaa";
        c.lineWidth = 3 + Math.min(6, j.flow * 3);
        c.lineCap = "round";
        c.beginPath();
        j.points.forEach((p, i) => i ? c.lineTo(p.x * 100, p.y * 100) : c.moveTo(p.x * 100, p.y * 100));
        c.stroke();
        c.fillStyle = "#d0ebff";
        const n = j.points.length;
        for (let k = 0; k < 6; k++) {
            const p = j.points[Math.floor(((time * 40 + k * n / 6) % n))];
            if (p) {
                c.beginPath();
                c.arc(p.x * 100, p.y * 100, 4, 0, Math.PI * 2);
                c.fill();
            }
        }
    }
    for (const s of water.spillStates()) {
        c.strokeStyle = "#4dabf7aa";
        c.lineWidth = 3 + Math.min(8, s.flow * 4);
        c.setLineDash([8, 6]);
        c.lineDashOffset = -time * 200;
        c.beginPath();
        c.moveTo(s.x * 100, s.y * 100);
        c.lineTo(s.x * 100, 840);
        c.stroke();
        c.setLineDash([]);
    }
    for (const p of water.puddleStates()) {
        const r = Math.min(120, 20 + p.amount * 12);
        c.fillStyle = "#4dabf766";
        c.beginPath();
        c.ellipse(p.x * 100, 838, r, 8, 0, 0, Math.PI * 2);
        c.fill();
    }
    c.restore();
}
/** BUILD mode: port dots. Green = something joined, yellow = open (an open pipe end will spill!). */
export function drawWaterPorts(c, layout) {
    c.save();
    const counts = new Map();
    for (const p of layout.ports)
        counts.set(p.node, (counts.get(p.node) ?? 0) + 1);
    for (const p of layout.ports) {
        const joined = (counts.get(p.node) ?? 0) >= 2;
        drawConnectionMark(c, p.x * 100, p.y * 100, joined, 8);
    }
    c.restore();
}
export { fluidPorts };
