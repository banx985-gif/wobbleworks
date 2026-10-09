import { SENSORS, blockCount } from "./RobotProgram.js";
const PALETTE = [
    { label: "Forward", icon: "⬆️", make: () => ({ op: "FORWARD", n: 1 }) },
    { label: "Turn left", icon: "↰", make: () => ({ op: "TURN", dir: "L" }) },
    { label: "Turn right", icon: "↱", make: () => ({ op: "TURN", dir: "R" }) },
    { label: "Wait", icon: "⏱️", make: () => ({ op: "WAIT", s: 1 }) },
    { label: "Repeat", icon: "🔁", make: () => ({ op: "REPEAT", n: 2, body: [] }) },
    { label: "Repeat until", icon: "🔂", make: () => ({ op: "UNTIL", sensor: "ON_GREEN", body: [] }) },
    { label: "If", icon: "❓", make: () => ({ op: "IF", sensor: "WALL_AHEAD", then: [], else: [] }) },
    { label: "Grab", icon: "✊", make: () => ({ op: "GRAB" }) },
    { label: "Drop", icon: "👐", make: () => ({ op: "DROP" }) },
    { label: "Press", icon: "👆", make: () => ({ op: "PRESS" }) }
];
function el(tag, className = "", text) { const n = document.createElement(tag); if (className)
    n.className = className; if (text !== undefined)
    n.textContent = text; return n; }
