/** Experiment Lab drawing (M22): lane signs, the finish flag and the test floor. Code-drawn (docs/ART_NEEDED.md, Batch E). */
const INK = "#203040";
export function isExperimentPart(def) { return def.id.startsWith("experiment."); }
export function drawExperimentPart(c, part, def, selected) {
    c.save();
    c.translate(part.position.x * 100, part.position.y * 100);
    c.strokeStyle = INK;
    c.lineWidth = selected ? 7 : 4;
    c.lineJoin = "round";
    if (def.id === "experiment.lane-sign") {
        const a = String(part.parameters.letter ?? "A") === "A";
        c.fillStyle = a ? "#4dabf7" : "#ff922b";
        c.beginPath();
        c.arc(0, 0, 34, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = "#fff";
        c.font = "900 38px system-ui";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(String(part.parameters.letter ?? "A"), 0, 2);
    }
    else if (def.id === "experiment.finish") {
        c.beginPath();
        c.moveTo(0, 80);
        c.lineTo(0, -40);
        c.stroke();
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 3; j++) {
                c.fillStyle = (i + j) % 2 ? "#212529" : "#f8f9fa";
                c.fillRect(i * 12, -40 + j * 12, 12, 12);
            }
        c.strokeRect(0, -40, 48, 36);
    }
    else if (def.id === "experiment.test-surface") {
        const f = Number(part.parameters.friction ?? 0.35);
        c.fillStyle = f >= 0.8 ? "#69db7c" : f <= 0.1 ? "#a5d8ff" : "#ced4da";
        c.beginPath();
        c.roundRect(-280, -10, 560, 20, 6);
        c.fill();
        c.stroke();
        c.fillStyle = INK;
        c.globalAlpha = 0.35;
        for (let x = -270; x < 270; x += f >= 0.8 ? 16 : f <= 0.1 ? 70 : 34) {
            c.fillRect(x, -6, f <= 0.1 ? 30 : 6, 4);
        }
        c.globalAlpha = 1;
    }
    else {
        c.restore();
        return false;
    }
    c.restore();
    return true;
}
