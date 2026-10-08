import { circuitBehaviour, circuitTerminals, wireBehaviour, wireEnds } from "../power/CircuitSystem.js";
/**
 * Power Lab drawing (M14). Painted where art exists — the big button (`power.big-button`) and the lever switch
 * (`power.button-lever`); everything else is code-drawn behind its part id (docs/ART_NEEDED.md, Batch P).
 * Drawing only: nothing here changes how the circuit behaves. 100 px per metre.
 */
const INK = "#203040";
export function isCircuitPart(def) { return Boolean(circuitBehaviour(def) || wireBehaviour(def)); }
/** Draws a circuit part. Returns true when fully drawn; false for the electric motor so its gear shaft is drawn on top. */
export function drawCircuitPart(c, part, def, selected, ctx) {
    const wire = wireBehaviour(def);
    if (wire) {
        drawWire(c, part, def, selected, ctx);
        return true;
    }
    const b = circuitBehaviour(def);
    if (!b)
        return false;
    const st = ctx.circuits;
    const x = part.position.x * 100, y = part.position.y * 100;
    c.save();
    c.translate(x, y);
    c.rotate(part.rotation);
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 4;
    if (selected) {
        c.shadowColor = "#ffd43b";
        c.shadowBlur = 22;
    }
    const load = st?.load(part.id);
    const level = load?.level ?? 0;
    if (b.role === "BATTERY")
        drawBattery(c, part, def, st);
    else if (b.role === "SWITCH")
        drawSwitch(c, st ? st.isClosed(part.id) : part.parameters.closed === true, ctx.art);
    else if (b.role === "BUTTON")
        drawButton(c, st?.isClosed(part.id) ?? false, ctx.art, part);
    else if (b.role === "JUNCTION") {
        c.fillStyle = "#fab005";
        c.beginPath();
        c.arc(0, 0, 13, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        c.beginPath();
        c.arc(0, 0, 4, 0, Math.PI * 2);
        c.fill();
    }
    else if (b.load === "BULB")
        drawBulb(c, level);
    else if (b.load === "BUZZER")
        drawBuzzer(c, level, ctx.time);
    else if (b.load === "MOTOR")
        drawMotorBody(c, level);
    else
        drawDevice(c, part, level, ctx.time);
    c.shadowBlur = 0;
    if (ctx.scanner && load) {
        c.fillStyle = INK;
        c.font = "800 14px system-ui";
        c.textAlign = "center";
        c.fillText(load.on ? `${Math.round(level * 100)}% power` : "no power", 0, b.role === "LOAD" && b.load === "BULB" ? -64 : -48);
    }
    c.restore();
    return !(b.role === "LOAD" && b.load === "MOTOR");
}
function drawBattery(c, part, def, st) {
    const b = circuitBehaviour(def);
    const half = Math.abs(b.terminals[0].x) * 100;
    const big = part.definitionId !== "circuit.battery";
    const station = part.definitionId === "circuit.power-station";
    if (station) {
        c.fillStyle = "#495057";
        c.beginPath();
        c.roundRect(-half, -70, half * 2, 120, 12);
        c.fill();
        c.stroke();
        c.fillStyle = "#ffd43b";
        c.font = "900 34px system-ui";
        c.textAlign = "center";
        c.fillText("⚡", 0, -14);
        const s = st?.source(part.id);
        c.fillStyle = s?.tripped ? "#e03131" : "#69db7c";
        c.beginPath();
        c.roundRect(-half + 14, 14, half * 2 - 28, 22, 6);
        c.fill();
        c.stroke();
        c.fillStyle = "#fff";
        c.font = "900 13px system-ui";
        c.fillText(s?.tripped ? "OVERLOAD — OFF" : `max ${Number(part.parameters.maxPower ?? 0)}`, 0, 30);
        terminalStubs(c, b.terminals);
        return;
    }
    const h = big ? 52 : 42;
    c.fillStyle = "#40c057";
    c.beginPath();
    c.roundRect(-half + 8, -h / 2, half * 2 - 22, h, 10);
    c.fill();
    c.stroke();
    c.fillStyle = "#adb5bd";
    c.beginPath();
    c.roundRect(half - 16, -h / 4, 12, h / 2, 3);
    c.fill();
    c.stroke();
    // Charge bar (battery drain indicator).
    const s = st?.source(part.id);
    const frac = s ? s.charge / s.capacity : 1;
    c.fillStyle = "#fff";
    c.fillRect(-half + 18, -h / 2 + 8, half * 2 - 44, 8);
    c.fillStyle = frac > 0.3 ? "#ffd43b" : "#fa5252";
    c.fillRect(-half + 18, -h / 2 + 8, (half * 2 - 44) * Math.max(0, frac), 8);
    c.fillStyle = INK;
    c.font = "900 18px system-ui";
    c.textAlign = "center";
    c.fillText("−", -half + 22, 12);
    c.fillText("+", half - 30, 12);
    if (big) {
        c.font = "900 11px system-ui";
        c.fillText("BIG", 0, 14);
    }
}
function terminalStubs(c, ts) {
    c.fillStyle = "#868e96";
    for (const t of ts) {
        c.beginPath();
        c.arc(t.x * 100, t.y * 100, 6, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
}
function drawSwitch(c, closed, art) {
    const img = art("power.button-lever");
    c.fillStyle = "#495057";
    c.beginPath();
    c.roundRect(-40, 4, 80, 18, 6);
    c.fill();
    c.stroke();
    if (img) {
        c.save();
        c.beginPath();
        c.rect(-40, -60, 80, 66);
        c.clip();
        c.drawImage(img, 0 - 22, -58, 64, 46);
        c.restore();
    }
    c.strokeStyle = INK;
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(-34, 15);
    c.lineTo(closed ? 34 : 18, closed ? 15 : -26);
    c.stroke();
    c.strokeStyle = closed ? "#40c057" : "#fa5252";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(-34, 15);
    c.lineTo(closed ? 34 : 18, closed ? 15 : -26);
    c.stroke();
    c.fillStyle = closed ? "#2f9e44" : "#e03131";
    c.font = "900 13px system-ui";
    c.textAlign = "center";
    c.fillText(closed ? "ON" : "OFF", 0, 40);
}
function drawButton(c, down, art, part) {
    const img = art("power.big-button");
    if (img)
        c.drawImage(img, -44, down ? -26 : -36, 88, down ? 54 : 64);
    else {
        c.fillStyle = "#495057";
        c.beginPath();
        c.roundRect(-40, -4, 80, 20, 6);
        c.fill();
        c.stroke();
        c.fillStyle = "#fa5252";
        c.beginPath();
        c.ellipse(0, down ? -2 : -10, 26, 12, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
    if (part.parameters.pressFrom !== undefined) {
        c.fillStyle = INK;
        c.font = "800 12px system-ui";
        c.textAlign = "center";
        c.fillText(`Bolt presses at ${part.parameters.pressFrom}s`, 0, 42);
    }
}
function drawBulb(c, level) {
    const glow = Math.min(1, level);
    if (glow > 0.05) {
        const g = c.createRadialGradient(0, -20, 4, 0, -20, 30 + 60 * glow);
        g.addColorStop(0, `rgba(255,236,120,${0.85 * glow})`);
        g.addColorStop(1, "rgba(255,236,120,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, -20, 30 + 60 * glow, 0, Math.PI * 2);
        c.fill();
    }
    c.fillStyle = glow > 0.05 ? `rgb(255,${Math.round(220 + 30 * glow)},${Math.round(120 * (1 - glow) + 60)})` : "#f1f3f5";
    c.beginPath();
    c.arc(0, -20, 24, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.strokeStyle = glow > 0.05 ? "#f08c00" : "#adb5bd";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-8, -6);
    c.lineTo(-4, -22);
    c.lineTo(4, -14);
    c.lineTo(8, -26);
    c.stroke();
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.fillStyle = "#adb5bd";
    c.beginPath();
    c.roundRect(-13, 2, 26, 20, 4);
    c.fill();
    c.stroke();
    c.fillStyle = "#495057";
    c.beginPath();
    c.roundRect(-26, 22, 52, 20, 6);
    c.fill();
    c.stroke();
}
function drawBuzzer(c, level, time) {
    const on = level >= 0.15;
    const shake = on ? Math.sin(time * 60) * 2 : 0;
    c.fillStyle = "#fd7e14";
    c.beginPath();
    c.roundRect(-30 + shake, -26, 60, 52, 12);
    c.fill();
    c.stroke();
    c.fillStyle = INK;
    for (let k = -1; k <= 1; k++) {
        c.beginPath();
        c.arc(k * 14 + shake, -2, 4, 0, Math.PI * 2);
        c.fill();
    }
    if (on) {
        c.strokeStyle = "#e8590c";
        c.lineWidth = 4;
        for (let k = 1; k <= 3; k++) {
            c.beginPath();
            c.arc(36, -2, 8 * k + (time * 30) % 8, -0.7, 0.7);
            c.stroke();
        }
        c.fillStyle = "#e8590c";
        c.font = "900 16px system-ui";
        c.textAlign = "center";
        c.fillText("BZZZ!", 0, -38);
    }
}
function drawMotorBody(c, level) {
    c.fillStyle = "#4dabf7";
    c.beginPath();
    c.roundRect(-40, -36, 80, 72, 14);
    c.fill();
    c.stroke();
    c.fillStyle = level >= 0.15 ? "#ffd43b" : "#e9ecef";
    c.font = "900 22px system-ui";
    c.textAlign = "center";
    c.fillText("⚡", -22, -12);
    c.fillStyle = INK;
    c.font = "900 11px system-ui";
    c.fillText("MOTOR", 0, 30);
}
function drawDevice(c, part, level, time) {
    const on = level >= 0.15;
    const label = String(part.parameters.label ?? "MACHINE");
    const icon = String(part.parameters.icon ?? "⚙️");
    c.fillStyle = on ? "#d3f9d8" : "#dee2e6";
    c.beginPath();
    c.roundRect(-46, -50, 92, 92, 12);
    c.fill();
    c.stroke();
    if (part.parameters.priority === true) {
        c.fillStyle = "#fab005";
        c.font = "900 20px system-ui";
        c.textAlign = "left";
        c.fillText("★", -42, -30);
    }
    c.font = "30px system-ui";
    c.textAlign = "center";
    c.fillStyle = INK;
    c.save();
    if (on)
        c.translate(0, Math.sin(time * 12) * 2);
    c.fillText(icon, 0, -2);
    c.restore();
    c.font = "900 12px system-ui";
    c.fillText(label.toUpperCase(), 0, 30);
    c.fillStyle = on ? "#40c057" : "#868e96";
    c.beginPath();
    c.arc(34, -36, 6, 0, Math.PI * 2);
    c.fill();
    c.stroke();
}
/** A wire: a soft cable between its two ends. With current, glowing pulses travel along it (faster for more current). */
function drawWire(c, part, def, selected, ctx) {
    const e = wireEnds(part, def);
    const x1 = e.x1 * 100, y1 = e.y1 * 100, x2 = e.x2 * 100, y2 = e.y2 * 100;
    const sag = Math.min(30, e.length * 8);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
    const broken = part.parameters.broken === true;
    const i = ctx.circuits?.current(part.id) ?? 0;
    c.save();
    c.lineCap = "round";
    c.strokeStyle = selected ? "#ffd43b" : INK;
    c.lineWidth = selected ? 11 : 8;
    c.beginPath();
    c.moveTo(x1, y1);
    c.quadraticCurveTo(mx, my, x2, y2);
    c.stroke();
    c.strokeStyle = Math.abs(i) > 0.05 ? "#ffd43b" : "#e03131";
    c.lineWidth = 4;
    if (broken) {
        c.strokeStyle = "#e03131";
        c.setLineDash([]);
        c.beginPath();
        c.moveTo(x1, y1);
        c.quadraticCurveTo((x1 + mx) / 2, (y1 + my) / 2, mx - 10, my - 4);
        c.moveTo(mx + 10, my + 4);
        c.quadraticCurveTo((x2 + mx) / 2, (y2 + my) / 2, x2, y2);
        c.stroke();
        c.fillStyle = "#e03131";
        c.font = "900 15px system-ui";
        c.textAlign = "center";
        c.fillText("BROKEN", mx, my - 16);
    }
    else {
        c.beginPath();
        c.moveTo(x1, y1);
        c.quadraticCurveTo(mx, my, x2, y2);
        c.stroke();
        if (Math.abs(i) > 0.05) {
            // Moving pulses show which way the current goes and how much flows.
            c.fillStyle = "#fff9db";
            const n = Math.max(2, Math.round(e.length * 2));
            const off = ((ctx.time * Math.min(3, Math.abs(i)) * 0.8) % 1 + 1) % 1;
            for (let k = 0; k < n; k++) {
                let t = (k + off) / n;
                if (i < 0)
                    t = 1 - t;
                const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
                c.beginPath();
                c.arc(px, py, 5, 0, Math.PI * 2);
                c.fill();
            }
            if (ctx.scanner) {
                c.fillStyle = INK;
                c.font = "800 13px system-ui";
                c.textAlign = "center";
                c.fillText(`${Math.abs(i).toFixed(1)} A`, mx, my + 18);
            }
        }
    }
    c.fillStyle = "#adb5bd";
    c.strokeStyle = INK;
    c.lineWidth = 3;
    for (const [px, py] of [[x1, y1], [x2, y2]]) {
        c.beginPath();
        c.arc(px, py, 6, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
    c.restore();
}
/** BUILD mode: terminal dots. Green = joined to something, yellow = nothing plugged in yet. */
export function drawCircuitTerminals(c, layout) {
    c.save();
    const counts = new Map();
    for (const t of layout.terminals)
        counts.set(t.node, (counts.get(t.node) ?? 0) + 1);
    for (const t of layout.terminals) {
        if (t.isWire)
            continue;
        const joined = (counts.get(t.node) ?? 0) >= 2;
        c.fillStyle = joined ? "#2f9e44" : "#ffd43b";
        c.strokeStyle = INK;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(t.x * 100, t.y * 100, joined ? 8 : 9, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }
    c.restore();
}
/** Scanner during a TEST: loads in a broken loop get a red "!" so the gap is easy to spot. */
export function drawCircuitScanner(c, parts, registry, circuits) {
    c.save();
    c.font = "900 22px system-ui";
    c.textAlign = "center";
    for (const p of parts) {
        const def = registry(p.definitionId);
        const b = circuitBehaviour(def);
        if (b?.role !== "LOAD")
            continue;
        const l = circuits.load(p.id);
        if (!l || l.on)
            continue;
        const t = circuitTerminals(p, def);
        const x = p.position.x * 100, y = p.position.y * 100 - 70;
        c.fillStyle = "#e03131";
        c.beginPath();
        c.arc(x, y, 16, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#fff";
        c.fillText("!", x, y + 8);
        void t;
    }
    c.restore();
}
