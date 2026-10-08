/**
 * Code-drawn Gear Garage parts (M12), behind their named ids until the gear art arrives
 * (docs/ART_NEEDED.md, "Gear Garage"). World units are metres; the canvas is 100 px per metre.
 */
const INK = "#203040";
const GEAR_COLOURS = {
    "gear.small": "#ffd43b", "gear.medium": "#74c0fc", "gear.large": "#ff922b", "gear.door-wheel": "#adb5bd",
    "gear.belt-pulley": "#b197fc", "gear.belt-pulley-big": "#9775fa"
};
export function gearBehaviour(def) { const g = def.behaviours.find(b => b.kind === "GEAR"); return g?.kind === "GEAR" ? g : undefined; }
export function gearOutput(def) { const o = def.behaviours.find(b => b.kind === "GEAR_OUTPUT"); return o?.kind === "GEAR_OUTPUT" ? o : undefined; }
export function gearDriver(def) { const d = def.behaviours.find(b => b.kind === "GEAR_DRIVER"); return d?.kind === "GEAR_DRIVER" ? d : undefined; }
function toothedGear(c, r, teeth, fill, selected) {
    const depth = Math.min(14, r * 0.18), inner = r - depth;
    c.beginPath();
    for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2, step = Math.PI * 2 / teeth;
        const pts = [[a0, inner], [a0 + step * 0.15, r], [a0 + step * 0.45, r], [a0 + step * 0.6, inner]];
        for (const [a, rad] of pts) {
            const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
            if (i === 0 && a === a0)
                c.moveTo(x, y);
            else
                c.lineTo(x, y);
        }
    }
    c.closePath();
    c.fillStyle = selected ? "#ffe066" : fill;
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 5;
    c.lineJoin = "round";
    c.fill();
    c.stroke();
    // spokes + hub
    c.fillStyle = "#ffffff55";
    c.beginPath();
    c.arc(0, 0, inner * 0.72, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = INK;
    c.lineWidth = 4;
    for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2;
        c.beginPath();
        c.moveTo(Math.cos(a) * inner * 0.22, Math.sin(a) * inner * 0.22);
        c.lineTo(Math.cos(a) * inner * 0.72, Math.sin(a) * inner * 0.72);
        c.stroke();
    }
    c.fillStyle = "#495057";
    c.beginPath();
    c.arc(0, 0, Math.max(8, r * 0.16), 0, Math.PI * 2);
    c.fill();
    c.stroke();
    // a marker tooth so turning is easy to see
    c.fillStyle = "#e03131";
    c.beginPath();
    c.arc(inner * 0.5, 0, Math.max(4, r * 0.07), 0, Math.PI * 2);
    c.fill();
}
function pulley(c, r, fill, selected) {
    c.fillStyle = selected ? "#ffe066" : fill;
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 5;
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    c.stroke();
    c.lineWidth = 4;
    for (let k = 0; k < 3; k++) {
        const a = k * Math.PI * 2 / 3;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
        c.stroke();
    }
    c.fillStyle = "#495057";
    c.beginPath();
    c.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    c.fill();
    c.stroke();
}
/** Draws one Gear Garage part at its place. Returns false for parts that aren't gear parts. */
/** Decided 9 Oct: blue ring = small 8-tooth, purple hub = medium 12-tooth, green bolt = large 20-tooth. */
export const GEAR_ART = { "gear.small": "gear.ring-blue", "gear.medium": "gear.hub-purple", "gear.large": "gear.bolt-green" };
export function drawGearPart(c, part, def, selected, ctx) {
    const g = gearBehaviour(def);
    if (!g)
        return false;
    const st = ctx.gears?.state(part.id);
    const angle = (st?.angle ?? 0) + part.rotation;
    const x = part.position.x * 100, y = part.position.y * 100, r = g.radius * 100;
    const out = gearOutput(def), drive = gearDriver(def);
    c.save();
    c.translate(x, y);
    if (out)
        drawOutputBody(c, part, out.output, angle, st?.omega ?? 0, ctx, out.drum ?? g.radius);
    if (drive)
        drawDriverBody(c, drive.driver, angle);
    c.rotate(angle);
    const pic = GEAR_ART[part.definitionId] ? ctx.art?.(GEAR_ART[part.definitionId]) : undefined;
    if (g.role === "GEAR" && pic) {
        // Painted gear scaled to this gear's size (the painted teeth needn't match the count; the solver uses the real one).
        if (selected) {
            c.shadowColor = "#ffd43b";
            c.shadowBlur = 24;
        }
        const d = r * 2 * 1.12;
        c.drawImage(pic, -d / 2, -d / 2, d, d);
        c.shadowBlur = 0;
        if (selected) {
            c.strokeStyle = "#ffd43b";
            c.lineWidth = 5;
            c.setLineDash([12, 9]);
            c.beginPath();
            c.arc(0, 0, r * 1.12, 0, Math.PI * 2);
            c.stroke();
            c.setLineDash([]);
        }
    }
    else if (g.role === "GEAR")
        toothedGear(c, r, Math.max(6, g.teeth), GEAR_COLOURS[part.definitionId] ?? "#ced4da", selected);
    else if (g.role === "PULLEY")
        pulley(c, r, GEAR_COLOURS[part.definitionId] ?? "#b197fc", selected);
    else {
        c.fillStyle = selected ? "#ffe066" : "#868e96";
        c.strokeStyle = INK;
        c.lineWidth = 4;
        c.beginPath();
        c.arc(0, 0, r, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        c.fillRect(-r * 0.15, -r * 0.8, r * 0.3, r * 1.6);
    }
    c.restore();
    return true;
}
function drawDriverBody(c, kind, angle) {
    if (kind === "MOTOR") {
        c.fillStyle = "#4dabf7";
        c.strokeStyle = INK;
        c.lineWidth = 5;
        c.beginPath();
        c.roundRect(-40, -34, 80, 68, 12);
        c.fill();
        c.stroke();
        c.fillStyle = "#ffd43b";
        c.font = "900 30px system-ui";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("⚡", 0, -6);
        c.fillStyle = INK;
        c.font = "900 13px system-ui";
        c.fillText("MOTOR", 0, 22);
        return;
    }
    // Hand crank: a stand, then an arm with a knob that turns with the shaft.
    c.fillStyle = "#8d5524";
    c.strokeStyle = INK;
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(-26, 60);
    c.lineTo(26, 60);
    c.lineTo(10, 0);
    c.lineTo(-10, 0);
    c.closePath();
    c.fill();
    c.stroke();
    c.save();
    c.rotate(angle);
    c.strokeStyle = INK;
    c.lineWidth = 12;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(55, 0);
    c.stroke();
    c.strokeStyle = "#fa5252";
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(55, 0);
    c.stroke();
    c.fillStyle = "#ffd43b";
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.beginPath();
    c.arc(55, 0, 12, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.restore();
}
function drawOutputBody(c, part, kind, angle, omega, ctx, drum) {
    c.save();
    c.strokeStyle = INK;
    c.lineWidth = 5;
    c.lineJoin = "round";
    if (kind === "FAN") {
        c.save();
        c.rotate(angle * 1);
        c.fillStyle = "#e7f5ff";
        for (let k = 0; k < 4; k++) {
            c.rotate(Math.PI / 2);
            c.beginPath();
            c.ellipse(34, 0, 32, 13, 0.3, 0, Math.PI * 2);
            c.fill();
            c.stroke();
        }
        c.restore();
        c.fillStyle = INK;
        c.font = "900 14px system-ui";
        c.textAlign = "center";
        c.fillText("FAN", 0, 86);
    }
    else if (kind === "WINCH") {
        const d = drum * 100;
        c.fillStyle = "#a9e34b";
        c.beginPath();
        c.arc(0, 0, d, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        const load = typeof part.parameters.ropeTo === "string" ? ctx.parts.find(p => p.id === part.parameters.ropeTo) : undefined;
        if (load) {
            const s = ctx.states.get(load.id);
            const lx = ((s?.x ?? load.position.x) - part.position.x) * 100, ly = ((s?.y ?? load.position.y) - part.position.y) * 100;
            const def = ctx.registry(load.definitionId);
            const rb = def.behaviours.find(b => b.kind === "RIGID_BODY");
            const top = ly - (rb?.kind === "RIGID_BODY" ? rb.height * 50 : 40);
            c.strokeStyle = "#8d5524";
            c.lineWidth = 5;
            c.beginPath();
            c.moveTo(d, 0);
            c.lineTo(lx, top);
            c.stroke();
            c.fillStyle = "#495057";
            c.beginPath();
            c.arc(lx, top, 7, 0, Math.PI * 2);
            c.fill();
        }
        c.fillStyle = INK;
        c.font = "900 14px system-ui";
        c.textAlign = "center";
        c.fillText("WINCH", 0, -d - 26);
    }
    else if (kind === "CONVEYOR") {
        const d = drum * 100;
        c.fillStyle = "#ced4da";
        c.beginPath();
        c.arc(0, 0, d, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.save();
        c.rotate(angle);
        c.lineWidth = 4;
        for (let k = 0; k < 6; k++) {
            c.rotate(Math.PI / 3);
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(d, 0);
            c.stroke();
        }
        c.restore();
        c.fillStyle = INK;
        c.font = "900 13px system-ui";
        c.textAlign = "center";
        c.fillText("DRUM", 0, -d - 22);
    }
    else if (kind === "CAROUSEL") {
        const flung = Math.abs(omega) > Number(part.parameters.flingAbove ?? 2.6);
        c.save();
        c.rotate(angle);
        c.fillStyle = "#ffa8a8";
        c.beginPath();
        c.arc(0, 0, 95, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = "#fff3bf";
        for (let k = 0; k < 8; k++) {
            c.beginPath();
            c.moveTo(0, 0);
            c.arc(0, 0, 95, k * Math.PI / 4, k * Math.PI / 4 + Math.PI / 8);
            c.closePath();
            c.fill();
        }
        c.stroke();
        if (!flung) {
            c.font = "48px system-ui";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("🐶", 62, 0);
        }
        c.restore();
        if (flung) {
            const t = ctx.time * 4;
            c.font = "56px system-ui";
            c.textAlign = "center";
            c.fillText("🐶", 150 + Math.sin(t) * 10, -120 + Math.cos(t) * 8);
            c.font = "900 18px system-ui";
            c.fillStyle = "#e03131";
            c.fillText("WHEEEE! TOO FAST!", 150, -70);
        }
        c.fillStyle = INK;
        c.font = "900 14px system-ui";
        c.textAlign = "center";
        c.fillText("CAROUSEL", 0, 118);
    }
    else if (kind === "CLOCK") {
        c.fillStyle = "#fffdf5";
        c.beginPath();
        c.arc(0, -150, 70, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        for (let k = 0; k < 12; k++) {
            const a = k * Math.PI / 6;
            c.beginPath();
            c.arc(Math.cos(a) * 58, -150 + Math.sin(a) * 58, 4, 0, Math.PI * 2);
            c.fill();
        }
        c.lineCap = "round";
        c.lineWidth = 6;
        c.beginPath();
        c.moveTo(0, -150);
        c.lineTo(Math.cos(angle / 12 - Math.PI / 2) * 34, -150 + Math.sin(angle / 12 - Math.PI / 2) * 34);
        c.stroke();
        c.lineWidth = 4;
        c.strokeStyle = "#e03131";
        c.beginPath();
        c.moveTo(0, -150);
        c.lineTo(Math.cos(angle - Math.PI / 2) * 52, -150 + Math.sin(angle - Math.PI / 2) * 52);
        c.stroke();
        c.strokeStyle = INK;
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(0, -80);
        c.lineTo(0, -20);
        c.stroke();
    }
    else if (kind === "FACTORY") {
        c.fillStyle = "#adb5bd";
        c.beginPath();
        c.roundRect(40, -60, 300, 120, 14);
        c.fill();
        c.stroke();
        c.fillStyle = "#495057";
        c.fillRect(60, 10, 260, 22);
        const shift = (angle * 30) % 60;
        c.fillStyle = "#f6b26b";
        for (let k = -1; k < 5; k++) {
            const bx = 70 + k * 60 + shift;
            if (bx < 60 || bx > 290)
                continue;
            c.fillRect(bx, -22, 30, 30);
            c.strokeRect(bx, -22, 30, 30);
        }
        c.fillStyle = INK;
        c.font = "900 15px system-ui";
        c.textAlign = "center";
        c.fillText(omega > 0 ? "FACTORY LINE ▶" : omega < 0 ? "◀ BACKWARDS!" : "FACTORY LINE", 190, -34);
    }
    else if (kind === "RIDE") {
        c.save();
        c.rotate(angle);
        c.strokeStyle = "#7048e8";
        c.lineWidth = 6;
        c.beginPath();
        c.arc(0, 0, 80, 0, Math.PI * 2);
        c.stroke();
        for (let k = 0; k < 6; k++) {
            const a = k * Math.PI / 3;
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(Math.cos(a) * 80, Math.sin(a) * 80);
            c.stroke();
        }
        c.restore();
        c.fillStyle = "#ffd43b";
        c.strokeStyle = INK;
        c.lineWidth = 3;
        for (let k = 0; k < 6; k++) {
            const a = angle + k * Math.PI / 3;
            c.beginPath();
            c.roundRect(Math.cos(a) * 80 - 12, Math.sin(a) * 80 - 4, 24, 18, 6);
            c.fill();
            c.stroke();
        }
        c.fillStyle = INK;
        c.font = "900 14px system-ui";
        c.textAlign = "center";
        c.fillText("BIG WHEEL", 0, 110);
    }
    c.restore();
}
/** The door panel that the Door Wheel lifts (drawn next to it). */
export function drawDoorPanel(c, part, turns) {
    const x = part.position.x * 100 + 120, y = part.position.y * 100 - 220, open = Math.min(1, turns * 2);
    c.save();
    c.strokeStyle = INK;
    c.lineWidth = 5;
    c.fillStyle = "#5c3b1e";
    c.fillRect(x - 10, y - 10, 200, 320);
    c.strokeRect(x - 10, y - 10, 200, 320);
    c.fillStyle = "#c2e7ff";
    c.fillRect(x, y, 180, 300);
    c.fillStyle = "#ced4da";
    const h = 300 * (1 - open);
    for (let k = 0; k * 40 < h; k++) {
        c.fillRect(x, y + k * 40, 180, Math.min(36, h - k * 40));
        c.strokeRect(x, y + k * 40, 180, Math.min(36, h - k * 40));
    }
    c.fillStyle = INK;
    c.font = "900 16px system-ui";
    c.textAlign = "center";
    c.fillText(open >= 1 ? "OPEN!" : "DOOR", x + 90, y - 18);
    c.restore();
}
/** Belts, mesh contact dots, gaps and clashes — the "how is it connected?" layer, in BUILD and TEST. */
export function drawGearLinks(c, analysis, building) {
    const node = (id) => analysis.nodes.find(n => n.id === id);
    c.save();
    for (const l of analysis.links) {
        const a = node(l.a), b = node(l.b);
        if (l.kind === "BELT") {
            const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
            c.strokeStyle = "#343a40";
            c.lineWidth = 7;
            c.lineCap = "round";
            for (const side of [1, -1]) {
                c.beginPath();
                c.moveTo((a.x + nx * a.radius * side) * 100, (a.y + ny * a.radius * side) * 100);
                c.lineTo((b.x + nx * b.radius * side) * 100, (b.y + ny * b.radius * side) * 100);
                c.stroke();
            }
        }
        else if (l.kind === "MESH" && building) {
            const t = a.radius / (a.radius + b.radius);
            c.fillStyle = "#2f9e44";
            c.strokeStyle = "#fff";
            c.lineWidth = 3;
            c.beginPath();
            c.arc((a.x + (b.x - a.x) * t) * 100, (a.y + (b.y - a.y) * t) * 100, 9, 0, Math.PI * 2);
            c.fill();
            c.stroke();
        }
    }
    if (building) {
        for (const m of analysis.nearMisses) {
            const a = node(m.a), b = node(m.b);
            if (m.gap > 0.35)
                continue;
            const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
            const p = { x: a.x + dx / d * a.radius, y: a.y + dy / d * a.radius }, q = { x: b.x - dx / d * b.radius, y: b.y - dy / d * b.radius };
            c.strokeStyle = "#e03131";
            c.lineWidth = 4;
            c.setLineDash([6, 6]);
            c.beginPath();
            c.moveTo(p.x * 100, p.y * 100);
            c.lineTo(q.x * 100, q.y * 100);
            c.stroke();
            c.setLineDash([]);
        }
    }
    c.restore();
}
/** Rotation view: direction arrows on everything turning; the Spin Scanner adds speeds and ratios. Jams and stalls are always shown. */
export function drawRotationView(c, gears, showValues) {
    c.save();
    const labelled = new Set();
    for (const s of gears.states()) {
        const n = gears.node(s.id);
        const x = n.x * 100, y = n.y * 100;
        const status = gears.status(s.id);
        if (status === "JAMMED" || status === "STALLED") {
            const info = gears.trainInfo(s.id);
            if (!info?.driverId || labelled.has(info.driverId))
                continue;
            labelled.add(info.driverId);
            const d = gears.node(info.driverId);
            const text = status === "JAMMED" ? "🔒 JAMMED" : "😣 TOO HEAVY";
            c.font = "900 22px system-ui";
            c.textAlign = "center";
            c.lineWidth = 6;
            c.strokeStyle = "#fff";
            c.fillStyle = "#e03131";
            c.strokeText(text, d.x * 100, d.y * 100 - 90);
            c.fillText(text, d.x * 100, d.y * 100 - 90);
            continue;
        }
        if (s.omega === 0 || n.role === "SHAFT" && !n.output && !n.driver)
            continue;
        const r = Math.max(n.radius * 100 + 14, 34);
        const dir = Math.sign(s.omega);
        c.strokeStyle = dir > 0 ? "#2f9e44" : "#1c7ed6";
        c.lineWidth = 5;
        c.lineCap = "round";
        const a0 = -Math.PI * 0.85, a1 = -Math.PI * 0.35;
        c.beginPath();
        c.arc(x, y, r, a0, a1);
        c.stroke();
        const end = dir > 0 ? a1 : a0;
        const ex = x + Math.cos(end) * r, ey = y + Math.sin(end) * r;
        const tangent = end + (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
        c.fillStyle = c.strokeStyle;
        c.beginPath();
        c.moveTo(ex + Math.cos(tangent) * 12, ey + Math.sin(tangent) * 12);
        c.lineTo(ex + Math.cos(tangent + 2.4) * 12, ey + Math.sin(tangent + 2.4) * 12);
        c.lineTo(ex + Math.cos(tangent - 2.4) * 12, ey + Math.sin(tangent - 2.4) * 12);
        c.closePath();
        c.fill();
        if (showValues && (n.output || n.driver || n.role !== "SHAFT")) {
            const text = n.driver ? `${Math.abs(s.omega).toFixed(1)} rad/s` : `×${Math.abs(s.factor).toFixed(2)} speed  ×${(1 / Math.max(1e-6, Math.abs(s.factor))).toFixed(2)} force`;
            c.font = "800 14px system-ui";
            c.textAlign = "center";
            c.lineWidth = 5;
            c.strokeStyle = "#fff";
            c.fillStyle = INK;
            c.strokeText(text, x, y + r + 20);
            c.fillText(text, x, y + r + 20);
        }
    }
    c.restore();
}
/** The Gear Garage room: pegboard wall, workbench and a couple of big decorative wall gears. */
export function drawGearGarageBackdrop(c, time) {
    const wall = c.createLinearGradient(0, 0, 0, 820);
    wall.addColorStop(0, "#ffe8cc");
    wall.addColorStop(1, "#fff4e6");
    c.fillStyle = wall;
    c.fillRect(0, 0, 1600, 820);
    c.fillStyle = "#e8c39e";
    c.fillRect(0, 140, 1600, 560);
    c.fillStyle = "#c08f5f";
    for (let x = 20; x < 1600; x += 40)
        for (let y = 160; y < 700; y += 40) {
            c.beginPath();
            c.arc(x, y, 4, 0, Math.PI * 2);
            c.fill();
        }
    c.fillStyle = "#868e96";
    c.fillRect(0, 700, 1600, 120);
    c.fillStyle = "#adb5bd";
    for (let x = 0; x < 1600; x += 160)
        c.fillRect(x, 700, 150, 120);
    c.save();
    c.globalAlpha = 0.25;
    c.translate(1450, 230);
    c.rotate(time * 0.2);
    toothedGear(c, 110, 18, "#ff922b", false);
    c.restore();
    c.save();
    c.globalAlpha = 0.25;
    c.translate(1290, 330);
    c.rotate(-time * 0.2 * 110 / 70);
    toothedGear(c, 70, 12, "#74c0fc", false);
    c.restore();
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
    c.fillText("GEAR GARAGE", 225, 95);
}
