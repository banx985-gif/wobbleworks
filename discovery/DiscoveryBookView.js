import { bookView } from "./DiscoveryBook.js";
/**
 * The Inventor Discovery Book screen (DOM). View only: it reads the save and draws pages.
 * `artUrl` turns an art id into its file (assets/manifest.json); missing art shows a simple badge.
 */
function el(tag, className = "", text) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    if (text !== undefined)
        node.textContent = text;
    return node;
}
const SECTION_TITLES = { CONCEPT: "Discoveries", COMBINATION: "Combination Discoveries", SECRET: "Secret Experiments" };
export function renderDiscoveryBook(root, save, artUrl, tab, onTab) {
    const view = bookView(save);
    root.replaceChildren();
    const tabs = el("div", "book-tabs");
    for (const [id, label] of [["DISCOVERIES", `Discoveries ${view.foundCount}/${view.total}`], ["PARTS", "Part Cards"]]) {
        const b = el("button", `book-tab${tab === id ? " on" : ""}`, label);
        b.setAttribute("aria-pressed", String(tab === id));
        b.addEventListener("click", () => onTab(id));
        tabs.append(b);
    }
    root.append(tabs);
    const picture = (id, found) => {
        const url = artUrl(id);
        const frame = el("span", `book-pic${found ? "" : " unfound"}`);
        if (url) {
            const img = el("img");
            img.src = url;
            img.alt = "";
            frame.append(img);
        }
        else
            frame.textContent = "★";
        return frame;
    };
    if (tab === "DISCOVERIES") {
        for (const kind of ["CONCEPT", "COMBINATION", "SECRET"]) {
            const entries = view.entries.filter(e => e.kind === kind);
            const section = el("section", `book-section kind-${kind.toLowerCase()}`);
            section.append(el("h2", "", SECTION_TITLES[kind]));
            const grid = el("div", "book-grid");
            for (const e of entries) {
                const card = el("article", `book-card${e.found ? " found" : ""}`);
                card.append(picture(e.kind === "SECRET" && !e.found ? "fx.star-splash" : e.art, e.found));
                const text = el("div", "book-text");
                text.append(el("strong", "", e.title), el("span", "", e.line));
                if (e.realWorld) {
                    const rw = el("span", "book-rw");
                    rw.append(el("b", "", `🌍 ${e.realWorld.title}: `), document.createTextNode(e.realWorld.example));
                    text.append(rw);
                }
                card.append(text);
                grid.append(card);
            }
            section.append(grid);
            root.append(section);
        }
        if (view.foundCount === 0)
            root.append(el("p", "book-empty", "Build something and press TEST. Everything you notice goes in here!"));
        return;
    }
    const grid = el("div", "book-grid parts");
    for (const c of view.parts) {
        const card = el("article", `book-card part${c.anyFound ? " found" : ""}`);
        card.append(picture(c.partId, c.anyFound));
        const text = el("div", "book-text");
        text.append(el("strong", "", c.title));
        const uses = el("ul", "book-uses");
        for (const u of c.uses) {
            const li = el("li", u.found ? "on" : "", u.found ? `✓ ${u.label}` : "? ? ?");
            uses.append(li);
        }
        text.append(uses);
        card.append(text);
        grid.append(card);
    }
    root.append(el("p", "book-note", "Each part can do different jobs. Try them in new ways to fill the cards!"), grid);
}
