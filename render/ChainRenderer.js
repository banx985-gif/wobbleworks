import { chainThing } from "../chain/ChainSystem.js";
/**
 * Chain Reaction Workshop drawing (M21). Code-drawn behind each part id until the chain art arrives
 * (docs/ART_NEEDED.md, Batch C). Drawing only. 100 px per metre.
 */
const INK = "#203040";
export function isChainPart(def) { return chainThing(def) !== undefined; }
export function chainLayer(def) { const t = chainThing(def); return t === "DOMINO" || t === "CANNON" ? 3.5 : t === "SEESAW" ? 0.5 : -1; }
export function drawChainPart(c, part, def, selected, ctx) {
    const thing = chainThing(def);
    if (!thing)
        return false;
    const x = part.position.x * 100, y = part.position.y * 100;
    const mech = ctx.chain?.mechState(part.id);
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
    switch (thing) {
        case "DOMINO": {
            const d = ctx.chain?.dominoState(part.id);
            const dir = d?.dir ?? (Number(part.parameters.dir ?? 1) < 0 ? -1 : 1);
            const fall = (d?.progress ?? 0) * 1.42 * dir;
            c.translate(dir * 8, 45);
            c.rotate(fall);
            c.fillStyle = "#f8f9fa";
            c.beginPath();
            c.roundRect(-8, -90, 16, 90, 4);
            c.fill();
            c.stroke();
            c.fillStyle = INK;
            for (const yy of [-70, -45, -20]) {
                c.beginPath();
                c.arc(0, yy, 3, 0, Math.PI * 2);
                c.fill();
            }
            if (!d) {
                c.rotate(-fall);
                c.strokeStyle = "#ffa94d";
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(0, -100);
                c.lineTo(dir * 18, -100);
                c.lineTo(dir * 12, -106);
                c.moveTo(dir * 18, -100);
                c.lineTo(dir * 12, -94);
                c.stroke();
            }
            break;
        }
        case "BELL": {
            const ring = mech?.fired && mech.ago < 1.2 ? Math.sin(ctx.time * 30) * 0.35 * (1.2 - mech.ago) : 0;
            c.strokeStyle = INK;
            c.beginPath();
            c.moveTo(0, -36);
            c.lineTo(0, -28);
            c.stroke();
            c.rotate(ring);
            c.fillStyle = "#fcc419";
            c.beginPath();
            c.moveTo(-24, 18);
            c.quadraticCurveTo(-24, -28, 0, -28);
            c.quadraticCurveTo(24, -28, 24, 18);
            c.closePath();
            c.fill();
            c.stroke();
            c.fillStyle = "#e67700";
            c.beginPath();
            c.arc(0, 22, 6, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            if (ring) {
                c.rotate(-ring);
                c.strokeStyle = "#fab005";
                c.lineWidth = 3;
                for (const s of [-1, 1]) {
                    c.beginPath();
                    c.arc(0, -4, 36, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5);
                    c.stroke();
                }
            }
            break;
        }
        case "SEESAW": {
            const side = String(part.parameters.launch ?? "right") === "left" ? -1 : 1;
            const tilt = mech?.fired ? -0.22 * side : 0.22 * side;
            c.fillStyle = "#868e96";
            c.beginPath();
            c.moveTo(-18, 8);
            c.lineTo(18, 8);
            c.lineTo(0, -8);
            c.closePath();
            c.fill();
            c.stroke();
            c.rotate(tilt);
            c.fillStyle = "#e8590c";
            c.beginPath();
            c.roundRect(-100, -16, 200, 12, 5);
            c.fill();
            c.stroke();
            break;
        }
        case "TRAPDOOR": {
            const open = mech?.fired ?? false;
            c.fillStyle = "#adb5bd";
            c.fillRect(-52, -6, 10, 18);
            c.strokeRect(-52, -6, 10, 18);
            c.save();
            c.translate(-42, 0);
            c.rotate(open ? 1.3 : 0);
            c.fillStyle = "#a0522d";
            c.beginPath();
            c.roundRect(0, -6, 84, 12, 4);
            c.fill();
            c.stroke();
            c.restore();
            c.fillStyle = "#e03131";
            c.beginPath();
            c.arc(46, 0, 8, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            break;
        }
        case "CANNON": {
            const a = part.rotation - Math.PI / 4;
            c.fillStyle = "#495057";
            c.beginPath();
            c.arc(0, 20, 26, Math.PI, 0);
            c.closePath();
            c.fill();
            c.stroke();
            c.save();
            c.rotate(a);
            c.fillStyle = "#4dabf7";
            c.beginPath();
            c.roundRect(-12, -20, 64, 40, 10);
            c.fill();
            c.stroke();
            c.restore();
            if (mech?.fired && mech.ago < 0.6) {
                c.fillStyle = "#ffe066";
                c.beginPath();
                c.arc(Math.cos(a) * 60, Math.sin(a) * 60, 22 * (1 - mech.ago), 0, Math.PI * 2);
                c.fill();
            }
            if (typeof part.parameters.link === "string" && !ctx.chain) {
                c.fillStyle = INK;
                c.font = "800 11px system-ui";
                c.textAlign = "center";
                c.fillText("linked", 0, 60);
            }
            break;
        }
        case "CONFETTI": {
            c.strokeStyle = "#e64980";
            c.lineWidth = 8;
            c.setLineDash([14, 10]);
            c.beginPath();
            c.arc(0, 0, 38, 0, Math.PI * 2);
            c.stroke();
            c.setLineDash([]);
            if (mech?.fired && mech.ago < 2.5) {
                const k = mech.ago;
                const colours = ["#ff6b6b", "#ffd43b", "#69db7c", "#4dabf7", "#da77f2"];
                for (let i = 0; i < 40; i++) {
                    const ang = i * 2.4, sp = 60 + (i % 7) * 18;
                    c.fillStyle = colours[i % colours.length];
                    c.fillRect(Math.cos(ang) * sp * k, Math.sin(ang) * sp * k + 80 * k * k, 8, 5);
                }
            }
            break;
        }
        case "COUNTER": {
            const n = ctx.chain ? ctx.chain.longest() : undefined;
            c.fillStyle = "#212529";
            c.beginPath();
            c.roundRect(-70, -36, 140, 72, 12);
            c.fill();
            c.stroke();
            c.fillStyle = "#ffd43b";
            c.font = "900 15px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("CHAIN", 0, -16);
            c.font = "900 30px system-ui";
            c.fillStyle = n ? "#69db7c" : "#adb5bd";
            c.fillText(n === undefined ? "—" : String(n), 0, 14);
            break;
        }
    }
    c.restore();
    return true;
}
/** Arrows from cause to effect for the steps the counter has just counted, newest brightest, each numbered. */
export function drawChainEdges(c, runtime, parts) {
    const chain = runtime.chain;
    if (!chain.active || !chain.edges.length)
        return;
    const at = (id) => { try {
        const s = runtime.physics.state(id);
        return { x: s.x, y: s.y };
    }
    catch {
        return parts.find(p => p.id === id)?.position;
    } };
    const now = runtime.tick;
    c.save();
    c.lineCap = "round";
    for (const e of chain.edges.slice(-24)) {
        const age = (now - e.tick) / 60;
        const a = Math.max(0.15, 1 - age / 6);
        const p = at(e.causeId), q = at(e.effectId);
        if (!p || !q)
            continue;
        const x1 = p.x * 100, y1 = p.y * 100, x2 = q.x * 100, y2 = q.y * 100;
        const len = Math.hypot(x2 - x1, y2 - y1);
        if (len < 4)
            continue;
        c.globalAlpha = a;
        c.strokeStyle = "#ff922b";
        c.lineWidth = 5;
        c.setLineDash([10, 8]);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.setLineDash([]);
        const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
        c.fillStyle = "#ff922b";
        c.beginPath();
        c.moveTo(x2 - ux * 18, y2 - uy * 18);
        c.lineTo(x2 - ux * 32 - uy * 9, y2 - uy * 32 + ux * 9);
        c.lineTo(x2 - ux * 32 + uy * 9, y2 - uy * 32 - ux * 9);
        c.closePath();
        c.fill();
        c.fillStyle = "#fff";
        c.strokeStyle = "#203040";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(x2, y2 - 34, 14, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = "#203040";
        c.font = "900 14px system-ui";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(String(e.depth), x2, y2 - 33);
    }
    c.restore();
}
