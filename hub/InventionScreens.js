import { activeProfile } from "../app/AppState.js";
import { comparisonLines, compareVersions, inventionStorage, latestVersion, resolveAll, shelfItemFor, thumbKey, tidySuggestion, VERSION_METRICS } from "../inventions/Inventions.js";
import { formatBytes } from "../save/StorageMonitor.js";
import { miniBuild } from "./HubScreens.js";
import { INVENTION_CARD_FRAME, picturePath } from "../render/RewardPictures.js";
let view = { kind: "LIST" };
export function showInventionList() { view = { kind: "LIST" }; }
export function showInventionDetail(id) { view = { kind: "DETAIL", id, picks: [] }; }
function el(tag, className = "", text) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    if (text !== undefined)
        node.textContent = text;
    return node;
}
function button(text, on, className = "") { const b = el("button", className, text); b.addEventListener("click", on); return b; }
const day = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });
/** A picture of one version: the saved photo when there is one, otherwise a sketch drawn from its parts. */
function picture(cb, inv, n, parts) {
    const box = el("div", "inv-thumb");
    box.append(miniBuild((parts !== null && parts !== void 0 ? parts : []).map(p => ({ x: p.position.x, y: p.position.y, id: p.definitionId }))));
    void cb.thumb(thumbKey(inv.id, n)).then(src => { if (!src)
        return; const img = el("img"); img.src = src; img.alt = ""; box.replaceChildren(img); });
    return box;
}
export function renderInventions(root, save, cb) {
    root.replaceChildren();
    const p = activeProfile(save);
    if (!p) {
        root.append(el("p", "", "Choose an inventor first."));
        return;
    }
    if (view.kind === "DETAIL" && !p.inventions.some(i => i.id === view.id))
        view = { kind: "LIST" };
    if (view.kind === "STORAGE") {
        renderStorage(root, save, cb);
        return;
    }
    if (view.kind === "DETAIL") {
        renderDetail(root, save, p.inventions.find(i => i.id === view.id), cb);
        return;
    }
    const bar = el("div", "inv-bar");
    bar.append(el("span", "muted", `${p.inventions.length} invention${p.inventions.length === 1 ? "" : "s"}`), button("🧹 Storage", () => { view = { kind: "STORAGE" }; cb.rerender(); }));
    root.append(bar);
    if (!p.inventions.length) {
        root.append(el("p", "inv-empty", "No inventions saved yet. While you build, tap 💾 Save to keep your invention here. Save again after changing it to make Version 2!"));
        return;
    }
    const grid = el("div", "inv-grid");
    for (const inv of [...p.inventions].sort((a, b) => latestVersion(b).savedAtMs - latestVersion(a).savedAtMs)) {
        const last = latestVersion(inv);
        const card = button("", () => { view = { kind: "DETAIL", id: inv.id, picks: [] }; cb.rerender(); }, "inv-card");
        // M45: each invention sits in the painted blank card (a picture frame only).
        card.style.backgroundImage = `url(${picturePath(INVENTION_CARD_FRAME)})`;
        card.classList.add("framed");
        const content = resolveAll(inv).get(last.n);
        card.append(picture(cb, inv, last.n, content === null || content === void 0 ? void 0 : content.parts), el("strong", "", inv.name), el("span", "muted", `Version ${last.n} · ${last.partCount} parts`));
        if (shelfItemFor(save, inv.id))
            card.append(el("span", "inv-shelf-tag", "⭐ On shelf"));
        grid.append(card);
    }
    root.append(grid);
}
function renderDetail(root, save, inv, cb) {
    const v = view;
    const all = resolveAll(inv);
    const newest = latestVersion(inv);
    const onShelf = shelfItemFor(save, inv.id);
    const head = el("div", "inv-head");
    head.append(button("← All inventions", () => { view = { kind: "LIST" }; cb.rerender(); }, "back-btn"));
    if (v.renaming) {
        const input = el("input", "inv-name-input");
        input.value = inv.name;
        input.maxLength = 40;
        input.setAttribute("aria-label", "Invention name");
        head.append(input, button("✓ Save name", () => { cb.rename(inv.id, input.value); v.renaming = false; cb.rerender(); }, "primary"));
        window.setTimeout(() => input.focus(), 0);
    }
    else
        head.append(el("h2", "", inv.name), button("✏️ Rename", () => { v.renaming = true; cb.rerender(); }));
    root.append(head, el("p", "muted", `Built in: ${cb.placeName(inv.environment)} · ${inv.versions.length} version${inv.versions.length === 1 ? "" : "s"} saved${inv.copiedFrom ? " · a copy" : ""}`));
    const actions = el("div", "inv-actions");
    actions.append(button(`▶ Build with Version ${newest.n}`, () => cb.open(inv.id, newest.n), "primary"), button("📄 Make a copy", () => cb.duplicate(inv.id, newest.n)), button(onShelf ? "⭐ Take off shelf" : "☆ Show on shelf", () => cb.toggleShelf(inv.id, newest.n)));
    actions.append(v.confirmDelete
        ? button(`Really delete "${inv.name}" and all its versions?`, () => { cb.remove(inv.id); view = { kind: "LIST" }; cb.rerender(); }, "danger")
        : button("🗑️ Delete", () => { v.confirmDelete = true; cb.rerender(); }));
    root.append(actions);
    if (v.picks.length === 2) {
        const c = compareVersions(inv, Math.min(...v.picks), Math.max(...v.picks));
        if (c)
            root.append(comparisonCard(c, cb));
    }
    root.append(el("p", "inv-tip", inv.versions.length >= 2 ? "Tap ⚖️ on two versions to see what changed." : "Change your invention and save again to make Version 2."));
    const list = el("div", "inv-versions");
    for (const ver of [...inv.versions].reverse()) {
        const content = all.get(ver.n);
        const row = el("div", `inv-version${v.picks.includes(ver.n) ? " picked" : ""}`);
        const words = el("div", "inv-version-words");
        words.append(el("strong", "", `Version ${ver.n}${ver.n === newest.n ? " (newest)" : ""}`), el("span", "muted", `${day(ver.savedAtMs)} · ${ver.partCount} parts${ver.restoredFrom ? ` · brought back from Version ${ver.restoredFrom}` : ""}${(onShelf === null || onShelf === void 0 ? void 0 : onShelf.versionN) === ver.n ? " · ⭐ on the shelf" : ""}`));
        if (ver.metrics) {
            const chips = el("div", "inv-chips");
            for (const [k, x] of Object.entries(ver.metrics)) {
                const m = VERSION_METRICS[k];
                if (m)
                    chips.append(el("span", "inv-chip", `${m.label}: ${k === "chain" ? x : x.toFixed(1)}${m.unit ? " " + m.unit : ""}`));
            }
            words.append(chips);
        }
        if (!content)
            words.append(el("span", "inv-warn", "This version can't be rebuilt exactly, so it won't be loaded."));
        const buttons = el("div", "inv-version-buttons");
        if (content) {
            buttons.append(button("▶ Open", () => cb.open(inv.id, ver.n)));
            if (ver.n !== newest.n)
                buttons.append(button("↩ Bring back", () => cb.restore(inv.id, ver.n)));
            const pick = button(v.picks.includes(ver.n) ? "⚖️ Picked" : "⚖️ Compare", () => { v.picks = v.picks.includes(ver.n) ? v.picks.filter(x => x !== ver.n) : [...v.picks, ver.n].slice(-2); cb.rerender(); });
            pick.setAttribute("aria-pressed", String(v.picks.includes(ver.n)));
            buttons.append(pick);
        }
        row.append(picture(cb, inv, ver.n, content === null || content === void 0 ? void 0 : content.parts), words, buttons);
        list.append(row);
    }
    root.append(list);
}
function comparisonCard(c, cb) {
    const card = el("section", "inv-compare");
    const { changes, results } = comparisonLines(c, cb.partName);
    card.append(el("h3", "", `⚖️ Version ${c.a} → Version ${c.b}`));
    const ul = el("ul");
    for (const line of changes)
        ul.append(el("li", "", line));
    card.append(ul);
    if (results.length) {
        card.append(el("strong", "", "What the tests measured"));
        const r = el("ul");
        for (const line of results)
            r.append(el("li", "", line));
        card.append(r);
    }
    else
        card.append(el("p", "muted", "TEST both versions before saving them to compare how far, how high and how fast they went."));
    return card;
}
function renderStorage(root, save, cb) {
    const v = view;
    const st = inventionStorage(save);
    const head = el("div", "inv-head");
    head.append(button("← All inventions", () => { view = { kind: "LIST" }; cb.rerender(); }, "back-btn"), el("h2", "", "🧹 Storage"));
    root.append(head);
    const share = Math.min(1, st.bytes / st.budget);
    const meter = el("div", "inv-meter");
    const fill = el("span");
    fill.style.width = `${Math.max(2, Math.round(share * 100))}%`;
    meter.append(fill);
    root.append(el("p", "", `${st.count} invention${st.count === 1 ? "" : "s"} and ${st.versions.reduce((a, b) => a + b, 0)} versions use about ${formatBytes(st.bytes)} of your ${formatBytes(st.budget)} invention space.`), meter);
    const pics = el("p", "muted", "Pictures: checking…");
    root.append(pics);
    void cb.pictureBytes().then(b => { pics.textContent = `Pictures use about ${formatBytes(b)}.`; });
    root.append(el("p", "inv-tip", "Tidying only removes old versions you pick. Your newest version, your first version and anything on the shelf always stay."));
    if (!st.big.length)
        root.append(el("p", "", "Nothing needs tidying. 👍"));
    for (const row of st.big) {
        const line = el("div", "inv-storage-row");
        line.append(el("strong", "", row.name), el("span", "muted", `${row.versions} versions · ${formatBytes(row.bytes)}`));
        line.append(v.confirmTidy === row.id
            ? button(`Remove ${row.tidyable} old version${row.tidyable > 1 ? "s" : ""}? Yes`, () => { cb.tidy(row.id); delete v.confirmTidy; cb.rerender(); }, "danger")
            : button(`Tidy up (${row.tidyable} old)`, () => { v.confirmTidy = row.id; cb.rerender(); }));
        root.append(line);
    }
    const clean = button("🖼️ Clear unused pictures", () => { clean.disabled = true; void cb.cleanPictures().then(n => { clean.textContent = n ? `Cleared ${n} unused picture${n > 1 ? "s" : ""}` : "No unused pictures"; }); });
    root.append(clean);
}
/** For tests: which versions Tidy up would remove. */
export { tidySuggestion };
