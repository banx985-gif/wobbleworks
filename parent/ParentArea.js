import { ABOUT_POINTS, HELP_POINTS, PARENT_CONCEPT_GROUPS, PRIVACY_POINTS, childSummary } from "./ParentSummary.js";
import { MAIN_LABS } from "../progression/CampaignData.js";
import { INSTALLED_REGION_CONTENT, ownsFullGame } from "../progression/Campus.js";
import { formatBytes } from "../save/StorageMonitor.js";
/**
 * Grown-ups area: gate keypad and the Parent Dashboard (M34) — each inventor's evidence-backed summary
 * (src/parent/ParentSummary.ts), storage and backups, full-game controls, privacy, help and about.
 * Real store purchase/restore arrives at M37; until then the buttons explain that, and a clearly-labelled test tool remains.
 */
function el(tag, className = "", text) {
    const n = document.createElement(tag);
    if (className)
        n.className = className;
    if (text !== undefined)
        n.textContent = text;
    return n;
}
/** Grown-ups gate, laid out after Aaron's "Grown-ups only" art (8 Oct): number boxes, big keypad with ← and ✓, info panel. */
export function renderParentGate(root, gate, message, onPress, onBack, onDelete = () => undefined) {
    root.replaceChildren();
    const main = el("div", "blue-panel gate-panel");
    const prompt = el("p", "gate-prompt");
    prompt.append(el("span", "", "To open the grown-ups area, type this number:"), el("strong", "", gate.current().prompt));
    const boxes = el("div", "gate-boxes");
    const entered = gate.enteredDigits();
    for (let i = 0; i < gate.current().digits.length; i += 1)
        boxes.append(el("span", i < entered.length ? "on" : "", i < entered.length ? String(entered[i]) : ""));
    const pad = el("div", "gate-keys");
    for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
        const b = el("button", "key", String(d));
        b.addEventListener("click", () => onPress(d));
        pad.append(b);
    }
    const del = el("button", "key del", "⬅");
    del.setAttribute("aria-label", "Delete");
    del.addEventListener("click", onDelete);
    const zero = el("button", "key", "0");
    zero.addEventListener("click", () => onPress(0));
    const ok = el("button", "key ok", "✔");
    ok.setAttribute("aria-label", "Check");
    ok.disabled = true;
    ok.title = "Checks automatically when all numbers are in";
    pad.append(del, zero, ok);
    main.append(prompt, boxes, pad, el("p", "gate-message", message));
    const side = el("div", "gate-side");
    for (const [icon, label] of [["⚙️", "Settings"], ["👥", "Manage inventors"], ["💾", "Backups & storage"], ["📊", "See progress"], ["🔓", "Full game"]]) {
        const r = el("div", "gate-side-row");
        r.append(el("span", "", icon), el("span", "", label));
        side.append(r);
    }
    side.append(el("p", "", "Thanks for helping keep WobbleWorks a safe and positive space for kids! 🙂"));
    const body = el("div", "gate-body");
    body.append(main, side);
    const back = el("button", "big-btn back", "⬅ Back");
    back.addEventListener("click", onBack);
    const actions = el("div", "art-actions");
    actions.append(back, el("span"), el("span"));
    root.append(body, actions);
}
/** A painted grown-ups icon (assets/parent/, filed 9 Oct). */
function parentIcon(id) { const img = el("img", "parent-icon"); img.src = `./assets/parent/parent.icon.${id}.webp`; img.alt = ""; return img; }
function heading(icon, text) { const h = el("h2", "parent-h"); h.append(parentIcon(icon), document.createTextNode(text)); return h; }
function line(icon, text) { const s = el("span", "parent-line"); s.append(parentIcon(icon), el("span", "", text)); return s; }
export { PARENT_CONCEPT_GROUPS };
/** A titled list; an empty list shows a gentle "not yet" line instead (never a judgement). */
function list(title, lines, empty) {
    const box = el("div", "parent-block");
    box.append(el("strong", "", title));
    if (!lines.length)
        box.append(el("span", "muted", empty));
    for (const t of lines)
        box.append(el("span", "parent-item", t));
    return box;
}
/** One inventor's page: what they explored (from evidence), labs, experiments, coding, making, and things to try at home. */
function childCard(save, p, cb) {
    const sum = childSummary(save, p);
    const card = el("details", "parent-kid");
    if (save.profiles.length === 1 || p.id === save.activeProfileId)
        card.open = true;
    const head = el("summary", "");
    head.append(el("strong", "", sum.name));
    if (sum.lastPlayed)
        head.append(el("span", "muted", ` · last played ${sum.lastPlayed}`));
    card.append(head);
    card.append(line("science", "What they explored"));
    card.append(sum.concepts.length ? (() => { const box = el("div", "parent-block"); for (const g of sum.concepts)
        box.append(el("span", "parent-item", `${g.concept}: ${g.evidence.join("; ")}`)); return box; })() : el("p", "muted", "Nothing recorded yet. Discoveries appear here when they really happen in a test — finishing a level isn't enough on its own."));
    card.append(line("explore", "Labs and challenges"), list("", sum.labs.map(l => `${l.title} — ${l.line}`), "No missions finished yet."));
    card.append(line("science", "Experiments"), list("", sum.experiments, "No experiments saved yet."));
    card.append(line("progress", "Coding"), list("", sum.programming, "No coding concepts met yet — they come in the Robot Lab."));
    card.append(line("activity", "Making and sharing"), list("", sum.making, "Nothing saved yet."));
    if (sum.tryAtHome.length) {
        const home = el("div", "parent-block");
        home.append(el("strong", "", "Try at home"));
        for (const t of sum.tryAtHome)
            home.append(el("span", "parent-item", `${t.concept}: ${t.ideas[0]}`));
        card.append(line("family", "Ideas for real-world play"), home);
    }
    const del = el("button", "danger small", "Remove inventor…");
    del.addEventListener("click", () => { if (window.confirm(`Remove ${p.name} and all of their progress from this device? This can't be undone unless you have a backup.`))
        cb.deleteProfile(p.id); });
    card.append(del);
    return card;
}
/** A section of plain-language points (privacy, help, about). */
function infoSection(icon, title, points) {
    const sec = el("section", "parent-section");
    const d = el("details", "");
    const sm = el("summary", "");
    sm.append(heading(icon, title));
    d.append(sm);
    const ul = el("ul", "parent-points");
    for (const t of points)
        ul.append(el("li", "", t));
    d.append(ul);
    sec.append(d);
    return sec;
}
export function renderParentDashboard(root, save, storage, notice, cb) {
    root.replaceChildren();
    if (notice)
        root.append(el("p", "parent-notice", notice));
    const kids = el("section", "parent-section");
    kids.append(heading("family", "Your inventors"));
    if (!save.profiles.length)
        kids.append(el("p", "muted", "No inventor profiles yet."));
    for (const p of save.profiles)
        kids.append(childCard(save, p, cb));
    kids.append(el("p", "muted", "WobbleWorks only describes what your child has explored and made. Nothing here marks, compares or labels children."));
    const store = el("section", "parent-section");
    store.append(heading("activity", "Storage & backups"));
    if (storage) {
        const usage = storage.usageBytes !== undefined && storage.quotaBytes !== undefined ? `${formatBytes(storage.usageBytes)} of ${formatBytes(storage.quotaBytes)} available space used` : "Device storage size not reported by this browser";
        store.append(el("p", "", `Save size: ${formatBytes(storage.saveBytes)} · Saved inventions: ${storage.inventionCount} · ${usage}`));
        if (storage.level === "NEARLY_FULL")
            store.append(el("p", "parent-warn", "This device is nearly out of space. Export a backup to be safe."));
    }
    const exp = el("button", "primary", "Export backup file");
    exp.addEventListener("click", cb.exportBackup);
    const label = el("label", "file-button");
    label.textContent = "Import backup file…";
    const input = el("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.className = "visually-hidden";
    input.addEventListener("change", () => { const f = input.files?.[0]; if (f)
        cb.importBackup(f); input.value = ""; });
    label.append(input);
    const row = el("div", "parent-row");
    row.append(exp, label);
    store.append(row, el("p", "muted", "Importing replaces everything on this device. Your current save is kept as a safety copy first."));
    const own = el("section", "parent-section");
    own.append(heading("award", "Full game"));
    own.append(el("p", "", ownsFullGame(save.entitlement) ? "The full campus is unlocked on this device." : "Free: the opening, all of the Motion Yard and Empty Workshop Free Build. The full game opens the rest of the campus."));
    if (cb.ownershipLine)
        own.append(el("p", "parent-ownership", cb.ownershipLine()));
    const buyRow = el("div", "parent-row");
    if (!ownsFullGame(save.entitlement)) {
        const buy = el("button", "primary", "Unlock the full game…");
        buy.addEventListener("click", () => cb.purchase("BUY"));
        buyRow.append(buy);
    }
    const restore = el("button", "", "Restore a purchase");
    restore.addEventListener("click", () => cb.purchase("RESTORE"));
    buyRow.append(restore);
    own.append(buyRow, el("p", "muted", "Children never see a shop: the full game can only be unlocked here, in the grown-ups area."));
    const toggle = el("button", "", ownsFullGame(save.entitlement) ? "Test tool: lock full game again" : "Test tool: pretend full game is owned");
    toggle.addEventListener("click", () => cb.setFullGameForTesting(!ownsFullGame(save.entitlement)));
    own.append(toggle);
    if (ownsFullGame(save.entitlement) && cb.openLabForTesting) {
        for (const { id: labId, title } of MAIN_LABS.filter(l => l.id !== "motion-yard" && INSTALLED_REGION_CONTENT.has(l.id))) {
            const peek = el("button", "", `Test tool: open the ${title} now`);
            peek.addEventListener("click", () => cb.openLabForTesting(labId));
            own.append(peek);
        }
        own.append(el("p", "muted", "For testing: skips finishing the earlier labs first. Nothing in the save is changed by opening one."));
    }
    const close = el("button", "primary", "Done");
    close.addEventListener("click", cb.close);
    root.append(kids, store, own, infoSection("explore", "Privacy", PRIVACY_POINTS), infoSection("progress", "Help for grown-ups", HELP_POINTS), infoSection("award", "About WobbleWorks", ABOUT_POINTS), close);
}
