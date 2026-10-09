import { spaceBehaviour, vesselBehaviour } from "../space/SpaceSystem.js";
import { describeBlock } from "../robots/BlockEditor.js";
import { parseProgram } from "../robots/RobotProgram.js";
import { blockAt } from "./RobotRenderer.js";
import { drawPartPicture, PART_PICTURES } from "./PartPictures.js";
/**
 * Space Centre drawing (M19). Wheels, drive motor and solar panel are painted (part-art map, PartPictures.ts); the rest is
 * code-drawn behind each part id until the space art arrives (docs/ART_NEEDED.md, Batch S).
 * Drawing only — nothing here changes the simulation. 100 px per metre.
 */
const INK = "#203040";
export function isSpacePart(def) { return def.id.startsWith("space."); }
/** Draw order: zones and the sun at the back, pads and rocks, vessels, then clip-on parts in front. */
export function spaceLayer(def) {
    if (def.behaviours.some(b => b.kind === "GRAVITY_ZONE"))
        return -2;
    if (def.behaviours.some(b => b.kind === "SUN" || b.kind === "PLANET") || def.id === "space.repair-slot" || def.id === "space.marker" || def.id === "space.moon-base" || def.id === "space.satellite")
        return -1;
    if (vesselBehaviour(def))
        return 3;
    if (def.id === "space.repair-module")
        return 3;
    if (def.id === "space.robot-arm")
        return 3.5;
    if (spaceBehaviour(def) || def.behaviours.some(b => b.kind === "CIRCUIT"))
        return 3.5;
    return 0;
}
export function drawSpacePart(c, part, def, selected, ctx) {
    const st = ctx.states.get(part.id);
    const pose = ctx.pose(part.id);
    const x = (pose?.x ?? st?.x ?? part.position.x) * 100, y = (pose?.y ?? st?.y ?? part.position.y) * 100, angle = pose?.angle ?? st?.angle ?? part.rotation;
    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 4;
    if (selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 22;
    }
    const img = ctx.art(def.id);
    if (def.behaviours.some(b => b.kind === "GRAVITY_ZONE")) {
        c.shadowBlur = 0;
        drawZone(c, part, ctx.time);
        c.restore();
        return true;
    }
    c.translate(x, y);
    if (def.id === "space.robot-arm") {
        c.restore();
        drawArm(c, part, selected, ctx);
        return true;
    }
    const spinning = Boolean(ctx.space) && (def.id === "space.wheel" || def.id === "space.grip-wheel");
    if (!img && !vesselBehaviour(def) && def.id !== "space.solar-panel" && PART_PICTURES[def.id]) {
        c.rotate(angle);
        if (drawPartPicture(c, ctx.art, def.id, { spinAngle: spinning ? ctx.time * 4 : 0 })) {
            c.restore();
            return true;
        }
        c.rotate(-angle);
    }
    if (img && !vesselBehaviour(def)) {
        c.rotate(angle);
        const s = artSize(def.id);
        c.drawImage(img, -s[0] / 2, -s[1] / 2, s[0], s[1]);
        c.restore();
        return true;
    }
    switch (def.id) {
        case "space.sun": {
            c.shadowBlur = 0;
            const g = c.createRadialGradient(0, 0, 10, 0, 0, 90);
            g.addColorStop(0, "#fff9db");
            g.addColorStop(0.5, "#ffd43b");
            g.addColorStop(1, "#ffd43b00");
            c.fillStyle = g;
            c.beginPath();
            c.arc(0, 0, 90, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#ffe066";
            c.beginPath();
            c.arc(0, 0, 42, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            break;
        }
        case "space.planet": {
            c.fillStyle = "#63e6be";
            c.beginPath();
            c.arc(0, 0, 80, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = "#38d9a9";
            for (const [a, b, r] of [[-25, -20, 18], [22, 18, 24], [30, -32, 10]]) {
                c.beginPath();
                c.arc(a, b, r, 0, Math.PI * 2);
                c.fill();
            }
            c.strokeStyle = "#ffffff55";
            c.lineWidth = 3;
            c.setLineDash([6, 10]);
            c.beginPath();
            c.arc(0, 0, 270, 0, Math.PI * 2);
            c.stroke();
            c.setLineDash([]);
            break;
        }
        case "space.launcher": {
            c.rotate(angle);
            c.fillStyle = "#868e96";
            c.beginPath();
            c.roundRect(-40, -15, 80, 30, 8);
            c.fill();
            c.stroke();
            const power = Math.round(Number(part.parameters.power ?? 0));
            for (let i = 0; i < 4; i++) {
                c.fillStyle = i <= power ? "#ff6b6b" : "#dee2e6";
                c.fillRect(-30 + i * 16, 22, 12, 10 + i * 4);
                c.strokeRect(-30 + i * 16, 22, 12, 10 + i * 4);
            }
            c.fillStyle = INK;
            c.font = "900 13px system-ui";
            c.textAlign = "center";
            c.fillText("POWER", 0, 58);
            c.fillStyle = "#ffd43b";
            c.beginPath();
            c.moveTo(48, 0);
            c.lineTo(34, -9);
            c.lineTo(34, 9);
            c.closePath();
            c.fill();
            c.stroke();
            break;
        }
        case "space.launch-pad": {
            c.fillStyle = "#adb5bd";
            c.beginPath();
            c.roundRect(-80, -15, 160, 30, 6);
            c.fill();
            c.stroke();
            c.fillStyle = "#ffd43b";
            for (let k = -70; k < 70; k += 28)
                c.fillRect(k, -10, 14, 20);
            const tilt = Number(part.parameters.tilt ?? 0);
            if (tilt) {
                c.strokeStyle = "#e8590c";
                c.lineWidth = 5;
                c.setLineDash([8, 6]);
                c.beginPath();
                c.moveTo(0, -15);
                c.lineTo(Math.sin(tilt * Math.PI / 180) * 120, -15 - Math.cos(tilt * Math.PI / 180) * 120);
                c.stroke();
                c.setLineDash([]);
            }
            c.fillStyle = INK;
            c.font = "900 14px system-ui";
            c.textAlign = "center";
            c.fillText(`${tilt}°`, 0, 36);
            break;
        }
        case "space.landing-pad": {
            c.fillStyle = "#ced4da";
            c.beginPath();
            c.roundRect(-110, -15, 220, 30, 6);
            c.fill();
            c.stroke();
            c.fillStyle = "#e03131";
            c.font = "900 22px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("H", 0, 1);
            break;
        }
        case "space.moon-plateau": {
            c.fillStyle = "#adb5bd";
            c.beginPath();
            c.roundRect(-200, -100, 400, 200, 14);
            c.fill();
            c.stroke();
            c.fillStyle = "#868e96";
            for (const [a, b, r] of [[-120, -40, 22], [60, 10, 30], [150, -60, 14], [-40, 50, 18]]) {
                c.beginPath();
                c.ellipse(a, b, r, r * 0.6, 0, 0, Math.PI * 2);
                c.fill();
            }
            break;
        }
        case "space.marker": {
            c.strokeStyle = INK;
            c.lineWidth = 5;
            c.beginPath();
            c.moveTo(0, 60);
            c.lineTo(0, -40);
            c.stroke();
            c.fillStyle = "#ff6b6b";
            c.beginPath();
            c.moveTo(0, -40);
            c.lineTo(46, -26);
            c.lineTo(0, -12);
            c.closePath();
            c.fill();
            c.lineWidth = 3;
            c.stroke();
            break;
        }
        case "space.moon-base": {
            c.fillStyle = "#e9ecef";
            c.beginPath();
            c.arc(0, 30, 70, Math.PI, 0);
            c.closePath();
            c.fill();
            c.stroke();
            c.fillStyle = "#74c0fc";
            c.beginPath();
            c.roundRect(-18, 0, 36, 30, 6);
            c.fill();
            c.stroke();
            c.fillStyle = INK;
            c.font = "900 14px system-ui";
            c.textAlign = "center";
            c.fillText("BASE", 0, -14);
            break;
        }
        case "space.satellite": {
            c.fillStyle = "#ced4da";
            c.beginPath();
            c.roundRect(-40, -30, 80, 60, 8);
            c.fill();
            c.stroke();
            c.beginPath();
            c.moveTo(40, -10);
            c.lineTo(70, -40);
            c.stroke();
            c.fillStyle = "#fff";
            c.beginPath();
            c.arc(74, -44, 14, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            break;
        }
        case "space.rocket":
        case "space.lander": {
            c.rotate(angle);
            drawVessel(c, def.id, ctx.space?.vessel(part.id)?.thrust ?? 0, ctx.time);
            break;
        }
        case "space.rover": {
            drawRover(c, ctx.space?.vessel(part.id), ctx.time, st?.angle ?? 0);
            break;
        }
        case "space.booster": {
            c.rotate(angle);
            const burning = (ctx.space?.boosterFuel(part.id) ?? 1) > 0 && ctx.space?.vessel(ownerOf(ctx, part.id) ?? "")?.thrust;
            c.fillStyle = "#ff922b";
            c.beginPath();
            c.roundRect(-15, -26, 30, 46, 8);
            c.fill();
            c.stroke();
            c.fillStyle = "#495057";
            c.beginPath();
            c.moveTo(-12, 20);
            c.lineTo(12, 20);
            c.lineTo(17, 30);
            c.lineTo(-17, 30);
            c.closePath();
            c.fill();
            c.stroke();
            if (burning)
                drawFlame(c, 30, ctx.time);
            if (!ctx.space) {
                c.rotate(-angle);
                c.fillStyle = INK;
                c.font = "800 12px system-ui";
                c.textAlign = "center";
                c.fillText(`${Number(part.parameters.burn ?? spaceBehaviour(def)?.burn ?? 1.5)} s`, 0, -34);
            }
            break;
        }
        case "space.fins": {
            c.rotate(angle);
            c.fillStyle = "#e03131";
            for (const s of [-1, 1]) {
                c.beginPath();
                c.moveTo(s * 20, -22);
                c.lineTo(s * 48, 18);
                c.lineTo(s * 20, 18);
                c.closePath();
                c.fill();
                c.stroke();
            }
            break;
        }
        case "space.nose-cone": {
            c.rotate(angle);
            c.fillStyle = "#e03131";
            c.beginPath();
            c.moveTo(0, -30);
            c.quadraticCurveTo(22, 0, 22, 18);
            c.lineTo(-22, 18);
            c.quadraticCurveTo(-22, 0, 0, -30);
            c.closePath();
            c.fill();
            c.stroke();
            break;
        }
        case "space.capsule": {
            c.rotate(angle);
            c.fillStyle = "#f8f9fa";
            c.beginPath();
            c.moveTo(-26, 22);
            c.lineTo(-14, -20);
            c.lineTo(14, -20);
            c.lineTo(26, 22);
            c.closePath();
            c.fill();
            c.stroke();
            c.fillStyle = "#74c0fc";
            c.beginPath();
            c.arc(0, 2, 8, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            break;
        }
        case "space.landing-legs": {
            c.rotate(angle);
            c.lineWidth = 6;
            for (const s of [-1, 1]) {
                c.beginPath();
                c.moveTo(s * 18, -14);
                c.lineTo(s * 46, 34);
                c.stroke();
                c.fillStyle = "#adb5bd";
                c.beginPath();
                c.ellipse(s * 46, 38, 14, 5, 0, 0, Math.PI * 2);
                c.fill();
                c.lineWidth = 3;
                c.stroke();
                c.lineWidth = 6;
            }
            break;
        }
        case "space.wheel":
        case "space.grip-wheel": {
            const spin = ctx.space ? ctx.time * 4 : 0;
            c.fillStyle = "#495057";
            c.beginPath();
            c.arc(0, 0, 23, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            if (def.id === "space.grip-wheel") {
                c.strokeStyle = "#ffd43b";
                c.lineWidth = 4;
                for (let k = 0; k < 8; k++) {
                    const a = spin + k * Math.PI / 4;
                    c.beginPath();
                    c.moveTo(Math.cos(a) * 16, Math.sin(a) * 16);
                    c.lineTo(Math.cos(a) * 25, Math.sin(a) * 25);
                    c.stroke();
                }
            }
            c.fillStyle = "#dee2e6";
            c.beginPath();
            c.arc(0, 0, 8, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = INK;
            c.lineWidth = 3;
            c.stroke();
            break;
        }
        case "space.drive-motor": {
            c.fillStyle = "#7950f2";
            c.beginPath();
            c.roundRect(-22, -14, 44, 28, 6);
            c.fill();
            c.stroke();
            c.fillStyle = "#fff";
            c.font = "900 12px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("DRIVE", 0, 1);
            break;
        }
        case "space.cargo-pod": {
            c.rotate(angle);
            c.fillStyle = "#ffa94d";
            c.beginPath();
            c.roundRect(-22, -18, 44, 36, 6);
            c.fill();
            c.stroke();
            c.beginPath();
            c.moveTo(-22, 0);
            c.lineTo(22, 0);
            c.stroke();
            break;
        }
        case "space.solar-panel": {
            const attached = Boolean(pose);
            c.save();
            c.rotate(attached ? angle : part.rotation);
            const painted = drawPartPicture(c, ctx.art, def.id);
            c.restore();
            if (painted)
                break;
            if (!attached) {
                c.fillStyle = "#868e96";
                c.fillRect(-6, 0, 12, 32);
                c.strokeRect(-6, 0, 12, 32);
                c.fillRect(-44, 28, 88, 8);
                c.strokeRect(-44, 28, 88, 8);
            }
            c.rotate(attached ? angle : part.rotation);
            c.fillStyle = "#1c7ed6";
            c.beginPath();
            c.roundRect(-44, -10, 88, 18, 3);
            c.fill();
            c.stroke();
            c.strokeStyle = "#a5d8ff";
            c.lineWidth = 2;
            for (let k = -30; k <= 30; k += 15) {
                c.beginPath();
                c.moveTo(k, -9);
                c.lineTo(k, 7);
                c.stroke();
            }
            c.fillStyle = "#ffd43b";
            c.beginPath();
            c.moveTo(0, -30);
            c.lineTo(-7, -18);
            c.lineTo(7, -18);
            c.closePath();
            c.fill();
            break;
        }
        case "space.radio": {
            c.fillStyle = "#e9ecef";
            c.beginPath();
            c.roundRect(-34, -22, 68, 44, 8);
            c.fill();
            c.stroke();
            c.beginPath();
            c.moveTo(14, -22);
            c.lineTo(26, -50);
            c.stroke();
            c.fillStyle = INK;
            c.font = "900 12px system-ui";
            c.textAlign = "center";
            c.fillText("RADIO", 0, 5);
            break;
        }
        case "space.igniter": {
            c.fillStyle = "#ffe066";
            c.beginPath();
            c.roundRect(-28, -16, 56, 32, 8);
            c.fill();
            c.stroke();
            c.fillStyle = "#e8590c";
            c.font = "900 18px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("🔥", 0, 1);
            break;
        }
        case "space.repair-slot": {
            const gx = Math.round(part.position.x) * 100 - x, gy = Math.round(part.position.y) * 100 - y;
            c.translate(gx, gy);
            c.fillStyle = "#fff3bf";
            c.setLineDash([10, 8]);
            c.strokeStyle = "#f08c00";
            c.beginPath();
            c.roundRect(-44, -44, 88, 88, 10);
            c.fill();
            c.stroke();
            c.setLineDash([]);
            c.fillStyle = "#f08c00";
            c.font = "900 13px system-ui";
            c.textAlign = "center";
            c.fillText(String(part.parameters.label ?? "SLOT"), 0, 5);
            break;
        }
        case "space.repair-module": {
            const b = ctx.robots?.box(part.id);
            if (b?.carried) {
                c.restore();
                return true;
            }
            const bx = (b ? b.x : Math.round(part.position.x)) * 100 - x, by = (b ? b.y : Math.round(part.position.y)) * 100 - y;
            c.translate(bx, by);
            c.fillStyle = "#4dabf7";
            c.beginPath();
            c.roundRect(-30, -30, 60, 60, 8);
            c.fill();
            c.stroke();
            c.fillStyle = "#fff";
            c.font = "900 12px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(String(part.parameters.label ?? "PART"), 0, 1);
            break;
        }
        case "space.hull": {
            const gx = Math.round(part.position.x) * 100 - x, gy = Math.round(part.position.y) * 100 - y;
            c.translate(gx, gy);
            c.fillStyle = "#dee2e6";
            c.beginPath();
            c.roundRect(-48, -48, 96, 96, 8);
            c.fill();
            c.stroke();
            c.fillStyle = "#adb5bd";
            for (const [a, b] of [[-30, -30], [30, -30], [-30, 30], [30, 30]]) {
                c.beginPath();
                c.arc(a, b, 5, 0, Math.PI * 2);
                c.fill();
            }
            break;
        }
        default:
            c.restore();
            return false;
    }
    c.restore();
    return true;
}
function artSize(id) { return id === "space.sun" ? [180, 180] : id === "space.planet" ? [170, 170] : id === "space.moon-plateau" ? [400, 200] : id === "space.moon-base" ? [150, 110] : [90, 90]; }
function ownerOf(ctx, partId) { return ctx.space?.vesselViews().find(v => v.attached.includes(partId))?.id; }
function drawZone(c, part, time) {
    const w = Number(part.parameters.width ?? 16) * 100, x1 = part.position.x * 100 - w / 2;
    const g = Number(part.parameters.g ?? 1.62);
    const label = String(part.parameters.label ?? (g < 0.01 ? "ZERO G" : g < 5 ? "MOON" : "EARTH"));
    c.fillStyle = g < 0.01 ? "#1c1f4a55" : g < 5 ? "#ced4da33" : "#74c0fc22";
    c.fillRect(x1, 0, w, 840);
    if (g < 5) {
        c.fillStyle = "#ffffffaa";
        for (let i = 0; i < Math.floor(w / 60); i++) {
            const sx = x1 + ((i * 137) % w), sy = (i * 89) % 700;
            const tw = 1.5 + Math.sin(time * 2 + i) * 0.8;
            c.beginPath();
            c.arc(sx, sy, tw, 0, Math.PI * 2);
            c.fill();
        }
    }
    c.strokeStyle = "#ffffff99";
    c.lineWidth = 3;
    c.setLineDash([12, 10]);
    c.beginPath();
    c.moveTo(x1, 0);
    c.lineTo(x1, 840);
    c.moveTo(x1 + w, 0);
    c.lineTo(x1 + w, 840);
    c.stroke();
    c.setLineDash([]);
    const text = `${label} · gravity ${g < 0.01 ? "0" : g.toFixed(g < 5 ? 2 : 1)}`;
    c.font = "900 18px system-ui";
    const tw = c.measureText(text).width + 24;
    c.fillStyle = "#ffffffdd";
    c.strokeStyle = INK;
    c.lineWidth = 3;
    c.beginPath();
    c.roundRect(x1 + w / 2 - tw / 2, 136, tw, 32, 14);
    c.fill();
    c.stroke();
    c.fillStyle = INK;
    c.textAlign = "center";
    c.fillText(text, x1 + w / 2, 159);
}
function drawFlame(c, at, time) {
    const f = 1 + Math.sin(time * 40) * 0.15;
    c.save();
    c.shadowBlur = 0;
    c.fillStyle = "#ffd43b";
    c.beginPath();
    c.moveTo(-12, at);
    c.quadraticCurveTo(0, at + 60 * f, 12, at);
    c.closePath();
    c.fill();
    c.fillStyle = "#ff6b6b";
    c.beginPath();
    c.moveTo(-7, at);
    c.quadraticCurveTo(0, at + 34 * f, 7, at);
    c.closePath();
    c.fill();
    c.restore();
}
function drawVessel(c, id, thrust, time) {
    if (id === "space.lander") {
        c.fillStyle = "#fcc419";
        c.beginPath();
        c.roundRect(-40, -45, 80, 90, 14);
        c.fill();
        c.stroke();
        c.fillStyle = "#74c0fc";
        c.beginPath();
        c.arc(0, -10, 16, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.strokeStyle = "#e67700";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-36, 20);
        c.lineTo(36, 20);
        c.stroke();
        if (thrust > 0)
            drawFlame(c, 45, time);
        return;
    }
    c.fillStyle = "#f8f9fa";
    c.beginPath();
    c.roundRect(-22, -75, 44, 150, 16);
    c.fill();
    c.stroke();
    c.fillStyle = "#e03131";
    c.fillRect(-20, -20, 40, 10);
    c.fillRect(-20, 40, 40, 10);
    c.strokeRect(-20, -20, 40, 10);
    c.strokeRect(-20, 40, 40, 10);
    c.fillStyle = "#74c0fc";
    c.beginPath();
    c.arc(0, -42, 11, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    if (thrust > 0)
        drawFlame(c, 75, time);
}
function drawRover(c, v, time, _angle) {
    // Chassis (the wheels and parts clipped on are drawn as their own parts).
    c.fillStyle = "#e9ecef";
    c.beginPath();
    c.roundRect(-60, -30, 120, 34, 10);
    c.fill();
    c.stroke();
    c.fillStyle = "#4dabf7";
    c.beginPath();
    c.roundRect(10, -50, 34, 22, 6);
    c.fill();
    c.stroke();
    if (v && !v.stable) {
        c.strokeStyle = INK;
        c.lineWidth = 5;
        for (const s of [-1, 1]) {
            c.beginPath();
            c.moveTo(s * 40, 4);
            c.lineTo(s * 46, 32);
            c.stroke();
        }
    }
    if (v?.slipping) {
        c.fillStyle = "#adb5bd";
        for (let k = 0; k < 4; k++) {
            const a = time * 8 + k;
            c.beginPath();
            c.arc(-50 - Math.abs(Math.sin(a)) * 30, 30 - Math.abs(Math.cos(a)) * 12, 6, 0, Math.PI * 2);
            c.fill();
        }
    }
}
/** The station's robot arm: a base where it was built, a jointed arm out to the gripper, which runs a Robot Lab program. */
function drawArm(c, part, selected, ctx) {
    const bx = Math.round(part.position.x) * 100, by = Math.round(part.position.y) * 100;
    const v = ctx.robots?.robot(part.id);
    const gx = (v?.x ?? Math.round(part.position.x)) * 100, gy = (v?.y ?? Math.round(part.position.y)) * 100;
    const heading = v?.angle ?? Math.round(Number(part.parameters.heading ?? 0)) * Math.PI / 2;
    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    if (selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 22;
    }
    c.fillStyle = "#868e96";
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.beginPath();
    c.roundRect(bx - 34, by - 34, 68, 68, 12);
    c.fill();
    c.stroke();
    const ex = (bx + gx) / 2 + (gy - by) * 0.25, ey = (by + gy) / 2 - (gx - bx) * 0.25;
    c.strokeStyle = INK;
    c.lineWidth = 20;
    c.beginPath();
    c.moveTo(bx, by);
    c.lineTo(ex, ey);
    c.lineTo(gx, gy);
    c.stroke();
    c.strokeStyle = "#ced4da";
    c.lineWidth = 12;
    c.stroke();
    c.fillStyle = "#fcc419";
    c.lineWidth = 4;
    c.strokeStyle = INK;
    c.beginPath();
    c.arc(ex, ey, 11, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.translate(gx, gy);
    c.rotate(heading);
    // The painted claw (robot.claw) points the way the arm faces; code-drawn gripper if the picture isn't loaded.
    const claw = ctx.art("robot.claw");
    if (claw) {
        c.save();
        c.rotate(-Math.PI / 2);
        if (v?.holding)
            c.scale(0.85, 1);
        c.drawImage(claw, -26, -14, 52, 70);
        c.restore();
    }
    else {
        c.fillStyle = "#fcc419";
        c.beginPath();
        c.roundRect(-16, -16, 32, 32, 6);
        c.fill();
        c.stroke();
        c.lineWidth = 6;
        for (const s of [-1, 1]) {
            c.beginPath();
            c.moveTo(14, s * 12);
            c.lineTo(36, s * (v?.holding ? 22 : 14));
            c.lineTo(42, s * 6);
            c.stroke();
        }
    }
    c.rotate(-heading);
    if (v?.holding) {
        c.fillStyle = "#4dabf7";
        c.beginPath();
        c.roundRect(-22, -22, 44, 44, 6);
        c.globalAlpha = 0.9;
        c.fill();
        c.globalAlpha = 1;
        c.stroke();
    }
    if (v?.current) {
        const b = blockAt(parseProgram(part.parameters.program), v.current);
        if (b) {
            const text = describeBlock(b);
            c.font = "800 14px system-ui";
            const w = c.measureText(text).width + 18;
            c.fillStyle = "#ffffffee";
            c.lineWidth = 3;
            c.beginPath();
            c.roundRect(-w / 2, -70, w, 26, 10);
            c.fill();
            c.stroke();
            c.fillStyle = INK;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(text, 0, -57);
        }
    }
    c.restore();
}
/** Gravity readouts: every free object in a zone shows its mass (never changes) and its weight there (mass × g). */
export function drawGravityReadouts(c, runtime) {
    const space = runtime.space;
    if (!space.zones.length)
        return;
    for (const s of runtime.physics.states()) {
        if (space.isAttached(s.id) || !runtime.isDynamicBody(s.id))
            continue;
        const def = runtime.partDefinition(s.id);
        if (!def || def.id === "space.lander" || def.id === "space.rocket")
            continue;
        const m = runtime.physics.mass(s.id), g = space.gravityAt(s.x);
        const text = `mass ${m.toFixed(2)} kg · weight ${(m * g).toFixed(1)} N`;
        c.save();
        c.font = "800 13px system-ui";
        const w = c.measureText(text).width + 14;
        c.fillStyle = "#fffffff0";
        c.strokeStyle = INK;
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(s.x * 100 - w / 2, s.y * 100 - 64, w, 22, 9);
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(text, s.x * 100, s.y * 100 - 53);
        c.strokeStyle = "#e03131";
        c.lineWidth = 4;
        const len = Math.min(70, 10 + m * g * 6);
        c.beginPath();
        c.moveTo(s.x * 100, s.y * 100);
        c.lineTo(s.x * 100, s.y * 100 + len);
        c.stroke();
        c.beginPath();
        c.moveTo(s.x * 100 - 6, s.y * 100 + len - 8);
        c.lineTo(s.x * 100, s.y * 100 + len);
        c.lineTo(s.x * 100 + 6, s.y * 100 + len - 8);
        c.stroke();
        c.restore();
    }
}
