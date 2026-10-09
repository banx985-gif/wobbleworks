import { creatureBehaviour } from "../creatures/CreatureSystem.js";
import { musicBehaviour } from "../music/MusicSystem.js";
import { drawPartPicture } from "./PartPictures.js";
/** Creature & Music Machines drawing (M29). Code-drawn behind each part id (docs/ART_NEEDED.md, Batch M). Drawing only. */
const INK = "#203040";
export function isCreatureOrMusicPart(def) { return Boolean(creatureBehaviour(def) || (musicBehaviour(def) && musicBehaviour(def).family !== "HORN" && musicBehaviour(def).family !== "TIMER")); }
export function creatureLayer(def) { const c = creatureBehaviour(def); if (c)
    return c.part === "BODY" ? 3 : c.part === "SEGMENT" ? 2.5 : 3.5; return musicBehaviour(def)?.family === "BEATER" ? 2 : 0.5; }
const COLOURS = { frog: "#69db7c", bird: "#74c0fc", crab: "#ff8787", bug: "#b197fc", spider: "#495057", dino: "#82c91e" };
const colourOf = (p) => COLOURS[(p.tags ?? []).map(t => t.replace("creature.", "")).find(t => COLOURS[t]) ?? ""] ?? "#ffa94d";
export function drawCreatureOrMusicPart(c, part, def, selected, ctx) {
    const cr = creatureBehaviour(def);
    const rt = ctx.runtime;
    const owner = rt?.creatures.ownerOf(part.id);
    const pose = cr && cr.part !== "BODY" && rt ? rt.creatures.clipPose(part.id, rt.physics) : undefined;
    const st = ctx.states.get(part.id);
    const x = (pose?.x ?? st?.x ?? part.position.x) * 100, y = (pose?.y ?? st?.y ?? part.position.y) * 100;
    const view = rt && (cr?.part === "BODY" ? rt.creatures.view(part.id, rt.physics) : owner ? rt.creatures.view(owner, rt.physics) : undefined);
    const tilt = view?.tilt ?? 0, phase = view?.phase ?? 0;
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
                if (view?.heavy) {
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
                const swing = view?.walking ? Math.sin(phase + (part.position.x % 1) * 3) * 0.45 : 0;
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
                const closed = Boolean(view?.grabbed);
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
                c.fillStyle = "#adb5bd";
                c.beginPath();
                c.roundRect(-16, -12, 32, 24, 6);
                c.fill();
                c.stroke();
                c.save();
                c.rotate(view?.walking ? ctx.time * 8 : 0);
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
        const last = rt?.music.notes.filter(n => n.instrumentId === part.id).pop();
        const ringing = last && rt ? rt.tick - last.tick < 12 : false;
        if (ringing) {
            c.shadowColor = "#ffd43b";
            c.shadowBlur = 24;
        }
        const label = (t) => { c.shadowBlur = 0; c.fillStyle = INK; c.font = "800 13px system-ui"; c.textAlign = "center"; c.fillText(t, 0, 44); };
        switch (m.family) {
            case "DRUM":
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
                label(`♪${Number(part.parameters.note ?? 1)}`);
                break;
            case "CHIME":
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
                label(`♪${Number(part.parameters.note ?? 1)}`);
                break;
            case "TONE_BLOCK":
                c.fillStyle = "#c08552";
                c.beginPath();
                c.roundRect(-26, -12, 52, 24, 6);
                c.fill();
                c.stroke();
                c.fillStyle = INK;
                c.beginPath();
                c.roundRect(-18, -2, 36, 5, 2);
                c.fill();
                label(`♪${Number(part.parameters.note ?? 1)}`);
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
