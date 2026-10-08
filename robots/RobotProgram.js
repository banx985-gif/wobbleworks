export const SENSORS = [
    { id: "WALL_AHEAD", label: "wall ahead", icon: "🧱" }, { id: "PATH_CLEAR", label: "path clear", icon: "🟢" },
    { id: "ON_RED", label: "on red", icon: "🟥" }, { id: "ON_GREEN", label: "on green", icon: "🟩" }, { id: "ON_BLUE", label: "on blue", icon: "🟦" }, { id: "ON_YELLOW", label: "on yellow", icon: "🟨" },
    { id: "BOX_AHEAD", label: "box ahead", icon: "📦" }, { id: "HOLDING", label: "holding a box", icon: "✋" }, { id: "SIGNAL", label: "signal is on", icon: "📶" }
];
export function parseProgram(text) {
    if (typeof text !== "string" || !text)
        return [];
    try {
        const v = JSON.parse(text);
        return Array.isArray(v) ? v.map(clean).filter((b) => b !== undefined) : [];
    }
    catch {
        return [];
    }
}
function clean(v) {
    if (!v || typeof v !== "object")
        return undefined;
    const b = v;
    const list = (x) => Array.isArray(x) ? x.map(clean).filter((q) => q !== undefined) : [];
    const sensor = SENSORS.some(s => s.id === b.sensor) ? b.sensor : "WALL_AHEAD";
    switch (b.op) {
        case "FORWARD": return { op: "FORWARD", n: clampInt(b.n, 1, 12) };
        case "TURN": return { op: "TURN", dir: b.dir === "L" ? "L" : "R" };
        case "WAIT": return { op: "WAIT", s: clampInt(b.s, 1, 9) };
        case "REPEAT": return { op: "REPEAT", n: clampInt(b.n, 1, 20), body: list(b.body) };
        case "UNTIL": return { op: "UNTIL", sensor, body: list(b.body) };
        case "IF": return { op: "IF", sensor, then: list(b.then), else: list(b.else) };
        case "GRAB": return { op: "GRAB" };
        case "DROP": return { op: "DROP" };
        case "PRESS": return { op: "PRESS" };
        default: return undefined;
    }
}
function clampInt(v, lo, hi) { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo; }
export function programText(blocks) { return JSON.stringify(blocks); }
/** How many blocks a program uses (every block counts, including those inside REPEAT and IF): the programBlockCount metric. */
export function blockCount(blocks) {
    let n = 0;
    for (const b of blocks) {
        n += 1;
        if (b.op === "REPEAT" || b.op === "UNTIL")
            n += blockCount(b.body);
        if (b.op === "IF")
            n += blockCount(b.then) + blockCount(b.else);
    }
    return n;
}
export function usesBlock(blocks, op) {
    return blocks.some(b => b.op === op || ((b.op === "REPEAT" || b.op === "UNTIL") && usesBlock(b.body, op)) || (b.op === "IF" && (usesBlock(b.then, op) || usesBlock(b.else, op))));
}
export function pathKey(path) { return path.join("."); }
