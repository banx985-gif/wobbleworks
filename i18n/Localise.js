let table;
let pseudoMode = false;
const done = new Set();
const ACCENT = { a: "á", e: "é", i: "í", o: "ö", u: "ü", c: "ç", n: "ñ", s: "š", y: "ý", A: "Å", E: "É", I: "Î", O: "Ø", U: "Û", C: "Ç", N: "Ñ", S: "Š" };
/** Accented and ~35% longer, wrapped in ⟦ ⟧ so untranslated (unwrapped) text is easy to spot. */
export function pseudoText(s) {
    if (!s.trim() || !/[A-Za-z]/.test(s) || s.startsWith("⟦"))
        return s;
    const body = [...s].map(ch => { var _a; return (_a = ACCENT[ch]) !== null && _a !== void 0 ? _a : ch; }).join("");
    return `⟦${body}${"~".repeat(Math.max(1, Math.round(s.length * 0.35)))}⟧`;
}
export function setLanguage(next, opts = {}) { table = next; pseudoMode = opts.pseudo === true; done.clear(); }
export function isPseudo() { return pseudoMode; }
/** The translation of an English string (or the English itself when there is none). */
export function t(text) { var _a; if (pseudoMode)
    return pseudoText(text); return (_a = table === null || table === void 0 ? void 0 : table[text]) !== null && _a !== void 0 ? _a : text; }
function translateValue(v) {
    const trimmed = v.trim();
    if (!trimmed || !/[A-Za-z]/.test(trimmed) || done.has(trimmed))
        return undefined;
    const out = t(trimmed);
    if (out === trimmed)
        return undefined;
    done.add(out);
    return v.replace(trimmed, out);
}
const ATTRS = ["aria-label", "title", "placeholder", "alt"];
/** Translate every text node and label attribute under a node. */
export function localiseTree(root) {
    if (!table && !pseudoMode)
        return;
    const walk = (n) => {
        var _a;
        if (n.nodeType === 3) {
            const next = translateValue((_a = n.nodeValue) !== null && _a !== void 0 ? _a : "");
            if (next !== undefined)
                n.nodeValue = next;
            return;
        }
        if (n.nodeType !== 1)
            return;
        const el = n;
        const tag = el.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "CANVAS" || tag === "svg" || tag === "INPUT" || tag === "TEXTAREA")
            return;
        for (const a of ATTRS) {
            const v = el.getAttribute(a);
            if (v) {
                const next = translateValue(v);
                if (next !== undefined)
                    el.setAttribute(a, next);
            }
        }
        for (const c of Array.from(el.childNodes))
            walk(c);
    };
    walk(root);
}
/** Keep translating as screens are built and changed. */
export function watch(root) {
    if ((!table && !pseudoMode) || typeof MutationObserver === "undefined")
        return undefined;
    const mo = new MutationObserver(list => { for (const m of list) {
        if (m.type === "characterData")
            localiseTree(m.target);
        else
            for (const n of Array.from(m.addedNodes))
                localiseTree(n);
    } });
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return mo;
}
/** Start-up: ?lang=pseudo, or ?lang=<code> with content/strings/<code>.json. English needs nothing. */
export async function startLocalisation(root, search = typeof location === "undefined" ? "" : location.search) {
    var _a, _b;
    const lang = (_a = new URLSearchParams(search).get("lang")) !== null && _a !== void 0 ? _a : "en";
    if (lang === "pseudo")
        setLanguage(undefined, { pseudo: true });
    else if (lang !== "en" && /^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) {
        try {
            const r = await fetch(`./content/strings/${lang}.json`);
            if (r.ok) {
                const j = await r.json();
                setLanguage((_b = j.strings) !== null && _b !== void 0 ? _b : {});
            }
        }
        catch { /* stay in English */ }
    }
    if (lang !== "en") {
        document.documentElement.lang = lang === "pseudo" ? "en-XA" : lang;
        localiseTree(root);
        watch(root);
    }
    return lang;
}
