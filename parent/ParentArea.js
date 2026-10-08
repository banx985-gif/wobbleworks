import { MOTION_PARENT_MAPPINGS } from "../motion/MotionYard.js";
import { GEAR_PARENT_MAPPINGS } from "../gears/GearGarage.js";
import { STRUCTURE_PARENT_MAPPINGS } from "../structures/BuilderBay.js";
import { MAIN_LABS } from "../progression/CampaignData.js";
import { labCleared } from "../progression/LabProgression.js";
import { INSTALLED_REGION_CONTENT, ownsFullGame } from "../progression/Campus.js";
import { LAB_MODULES } from "../labs/Labs.js";
import { formatBytes } from "../save/StorageMonitor.js";
import { CHAIN_PARENT_MAPPINGS } from "../chain/ChainWorkshop.js";
import { EXPERIMENT_PARENT_MAPPINGS } from "../experiment/ExperimentLab.js";
/**
 * Grown-ups area (Milestone 10 slice): gate keypad, per-child concept summary, storage manager,
 * backup export/import and profile removal. Full Parent Dashboard content arrives at M34;
 * real purchase/restore at M37 — until then the full-game switch is a clearly-labelled test tool.
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
/** Every lab's grown-up concept lines, in campaign order. */
export const PARENT_CONCEPT_GROUPS = [
    { concept: "Gears & Mechanisms", mappings: GEAR_PARENT_MAPPINGS },
    { concept: "Structures & Forces", mappings: STRUCTURE_PARENT_MAPPINGS },
    ...LAB_MODULES.map(m => ({ concept: m.concept, mappings: m.parentMappings })),
    { concept: "Cause and effect", mappings: CHAIN_PARENT_MAPPINGS },
    { concept: "Fair tests", mappings: EXPERIMENT_PARENT_MAPPINGS }
];
function conceptLines(p, mappings = MOTION_PARENT_MAPPINGS) {
    const found = new Set(p.discoveries);
    return mappings.filter(m => found.has(m.discoveryId)).map(m => m.evidence);
}
export function renderParentDashboard(root, save, storage, notice, cb) {
    root.replaceChildren();
    if (notice)
        root.append(el("p", "parent-notice", notice));
    const kids = el("section", "parent-section");
    kids.append(heading("family", "Your inventors"));
    if (!save.profiles.length)
        kids.append(el("p", "muted", "No inventor profiles yet."));
    for (const p of save.profiles) {
        const done = new Set(Object.entries(p.levels).filter(([, r]) => r.completed).map(([id]) => id));
        const labs = MAIN_LABS.filter(l => labCleared(l, done)).map(l => l.title);
        const card = el("div", "parent-kid");
        const lines = conceptLines(p);
        card.append(el("strong", "", p.name), line("progress", `Missions finished: ${done.size} · Inventions saved: ${p.shelf.length}`), line("explore", `Labs restored: ${labs.length ? labs.join(", ") : "none yet"}`), line("science", `Force & Motion explored: ${lines.length ? lines.join(", ") : "just getting started"}`));
        for (const g of PARENT_CONCEPT_GROUPS) {
            const found = conceptLines(p, g.mappings);
            if (found.length)
                card.append(line("science", `${g.concept} explored: ${found.join(", ")}`));
        }
        const del = el("button", "danger small", "Remove inventor…");
        del.addEventListener("click", () => { if (window.confirm(`Remove ${p.name} and all of their progress from this device? This can't be undone unless you have a backup.`))
            cb.deleteProfile(p.id); });
        card.append(del);
        kids.append(card);
    }
    kids.append(el("p", "muted", "WobbleWorks describes what your child explored. It never grades or labels ability."));
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
    own.append(el("p", "muted", "Buying and restoring the full game arrive in a later development build."));
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
    root.append(kids, store, own, close);
}
