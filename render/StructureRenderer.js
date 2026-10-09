import { analyzeStructure, beamEndpoints } from "../structures/StructureSystem.js";
/**
 * Code-drawn Builder Bay pieces (M13), behind their named ids until the structure art arrives
 * (docs/ART_NEEDED.md, "Batch S — Builder Bay"). 100 px per metre.
 */
const INK = "#203040";
export function structureKind(def) {
    return def.behaviours.find(b => ["BEAM", "STRUCT_ANCHOR", "STRUCT_GROUND", "CHASM", "TRAVELLER", "STRUCT_LOAD", "EGG", "WIND"].includes(b.kind))?.kind;
}
/** Draw order inside a structure scene: ground first, then beams, then the things on them. */
export function structureLayer(def) {
    const k = structureKind(def);
    return k === "CHASM" || k === "STRUCT_GROUND" ? 0 : k === "STRUCT_ANCHOR" ? 1 : k === "BEAM" ? 2 : 4;
}
/**
 * Painted structure pieces (9 Oct art, assets/parts/structure.*). Each picture is laid along its member:
 * long pictures for long members, the yellow connector bar for braces, the post for columns. Drawing only.
 */
export function beamArtId(definitionId, material, lengthPx) {
    if (definitionId === "builder.brace")
        return "structure.connector-bar";
    if (definitionId === "builder.column")
        return "structure.post";
    if (material === "WOOD")
        return lengthPx >= 150 ? "structure.beam-wood-long" : "structure.beam-wood-short";
    if (material === "METAL")
        return lengthPx >= 150 ? "structure.beam-metal-long" : "structure.beam-metal-short";
    return undefined;
}
/** Thickness of a member picture on screen (px): chunky enough to read, thin enough to see the shape. */
export function beamArtThickness(definitionId, thicknessPx) { return definitionId === "builder.column" ? Math.max(36, thicknessPx * 2.2) : definitionId === "builder.brace" ? 24 : Math.max(30, thicknessPx * 2.4); }
function drawMemberArt(c, img, id, len, h, broken) {
    const draw = (x0, w, dy) => {
        // The post picture stands upright, so it is turned a quarter to lie along the member (its length runs end to end).
        if (id === "builder.column") {
            c.save();
            c.translate(x0 + w / 2, dy);
            c.rotate(-Math.PI / 2);
            c.drawImage(img, -h / 2, -w / 2 - 6, h, w + 12);
            c.restore();
        }
        else
            c.drawImage(img, x0 - 6, -h / 2 + dy, w + 12, h);
    };
    if (!broken) {
        draw(0, len, 0);
        return;
    }
    for (const [x0, dy] of [[0, 0], [len * 0.52, 6]]) {
        c.save();
        c.beginPath();
        c.rect(x0 - 8, -h, len * 0.48 + 8, h * 2);
        c.clip();
        draw(0, len, dy);
        c.restore();
    }
}
function stressColour(r) { return r < 0.5 ? "#40c057" : r < 0.8 ? "#fab005" : "#e03131"; }
/** One Builder Bay part. False when the part isn't a structure part. */
export function drawStructurePart(c, part, def, selected, ctx) {
    const kind = structureKind(def);
    if (!kind)
        return false;
    const st = ctx.structures;
    const x = part.position.x * 100, y = part.position.y * 100;
    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    if (kind === "CHASM") {
        const w = Number(part.parameters.width ?? 4) * 100;
        const g = c.createLinearGradient(0, 520, 0, 900);
        g.addColorStop(0, "#5c3b1e");
        g.addColorStop(1, "#1c1006");
        c.fillStyle = g;
        c.fillRect(x - w / 2, 500, w, 420);
        c.fillStyle = "#4dabf7";
        c.fillRect(x - w / 2, 860, w, 40);
        c.strokeStyle = "#a5d8ff";
        c.lineWidth = 3;
        for (let k = 0; k < w; k += 40) {
            c.beginPath();
            c.moveTo(x - w / 2 + k, 870 + Math.sin(ctx.time * 2 + k) * 3);
            c.lineTo(x - w / 2 + k + 20, 870);
            c.stroke();
        }
    }
    else if (kind === "STRUCT_GROUND") {
        const w = Number(part.parameters.width ?? 4) * 100, h = Number(part.parameters.height ?? 3) * 100;
        c.fillStyle = "#c08f5f";
        c.strokeStyle = INK;
        c.lineWidth = 5;
        c.beginPath();
        c.roundRect(x - w / 2, y - h / 2, w, h, 8);
        c.fill();
        c.stroke();
        c.fillStyle = "#8fbf5a";
        c.fillRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, Math.min(16, h - 6));
        c.fillStyle = "#a8774a";
        for (let k = 20; k < w - 10; k += 46)
            for (let j = 40; j < h - 10; j += 52) {
                c.beginPath();
                c.ellipse(x - w / 2 + k + (j % 2) * 12, y - h / 2 + j, 9, 6, 0, 0, Math.PI * 2);
                c.fill();
            }
    }
    else if (kind === "STRUCT_ANCHOR" && ctx.art("structure.hinge")) {
        c.drawImage(ctx.art("structure.hinge"), x - 24, y - 20, 48, 42);
    }
    else if (kind === "STRUCT_ANCHOR") {
        c.fillStyle = "#868e96";
        c.strokeStyle = INK;
        c.lineWidth = 4;
        c.beginPath();
        c.roundRect(x - 14, y - 14, 28, 28, 6);
        c.fill();
        c.stroke();
        c.fillStyle = "#dee2e6";
        c.beginPath();
        c.arc(x, y, 6, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
    else if (kind === "BEAM") {
        drawBeam(c, part, def, selected, ctx);
    }
    else if (kind === "TRAVELLER") {
        const t = st?.traveller(part.id);
        const tx = (t?.x ?? part.position.x) * 100, ty = (t?.y ?? part.position.y) * 100;
        const b = def.behaviours.find(q => q.kind === "TRAVELLER");
        const who = b?.kind === "TRAVELLER" ? b.who : "BOLT";
        const bob = t?.started && !t.arrived && !t.fallen ? Math.abs(Math.sin(ctx.time * 8)) * 4 : 0;
        drawTraveller(c, who, tx, ty - bob, ctx.art, t?.fallen ?? false);
        if (t?.blocked) {
            c.font = "900 18px system-ui";
            c.textAlign = "center";
            c.fillStyle = "#e03131";
            c.fillText("BLOCKED!", tx, ty - 120);
        }
        if (!t || !t.started) {
            c.strokeStyle = "#1c7ed688";
            c.lineWidth = 4;
            c.setLineDash([8, 8]);
            const ex = Number(part.parameters.endX ?? part.position.x + 8) * 100;
            c.beginPath();
            c.moveTo(tx, ty - 120);
            c.lineTo(ex, ty - 120);
            c.stroke();
            c.setLineDash([]);
            c.fillStyle = "#1c7ed6";
            c.beginPath();
            c.moveTo(ex, ty - 120);
            c.lineTo(ex - 14, ty - 130);
            c.lineTo(ex - 14, ty - 110);
            c.closePath();
            c.fill();
        }
    }
    else if (kind === "STRUCT_LOAD") {
        const l = st?.load(part.id);
        const lx = (l?.x ?? part.position.x) * 100, ly = (l?.y ?? part.position.y) * 100;
        const grows = part.parameters.grow === true;
        const size = grows ? 30 + 30 * Math.min(1, (l?.applied ?? 0) / 30) : 34;
        c.fillStyle = grows ? "#495057" : "#d6a46a";
        c.strokeStyle = INK;
        c.lineWidth = 4;
        c.beginPath();
        c.roundRect(lx - size / 2, ly - size, size, size, grows ? 4 : 12);
        c.fill();
        c.stroke();
        c.fillStyle = "#fff";
        c.font = `900 ${grows ? 14 : 12}px system-ui`;
        c.textAlign = "center";
        c.fillText(grows ? `${Math.round(l?.applied ?? 0)}` : "SAND", lx, ly - size / 2 + 5);
        if (l?.done && part.parameters.grow === true) {
            c.fillStyle = INK;
            c.font = "900 16px system-ui";
            c.fillText(`held ${Math.round(l.held)}`, lx, ly - size - 12);
        }
    }
    else if (kind === "EGG") {
        const e = st?.egg(part.id);
        const ex = (e?.x ?? part.position.x) * 100, ey = (e?.y ?? part.position.y) * 100;
        const cracked = e?.landed && (e.impact ?? 0) > 4;
        c.fillStyle = "#fff9db";
        c.strokeStyle = INK;
        c.lineWidth = 3;
        c.beginPath();
        c.ellipse(ex, ey - 22, 17, 22, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        if (cracked) {
            c.strokeStyle = "#e03131";
            c.lineWidth = 3;
            c.beginPath();
            c.moveTo(ex - 12, ey - 26);
            c.lineTo(ex - 4, ey - 18);
            c.lineTo(ex + 3, ey - 28);
            c.lineTo(ex + 12, ey - 20);
            c.stroke();
            c.font = "900 16px system-ui";
            c.fillStyle = "#e03131";
            c.textAlign = "center";
            c.fillText("CRACK!", ex, ey - 56);
        }
        else if (e?.landed) {
            c.font = "900 16px system-ui";
            c.fillStyle = "#2f9e44";
            c.textAlign = "center";
            c.fillText("SAFE!", ex, ey - 56);
        }
    }
    else if (kind === "WIND") {
        c.strokeStyle = "#74c0fcaa";
        c.lineWidth = 6;
        for (let k = 0; k < 4; k++) {
            const off = ((ctx.time * 160 + k * 90) % 360);
            c.beginPath();
            c.moveTo(x - off, y + k * 40);
            c.bezierCurveTo(x - off - 40, y + k * 40 - 12, x - off - 80, y + k * 40 + 12, x - off - 120, y + k * 40);
            c.stroke();
        }
        c.fillStyle = "#1c7ed6";
        c.font = "900 16px system-ui";
        c.textAlign = "center";
        c.fillText("WIND ←", x, y - 20);
    }
    c.restore();
    return true;
}
function drawBeam(c, part, def, selected, ctx) {
    const e = beamEndpoints(part, def);
    if (!e)
        return;
    const b = def.behaviours.find(q => q.kind === "BEAM");
    if (b?.kind !== "BEAM")
        return;
    const st = ctx.structures;
    const ms = st?.memberState(part.id);
    let x1 = e.x1 * 100, y1 = e.y1 * 100, x2 = e.x2 * 100, y2 = e.y2 * 100;
    if (st) {
        const m = st.members.find(q => q.partId === part.id);
        if (m) {
            const da = st.jointDisplacement(m.a), db = st.jointDisplacement(m.b);
            const cl = (v) => Math.max(-0.8, Math.min(0.8, v)) * 100;
            x1 = st.layout.joints[m.a].x * 100 + cl(da.x);
            y1 = st.layout.joints[m.a].y * 100 + cl(da.y);
            x2 = st.layout.joints[m.b].x * 100 + cl(db.x);
            y2 = st.layout.joints[m.b].y * 100 + cl(db.y);
        }
        if (ms?.broken) {
            const at = st.brokenAtTick(part.id) ?? st.tick();
            const fall = Math.min(600, ((st.tick() - at) / 60) ** 2 * 490);
            y1 += fall;
            y2 += fall;
            c.globalAlpha = 0.55;
        }
    }
    const t = b.thickness * 100;
    const damage = Number(part.parameters.damage ?? 0);
    if (b.material === "ROPE") {
        const slack = ms && ms.mode !== "TENSION" ? 18 : 3;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + slack;
        c.strokeStyle = selected ? "#ffd43b" : "#8d5524";
        c.lineWidth = selected ? 9 : 6;
        c.beginPath();
        c.moveTo(x1, y1);
        c.quadraticCurveTo(mx, my, x2, y2);
        c.stroke();
        c.strokeStyle = "#e9c46a";
        c.lineWidth = 2;
        c.setLineDash([6, 6]);
        c.beginPath();
        c.moveTo(x1, y1);
        c.quadraticCurveTo(mx, my, x2, y2);
        c.stroke();
        c.setLineDash([]);
    }
    else {
        const ang = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1);
        c.save();
        c.translate(x1, y1);
        c.rotate(ang);
        const fill = b.material === "METAL" ? "#adb5bd" : "#d9a066";
        c.fillStyle = selected ? "#ffe066" : fill;
        c.strokeStyle = INK;
        c.lineWidth = selected ? 7 : 4;
        const artId = beamArtId(def.id, b.material, len);
        const img = artId ? ctx.art(artId) : undefined;
        if (img) {
            if (selected) {
                c.shadowColor = "#ffd43b";
                c.shadowBlur = 22;
            }
            drawMemberArt(c, img, def.id, len, beamArtThickness(def.id, t), ms?.broken ?? false);
            c.shadowBlur = 0;
        }
        else if (ms?.broken) {
            c.beginPath();
            c.roundRect(0, -t / 2, len * 0.48, t, 4);
            c.fill();
            c.stroke();
            c.beginPath();
            c.roundRect(len * 0.52, -t / 2 + 6, len * 0.48, t, 4);
            c.fill();
            c.stroke();
        }
        else {
            c.beginPath();
            c.roundRect(0, -t / 2, len, t, Math.min(6, t / 2));
            c.fill();
            c.stroke();
        }
        if (img) { /* painted */ }
        else if (b.material === "WOOD") {
            c.strokeStyle = "#a0693a";
            c.lineWidth = 2;
            for (let k = 12; k < len - 8; k += 26) {
                c.beginPath();
                c.moveTo(k, -t / 4);
                c.lineTo(k + 14, -t / 4 + 2);
                c.stroke();
            }
        }
        else {
            c.fillStyle = "#495057";
            for (let k = 10; k < len - 6; k += 24) {
                c.beginPath();
                c.arc(k, 0, 2.5, 0, Math.PI * 2);
                c.fill();
            }
        }
        if (damage > 0 && !ms?.broken) {
            c.strokeStyle = "#e03131";
            c.lineWidth = 3;
            const mx = len / 2;
            c.beginPath();
            c.moveTo(mx - 10, -t / 2);
            c.lineTo(mx, 0);
            c.lineTo(mx - 6, t / 2);
            c.stroke();
        }
        // Stress Scanner: colour by how close to breaking, with "pull" / "squash" marks.
        if (ctx.showStress && ms && !ms.broken) {
            c.strokeStyle = stressColour(ms.ratio);
            c.lineWidth = 6;
            c.globalAlpha = 0.85;
            c.beginPath();
            c.moveTo(4, 0);
            c.lineTo(len - 4, 0);
            c.stroke();
            c.globalAlpha = 1;
            if (ms.mode !== "NONE" && len > 60) {
                c.fillStyle = INK;
                c.font = "800 13px system-ui";
                c.textAlign = "center";
                c.save();
                c.translate(len / 2, -t / 2 - 8);
                if (Math.abs(ang) > Math.PI / 2)
                    c.rotate(Math.PI);
                c.fillText(`${ms.mode === "TENSION" ? "⟷ pull" : ms.mode === "COMPRESSION" ? "→← squash" : "slack"} ${Math.round(ms.ratio * 100)}%`, 0, 0);
                c.restore();
            }
        }
        else if (ms && !ms.broken && ms.ratio > 0.85) {
            c.strokeStyle = "#e03131";
            c.lineWidth = 3;
            c.setLineDash([4, 5]);
            c.beginPath();
            c.moveTo(4, 0);
            c.lineTo(len - 4, 0);
            c.stroke();
            c.setLineDash([]);
        }
        c.restore();
    }
    // Bolts at the ends (the painted pictures have their own end plates).
    if (b.material !== "ROPE" && ctx.art(beamArtId(def.id, b.material, Math.hypot(x2 - x1, y2 - y1)) ?? "")) {
        c.globalAlpha = 1;
        return;
    }
    c.globalAlpha = 1;
    c.fillStyle = "#495057";
    c.strokeStyle = INK;
    c.lineWidth = 2;
    for (const [px, py] of [[x1, y1], [x2, y2]]) {
        c.beginPath();
        c.arc(px, py, 6, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
}
function drawTraveller(c, who, x, y, art, fallen) {
    c.save();
    c.translate(x, y);
    if (fallen)
        c.rotate(0.6);
    c.strokeStyle = INK;
    c.lineWidth = 4;
    if (who === "ELEPHANT") {
        const img = art("toy.elephant");
        if (img)
            c.drawImage(img, -72, -140, 144, 140);
        else {
            c.fillStyle = "#74c0fc";
            c.beginPath();
            c.ellipse(0, -60, 70, 55, 0, 0, Math.PI * 2);
            c.fill();
            c.stroke();
        }
        c.fillStyle = "#495057";
        c.fillRect(-40, -12, 80, 12); // robot base plate
    }
    else if (who === "CART") {
        const img = art("motion.cart");
        if (img)
            c.drawImage(img, -55, -88, 110, 88);
        else {
            c.fillStyle = "#f08c00";
            c.fillRect(-50, -60, 100, 50);
            c.strokeRect(-50, -60, 100, 50);
        }
        c.fillStyle = "#495057";
        c.fillRect(-30, -96, 60, 30);
        c.strokeRect(-30, -96, 60, 30);
        c.fillStyle = "#fff";
        c.font = "900 12px system-ui";
        c.textAlign = "center";
        c.fillText("HEAVY", 0, -76);
    }
    else if (who === "BOLT" && art("char.bolt.wave")) {
        c.drawImage(art(fallen ? "char.bolt.panic" : "char.bolt.wave") ?? art("char.bolt.wave"), -40, -112, 80, 112);
    }
    else {
        // Parade robots (and Bolt if his pictures haven't loaded): code-drawn.
        const body = who === "ROBOT" ? "#9775fa" : "#ff922b";
        c.fillStyle = body;
        c.beginPath();
        c.roundRect(-30, -86, 60, 56, 16);
        c.fill();
        c.stroke();
        c.fillStyle = "#fffdf5";
        c.beginPath();
        c.roundRect(-22, -76, 44, 22, 8);
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        c.beginPath();
        c.arc(-9, -65, 5, 0, Math.PI * 2);
        c.arc(9, -65, 5, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.moveTo(0, -86);
        c.lineTo(0, -100);
        c.stroke();
        c.fillStyle = "#ffd43b";
        c.beginPath();
        c.arc(0, -104, 6, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = "#495057";
        c.beginPath();
        c.arc(-14, -16, 13, 0, Math.PI * 2);
        c.arc(14, -16, 13, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
    c.restore();
}
/** BUILD mode: joint dots (green = held by a support, white = free) so children can see what's connected. */
export function drawJoints(c, layout, art = () => undefined) {
    c.save();
    const cube = art("structure.connector-cube"), ball = art("structure.ball-joint");
    layout.joints.forEach((j, i) => {
        const used = layout.members.filter(m => m.a === i || m.b === i).length;
        if (!used)
            return;
        if (cube && ball) {
            // Painted joints: a connector cube where beams meet, a ball joint where one end is still loose; green ring = held by a support.
            const pic = used >= 2 || j.supported ? cube : ball;
            const size = j.supported ? 30 : 24;
            c.drawImage(pic, j.x * 100 - size / 2, j.y * 100 - size / 2, size, size);
            if (j.supported) {
                c.strokeStyle = "#2f9e44";
                c.lineWidth = 4;
                c.beginPath();
                c.arc(j.x * 100, j.y * 100, size / 2 + 4, 0, Math.PI * 2);
                c.stroke();
            }
            return;
        }
        c.fillStyle = j.supported ? "#2f9e44" : used >= 2 ? "#ffffff" : "#ffd43b";
        c.strokeStyle = INK;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(j.x * 100, j.y * 100, j.supported ? 10 : 8, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        if (j.supported) {
            c.strokeStyle = "#2f9e44";
            c.lineWidth = 4;
            c.beginPath();
            c.moveTo(j.x * 100 - 14, j.y * 100 + 16);
            c.lineTo(j.x * 100, j.y * 100 + 4);
            c.lineTo(j.x * 100 + 14, j.y * 100 + 16);
            c.stroke();
        }
    });
    c.restore();
}
export { analyzeStructure };
/** Builder Bay room: scaffolding, a big window with the campus canyon, hazard stripes. */
export function drawBuilderBayBackdrop(c) {
    const sky = c.createLinearGradient(0, 0, 0, 820);
    sky.addColorStop(0, "#d0ebff");
    sky.addColorStop(1, "#fff4e6");
    c.fillStyle = sky;
    c.fillRect(0, 0, 1600, 820);
    c.fillStyle = "#ced4da";
    for (let x = 0; x < 1600; x += 200) {
        c.fillRect(x + 90, 140, 12, 680);
    }
    c.strokeStyle = "#adb5bd";
    c.lineWidth = 6;
    for (let x = 0; x < 1600; x += 200) {
        c.beginPath();
        c.moveTo(x + 96, 160);
        c.lineTo(x + 296, 420);
        c.moveTo(x + 296, 160);
        c.lineTo(x + 96, 420);
        c.stroke();
    }
    c.fillStyle = "#ffd43b";
    c.fillRect(0, 812, 1600, 10);
    c.fillStyle = "#203040";
    for (let x = 0; x < 1600; x += 60)
        c.fillRect(x, 812, 30, 10);
    c.fillStyle = "#ffffffcc";
    c.strokeStyle = INK;
    c.lineWidth = 5;
    c.beginPath();
    c.roundRect(60, 40, 330, 90, 26);
    c.fill();
    c.stroke();
    c.fillStyle = INK;
    c.font = "900 40px system-ui";
    c.textAlign = "center";
    c.fillText("BUILDER BAY", 225, 95);
}
