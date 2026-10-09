import { PROTOTYPE_PART_IDS } from "../content/prototypeParts.js";
import { drawPartPicture } from "./PartPictures.js";
/**
 * Hidden Prototype Lab parts (M33), drawn in code until their art arrives (docs/ART_NEEDED.md, Batch H).
 * Drawing only — every one of them moves and acts through the ordinary systems.
 */
const INK = "#203040";
export function isPrototypePart(def) { return PROTOTYPE_PART_IDS.has(def.id); }
/** Warning stripes, the prototype "look". */
function stripes(c, x, y, w, h) {
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    c.fillStyle = "#ffd43b";
    c.fillRect(x, y, w, h);
    c.fillStyle = INK;
    for (let s = x - h; s < x + w + h; s += 16) {
        c.beginPath();
        c.moveTo(s, y + h);
        c.lineTo(s + 8, y + h);
        c.lineTo(s + 8 + h, y);
        c.lineTo(s + h, y);
        c.closePath();
        c.fill();
    }
    c.restore();
    c.strokeStyle = INK;
    c.lineWidth = 3;
    c.strokeRect(x, y, w, h);
}
export function drawPrototypePart(c, part, def, selected, ctx) {
    const x = part.position.x * 100, y = part.position.y * 100;
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
    switch (def.id) {
        case "proto.super-spring": {
            c.save();
            c.rotate(part.rotation);
            const painted = drawPartPicture(c, ctx.art, def.id);
            c.restore();
            if (painted)
                break;
            // A fat red coil on a striped base, with a lightning badge.
            c.rotate(part.rotation);
            stripes(c, -40, 4, 80, 12);
            c.strokeStyle = "#e03131";
            c.lineWidth = 9;
            c.beginPath();
            for (let k = 0; k <= 6; k++) {
                const yy = 2 - k * 4.5;
                c.lineTo(k % 2 ? 26 : -26, yy);
            }
            c.stroke();
            c.fillStyle = "#e03131";
            c.strokeStyle = INK;
            c.lineWidth = 4;
            c.beginPath();
            c.roundRect(-34, -30, 68, 10, 5);
            c.fill();
            c.stroke();
            c.fillStyle = "#ffd43b";
            c.beginPath();
            c.moveTo(4, -48);
            c.lineTo(-8, -34);
            c.lineTo(0, -34);
            c.lineTo(-4, -22);
            c.lineTo(10, -38);
            c.lineTo(2, -38);
            c.closePath();
            c.fill();
            c.lineWidth = 2;
            c.stroke();
            break;
        }
        case "proto.worm-gear": {
            if (drawPartPicture(c, ctx.art, def.id))
                break;
            // A screw: a short barrel with slanted threads that slide along as it turns.
            const turn = ctx.gearAngle(part.id);
            c.fillStyle = "#adb5bd";
            c.beginPath();
            c.roundRect(-26, -11, 52, 22, 8);
            c.fill();
            c.stroke();
            c.save();
            c.beginPath();
            c.roundRect(-26, -11, 52, 22, 8);
            c.clip();
            c.strokeStyle = "#495057";
            c.lineWidth = 4;
            const off = (((turn / (Math.PI * 2)) * 12) % 12 + 12) % 12;
            for (let sx = -40 + off; sx < 40; sx += 12) {
                c.beginPath();
                c.moveTo(sx, 11);
                c.lineTo(sx + 8, -11);
                c.stroke();
            }
            c.restore();
            c.fillStyle = INK;
            c.beginPath();
            c.arc(0, 0, 4, 0, Math.PI * 2);
            c.fill();
            break;
        }
        case "proto.reverse-drum": {
            // A drum with a big backwards arrow (it drives its belt the other way).
            const a = ctx.gearAngle(part.id);
            c.save();
            c.rotate(a);
            c.fillStyle = "#fd7e14";
            c.beginPath();
            c.arc(0, 0, 18, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.strokeStyle = INK;
            c.lineWidth = 3;
            c.beginPath();
            c.moveTo(-18, 0);
            c.lineTo(18, 0);
            c.stroke();
            c.restore();
            c.strokeStyle = "#e8590c";
            c.lineWidth = 5;
            c.beginPath();
            c.arc(0, 0, 30, Math.PI * 1.15, Math.PI * 1.85);
            c.stroke();
            c.fillStyle = "#e8590c";
            c.beginPath();
            c.moveTo(-26, -20);
            c.lineTo(-36, -4);
            c.lineTo(-18, -8);
            c.closePath();
            c.fill();
            if (part.parameters.locked === true) {
                c.fillStyle = INK;
                c.font = "900 15px system-ui";
                c.textAlign = "center";
                c.fillText("●", 0, 5);
            }
            break;
        }
        case "proto.bubble-blower": {
            // A wand on a little motor box, pointing the way it blows, with bubbles drifting out while it runs.
            c.rotate(part.rotation);
            c.fillStyle = "#f783ac";
            c.beginPath();
            c.roundRect(-34, -18, 40, 36, 8);
            c.fill();
            c.stroke();
            c.strokeStyle = INK;
            c.lineWidth = 4;
            c.beginPath();
            c.moveTo(6, 0);
            c.lineTo(24, 0);
            c.stroke();
            c.fillStyle = "#e7f5ff";
            c.beginPath();
            c.arc(34, 0, 11, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            if (ctx.runtime) {
                c.lineWidth = 2;
                c.strokeStyle = "#74c0fc";
                for (let k = 0; k < 6; k++) {
                    const t = (ctx.time * 0.8 + k / 6) % 1;
                    const bx = 48 + t * 300, by = Math.sin((t + k) * 9) * (10 + t * 60), r = 5 + (k % 3) * 3;
                    c.globalAlpha = 1 - t;
                    c.beginPath();
                    c.arc(bx, by, r, 0, Math.PI * 2);
                    c.stroke();
                }
                c.globalAlpha = 1;
            }
            break;
        }
        case "proto.memory-chip": {
            // A chip with gold legs. It glows once the chain reaches it.
            const lit = ctx.runtime?.chain.mechState(part.id)?.fired === true;
            if (lit) {
                c.shadowColor = "#63e6be";
                c.shadowBlur = 30;
            }
            c.fillStyle = lit ? "#63e6be" : "#343a40";
            c.beginPath();
            c.roundRect(-26, -22, 52, 44, 6);
            c.fill();
            c.stroke();
            c.shadowBlur = 0;
            c.strokeStyle = "#fcc419";
            c.lineWidth = 4;
            for (let k = -2; k <= 2; k++) {
                c.beginPath();
                c.moveTo(k * 9, -22);
                c.lineTo(k * 9, -32);
                c.moveTo(k * 9, 22);
                c.lineTo(k * 9, 32);
                c.stroke();
            }
            c.fillStyle = lit ? INK : "#ced4da";
            c.font = "900 15px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(lit ? "★" : "?", 0, 1);
            break;
        }
        default:
            c.restore();
            return false;
    }
    c.restore();
    return true;
}
