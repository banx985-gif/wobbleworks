import { pieceById } from "./InventorLook.js";
/** Card is 100 units wide and 140 tall. Head-stack layers (hair/hat/glasses) are relative to the head. */
export const CARD_HEIGHT = 140;
export const LOOK_LAYOUT = {
    backpack: { x: 66, y: 60, w: 34, z: 1 },
    outfit: { x: 22, y: 52, w: 56, z: 2 },
    gloves: { x: 0, y: 70, w: 30, z: 3 },
    shoes: { x: 24, y: 106, w: 52, z: 2 },
    skin: { x: 21, y: 8, w: 58, z: 5 },
    hair: { x: -6, y: -14, w: 112, z: 6 },
    glasses: { x: 12, y: 38, w: 76, z: 7 },
    hat: { x: -6, y: -34, w: 112, z: 8 }
};
/** Per-picture tweaks for pieces whose drawings sit differently (relative units like their layer). */
export const PIECE_NUDGE = {
    "inv.hair.ponytail-blonde": { y: -20, w: 116, x: -8 },
    "inv.hair.wild-white": { y: -22 },
    "inv.hair.curly-orange": { y: -16 },
    "inv.hat.wizard": { y: -48, x: 4, w: 92 },
    "inv.hat.hard-hat": { y: -26, x: -4, w: 108 },
    "inv.hat.cap": { y: -26, x: -4, w: 108 },
    "inv.hat.crown": { y: -34, x: 14, w: 72 },
    "inv.hat.propeller": { y: -46, x: 8, w: 84 },
    "inv.hat.propeller-rainbow": { y: -44, x: 8, w: 84 },
    "inv.hat.flatcap": { y: -24 },
    "inv.hat.aviator": { y: -20, x: -8, w: 116 }
};
const HEAD_STACK = ["hair", "glasses", "hat"];
const HEAD_ASPECT = 408 / 356;
/** Code-drawn stand-ins (named ids) for pieces whose art hasn't arrived yet — see docs/ART_NEEDED.md. */
const PLACEHOLDER_SVG = {
    "inv.hat.hard-hat": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><path d="M14 62 Q14 14 60 12 Q106 14 106 62Z" fill="#ffd43b" stroke="#18323f" stroke-width="6"/><rect x="4" y="58" width="112" height="14" rx="7" fill="#fab005" stroke="#18323f" stroke-width="6"/><path d="M60 14 V58" stroke="#18323f" stroke-width="5"/></svg>`,
    "inv.hat.cap": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><path d="M18 60 Q18 16 60 14 Q100 16 102 60Z" fill="#fa5252" stroke="#18323f" stroke-width="6"/><path d="M98 56 Q122 58 118 70 L78 66Z" fill="#c92a2a" stroke="#18323f" stroke-width="6" stroke-linejoin="round"/><circle cx="60" cy="16" r="6" fill="#fff" stroke="#18323f" stroke-width="4"/></svg>`,
    "inv.glasses.goggles": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60"><rect x="4" y="22" width="132" height="14" fill="#495057" stroke="#18323f" stroke-width="4"/><circle cx="44" cy="30" r="24" fill="#a5d8ff" stroke="#f08c00" stroke-width="8"/><circle cx="96" cy="30" r="24" fill="#a5d8ff" stroke="#f08c00" stroke-width="8"/><circle cx="36" cy="22" r="6" fill="#fff"/><circle cx="88" cy="22" r="6" fill="#fff"/></svg>`
};
export function pictureUrl(artId, manifest = {}) {
    if (manifest[artId])
        return manifest[artId];
    const svg = PLACEHOLDER_SVG[artId];
    if (svg)
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    // Inventor pieces are filed as assets/inventor/<id>.webp; a missing one just hides itself.
    return /^inv.[a-z]+.[a-z0-9-]+$/.test(artId) ? `./assets/inventor/${artId}.webp` : undefined;
}
function layer(urls, box, heightUnits, cls) {
    const node = document.createElement("span");
    node.className = `look-layer ${cls}`;
    node.style.left = `${box.x}%`;
    node.style.top = `${(box.y / heightUnits) * 100}%`;
    node.style.width = `${box.w}%`;
    node.style.zIndex = String(box.z);
    for (const url of urls) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "";
        img.draggable = false;
        img.addEventListener("error", () => img.remove());
        node.append(img);
    }
    return node;
}
/**
 * Builds the look. `headOnly` gives just the head stack in a square (for badges and inventor cards).
 * Unknown or missing pictures are simply left out, so a newer save never breaks an older build.
 */
export function renderLook(look, manifest = {}, headOnly = false) {
    const root = document.createElement("span");
    root.className = headOnly ? "look-head-only" : "look-card";
    root.setAttribute("aria-hidden", "true");
    const heightUnits = headOnly ? 100 : CARD_HEIGHT;
    const head = headOnly ? { x: 16, y: 26, w: 68, z: 5 } : LOOK_LAYOUT.skin;
    const headHeight = head.w / HEAD_ASPECT;
    const urlsFor = (category) => {
        const id = look[category];
        const piece = pieceById(id);
        const art = piece?.art ?? (id ? [id] : []);
        return art.map(a => pictureUrl(a, manifest)).filter((u) => Boolean(u));
    };
    const skin = urlsFor("skin");
    if (skin.length)
        root.append(layer(skin, head, heightUnits, "look-skin"));
    for (const category of HEAD_STACK) {
        const urls = urlsFor(category);
        if (!urls.length)
            continue;
        const base = LOOK_LAYOUT[category];
        const id = look[category];
        const nudge = PIECE_NUDGE[id] ?? {};
        const rel = { ...base, ...nudge };
        // Relative units are percentages of the head box.
        root.append(layer(urls, { x: head.x + rel.x * head.w / 100, y: head.y + rel.y * headHeight / 100, w: rel.w * head.w / 100, z: rel.z }, heightUnits, `look-${category}`));
    }
    if (headOnly)
        return root;
    for (const category of ["backpack", "outfit", "gloves", "shoes"]) {
        const urls = urlsFor(category);
        if (urls.length)
            root.append(layer(urls, LOOK_LAYOUT[category], heightUnits, `look-${category}${urls.length > 1 ? " pair" : ""}`));
    }
    return root;
}
