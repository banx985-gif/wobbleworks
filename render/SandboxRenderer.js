import { drawPartPicture, PART_PICTURES } from "./PartPictures.js";
/** Free Build / sandbox drawing (M23). Code-drawn behind each part id (docs/ART_NEEDED.md, Batch X). Drawing only. */
const INK = "#203040";
export function isSandboxPart(def) { return def.id.startsWith("sandbox.") || def.id === "magnetic.reed-switch"; }
export function sandboxLayer(def) { return def.id === "sandbox.water-area" || def.id === "sandbox.wind-zone" || def.id === "sandbox.sign" ? -2 : def.id === "sandbox.ice-floor" || def.id === "sandbox.moving-platform" ? 0 : def.id === "sandbox.rain" ? 4 : 3; }
export function drawSandboxPart(c, part, def, selected, ctx) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const st = ctx.states.get(part.id);
    const x = ((_a = st === null || st === void 0 ? void 0 : st.x) !== null && _a !== void 0 ? _a : part.position.x) * 100, y = ((_b = st === null || st === void 0 ? void 0 : st.y) !== null && _b !== void 0 ? _b : part.position.y) * 100, a = (_c = st === null || st === void 0 ? void 0 : st.angle) !== null && _c !== void 0 ? _c : part.rotation;
    c.save();
    c.translate(x, y);
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 4;
    if (selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 20;
    }
    // Painted objects (part-art map): the balloon keeps its string, the moving platform its picture.
    if (def.id === "sandbox.balloon" && ((_d = ctx.art) === null || _d === void 0 ? void 0 : _d.call(ctx, "air.balloon"))) {
        c.rotate(a);
        c.strokeStyle = "#495057";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, 26);
        c.quadraticCurveTo(8, 45, 0, 60);
        c.stroke();
    }
    if (PART_PICTURES[def.id] && drawPartPicture(c, ctx.art, def.id)) {
        c.restore();
        return true;
    }
    switch (def.id) {
        case "sandbox.toy-car":
            c.rotate(a);
            c.fillStyle = "#ff6b6b";
            c.beginPath();
            c.roundRect(-35, -14, 70, 22, 8);
            c.fill();
            c.stroke();
            c.fillStyle = "#a5d8ff";
            c.beginPath();
            c.roundRect(-14, -26, 28, 14, 5);
            c.fill();
            c.stroke();
            c.fillStyle = "#343a40";
            for (const s of [-22, 22]) {
                c.beginPath();
                c.arc(s, 10, 9, 0, Math.PI * 2);
                c.fill();
                c.stroke();
            }
            break;
        case "sandbox.balloon":
            c.strokeStyle = "#495057";
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(0, 28);
            c.quadraticCurveTo(8, 45, 0, 60);
            c.stroke();
            c.strokeStyle = INK;
            c.lineWidth = 4;
            c.fillStyle = "#f06595";
            c.beginPath();
            c.ellipse(0, 0, 25, 30, 0, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = "#fff8";
            c.beginPath();
            c.ellipse(-8, -10, 6, 9, -0.4, 0, Math.PI * 2);
            c.fill();
            break;
        case "sandbox.weight":
            c.fillStyle = "#495057";
            c.beginPath();
            c.moveTo(-25, 20);
            c.lineTo(-18, -14);
            c.lineTo(18, -14);
            c.lineTo(25, 20);
            c.closePath();
            c.fill();
            c.stroke();
            c.fillStyle = "#fff";
            c.font = "900 13px system-ui";
            c.textAlign = "center";
            c.fillText("10kg", 0, 10);
            break;
        case "sandbox.bowling-ball":
            c.rotate(a);
            c.fillStyle = "#3b5bdb";
            c.beginPath();
            c.arc(0, 0, 27, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = INK;
            for (const [px, py] of [[-6, -10], [6, -12], [0, 0]]) {
                c.beginPath();
                c.arc(px, py, 4, 0, Math.PI * 2);
                c.fill();
            }
            break;
        case "sandbox.feather":
            c.rotate(a);
            c.strokeStyle = "#868e96";
            c.lineWidth = 3;
            c.beginPath();
            c.moveTo(-26, 0);
            c.lineTo(26, 0);
            c.stroke();
            c.fillStyle = "#f1f3f5";
            c.strokeStyle = "#adb5bd";
            c.lineWidth = 2;
            c.beginPath();
            c.ellipse(4, 0, 22, 7, 0, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            break;
        case "sandbox.egg": {
            const broken = (_f = (_e = ctx.runtime) === null || _e === void 0 ? void 0 : _e.sandbox.isBroken(part.id)) !== null && _f !== void 0 ? _f : false;
            c.rotate(a);
            c.fillStyle = "#fff9db";
            if (broken) {
                c.beginPath();
                c.moveTo(-15, 20);
                c.lineTo(-15, 0);
                c.lineTo(-8, -6);
                c.lineTo(0, 2);
                c.lineTo(8, -6);
                c.lineTo(15, 0);
                c.lineTo(15, 20);
                c.closePath();
                c.fill();
                c.stroke();
                c.fillStyle = "#ffd43b";
                c.beginPath();
                c.ellipse(28, 18, 14, 5, 0, 0, Math.PI * 2);
                c.fill();
            }
            else {
                c.beginPath();
                c.ellipse(0, 0, 15, 20, 0, 0, Math.PI * 2);
                c.fill();
                c.stroke();
            }
            break;
        }
        case "sandbox.toy-animal":
            c.rotate(a);
            c.fillStyle = "#e9b383";
            c.beginPath();
            c.roundRect(-28, -10, 50, 24, 10);
            c.fill();
            c.stroke();
            c.beginPath();
            c.arc(24, -12, 12, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = INK;
            c.beginPath();
            c.arc(28, -14, 2.5, 0, Math.PI * 2);
            c.fill();
            break;
        case "sandbox.sprocket":
            c.rotate(a);
            c.fillStyle = "#adb5bd";
            c.beginPath();
            c.roundRect(-32, -12, 54, 28, 10);
            c.fill();
            c.stroke();
            c.fillStyle = "#ced4da";
            c.beginPath();
            c.roundRect(14, -26, 26, 24, 8);
            c.fill();
            c.stroke();
            c.fillStyle = "#63e6be";
            c.beginPath();
            c.arc(30, -16, 4, 0, Math.PI * 2);
            c.fill();
            break;
        case "sandbox.ice-floor":
            c.fillStyle = "#d0ebffcc";
            c.fillRect(-770, -6, 1540, 12);
            c.strokeStyle = "#74c0fc";
            c.lineWidth = 2;
            for (let k = -760; k < 760; k += 90) {
                c.beginPath();
                c.moveTo(k, -3);
                c.lineTo(k + 30, 3);
                c.stroke();
            }
            break;
        case "sandbox.wind-zone": {
            c.shadowBlur = 0;
            const w = Number((_g = part.parameters.width) !== null && _g !== void 0 ? _g : 6) * 100, h = Number((_h = part.parameters.height) !== null && _h !== void 0 ? _h : 4) * 100, ang = Number((_j = part.parameters.angle) !== null && _j !== void 0 ? _j : 0);
            c.strokeStyle = "#a5d8ffaa";
            c.lineWidth = 3;
            const off = (ctx.time * 160) % 120;
            for (let r = -h / 2 + 30; r < h / 2; r += 70)
                for (let k = -w / 2 + off; k < w / 2; k += 120) {
                    c.save();
                    c.rotate(ang);
                    c.beginPath();
                    c.moveTo(k, r);
                    c.quadraticCurveTo(k + 25, r - 8, k + 50, r);
                    c.stroke();
                    c.restore();
                }
            break;
        }
        case "sandbox.moving-platform":
            c.fillStyle = "#ffa94d";
            c.beginPath();
            c.roundRect(-100, -12, 200, 24, 6);
            c.fill();
            c.stroke();
            c.fillStyle = INK;
            c.font = "900 16px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("⟷", 0, 1);
            break;
        case "sandbox.water-area": {
            c.shadowBlur = 0;
            const w = Number((_k = part.parameters.width) !== null && _k !== void 0 ? _k : 4) * 100, h = Number((_l = part.parameters.height) !== null && _l !== void 0 ? _l : 1.5) * 100;
            c.fillStyle = "#4dabf766";
            c.fillRect(-w / 2, -h / 2, w, h);
            c.strokeStyle = "#e7f5ff";
            c.lineWidth = 3;
            for (let k = -w / 2; k < w / 2; k += 40) {
                c.beginPath();
                c.arc(k + 20, -h / 2 + 4 + Math.sin(ctx.time * 3 + k) * 2, 12, Math.PI * 1.1, Math.PI * 1.9);
                c.stroke();
            }
            break;
        }
        case "sandbox.rain": {
            c.restore();
            c.save();
            c.strokeStyle = "#74c0fc88";
            c.lineWidth = 2;
            for (let i = 0; i < 120; i++) {
                const rx = (i * 137) % 1600, ry = ((i * 61) + ctx.time * 700) % 840;
                c.beginPath();
                c.moveTo(rx, ry);
                c.lineTo(rx - 6, ry + 20);
                c.stroke();
            }
            break;
        }
        case "sandbox.sign": {
            c.shadowBlur = 0;
            const text = String((_m = part.parameters.text) !== null && _m !== void 0 ? _m : "");
            c.font = "800 16px system-ui";
            const w = c.measureText(text).width + 20;
            c.fillStyle = "#fff9db";
            c.beginPath();
            c.roundRect(-w / 2, -16, w, 32, 8);
            c.fill();
            c.lineWidth = 3;
            c.stroke();
            c.fillStyle = INK;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(text, 0, 1);
            break;
        }
        case "sandbox.power-limit":
            c.fillStyle = "#ffe3e3";
            c.beginPath();
            c.roundRect(-40, -18, 80, 36, 8);
            c.fill();
            c.stroke();
            c.fillStyle = INK;
            c.font = "800 13px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(`🪫 ${Number((_o = part.parameters.capacity) !== null && _o !== void 0 ? _o : 40)}`, 0, 1);
            break;
        case "magnetic.reed-switch": {
            const on = (_q = (_p = ctx.runtime) === null || _p === void 0 ? void 0 : _p.buttonPressed(part.id)) !== null && _q !== void 0 ? _q : false;
            c.fillStyle = "#e7f5ffcc";
            c.beginPath();
            c.roundRect(-42, -10, 84, 20, 10);
            c.fill();
            c.stroke();
            c.strokeStyle = "#868e96";
            c.lineWidth = 4;
            c.beginPath();
            c.moveTo(-34, 0);
            c.lineTo(-4, 0);
            c.moveTo(34, 0);
            c.lineTo(on ? 4 : 6, on ? 0 : -6);
            c.stroke();
            c.fillStyle = on ? "#40c057" : "#fa5252";
            c.beginPath();
            c.arc(0, -18, 5, 0, Math.PI * 2);
            c.fill();
            break;
        }
        default:
            c.restore();
            return false;
    }
    c.restore();
    return true;
}
