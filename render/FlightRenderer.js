import { aeroBehaviour, fanBehaviour, gateHeight, isCraft } from "../flight/FlightSystem.js";
import { drawPartPicture } from "./PartPictures.js";
/**
 * Flight Hangar drawing (M17). The fan, balloon and cargo box are painted (part-art map, PartPictures.ts); the rest is code-drawn
 * behind each part id until the flight art arrives (docs/ART_NEEDED.md, Batch F). Drawing only. 100 px per metre.
 */
const INK = "#203040";
const FLIGHT_IDS = new Set(["flight.paper-box", "flight.cliff"]);
export function isFlightPart(def) { return Boolean(aeroBehaviour(def) || isCraft(def) || fanBehaviour(def) || gateHeight(def) !== undefined || FLIGHT_IDS.has(def.id)); }
export function drawFlightPart(c, part, def, selected, ctx) {
    const st = ctx.states.get(part.id);
    const attached = ctx.pose(part.id);
    const x = (attached?.x ?? st?.x ?? part.position.x) * 100, y = (attached?.y ?? st?.y ?? part.position.y) * 100, angle = attached?.angle ?? st?.angle ?? part.rotation;
    c.save();
    c.translate(x, y);
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 4;
    if (selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 22;
    }
    const aero = aeroBehaviour(def);
    if (def.id === "flight.cliff") {
        c.fillStyle = "#c08f5f";
        c.beginPath();
        c.roundRect(-150, -200, 300, 400, 10);
        c.fill();
        c.stroke();
        c.fillStyle = "#8fbf5a";
        c.fillRect(-147, -197, 294, 16);
    }
    else if (fanBehaviour(def)) {
        c.rotate(angle);
        if (drawPartPicture(c, ctx.art, def.id, { spinAngle: ctx.time * 9, spinning: Boolean(ctx.flight) && part.parameters.off !== true })) { /* painted fan */ }
        else {
            c.fillStyle = "#74c0fc";
            c.beginPath();
            c.arc(0, 0, 36, 0, Math.PI * 2);
            c.fill();
            c.stroke();
        }
        if (part.parameters.off !== true)
            drawBreeze(c, fanBehaviour(def).range * 100, ctx.time);
    }
    else if (gateHeight(def) !== undefined) {
        const h = Number(part.parameters.height ?? gateHeight(def)) * 100;
        c.rotate(part.rotation);
        c.strokeStyle = "#e64980";
        c.lineWidth = 10;
        c.beginPath();
        c.ellipse(0, 0, 22, h / 2, 0, 0, Math.PI * 2);
        c.stroke();
        c.strokeStyle = "#ffd43b";
        c.lineWidth = 4;
        c.setLineDash([10, 8]);
        c.beginPath();
        c.ellipse(0, 0, 22, h / 2, 0, 0, Math.PI * 2);
        c.stroke();
    }
    else if (isCraft(def)) {
        c.rotate(angle);
        if (!drawPartPicture(c, ctx.art, def.id))
            drawCraftBody(c, def, ctx.flight?.craft(part.id)?.thrust ?? 0);
    }
    else if (def.id === "flight.paper-box") {
        c.rotate(angle);
        c.fillStyle = "#fff3bf";
        c.beginPath();
        c.roundRect(-25, -20, 50, 40, 4);
        c.fill();
        c.stroke();
        c.beginPath();
        c.moveTo(-25, -20);
        c.lineTo(0, 0);
        c.lineTo(25, -20);
        c.stroke();
    }
    else if (aero) {
        c.rotate(angle);
        drawAero(c, aero.part, def, ctx);
    }
    c.restore();
    return true;
}
function drawBreeze(c, range, time) {
    c.strokeStyle = "#a5d8ff";
    c.lineWidth = 3;
    c.globalAlpha = 0.7;
    for (let k = 0; k < 4; k++) {
        const off = ((time * 160 + k * range / 4) % range);
        const w = 12 + off * 0.3;
        c.beginPath();
        c.moveTo(40 + off, -w);
        c.quadraticCurveTo(60 + off, 0, 40 + off, w);
        c.stroke();
    }
    c.globalAlpha = 1;
}
function drawCraftBody(c, def, thrust) {
    if (def.id === "flight.basket") {
        c.fillStyle = "#d9a066";
        c.beginPath();
        c.moveTo(-30, -17);
        c.lineTo(30, -17);
        c.lineTo(24, 17);
        c.lineTo(-24, 17);
        c.closePath();
        c.fill();
        c.stroke();
        c.strokeStyle = "#a0693a";
        c.lineWidth = 2;
        for (let k = -20; k <= 20; k += 10) {
            c.beginPath();
            c.moveTo(k, -15);
            c.lineTo(k * 0.85, 15);
            c.stroke();
        }
        return;
    }
    if (def.id === "flight.cargo") {
        c.fillStyle = "#e8590c";
        c.beginPath();
        c.roundRect(-25, -25, 50, 50, 6);
        c.fill();
        c.stroke();
        c.fillStyle = "#fff";
        c.font = "900 12px system-ui";
        c.textAlign = "center";
        c.fillText("CARGO", 0, 5);
        return;
    }
    c.fillStyle = "#e7f5ff";
    c.beginPath();
    c.moveTo(-50, -6);
    c.quadraticCurveTo(10, -16, 50, 0);
    c.quadraticCurveTo(10, 14, -50, 8);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#74c0fc";
    c.beginPath();
    c.ellipse(22, -4, 10, 6, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    if (thrust > 0) {
        c.strokeStyle = "#ffffffaa";
        c.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
            c.beginPath();
            c.moveTo(-56 - k * 12, -6 + k * 6);
            c.lineTo(-70 - k * 12, -6 + k * 6);
            c.stroke();
        }
    }
}
function drawAero(c, kind, def, ctx) {
    if (kind === "WING") {
        const big = def.id !== "flight.wing-small";
        const w = big ? 70 : 46;
        c.save();
        c.rotate(-def.behaviours.find(b => b.kind === "AERO").incidence || 0);
        c.fillStyle = def.id === "flight.wing-steep" ? "#ffa94d" : "#ffd43b";
        c.beginPath();
        c.moveTo(-w / 2, 0);
        c.quadraticCurveTo(0, -12, w / 2, -2);
        c.lineTo(w / 2, 4);
        c.quadraticCurveTo(0, 2, -w / 2, 4);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
    }
    else if (kind === "TAIL") {
        c.fillStyle = "#ff8787";
        c.beginPath();
        c.moveTo(-14, 10);
        c.lineTo(-8, -26);
        c.lineTo(10, -26);
        c.lineTo(16, 10);
        c.closePath();
        c.fill();
        c.stroke();
        c.beginPath();
        c.roundRect(-22, 6, 44, 8, 4);
        c.fill();
        c.stroke();
    }
    else if (kind === "PROPELLER") {
        c.fillStyle = "#495057";
        c.beginPath();
        c.arc(0, 0, 7, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.save();
        c.scale(0.35, 1);
        c.rotate(ctx.time * 30);
        c.fillStyle = "#adb5bd";
        c.beginPath();
        c.ellipse(0, -22, 9, 22, 0, 0, Math.PI * 2);
        c.ellipse(0, 22, 9, 22, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.restore();
    }
    else if (kind === "POWER_PACK") {
        c.fillStyle = "#40c057";
        c.beginPath();
        c.roundRect(-18, -9, 36, 18, 4);
        c.fill();
        c.stroke();
        c.fillStyle = "#ffd43b";
        c.font = "900 12px system-ui";
        c.textAlign = "center";
        c.fillText("⚡", 0, 5);
    }
    else if (kind === "PARACHUTE") {
        c.fillStyle = "#e64980";
        c.beginPath();
        c.arc(0, 0, 60, Math.PI, 0);
        c.closePath();
        c.fill();
        c.stroke();
        c.strokeStyle = INK;
        c.lineWidth = 2;
        for (const k of [-55, -20, 20, 55]) {
            c.beginPath();
            c.moveTo(k, 0);
            c.lineTo(0, 70);
            c.stroke();
        }
    }
    else if (kind === "BALLOON") {
        if (drawPartPicture(c, ctx.art, def.id)) { /* painted balloon */ }
        else {
            c.fillStyle = "#fa5252";
            c.beginPath();
            c.ellipse(0, -10, 24, 30, 0, 0, Math.PI * 2);
            c.fill();
            c.stroke();
        }
        c.strokeStyle = INK;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, 22);
        c.lineTo(0, 100);
        c.stroke();
    }
    else if (kind === "WEIGHT") {
        c.fillStyle = "#495057";
        c.beginPath();
        c.roundRect(-12, -10, 24, 20, 4);
        c.fill();
        c.stroke();
        c.fillStyle = "#fff";
        c.font = "900 10px system-ui";
        c.textAlign = "center";
        c.fillText("kg", 0, 4);
    }
    else if (kind === "PAYLOAD") {
        c.fillStyle = "#d9a066";
        c.beginPath();
        c.roundRect(-16, -12, 32, 24, 4);
        c.fill();
        c.stroke();
        c.strokeStyle = "#a0693a";
        c.beginPath();
        c.moveTo(-16, 0);
        c.lineTo(16, 0);
        c.stroke();
    }
}
/** Air Scanner during a TEST: lift (green, up), weight (red, down), thrust (blue, forward) and drag (grey, back) on each craft. */
export function drawFlightForces(c, flight, states) {
    c.save();
    c.lineWidth = 5;
    c.lineCap = "round";
    for (const craft of flight.craftStates()) {
        const s = states.get(craft.id);
        const f = flight.forceArrows(craft.id);
        if (!s || !f)
            continue;
        const x = s.x * 100, y = s.y * 100;
        const arrow = (dx, dy, mag, col, label) => { if (mag < 0.05)
            return; const len = Math.min(110, 18 + mag * 14); c.strokeStyle = col; c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.lineTo(x + dx * len, y + dy * len); c.stroke(); c.font = "800 12px system-ui"; c.textAlign = "center"; c.fillText(label, x + dx * (len + 14), y + dy * (len + 14)); };
        const h = { x: Math.cos(s.angle), y: Math.sin(s.angle) };
        arrow(0, -1, f.lift, "#2f9e44", "lift");
        arrow(0, 1, f.weight, "#e03131", "weight");
        arrow(h.x, h.y, f.thrust, "#1c7ed6", "thrust");
        arrow(-h.x, -h.y, f.drag, "#868e96", "drag");
    }
    c.restore();
}
