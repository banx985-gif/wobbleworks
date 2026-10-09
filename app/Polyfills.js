const g = (typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
if (typeof globalThis === "undefined")
    g.globalThis = g;
/** When the game code first ran (start-up timing, M44). */
g.__wobbleCodeStart = typeof performance !== "undefined" ? performance.now() : 0;
function define(target, name, value) {
    if (!target || name in target)
        return;
    Object.defineProperty(target, name, { value, writable: true, configurable: true, enumerable: false });
}
/** Deep copy for save data (plain objects, arrays, dates, maps, sets, typed arrays); files and pictures are shared, as structuredClone would copy them unchanged. */
export function cloneFallback(value, seen = new Map()) {
    if (value === null || typeof value !== "object")
        return value;
    if (seen.has(value))
        return seen.get(value);
    const v = value;
    if (v instanceof Date)
        return new Date(v.getTime());
    if (v instanceof RegExp)
        return new RegExp(v.source, v.flags);
    if (typeof Blob !== "undefined" && v instanceof Blob)
        return v;
    if (v instanceof ArrayBuffer)
        return v.slice(0);
    if (ArrayBuffer.isView(v)) {
        const view = v;
        return (view.slice ? view.slice() : new DataView(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength)));
    }
    if (v instanceof Map) {
        const out = new Map();
        seen.set(v, out);
        v.forEach((val, key) => out.set(cloneFallback(key, seen), cloneFallback(val, seen)));
        return out;
    }
    if (v instanceof Set) {
        const out = new Set();
        seen.set(v, out);
        v.forEach(val => out.add(cloneFallback(val, seen)));
        return out;
    }
    if (typeof v === "function")
        throw new Error("A function can't be copied");
    if (Array.isArray(v)) {
        const out = [];
        seen.set(v, out);
        for (let i = 0; i < v.length; i += 1)
            out[i] = cloneFallback(v[i], seen);
        return out;
    }
    const out = {};
    seen.set(v, out);
    for (const key of Object.keys(v))
        out[key] = cloneFallback(v[key], seen);
    return out;
}
/** A random part id when crypto.randomUUID is missing (Chrome before 92). */
export function uuidFallback() {
    const bytes = new Uint8Array(16);
    const c = g.crypto;
    if (c === null || c === void 0 ? void 0 : c.getRandomValues)
        c.getRandomValues(bytes);
    else
        for (let i = 0; i < 16; i += 1)
            bytes[i] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
/** Rounded rectangle path (canvas roundRect arrived in Chrome 99). Accepts one radius or a list, like the real one. */
export function roundRectPath(x, y, w, h, radii) {
    const list = Array.isArray(radii) ? radii : [radii !== null && radii !== void 0 ? radii : 0];
    const num = (r) => { var _a; return typeof r === "number" ? r : (_a = r === null || r === void 0 ? void 0 : r.x) !== null && _a !== void 0 ? _a : 0; };
    const [tl, tr, br, bl] = list.length === 1 ? [list[0], list[0], list[0], list[0]] : list.length === 2 ? [list[0], list[1], list[0], list[1]] : list.length === 3 ? [list[0], list[1], list[2], list[1]] : [list[0], list[1], list[2], list[3]];
    if (w < 0) {
        x += w;
        w = -w;
    }
    if (h < 0) {
        y += h;
        h = -h;
    }
    const limit = (r) => Math.max(0, Math.min(r, w / 2, h / 2));
    const a = limit(num(tl)), b = limit(num(tr)), cR = limit(num(br)), d = limit(num(bl));
    this.moveTo(x + a, y);
    this.lineTo(x + w - b, y);
    this.arcTo(x + w, y, x + w, y + b, b);
    this.lineTo(x + w, y + h - cR);
    this.arcTo(x + w, y + h, x + w - cR, y + h, cR);
    this.lineTo(x + d, y + h);
    this.arcTo(x, y + h, x, y + h - d, d);
    this.lineTo(x, y + a);
    this.arcTo(x, y, x + a, y, a);
    this.closePath();
}
export function installPolyfills() {
    if (typeof g.structuredClone !== "function")
        g.structuredClone = (value) => cloneFallback(value);
    const c = g.crypto;
    if (c && typeof c.randomUUID !== "function") {
        try {
            define(c, "randomUUID", uuidFallback);
        }
        catch { /* read-only crypto: BuildSystem copes */ }
    }
    define(String.prototype, "replaceAll", function (find, by) {
        if (find instanceof RegExp) {
            if (!find.global)
                throw new TypeError("replaceAll needs a global pattern");
            return this.replace(find, by);
        }
        return this.split(String(find)).join(typeof by === "function" ? by(String(find)) : String(by));
    });
    define(Array.prototype, "at", function (i) { const n = Math.trunc(i) || 0; return this[n < 0 ? this.length + n : n]; });
    define(Array.prototype, "findLast", function (fn) { for (let i = this.length - 1; i >= 0; i -= 1)
        if (fn(this[i], i, this))
            return this[i]; return undefined; });
    define(Object, "fromEntries", (entries) => { const out = {}; for (const [k, v] of entries)
        out[k] = v; return out; });
    define(Object, "hasOwn", (o, k) => Object.prototype.hasOwnProperty.call(o, k));
    define(Promise, "allSettled", (items) => Promise.all(Array.from(items, p => Promise.resolve(p).then(value => ({ status: "fulfilled", value }), reason => ({ status: "rejected", reason })))));
    if (typeof Element !== "undefined") {
        const replaceChildren = function (...nodes) { while (this.lastChild)
            this.removeChild(this.lastChild); this.append(...nodes); };
        define(Element.prototype, "replaceChildren", replaceChildren);
        if (typeof DocumentFragment !== "undefined")
            define(DocumentFragment.prototype, "replaceChildren", replaceChildren);
    }
    if (typeof CanvasRenderingContext2D !== "undefined")
        define(CanvasRenderingContext2D.prototype, "roundRect", roundRectPath);
    if (typeof Path2D !== "undefined")
        define(Path2D.prototype, "roundRect", roundRectPath);
}
installPolyfills();
