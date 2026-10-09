import { activeProfile } from "../app/AppState.js";
import { customSolved, VALIDATED_LABEL } from "../custom/CustomChallenges.js";
let picking = false;
let confirmDelete;
export function showCreatorList() { picking = false; confirmDelete = undefined; }
function el(tag, className = "", text) { const n = document.createElement(tag); if (className)
    n.className = className; if (text !== undefined)
    n.textContent = text; return n; }
function button(text, on, className = "") { const b = el("button", className, text); b.addEventListener("click", on); return b; }
export function renderCreator(root, save, cb) {
    root.replaceChildren();
    const me = activeProfile(save);
    if (picking) {
        root.append(el("p", "", "Pick a room for your challenge:"));
        const grid = el("div", "inv-grid");
        for (const r of cb.rooms())
            grid.append(button(`${r.icon} ${r.title}`, () => cb.make(r.id), "creator-room"));
        root.append(grid, button("← Back", () => { picking = false; cb.rerender(); }));
        return;
    }
    root.append(el("p", "inv-tip", "Make a challenge for your family to try: put down something to start with, a goal and some obstacles, choose the parts — then solve it yourself to prove it can be done."));
    root.append(button("➕ Make a new challenge", () => { picking = true; cb.rerender(); }, "primary"));
    const list = save.customChallenges;
    if (!list.length) {
        root.append(el("p", "inv-empty", "No challenges made on this device yet."));
        return;
    }
    const grid = el("div", "creator-grid");
    for (const c of [...list].reverse())
        grid.append(card(c, save, cb, me === null || me === void 0 ? void 0 : me.id));
    root.append(grid);
}
function card(c, save, cb, me) {
    const box = el("div", "creator-card");
    const mine = c.creatorProfileId === me;
    const done = customSolved(save, c.id);
    box.append(el("strong", "", c.name), el("span", "creator-badge", `✅ ${VALIDATED_LABEL}`));
    box.append(el("span", "muted", `By ${c.creatorName}${mine ? " (you)" : ""} · ${cb.roomTitle(c.roomId)} · ${c.partLimit ? `up to ${c.partLimit} parts` : "any number of parts"}`));
    box.append(el("span", "muted", `The creator solved it with ${c.proof.partsUsed} part${c.proof.partsUsed === 1 ? "" : "s"} in ${c.proof.seconds.toFixed(1)} s.${done.solved ? ` You solved it${done.parts !== undefined ? ` with ${done.parts} part${done.parts === 1 ? "" : "s"}` : ""} ✓` : ""}`));
    const row = el("div", "inv-actions");
    row.append(button("▶ Play", () => cb.play(c.id), "primary"));
    if (mine)
        row.append(confirmDelete === c.id ? button("Really delete it?", () => { confirmDelete = undefined; cb.remove(c.id); cb.rerender(); }, "danger") : button("🗑️ Delete", () => { confirmDelete = c.id; cb.rerender(); }));
    box.append(row);
    return box;
}