/** Immutable edit helpers on paths like [2, "body", 0]. */
function getList(blocks, slot) {
    var _a;
    let list = blocks;
    for (let i = 0; i < slot.length; i += 2) {
        const b = list[slot[i]];
        list = (_a = b === null || b === void 0 ? void 0 : b[slot[i + 1]]) !== null && _a !== void 0 ? _a : [];
    }
    return list;
}
function setList(blocks, slot, next) {
    if (!slot.length)
        return [...next];
    const [i, field, ...rest] = slot;
    return blocks.map((b, k) => { var _a; return k !== i ? b : { ...b, [field]: setList((_a = (b[field])) !== null && _a !== void 0 ? _a : [], rest, next) }; });
}
function parsePath(key) { return key ? key.split(".").map(p => /^\d+$/.test(p) ? Number(p) : p) : []; }
export function describeBlock(b) {
    const sensor = (s) => { var _a, _b; return (_b = (_a = SENSORS.find(x => x.id === s)) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : s; };
    switch (b.op) {
        case "FORWARD": return `Forward ${b.n}`;
        case "TURN": return b.dir === "L" ? "Turn left" : "Turn right";
        case "WAIT": return `Wait ${b.s} s`;
        case "REPEAT": return `Repeat ${b.n} times`;
        case "UNTIL": return `Repeat until ${sensor(b.sensor)}`;
        case "IF": return `If ${sensor(b.sensor)}`;
        case "GRAB": return "Grab";
        case "DROP": return "Drop";
        case "PRESS": return "Press";
    }
}
/** A palette button's icon: its painted picture when there is one (a picture address from the game), else its emoji. */
function paletteIcon(label, icon, picture) {
    const src = picture === null || picture === void 0 ? void 0 : picture(label);
    if (!src)
        return el("span", "ico", icon);
    const img = document.createElement("img");
    img.className = "ico-pic";
    img.src = src;
    img.alt = "";
    return img;
}
export function renderBlockEditor(root, program, state, onChange, opts) {
    var _a, _b;
    root.replaceChildren();
    const head = el("div", "prog-head");
    const start = (_a = opts.picture) === null || _a === void 0 ? void 0 : _a.call(opts, "start");
    if (start)
        head.append(paletteIcon("start", "", opts.picture));
    head.append(el("strong", "", `🤖 ${opts.robotName}'s program`), el("span", "prog-count", `${blockCount(program)} blocks`));
    const close = el("button", "prog-close", "✕");
    close.setAttribute("aria-label", "Close the program");
    close.addEventListener("click", opts.close);
    head.append(close);
    root.append(head);
    if (!opts.locked) {
        const pal = el("div", "prog-palette");
        for (const p of PALETTE) {
            const b = el("button", "prog-pal");
            b.append(paletteIcon(p.label, p.icon, opts.picture), el("span", "", p.label));
            b.addEventListener("click", () => onChange(insert(program, state, p.make())));
            pal.append(b);
        }
        root.append(pal);
    }
    const list = el("div", "prog-list");
    list.setAttribute("role", "list");
    const runKey = opts.running ? opts.running.join(".") : undefined;
    const row = (b, path, depth) => {
        const key = path.join(".");
        const r = el("div", `prog-block op-${b.op.toLowerCase()}${state.selected === key ? " sel" : ""}${runKey === key ? " running" : ""}`);
        r.style.marginLeft = `${depth * 22}px`;
        r.setAttribute("role", "listitem");
        const label = el("button", "prog-label", describeBlock(b));
        label.addEventListener("click", () => { state.selected = state.selected === key ? undefined : key; onChange([...program]); });
        r.append(label);
        if (!opts.locked && state.selected === key) {
            const tools = el("span", "prog-tools");
            const num = (field, lo, hi) => { const v = b[field]; const minus = el("button", "", "−"), plus = el("button", "", "+"); minus.addEventListener("click", () => onChange(update(program, path, { ...b, [field]: Math.max(lo, v - 1) }))); plus.addEventListener("click", () => onChange(update(program, path, { ...b, [field]: Math.min(hi, v + 1) }))); tools.append(minus, plus); };
            if (b.op === "FORWARD")
                num("n", 1, 12);
            if (b.op === "WAIT")
                num("s", 1, 9);
            if (b.op === "REPEAT")
                num("n", 1, 20);
            if (b.op === "IF" || b.op === "UNTIL") {
                const s = el("button", "", "sensor ▸");
                s.addEventListener("click", () => { const i = SENSORS.findIndex(x => x.id === b.sensor); onChange(update(program, path, { ...b, sensor: SENSORS[(i + 1) % SENSORS.length].id })); });
                tools.append(s);
            }
            if (b.op === "TURN") {
                const t = el("button", "", "⇄");
                t.addEventListener("click", () => onChange(update(program, path, { ...b, dir: b.dir === "L" ? "R" : "L" })));
                tools.append(t);
            }
            const up = el("button", "", "▲"), down = el("button", "", "▼"), del = el("button", "danger", "🗑");
            up.addEventListener("click", () => onChange(move(program, path, -1, state)));
            down.addEventListener("click", () => onChange(move(program, path, 1, state)));
            del.addEventListener("click", () => { state.selected = undefined; onChange(remove(program, path)); });
            tools.append(up, down, del);
            r.append(tools);
        }
        list.append(r);
        const slots = b.op === "REPEAT" || b.op === "UNTIL" ? [["body", b.body]] : b.op === "IF" ? [["then", b.then], ["else", b.else]] : [];
        for (const [field, inner] of slots) {
            const slotKey = `${key}.${field}`;
            const slotRow = el("button", `prog-slot${state.selected === slotKey ? " sel" : ""}`, field === "then" ? "then do:" : field === "else" ? "otherwise do:" : "do:");
            slotRow.style.marginLeft = `${(depth + 1) * 22}px`;
            slotRow.addEventListener("click", () => { state.selected = state.selected === slotKey ? undefined : slotKey; onChange([...program]); });
            list.append(slotRow);
            inner.forEach((c, i) => row(c, [...path, field, i], depth + 1));
        }
    };
    program.forEach((b, i) => row(b, [i], 0));
    if (!program.length)
        list.append(el("p", "prog-empty", opts.locked ? "No blocks." : "Tap a block above to start the program."));
    root.append(list);
    // Debugging: keep the block the robot is running in view.
    (_b = list.querySelector(".running")) === null || _b === void 0 ? void 0 : _b.scrollIntoView({ block: "nearest" });
}
/** Add a block after the selected block, or at the end of a selected slot, or at the end of the program. */
function insert(program, state, block) {
    const sel = state.selected ? parsePath(state.selected) : [];
    if (sel.length && typeof sel[sel.length - 1] === "string") {
        const list = getList(program, sel);
        const next = setList(program, sel, [...list, block]);
        state.selected = [...sel, list.length].join(".");
        return next;
    }
    if (sel.length) {
        const slot = sel.slice(0, -1);
        const i = sel[sel.length - 1];
        const list = getList(program, slot);
        const next = setList(program, slot, [...list.slice(0, i + 1), block, ...list.slice(i + 1)]);
        state.selected = [...slot, i + 1].join(".");
        return next;
    }
    state.selected = String(program.length);
    return [...program, block];
}
function update(program, path, block) { const slot = path.slice(0, -1); const i = path[path.length - 1]; const list = getList(program, slot); return setList(program, slot, list.map((b, k) => k === i ? block : b)); }
function remove(program, path) { const slot = path.slice(0, -1); const i = path[path.length - 1]; return setList(program, slot, getList(program, slot).filter((_, k) => k !== i)); }
function move(program, path, by, state) {
    const slot = path.slice(0, -1);
    const i = path[path.length - 1];
    const list = [...getList(program, slot)];
    const j = i + by;
    if (j < 0 || j >= list.length)
        return [...program];
    [list[i], list[j]] = [list[j], list[i]];
    state.selected = [...slot, j].join(".");
    return setList(program, slot, list);
}
