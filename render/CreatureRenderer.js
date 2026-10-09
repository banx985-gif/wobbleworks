import { creatureBehaviour } from "../creatures/CreatureSystem.js";
import { musicBehaviour } from "../music/MusicSystem.js";
import { drawPartPicture } from "./PartPictures.js";
/** Creature & Music Machines drawing (M29). The claw, creature motor, drum, chimes and tone block are painted (PartPictures.ts); the rest is code-drawn (docs/ART_NEEDED.md). Drawing only. */
const INK = "#203040";
export function isCreatureOrMusicPart(def) { return Boolean(creatureBehaviour(def) || (musicBehaviour(def) && musicBehaviour(def).family !== "HORN" && musicBehaviour(def).family !== "TIMER")); }
export function creatureLayer(def) { var _a; const c = creatureBehaviour(def); if (c)
    return c.part === "BODY" ? 3 : c.part === "SEGMENT" ? 2.5 : 3.5; return ((_a = musicBehaviour(def)) === null || _a === void 0 ? void 0 : _a.family) === "BEATER" ? 2 : 0.5; }
const COLOURS = { frog: "#69db7c", bird: "#74c0fc", crab: "#ff8787", bug: "#b197fc", spider: "#495057", dino: "#82c91e" };
const colourOf = (p) => { var _a, _b, _c; return (_c = COLOURS[(_b = ((_a = p.tags) !== null && _a !== void 0 ? _a : []).map(t => t.replace("creature.", "")).find(t => COLOURS[t])) !== null && _b !== void 0 ? _b : ""]) !== null && _c !== void 0 ? _c : "#ffa94d"; };
export function drawCreatureOrMusicPart(c, part, def, selected, ctx) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const cr = creatureBehaviour(def);
    const rt = ctx.runtime;
    const owner = rt === null || rt === void 0 ? void 0 : rt.creatures.ownerOf(part.id);
    const pose = cr && cr.part !== "BODY" && rt ? rt.creatures.clipPose(part.id, rt.physics) : undefined;
    const st = ctx.states.get(part.id);
    const x = ((_b = (_a = pose === null || pose === void 0 ? void 0 : pose.x) !== null && _a !== void 0 ? _a : st === null || st === void 0 ? void 0 : st.x) !== null && _b !== void 0 ? _b : part.position.x) * 100, y = ((_d = (_c = pose === null || pose === void 0 ? void 0 : pose.y) !== null && _c !== void 0 ? _c : st === null || st === void 0 ? void 0 : st.y) !== null && _d !== void 0 ? _d : part.position.y) * 100;
    const view = rt && ((cr === null || cr === void 0 ? void 0 : cr.part) === "BODY" ? rt.creatures.view(part.id, rt.physics) : owner ? rt.creatures.view(owner, rt.physics) : undefined);
    const tilt = (_e = view === null || view === void 0 ? void 0 : view.tilt) !== null && _e !== void 0 ? _e : 0, phase = (_f = view === null || view === void 0 ? void 0 : view.phase) !== null && _f !== void 0 ? _f : 0;
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
    if (cr) {
        c.rotate(tilt);
        switch (cr.part) {
            case "BODY": {
                const col = colourOf(part);
                c.fillStyle = col;
                c.beginPath();
                c.roundRect(-60, -22, 120, 44, 20);
                c.fill();
                c.stroke();
                c.fillStyle = "#fff";
                c.beginPath();
                c.arc(42, -12, 11, 0, Math.PI * 2);
                c.fill();
                c.stroke();
                c.fillStyle = INK;
                c.beginPath();
                c.arc(45, -12, 4.5, 0, Math.PI * 2);
                c.fill();
                if (view === null || view === void 0 ? void 0 : view.heavy) {
                    c.fillStyle = "#e03131";
                    c.font = "900 18px system-ui";
                    c.textAlign = "center";
                    c.fillText("too heavy!", 0, -34);
                }
                break;
            }
            case "LEG":
            case "BIG_LEG": {
                const len = cr.part === "BIG_LEG" ? 90 : 55;
                const swing = (view === null || view === void 0 ? void 0 : view.walking) ? Math.sin(phase + (part.position.x % 1) * 3) * 0.45 : 0;
                c.rotate(swing);
                c.lineWidth = cr.part === "BIG_LEG" ? 14 : 8;
                c.strokeStyle = owner ? INK : "#495057";
                c.beginPath();
                c.moveTo(0, -8);
                c.lineTo(0, len - 10);
                c.stroke();
                c.fillStyle = "#868e96";
                c.beginPath();
                c.ellipse(6, len - 8, cr.part === "BIG_LEG" ? 16 : 10, 6, 0, 0, Math.PI * 2);
                c.fill();
                break;
            }
            case "SPRING_LEG": {
                c.strokeStyle = "#e64980";
                c.lineWidth = 5;
                c.beginPath();
                for (let k = 0; k <= 6; k++) {
                    const yy = -6 + k * 7;
                    c.lineTo(k % 2 ? 10 : -10, yy);
                }
                c.stroke();
                c.fillStyle = "#868e96";
                c.strokeStyle = INK;
                c.lineWidth = 3;
                c.beginPath();
                c.roundRect(-14, 36, 28, 8, 4);
                c.fill();
                c.stroke();
                break;
            }
            case "WING": {
                const flap = rt && owner ? Math.sin(phase) * 0.7 : 0.2;
                c.rotate(-0.3 - flap);
                c.fillStyle = "#e7f5ff";
                c.beginPath();
                c.moveTo(0, 0);
                c.quadraticCurveTo(-20, -60, -70, -54);
                c.quadraticCurveTo(-40, -20, 0, 0);
                c.fill();
                c.stroke();
                break;
            }
            case "CLAW": {
                const closed = Boolean(view === null || view === void 0 ? void 0 : view.grabbed);
                c.save();
                if (closed)
                    c.scale(1, 0.8);
                const painted = drawPartPicture(c, ctx.art, def.id);
                c.restore();
                if (painted)
                    break;
                c.fillStyle = "#fa5252";
                c.beginPath();
                c.roundRect(-10, -8, 24, 16, 6);
                c.fill();
                c.stroke();
                for (const s of [-1, 1]) {
                    c.save();
                    c.rotate(s * (closed ? 0.15 : 0.55));
                    c.beginPath();
                    c.moveTo(12, 0);
                    c.quadraticCurveTo(34, s * 4, 40, s * 16);
                    c.stroke();
                    c.restore();
                }
                break;
            }
            case "SEGMENT": {
                c.fillStyle = owner ? "#b197fc" : "#d0bfff";
                c.beginPath();
                c.ellipse(0, 0, 28, 20, 0, 0, Math.PI * 2);
                c.fill();
                c.stroke();
                c.strokeStyle = "#7048e8";
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(-6, -18);
                c.lineTo(-6, 18);
                c.moveTo(8, -18);
                c.lineTo(8, 18);
                c.stroke();
                break;
            }
            case "MOTOR": {
                if (drawPartPicture(c, ctx.art, def.id))
                    break;
                c.fillStyle = "#adb5bd";
                c.beginPath();
                c.roundRect(-16, -12, 32, 24, 6);
                c.fill();
                c.stroke();
                c.save();
                c.rotate((view === null || view === void 0 ? void 0 : view.walking) ? ctx.time * 8 : 0);
                c.fillStyle = "#fab005";
                c.beginPath();
                for (let k = 0; k < 8; k++) {
                    const a = k * Math.PI / 4;
                    c.lineTo(Math.cos(a) * 9, Math.sin(a) * 9);
                    c.lineTo(Math.cos(a + 0.4) * 6, Math.sin(a + 0.4) * 6);
                }
                c.closePath();
                c.fill();
                c.restore();
                break;
            }
        }
    }
    else {
        const m = musicBehaviour(def);
        const last = rt === null || rt === void 0 ? void 0 : rt.music.notes.filter(n => n.instrumentId === part.id).pop();
        const ringing = last && rt ? rt.tick - last.tick < 12 : false;
        if (ringing) {
            c.shadowColor = "#ffd43b";
            c.shadowBlur = 24;
        }
        const label = (t) => { c.shadowBlur = 0; c.fillStyle = INK; c.font = "800 13px system-ui"; c.textAlign = "center"; c.fillText(t, 0, 44); };
        switch (m.family) {
            case "DRUM":
                if (drawPartPicture(c, ctx.art, def.id)) {
                    label(`♪${Number((_g = part.parameters.note) !== null && _g !== void 0 ? _g : 1)}`);
                    break;
                }
                c.fillStyle = "#ff8787";
                c.beginPath();
                c.roundRect(-28, -16, 56, 36, 8);
                c.fill();
                c.stroke();
                c.fillStyle = "#fff4e6";
                c.beginPath();
                c.ellipse(0, -16, 28, 9, 0, 0, Math.PI * 2);
                c.fill();
                c.stroke();
                label(`♪${Number((_h = part.parameters.note) !== null && _h !== void 0 ? _h : 1)}`);
                break;
            case "CHIME":
                if (drawPartPicture(c, ctx.art, def.id)) {
                    label(`♪${Number((_j = part.parameters.note) !== null && _j !== void 0 ? _j : 1)}`);
                    break;
                }
                c.strokeStyle = "#868e96";
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(-26, -34);
                c.lineTo(26, -34);
                c.stroke();
                for (const [k, h] of [[-18, 52], [-6, 44], [6, 36], [18, 28]]) {
                    const sway = ringing ? Math.sin(ctx.time * 20 + k) * 3 : 0;
                    c.fillStyle = "#e9ecef";
                    c.strokeStyle = INK;
                    c.beginPath();
                    c.roundRect(k - 4 + sway, -32, 8, h, 3);
                    c.fill();
                    c.stroke();
                }
                label(`♪${Number((_k = part.parameters.note) !== null && _k !== void 0 ? _k : 1)}`);
                break;
            case "TONE_BLOCK":
                if (drawPartPicture(c, ctx.art, def.id)) {
                    label(`♪${Number((_l = part.parameters.note) !== null && _l !== void 0 ? _l : 1)}`);
                    break;
                }
                c.fillStyle = "#c08552";
                c.beginPath();
                c.roundRect(-26, -12, 52, 24, 6);
                c.fill();
                c.stroke();
                c.fillStyle = INK;
                c.beginPath();
                c.roundRect(-18, -2, 36, 5, 2);
                c.fill();
                label(`♪${Number((_m = part.parameters.note) !== null && _m !== void 0 ? _m : 1)}`);
                break;
            case "BEATER": {
                const a = ctx.gearAngle(part.id);
                c.save();
                c.rotate(a);
                c.strokeStyle = "#8d6e63";
                c.lineWidth = 6;
                c.beginPath();
                c.moveTo(0, 0);
                c.lineTo(46, 0);
                c.stroke();
                c.fillStyle = "#e64980";
                c.strokeStyle = INK;
                c.lineWidth = 3;
                c.beginPath();
                c.arc(50, 0, 11, 0, Math.PI * 2);
                c.fill();
                c.stroke();
                c.restore();
                c.fillStyle = INK;
                c.beginPath();
                c.arc(0, 0, 6, 0, Math.PI * 2);
                c.fill();
                break;
            }
            default:
                c.restore();
                return false;
        }
    }
    c.restore();
    return true;
}
