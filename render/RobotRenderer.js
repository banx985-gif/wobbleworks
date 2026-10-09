import { arenaThing, isRobot } from "../robots/RobotSystem.js";
import { describeBlock } from "../robots/BlockEditor.js";
import { parseProgram } from "../robots/RobotProgram.js";
import { drawPartPicture } from "./PartPictures.js";
/**
 * Robot Lab drawing (M18): a top-down floor plan of 1 m cells. Code-drawn behind each part id until the robot-lab art
 * arrives (docs/ART_NEEDED.md, Batch R). Drawing only. 100 px per metre.
 */
const INK = "#203040";
const COLOURS = { RED: "#fa5252", GREEN: "#40c057", BLUE: "#4dabf7", YELLOW: "#fcc419" };
export function isRobotPart(def) { return isRobot(def) || arenaThing(def) !== undefined; }
export function drawRobotPart(c, part, def, selected, ctx) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const thing = arenaThing(def);
    const sys = ctx.robots;
    let x = Math.round(part.position.x) * 100, y = Math.round(part.position.y) * 100;
    c.save();
    c.lineJoin = "round";
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 4;
    if (selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 20;
    }
    if (isRobot(def)) {
        const v = sys === null || sys === void 0 ? void 0 : sys.robot(part.id);
        if (v) {
            x = v.x * 100;
            y = v.y * 100;
        }
        const angle = (_a = v === null || v === void 0 ? void 0 : v.angle) !== null && _a !== void 0 ? _a : Math.round(Number((_b = part.parameters.heading) !== null && _b !== void 0 ? _b : 0)) * Math.PI / 2;
        c.translate(x, y);
        c.rotate(angle);
        c.fillStyle = (v === null || v === void 0 ? void 0 : v.crashed) ? "#ff8787" : "#63e6be";
        c.beginPath();
        c.roundRect(-38, -34, 76, 68, 16);
        c.fill();
        c.stroke();
        c.fillStyle = "#495057";
        c.fillRect(-34, -42, 30, 10);
        c.fillRect(4, -42, 30, 10);
        c.fillRect(-34, 32, 30, 10);
        c.fillRect(4, 32, 30, 10);
        c.fillStyle = "#fff";
        c.beginPath();
        c.roundRect(8, -18, 22, 36, 6);
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        c.beginPath();
        c.arc(20, -8, 4, 0, Math.PI * 2);
        c.arc(20, 8, 4, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#ffd43b";
        c.beginPath();
        c.moveTo(44, 0);
        c.lineTo(34, -8);
        c.lineTo(34, 8);
        c.closePath();
        c.fill();
        c.stroke();
        c.rotate(-angle);
        c.shadowBlur = 0;
        if (v === null || v === void 0 ? void 0 : v.holding) {
            c.fillStyle = "#d9a066";
            c.beginPath();
            c.roundRect(-16, -16, 32, 32, 4);
            c.fill();
            c.stroke();
        }
        if (v === null || v === void 0 ? void 0 : v.crashed) {
            c.fillStyle = "#e03131";
            c.font = "900 18px system-ui";
            c.textAlign = "center";
            c.fillText("BONK!", 0, -52);
        }
        else if (v === null || v === void 0 ? void 0 : v.current) {
            const b = blockAt(parseProgram(part.parameters.program), v.current);
            if (b)
                speech(c, describeBlock(b));
        }
        else if (v === null || v === void 0 ? void 0 : v.done)
            speech(c, "Done!");
        else if (!sys) {
            const n = parseProgram(part.parameters.program).length;
            c.fillStyle = INK;
            c.font = "800 12px system-ui";
            c.textAlign = "center";
            c.fillText(n ? `${n} block${n === 1 ? "" : "s"}` : "no program", 0, 58);
        }
        c.restore();
        return true;
    }
    c.translate(x, y);
    switch (thing) {
        case "WALL":
            c.fillStyle = "#868e96";
            c.beginPath();
            c.roundRect(-48, -48, 96, 96, 6);
            c.fill();
            c.stroke();
            c.strokeStyle = "#adb5bd";
            c.lineWidth = 3;
            c.beginPath();
            c.moveTo(-44, 0);
            c.lineTo(44, 0);
            c.moveTo(0, -44);
            c.lineTo(0, 0);
            c.moveTo(-22, 0);
            c.lineTo(-22, 44);
            c.moveTo(22, 0);
            c.lineTo(22, 44);
            c.stroke();
            break;
        case "TILE":
            c.fillStyle = (_c = COLOURS[String(part.parameters.colour)]) !== null && _c !== void 0 ? _c : "#dee2e6";
            c.globalAlpha = 0.8;
            c.beginPath();
            c.roundRect(-46, -46, 92, 92, 10);
            c.fill();
            c.globalAlpha = 1;
            c.lineWidth = 3;
            c.stroke();
            break;
        case "GOAL":
            c.strokeStyle = "#2f9e44";
            c.lineWidth = 6;
            c.setLineDash([12, 8]);
            c.beginPath();
            c.roundRect(-44, -44, 88, 88, 12);
            c.stroke();
            c.setLineDash([]);
            c.font = "34px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("🏁", 0, 2);
            break;
        case "DROP":
            c.fillStyle = "#fff3bf";
            c.beginPath();
            c.roundRect(-44, -44, 88, 88, 8);
            c.fill();
            c.strokeStyle = "#f08c00";
            c.lineWidth = 4;
            c.setLineDash([10, 8]);
            c.stroke();
            c.setLineDash([]);
            c.fillStyle = "#f08c00";
            c.font = "900 14px system-ui";
            c.textAlign = "center";
            c.fillText("DROP", 0, 5);
            break;
        case "BUTTON": {
            const on = (_d = sys === null || sys === void 0 ? void 0 : sys.isPressed(part.id)) !== null && _d !== void 0 ? _d : false;
            if (drawPartPicture(c, ctx.art, def.id)) {
                if (on) {
                    c.shadowBlur = 0;
                    c.strokeStyle = "#40c057";
                    c.lineWidth = 6;
                    c.beginPath();
                    c.arc(0, 0, 42, 0, Math.PI * 2);
                    c.stroke();
                }
                break;
            }
            c.fillStyle = "#495057";
            c.beginPath();
            c.arc(0, 0, 34, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = on ? "#40c057" : "#fa5252";
            c.beginPath();
            c.arc(0, 0, on ? 20 : 24, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            break;
        }
        case "DOOR": {
            const open = (_e = sys === null || sys === void 0 ? void 0 : sys.isOpen(part.id)) !== null && _e !== void 0 ? _e : part.parameters.open === true;
            c.fillStyle = open ? "#d3f9d8" : "#e8590c";
            c.beginPath();
            c.roundRect(-46, -46, 92, 92, 6);
            c.fill();
            c.stroke();
            if (!open) {
                c.strokeStyle = INK;
                c.lineWidth = 6;
                for (const k of [-24, 0, 24]) {
                    c.beginPath();
                    c.moveTo(k, -42);
                    c.lineTo(k, 42);
                    c.stroke();
                }
            }
            else {
                c.fillStyle = "#2f9e44";
                c.font = "900 13px system-ui";
                c.textAlign = "center";
                c.fillText("OPEN", 0, 5);
            }
            break;
        }
        case "SWEEPER": {
            const p = sys === null || sys === void 0 ? void 0 : sys.sweeperPosition(part.id);
            if (p)
                c.translate((p.x - Math.round(part.position.x)) * 100, (p.y - Math.round(part.position.y)) * 100);
            c.fillStyle = "#ffa94d";
            c.beginPath();
            c.arc(0, 0, 40, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.strokeStyle = "#fff";
            c.lineWidth = 4;
            c.save();
            c.rotate(ctx.time * 6);
            for (let k = 0; k < 3; k++) {
                c.rotate(Math.PI * 2 / 3);
                c.beginPath();
                c.moveTo(0, 0);
                c.lineTo(30, 0);
                c.stroke();
            }
            c.restore();
            break;
        }
        case "CONVEYOR": {
            const on = (_f = sys === null || sys === void 0 ? void 0 : sys.isOn(part.id)) !== null && _f !== void 0 ? _f : part.parameters.on === true;
            c.rotate(Math.round(Number((_g = part.parameters.heading) !== null && _g !== void 0 ? _g : 0)) * Math.PI / 2);
            c.fillStyle = "#495057";
            c.beginPath();
            c.roundRect(-48, -36, 96, 72, 8);
            c.fill();
            c.stroke();
            c.strokeStyle = on ? "#ffd43b" : "#868e96";
            c.lineWidth = 5;
            const off = on ? (ctx.time * 60) % 32 : 0;
            for (let k = -48; k < 48; k += 32) {
                c.beginPath();
                c.moveTo(k + off - 8, -20);
                c.lineTo(k + off + 6, 0);
                c.lineTo(k + off - 8, 20);
                c.stroke();
            }
            break;
        }
        case "MACHINE": {
            const on = (_h = sys === null || sys === void 0 ? void 0 : sys.isOn(part.id)) !== null && _h !== void 0 ? _h : false;
            c.fillStyle = "#748ffc";
            c.beginPath();
            c.roundRect(-46, -46, 92, 92, 12);
            c.fill();
            c.stroke();
            c.fillStyle = on ? "#69db7c" : "#dee2e6";
            c.beginPath();
            c.arc(-24, -26, 8, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = "#fff";
            c.font = "900 12px system-ui";
            c.textAlign = "center";
            c.fillText("PACKER", 0, 30);
            break;
        }
        case "LAMP": {
            const on = (_j = sys === null || sys === void 0 ? void 0 : sys.isOn(part.id)) !== null && _j !== void 0 ? _j : false;
            if (on) {
                c.fillStyle = "#fff3bf";
                c.beginPath();
                c.arc(0, 0, 46, 0, Math.PI * 2);
                c.fill();
            }
            c.save();
            if (on) {
                c.shadowColor = "#ffd43b";
                c.shadowBlur = 30;
            }
            else
                c.globalAlpha = 0.85;
            const lit = drawPartPicture(c, ctx.art, def.id);
            c.restore();
            if (lit)
                break;
            if (on) {
                c.fillStyle = "#fff3bf";
                c.beginPath();
                c.arc(0, 0, 46, 0, Math.PI * 2);
                c.fill();
            }
            c.fillStyle = on ? "#ffd43b" : "#e9ecef";
            c.beginPath();
            c.arc(0, 0, 22, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            break;
        }
        case "PAD": {
            const lit = Math.sin(ctx.time * 6) > 0;
            c.fillStyle = lit ? "#f783ac" : "#e599f7";
            c.beginPath();
            c.roundRect(-44, -44, 88, 88, 14);
            c.fill();
            c.stroke();
            c.font = "26px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("🎵", 0, 2);
            break;
        }
        case "BOX": {
            const b = sys === null || sys === void 0 ? void 0 : sys.box(part.id);
            if (b) {
                if (b.carried) {
                    c.restore();
                    return true;
                }
                c.translate((b.x - Math.round(part.position.x)) * 100, (b.y - Math.round(part.position.y)) * 100);
            }
            if (!(b === null || b === void 0 ? void 0 : b.product) && drawPartPicture(c, ctx.art, def.id))
                break;
            c.fillStyle = (b === null || b === void 0 ? void 0 : b.product) ? "#ffd8a8" : "#d9a066";
            c.beginPath();
            c.roundRect(-30, -30, 60, 60, 6);
            c.fill();
            c.stroke();
            if (b === null || b === void 0 ? void 0 : b.product) {
                c.strokeStyle = "#e64980";
                c.lineWidth = 6;
                c.beginPath();
                c.moveTo(0, -30);
                c.lineTo(0, 30);
                c.moveTo(-30, 0);
                c.lineTo(30, 0);
                c.stroke();
            }
            else {
                c.strokeStyle = "#a0693a";
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(-30, 0);
                c.lineTo(30, 0);
                c.stroke();
            }
            break;
        }
    }
    c.restore();
    return true;
}
function speech(c, text) {
    c.font = "800 14px system-ui";
    const w = c.measureText(text).width + 18;
    c.fillStyle = "#ffffffee";
    c.strokeStyle = INK;
    c.lineWidth = 3;
    c.beginPath();
    c.roundRect(-w / 2, -86, w, 26, 10);
    c.fill();
    c.stroke();
    c.fillStyle = INK;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 0, -72);
}
/** The block at a path in a program (for the speech bubble while it runs). */
export function blockAt(program, path) {
    var _a;
    let list = program;
    let block;
    for (let i = 0; i < path.length; i++) {
        const p = path[i];
        if (typeof p === "number") {
            block = list[p];
            if (!block)
                return undefined;
        }
        else {
            const b = block;
            list = (_a = b[p]) !== null && _a !== void 0 ? _a : [];
        }
    }
    return block;
}
/** The arena floor: a grid of 1 m cells drawn on the Robot Lab room. */
export function drawRobotFloor(c) {
    c.save();
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
    c.restore();
}
