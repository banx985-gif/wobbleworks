/**
 * Connection points that never rely on colour alone (M35, design §54 "colour-independent connection symbols"):
 *   joined → a solid green disc with a white tick;   open → a yellow ring with a dashed outline and a hollow centre.
 * The shapes differ, so the meaning survives colour blindness, high contrast and greyscale screens.
 */
export function drawConnectionMark(c, x, y, joined, size = 9) {
    c.save();
    c.strokeStyle = "#203040";
    c.lineWidth = 3;
    if (joined) {
        c.fillStyle = "#2f9e44";
        c.beginPath();
        c.arc(x, y, size, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.strokeStyle = "#ffffff";
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(x - size * 0.45, y);
        c.lineTo(x - size * 0.1, y + size * 0.4);
        c.lineTo(x + size * 0.5, y - size * 0.4);
        c.stroke();
    }
    else {
        c.fillStyle = "#ffd43b";
        c.beginPath();
        c.arc(x, y, size + 1, 0, Math.PI * 2);
        c.fill();
        c.setLineDash([4, 3]);
        c.beginPath();
        c.arc(x, y, size + 1, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]);
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(x, y, size * 0.4, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = 1.5;
        c.stroke();
    }
    c.restore();
}
