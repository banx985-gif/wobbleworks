import { activeProfile, MAX_PROFILES } from "../app/AppState.js";
import { MAIN_LABS } from "../progression/CampaignData.js";
import { CAMPUS_REGIONS, regionStatus } from "../progression/Campus.js";
import { labCompletionCount } from "../progression/LabProgression.js";
import { lockerItems, progressSummary } from "../progression/ProgressionManager.js";
import { hubFeatures, restorationStage, dueVisitors, restorationProps } from "../progression/Restoration.js";
import { REWARDS, rewardById, MISSION_STARS } from "../progression/Rewards.js";
import { renderLook } from "../inventor/LookView.js";
import { CENTRAL_MACHINE_SYSTEMS, collectedStory } from "../story/CampusStory.js";
import { dueContractVisitors, openJobs } from "../contracts/Contracts.js";
/**
 * The look to draw: the maker look, wearing whatever the locker has equipped in the avatar slot when that
 * reward is also a maker piece (hard hat, goggles, cap) — one shared list, so the locker puts it on.
 */
export function effectiveLook(profile) {
    if (!profile.look)
        return undefined;
    const piece = profile.equipped?.avatar ? rewardById(profile.equipped.avatar)?.piece : undefined;
    if (!piece)
        return profile.look;
    const category = piece.split(".")[1];
    return { ...profile.look, [category]: piece };
}
/**
 * DOM views for the Milestone 10 screens: Workshop Hub, Campus Map, Customisation Locker,
 * Trophy Shelf, Invention Shelf and Profile Select. Views only — every change goes back to main.ts
 * through callbacks, so all saving stays in one place.
 *
 * Art: procedural vector placeholders in the existing WobbleWorks toy style.
 * Final character/prop art replaces these in the art pass (see docs/ART_NEEDED.md).
 */
const SVG_NS = "http://www.w3.org/2000/svg";
function el(tag, className = "", text) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    if (text !== undefined)
        node.textContent = text;
    return node;
}
function svg(markup, viewBox, className = "", stretch = false) {
    const node = document.createElementNS(SVG_NS, "svg");
    node.setAttribute("viewBox", viewBox);
    node.setAttribute("aria-hidden", "true");
    if (stretch)
        node.setAttribute("preserveAspectRatio", "none");
    if (className)
        node.setAttribute("class", className);
    node.innerHTML = markup;
    return node;
}
export const AVATAR_COLOURS = { ORANGE: "#ff922b", BLUE: "#339af0", GREEN: "#40c057", PURPLE: "#9775fa", PINK: "#f06595" };
/** Painted inventor portraits (cropped from Aaron's inventor-select art). */
export const AVATAR_PORTRAITS = { BLUE: "./assets/avatars/avatar.blue.webp", PINK: "./assets/avatars/avatar.pink.webp", GREEN: "./assets/avatars/avatar.green.webp" };
export function avatarBadge(profile, size = 54) {
    const wrap = el("span", "avatar-badge");
    wrap.style.setProperty("--avatar", AVATAR_COLOURS[profile.avatarStyle] ?? "#ff922b");
    wrap.style.width = wrap.style.height = `${size}px`;
    const look = effectiveLook(profile);
    if (look) {
        wrap.classList.add("has-look");
        wrap.append(renderLook(look, {}, true));
        return wrap;
    }
    const portrait = AVATAR_PORTRAITS[profile.avatarStyle];
    if (portrait) {
        const img = el("img", "avatar-portrait");
        img.src = portrait;
        img.alt = "";
        wrap.append(img);
    }
    else
        wrap.append(svg(`<circle cx="32" cy="36" r="24" fill="var(--avatar)" stroke="#18323f" stroke-width="5"/><circle cx="24" cy="34" r="4" fill="#18323f"/><circle cx="40" cy="34" r="4" fill="#18323f"/><path d="M23 45 q9 7 18 0" fill="none" stroke="#18323f" stroke-width="4" stroke-linecap="round"/>`, "0 0 64 64"));
    const hat = profile.equipped?.avatar ? rewardById(profile.equipped.avatar) : undefined;
    if (hat) {
        const h = el("span", "avatar-hat", hat.icon);
        wrap.append(h);
    }
    return wrap;
}
export const BOLT_POSES = ["point", "wave", "cheer", "panic", "inspect", "sign"];
export function boltPoseUrl(pose) { return `./assets/char/char.bolt.${pose}.webp`; }
/**
 * Costumes that still fit Bolt's painted shape are drawn on top as overlays (hats on his head, the floatie round
 * his middle). Racing Stripes was drawn onto the old code body and doesn't fit the painted one, so it isn't shown
 * until its painted overlay arrives (docs/ART_NEEDED.md).
 */
export const BOLT_COSTUME_OVERLAYS = {
    "bolt.duck-floatie": { cls: "bolt-over waist", svg: `<svg viewBox="0 0 120 40" aria-hidden="true"><ellipse cx="60" cy="22" rx="52" ry="14" fill="#ffd43b" stroke="#18323f" stroke-width="5"/><circle cx="104" cy="12" r="10" fill="#ffd43b" stroke="#18323f" stroke-width="4"/><path d="M112 12 l9 2 -9 3z" fill="#ff922b" stroke="#18323f" stroke-width="2"/></svg>` },
    "bolt.top-hat": { cls: "bolt-over head", svg: `<svg viewBox="0 0 80 60" aria-hidden="true"><rect x="22" y="4" width="36" height="40" rx="4" fill="#212529" stroke="#18323f" stroke-width="4"/><rect x="22" y="30" width="36" height="8" fill="#e03131"/><ellipse cx="40" cy="46" rx="36" ry="9" fill="#212529" stroke="#18323f" stroke-width="4"/></svg>` },
    "bolt.builder-hat": { cls: "bolt-over head", svg: `<svg viewBox="0 0 80 60" aria-hidden="true"><path d="M10 46 Q10 8 40 8 Q70 8 70 46Z" fill="#ffd43b" stroke="#18323f" stroke-width="5"/><rect x="2" y="42" width="76" height="10" rx="5" fill="#fab005" stroke="#18323f" stroke-width="4"/></svg>` }
};
export const BOLT_COSTUMES_WITHOUT_OVERLAY = ["bolt.racing-stripes"];
export function boltArt(costume, pose = "wave") {
    const wrap = el("span", `bolt-art pose-${pose}`);
    wrap.setAttribute("aria-hidden", "true");
    const img = el("img", "bolt-pic");
    img.src = boltPoseUrl(pose);
    img.alt = "";
    img.draggable = false;
    wrap.append(img);
    const over = costume ? BOLT_COSTUME_OVERLAYS[costume] : undefined;
    if (over) {
        const o = el("span", over.cls);
        o.innerHTML = over.svg;
        wrap.append(o);
    }
    return wrap;
}
/** Sprocket = the robot puppy from Aaron's key art: white, blue patches, floppy blue ears (orange inside),
 *  blue robot joints, brown collar with an orange gear tag. Code placeholder until his Sprocket art is filed. */
export function sprocketArt(accessory, awake = true) {
    const O = `stroke="#18323f" stroke-width="4" stroke-linejoin="round"`;
    const eyes = awake
        ? `<ellipse cx="62" cy="30" rx="5" ry="6" fill="#18323f"/><circle cx="63.5" cy="28" r="1.8" fill="#fff"/><ellipse cx="76" cy="30" rx="4.5" ry="5.5" fill="#18323f"/><circle cx="77.3" cy="28" r="1.6" fill="#fff"/>`
        : `<path d="M57 31 q5 4 10 0" fill="none" stroke="#18323f" stroke-width="3.5" stroke-linecap="round"/><path d="M71 31 q5 4 10 0" fill="none" stroke="#18323f" stroke-width="3.5" stroke-linecap="round"/>`;
    const mouth = awake
        ? `<path d="M63 44 q6 6 12 0" fill="#18323f"/><path d="M66 46 q3 7 6 0" fill="#f06595" stroke="#18323f" stroke-width="2"/>`
        : `<path d="M64 44 q5 3 10 0" fill="none" stroke="#18323f" stroke-width="3" stroke-linecap="round"/>`;
    const acc = accessory === "sprocket.bandana" ? `<path d="M56 54 l26 0 -12 14z" fill="#fa5252" ${O}/>`
        : accessory === "sprocket.magnet-tag" ? `<g transform="translate(69 59)"><path d="M-7 -6 v6 a7 7 0 0 0 14 0 v-6" fill="none" stroke="#e03131" stroke-width="5"/><rect x="-9.5" y="-9" width="5" height="4" fill="#ced4da"/><rect x="4.5" y="-9" width="5" height="4" fill="#ced4da"/></g>`
            : accessory === "sprocket.rain-hat" ? `<path d="M52 20 q17 -16 34 0 l6 4 h-46z" fill="#ffd43b" stroke="#18323f" stroke-width="3"/>`
                : accessory === "sprocket.flying-goggles" ? `<rect x="57" y="23" width="26" height="12" rx="6" fill="#74c0fc" stroke="#18323f" stroke-width="3"/>`
                    : accessory === "sprocket.space-helmet" ? `<circle cx="69" cy="30" r="22" fill="#a5d8ff55" stroke="#18323f" stroke-width="3"/><path d="M50 40 q19 10 38 0" stroke="#18323f" stroke-width="3" fill="none"/>`
                        : accessory === "sprocket.antenna" ? `<path d="M69 18 v-14" stroke="#18323f" stroke-width="3"/><circle cx="69" cy="4" r="4" fill="#63e6be" stroke="#18323f" stroke-width="2"/>`
                            : accessory === "sprocket.glow-collar" ? `<path d="M55 51 q14 8 28 0" fill="none" stroke="#ffd43b" stroke-width="7" stroke-linecap="round" opacity=".9"/><circle cx="69" cy="58" r="5" fill="#fff59d" stroke="#18323f" stroke-width="2"/>`
                                : accessory === "sprocket.spring-collar" ? `<path d="M56 54 q4 -6 8 0 q4 6 8 0 q4 -6 8 0" fill="none" stroke="#845ef7" stroke-width="5"/>` : "";
    return svg(`
    <path d="M18 60 q-12 -6 -8 -20" fill="none" stroke="#18323f" stroke-width="9" stroke-linecap="round" class="sprocket-tail"/>
    <path d="M18 60 q-12 -6 -8 -20" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" class="sprocket-tail"/>
    <ellipse cx="38" cy="64" rx="24" ry="17" fill="#fff" ${O}/>
    <path d="M24 56 q8 -8 18 -2 q-6 8 -18 2z" fill="#4dabf7"/>
    <circle cx="24" cy="74" r="6" fill="#4dabf7" ${O}/>
    <rect x="18" y="74" width="13" height="10" rx="5" fill="#fff" ${O}/>
    <rect x="48" y="66" width="11" height="18" rx="5" fill="#fff" ${O}/><circle cx="53.5" cy="70" r="3.5" fill="#4dabf7" stroke="#18323f" stroke-width="2"/>
    <rect x="61" y="66" width="11" height="18" rx="5" fill="#fff" ${O}/><circle cx="66.5" cy="70" r="3.5" fill="#4dabf7" stroke="#18323f" stroke-width="2"/>
    <path d="M55 12 q-14 -2 -14 16 q0 10 6 12 q2 -14 10 -22z" fill="#1c7ed6" ${O}/>
    <ellipse cx="69" cy="34" rx="18" ry="17" fill="#fff" ${O}/>
    <path d="M54 24 q6 -10 14 -6 q-2 10 -12 12z" fill="#4dabf7"/>
    <path d="M80 14 q14 0 14 18 q0 10 -5 12 q-3 -14 -10 -22z" fill="#1c7ed6" ${O}/><path d="M84 20 q7 3 6 16" fill="none" stroke="#ff922b" stroke-width="4" stroke-linecap="round"/>
    ${eyes}
    <ellipse cx="69" cy="39" rx="5" ry="3.6" fill="#18323f"/>
    ${mouth}
    <path d="M55 51 q14 8 28 0" fill="none" stroke="#a0522d" stroke-width="5" stroke-linecap="round"/>
    <g transform="translate(69 58)"><circle r="5.5" fill="#ff922b" stroke="#18323f" stroke-width="2"/>${Array.from({ length: 6 }, (_, i) => `<rect x="-1.6" y="-8" width="3.2" height="3.5" fill="#ff922b" stroke="#18323f" stroke-width="1" transform="rotate(${i * 60})"/>`).join("")}<circle r="2" fill="#ffd43b"/></g>
    ${acc}`, "0 0 100 90", "sprocket-art");
}
/** A painted hub prop (assets/hub/, filed 9 Oct). */
export function hubProp(id) { const img = el("img", "hub-prop"); img.src = `./assets/hub/${id}.webp`; img.alt = ""; img.draggable = false; return img; }
/** The display cabinet, with a little glow per invention on the shelf. */
function shelfArt(count) { const g = el("div", "station-stack shelf-stack"); g.append(hubProp("hub.prop.display-cabinet")); if (count)
    g.append(el("span", "shelf-count", "★".repeat(Math.min(3, count)))); return g; }
let hubActions;
export function renderHub(root, save, cb) {
    const p = activeProfile(save);
    root.replaceChildren();
    if (!p)
        return;
    const stage = restorationStage(save);
    const features = hubFeatures(stage);
    const summary = progressSummary(save);
    // Gift visitors first (Postie Pip), then Inventor Contract visitors, in the order they arrived.
    const visitors = [...dueVisitors(save), ...dueContractVisitors(save)];
    const top = el("div", "hub-top");
    const who = el("button", "hub-who");
    who.append(avatarBadge(p, 46), el("strong", "", p.name));
    who.addEventListener("click", cb.openProfiles);
    who.setAttribute("aria-label", `${p.name} — switch inventor`);
    const stars = el("div", "hub-stat");
    stars.append(el("span", "star on", "★"), el("strong", "", String(summary.totalStars)));
    const title = el("h1", "hub-title", "Workshop");
    const right = el("div", "hub-right");
    right.append(stars);
    hubActions ??= document.querySelector("#hub-actions") ?? undefined;
    if (hubActions)
        right.append(hubActions);
    top.append(who, title, right);
    const scene = el("div", "hub-scene");
    scene.classList.add(`stage-${stage.toLowerCase()}`);
    for (const f of features)
        scene.classList.add(`f-${f}`);
    scene.append(svg(`
    <defs><linearGradient id="hubWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe8cc"/><stop offset="1" stop-color="#ffd8a8"/></linearGradient></defs>
    <rect width="1000" height="560" fill="url(#hubWall)"/>
    ${Array.from({ length: 11 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="380" stroke="#f0c48c" stroke-width="4"/>`).join("")}
    <rect y="380" width="1000" height="180" fill="#c5d6dd"/><rect y="372" width="1000" height="14" fill="#18323f"/>
    ${Array.from({ length: 10 }, (_, i) => `<line x1="${i * 110 - 30}" y1="386" x2="${i * 140 - 160}" y2="560" stroke="#a9bec7" stroke-width="3"/>`).join("")}
    <g class="hub-window"><rect x="380" y="40" width="240" height="150" rx="16" fill="#a5d8ff" stroke="#18323f" stroke-width="8"/>
      <path d="M388 160 l50 -40 40 26 50 -50 50 40 34 -20 v62 h-224z" fill="#8ce99a" stroke="#18323f" stroke-width="4"/>
      <line x1="500" y1="40" x2="500" y2="190" stroke="#18323f" stroke-width="6"/></g>
    <g class="hub-sign"><rect x="390" y="208" width="220" height="40" rx="12" fill="#fffdf5" stroke="#18323f" stroke-width="5"/>
      <text x="500" y="236" text-anchor="middle" font-size="22" font-weight="900" fill="#18323f" font-family="system-ui">WOBBLEWORKS</text></g>
    <rect x="0" y="520" width="1000" height="40" fill="#b5c7cf"/>
    <rect class="hub-dim" width="1000" height="560" fill="#0b1a24"/>
  `, "0 0 1000 560", "hub-backdrop", true));
    const unseen = new Set(p.unseenRewards);
    const shelfBadge = p.shelf.length ? String(p.shelf.length) : undefined;
    const lockerNew = p.unseenRewards.some(id => { const k = rewardById(id)?.kind; return k === "AVATAR" || k === "BOLT_COSTUME" || k === "SPROCKET_ACCESSORY" || k === "FRAME"; });
    const trophyNew = p.unseenRewards.some(id => id.startsWith("badge.") || id.startsWith("sticker."));
    const prop = (id) => () => hubProp(id);
    const stations = [
        { id: "map", label: "Campus Map", x: 2, y: 3, w: 15, h: 38, onTap: cb.openMap, art: prop("hub.prop.blueprint-board") },
        { id: "workbench", label: "Workbench", x: 39, y: 42, w: 22, h: 40, onTap: cb.openWorkbench, art: prop("hub.prop.workbench") },
        { id: "shelf", label: "Invention Shelf", x: 68, y: 2, w: 12, h: 40, onTap: cb.openShelf, ...(shelfBadge ? { badge: shelfBadge } : {}), art: () => shelfArt(p.shelf.length) },
        { id: "trophies", label: "Trophy Shelf", x: 81, y: 2, w: 15, h: 40, onTap: cb.openTrophies, ...(trophyNew ? { badge: "NEW" } : {}), art: prop("hub.prop.trophy-shelf") },
        { id: "locker", label: "Locker", x: 1, y: 42, w: 12, h: 42, onTap: cb.openLocker, ...(lockerNew ? { badge: "NEW" } : {}), art: prop("hub.prop.parts-drawers") },
        { id: "bolt", label: "Bolt", x: 13, y: 40, w: 14, h: 46, onTap: cb.pokeBolt, art: () => { const g = el("div", "station-stack bolt-charger"); g.append(hubProp("hub.prop.bolt-charger"), boltArt(p.equipped.bolt)); return g; } },
        { id: "sprocket", label: "Sprocket", x: 63, y: 56, w: 15, h: 30, onTap: cb.pokeSprocket, art: () => { const g = el("div", "station-stack sprocket-bed"); g.append(hubProp("hub.prop.sprocket-bed"), sprocketArt(p.equipped.sprocket, features.includes("sprocket-awake"))); return g; } },
        { id: "door", label: visitors[0] ? visitors[0].name : "Visitor Door", x: 87, y: 44, w: 12, h: 40, onTap: () => { if (visitors[0])
                cb.meetVisitor(visitors[0].id); }, ...(visitors[0] ? { badge: "!" } : {}), art: () => svg(`<rect x="6" y="4" width="72" height="128" rx="10" fill="#a0522d" stroke="#18323f" stroke-width="6"/><circle cx="62" cy="70" r="5" fill="#ffd43b" stroke="#18323f" stroke-width="3"/><rect x="18" y="18" width="48" height="30" rx="6" fill="#a5d8ff" stroke="#18323f" stroke-width="4"/>${visitors[0] ? `<text x="42" y="42" text-anchor="middle" font-size="22">${visitors[0].icon}</text>` : ""}`, "0 0 84 136") }
    ];
    if (cb.openExperiments)
        stations.push({ id: "experiments", label: "Experiment Lab", x: 52, y: 22, w: 9, h: 18, onTap: cb.openExperiments, art: () => { const img = el("img", "hub-prop"); img.src = "./assets/icons/icon.energy-flask.webp"; img.alt = ""; img.draggable = false; return img; } });
    if (cb.openJobBoard)
        stations.push({ id: "jobs", label: "Job Board", x: 64, y: 41, w: 10, h: 17, onTap: cb.openJobBoard, ...(openJobs(save).length ? { badge: String(openJobs(save).length) } : {}), art: () => el("span", "job-board-art", "📋") });
    if (cb.openChallenges)
        stations.push({ id: "challenges", label: "Challenge Lab", x: 20, y: 24, w: 12, h: 17, onTap: cb.openChallenges, art: () => { const img = el("img", "hub-prop"); img.src = "./assets/icons/icon.speed.webp"; img.alt = ""; img.draggable = false; return img; } });
    if (cb.openChain)
        stations.push({ id: "chain", label: "Chain Reactions", x: 27, y: 64, w: 12, h: 22, onTap: cb.openChain, art: () => { const img = el("img", "hub-prop"); img.src = "./assets/level/level.marble-run.webp"; img.alt = ""; img.draggable = false; return img; } });
    if (p.freeBuildUnlocked)
        stations.push({ id: "freebuild", label: "Free Build", x: 41, y: 79, w: 18, h: 21, onTap: cb.openFreeBuild, art: prop("hub.prop.test-track") });
    // Painted props that aren't buttons: wall gears, the Bolt sign, the parts shelf, and what each lab's restoration brings back.
    const decor = [
        { id: "hub.prop.wall-gears", x: 18, y: 2, w: 10, cls: "spin-gears" },
        { id: "hub.prop.bolt-sign", x: 29, y: 3, w: 8, cls: features.includes("all-signs-lit") ? "lit" : features.includes("motion-sign-lit") ? "half-lit" : "unlit" },
        { id: "hub.prop.parts-shelf", x: 27.5, y: 44, w: 10.5 },
        { id: "hub.prop.inventor-statue", x: 62.5, y: 16, w: 4.6 },
        ...(p.freeBuildUnlocked ? [] : [{ id: "hub.prop.test-track", x: 42.5, y: 78, w: 15, cls: "track" }])
    ];
    const where = {
        "hub.prop.conveyor": { x: 25.5, y: 83, w: 12, cls: "belt" }, "hub.prop.plant": { x: 78.5, y: 58, w: 8 },
        "hub.prop.fountain": { x: 47, y: 13, w: 8 }, "hub.prop.toy-plane": { x: 0, y: 1, w: 9, cls: "fly" }
    };
    for (const id of restorationProps(stage))
        decor.push({ id, ...where[id] });
    for (const d of decor) {
        const box = el("div", `hub-decor${d.cls ? ` ${d.cls}` : ""}`);
        box.style.left = `${d.x}%`;
        box.style.top = `${d.y}%`;
        box.style.width = `${d.w}%`;
        box.dataset.prop = d.id;
        box.append(hubProp(d.id));
        scene.append(box);
    }
    for (const s of stations) {
        const b = el("button", `hub-station station-${s.id}`);
        b.style.left = `${s.x}%`;
        b.style.top = `${s.y}%`;
        b.style.width = `${s.w}%`;
        b.style.height = `${s.h}%`;
        b.setAttribute("aria-label", s.label);
        const art = s.art();
        art.classList.add("station-art");
        b.append(art, el("span", "station-label", s.label));
        if (s.badge)
            b.append(el("span", "station-badge", s.badge));
        b.addEventListener("click", s.onTap);
        scene.append(b);
    }
    void unseen;
    root.append(top, scene);
}
/** Painted campus-map pictures (9 Oct art): lab icons from assets/icons/, other places from assets/map/. */
export const REGION_ICON_ART = {
    "workshop-hub": "./assets/map/map.house.webp", "motion-yard": "./assets/icons/icon.cat-wheels.webp", "gear-garage": "./assets/icons/icon.cat-gears.webp",
    "builder-bay": "./assets/map/map.tower.webp", "power-lab": "./assets/icons/icon.cat-power.webp", "magnet-factory": "./assets/icons/icon.magnet.webp",
    "water-works": "./assets/icons/icon.water-drop.webp", "flight-hangar": "./assets/icons/icon.biplane.webp", "robot-lab": "./assets/icons/icon.robot.webp",
    "space-centre": "./assets/icons/icon.rocket.webp", "grand-invention-hall": "./assets/map/map.castle.webp", "hidden-prototype-lab": "./assets/map/map.windmill.webp"
};
const STATUS_LABEL = { OPEN: "Open", CLEARED: "Restored!", LOCKED_PROGRESS: "Locked", LOCKED_OWNERSHIP: "Closed", UNDER_REPAIR: "Being fixed" };
export function renderCampusMap(root, save, cb) {
    root.replaceChildren();
    const p = activeProfile(save);
    const done = new Set(p ? Object.entries(p.levels).filter(([, r]) => r.completed).map(([id]) => id) : []);
    const map = el("div", "campus-map");
    const pts = CAMPUS_REGIONS.filter(r => r.kind !== "SECRET").map(r => r.map);
    map.append(svg(`<rect width="1000" height="560" rx="30" fill="#b2f2bb"/>
    <path d="M0 470 C200 420 260 520 480 470 S800 430 1000 500 V560 H0z" fill="#8ce99a"/>
    <path d="M760 0 C820 120 940 120 1000 90 V0z" fill="#a5d8ff"/>
    <polyline points="${pts.map(q => `${q.x},${q.y}`).join(" ")}" fill="none" stroke="#fffdf5" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${pts.map(q => `${q.x},${q.y}`).join(" ")}" fill="none" stroke="#e9c46a" stroke-width="8" stroke-dasharray="2 18" stroke-linecap="round"/>
    ${[[24, 540], [520, 548], [978, 548], [980, 24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="#51cf66" stroke="#18323f" stroke-width="5"/>`).join("")}`, "0 0 1000 560", "map-backdrop", true));
    for (const region of CAMPUS_REGIONS) {
        const status = regionStatus(save, region.id);
        const b = el("button", `map-node status-${status.toLowerCase().replace("_", "-")} kind-${region.kind.toLowerCase()}`);
        b.style.left = `${region.map.x / 10}%`;
        b.style.top = `${region.map.y / 5.6}%`;
        b.style.setProperty("--region", region.colour);
        const hiddenSecret = status === "LOCKED_PROGRESS" && region.kind === "SECRET";
        const icon = el("span", "map-icon", hiddenSecret || REGION_ICON_ART[region.id] ? (hiddenSecret ? "?" : "") : region.icon);
        if (!hiddenSecret && REGION_ICON_ART[region.id]) {
            const img = el("img", "map-pic");
            img.src = REGION_ICON_ART[region.id];
            img.alt = "";
            img.addEventListener("error", () => { img.remove(); icon.textContent = region.icon; });
            icon.append(img);
        }
        const name = el("strong", "map-name", region.kind === "SECRET" && status === "LOCKED_PROGRESS" ? "???" : region.title);
        const tag = el("span", "map-status", STATUS_LABEL[status]);
        b.append(icon, name, tag);
        if (region.lab) {
            const c = labCompletionCount(region.lab, done);
            if (c.done > 0)
                b.append(el("span", "map-count", `${c.done}/${c.total}`));
        }
        b.setAttribute("aria-label", `${region.title}: ${STATUS_LABEL[status]}`);
        b.addEventListener("click", () => cb.tapRegion(region.id));
        map.append(b);
    }
    root.append(map);
}
const LOCKER_TABS = [
    { slot: "avatar", label: "Inventor", empty: "Earn hats and goggles by finishing missions with all three stars." },
    { slot: "bolt", label: "Bolt", empty: "Bolt's costumes come from big builds and silly missions." },
    { slot: "sprocket", label: "Sprocket", empty: "Sprocket's accessories come from emergencies and bouncy missions." },
    { slot: "frame", label: "Frames", empty: "Frames for your invention shelf come from delivery missions." }
];
export function renderLocker(root, save, tab, cb) {
    root.replaceChildren();
    const p = activeProfile(save);
    if (!p)
        return;
    const tabs = el("div", "locker-tabs");
    tabs.setAttribute("role", "tablist");
    for (const t of LOCKER_TABS) {
        const b = el("button", t.slot === tab ? "selected" : "", t.label);
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", String(t.slot === tab));
        b.addEventListener("click", () => cb.selectTab(t.slot));
        tabs.append(b);
    }
    const preview = el("div", "locker-preview");
    if (tab === "avatar")
        preview.append(avatarBadge(p, 120));
    else if (tab === "bolt")
        preview.append(boltArt(p.equipped.bolt));
    else if (tab === "sprocket")
        preview.append(sprocketArt(p.equipped.sprocket));
    else
        preview.append(el("div", "frame-preview", p.equipped.frame ? rewardById(p.equipped.frame)?.icon ?? "🖼️" : "🖼️"));
    const grid = el("div", "locker-grid");
    const owned = lockerItems(save, tab);
    const none = el("button", `locker-item${p.equipped[tab] === undefined ? " selected" : ""}`);
    none.append(el("span", "locker-icon", "✖"), el("span", "", "None"));
    none.addEventListener("click", () => cb.equip(tab, undefined));
    grid.append(none);
    for (const id of owned) {
        const r = rewardById(id);
        const b = el("button", `locker-item${p.equipped[tab] === id ? " selected" : ""}`);
        b.append(el("span", "locker-icon", r.icon), el("span", "", r.title));
        if (p.unseenRewards.includes(id))
            b.append(el("span", "station-badge", "NEW"));
        b.addEventListener("click", () => cb.equip(tab, id));
        grid.append(b);
    }
    const allForSlot = REWARDS.filter(r => ({ AVATAR: "avatar", BOLT_COSTUME: "bolt", SPROCKET_ACCESSORY: "sprocket", FRAME: "frame" }[r.kind] === tab));
    for (const r of allForSlot.filter(r => !owned.includes(r.id))) {
        const b = el("div", "locker-item locked");
        b.append(el("span", "locker-icon", "?"), el("span", "", "Not found yet"));
        grid.append(b);
    }
    const hint = el("p", "muted", owned.length ? "Tap to wear it." : LOCKER_TABS.find(t => t.slot === tab).empty);
    root.append(tabs, el("div", "locker-body"));
    root.lastElementChild.append(preview, grid);
    root.append(hint);
}
export function renderTrophies(root, save, cb) {
    root.replaceChildren();
    const p = activeProfile(save);
    if (!p)
        return;
    const summary = progressSummary(save);
    const head = el("p", "trophy-head");
    head.append(el("span", "star on", "★"), el("strong", "", ` ${summary.totalStars} stars · ${summary.missionsDone} missions · ${summary.labsCleared} labs restored`));
    const badges = el("div", "trophy-grid");
    for (const r of REWARDS.filter(x => x.kind === "BADGE" || x.kind === "STICKER")) {
        const has = p.rewards.includes(r.id);
        const card = el("div", `trophy${has ? "" : " missing"}${r.kind === "BADGE" ? " badge" : ""}`);
        card.append(el("span", "trophy-icon", has ? r.icon : "?"), el("strong", "", has ? r.title : "???"));
        if (has)
            card.title = r.description;
        if (p.unseenRewards.includes(r.id))
            card.append(el("span", "station-badge", "NEW"));
        badges.append(card);
    }
    const labs = el("div", "trophy-labs");
    for (const lab of MAIN_LABS) {
        const levels = lab.missions.map(m => p.levels[m.id]).filter(Boolean);
        if (!levels.length)
            continue;
        const got = levels.reduce((n, r) => n + (r?.stars.length ?? 0), 0);
        const row = el("div", "trophy-lab");
        row.append(el("span", "", lab.icon), el("strong", "", lab.title), el("span", "star on", "★"), el("span", "", `${got} of ${lab.missions.length * 3}`));
        labs.append(row);
    }
    root.append(head, labs, badges, storyBook(save, cb));
}
/** The Campus Story book: the great machine's blueprint as it is found, plus recordings and memories to replay. */
function storyBook(save, cb) {
    const c = collectedStory(save);
    const book = el("section", "story-book");
    book.append(el("h2", "", "📜 Campus Story"));
    const grid = el("div", "blueprint-grid");
    const found = new Set(c.blueprints.map(s => s.labId));
    MAIN_LABS.forEach((lab, i) => { const piece = el("div", `blueprint-piece${found.has(lab.id) ? " found" : ""}`, found.has(lab.id) ? CENTRAL_MACHINE_SYSTEMS[i] : "?"); piece.title = found.has(lab.id) ? c.blueprints.find(s => s.labId === lab.id).lines[0] : `Restore the ${lab.title} to find this piece`; grid.append(piece); });
    book.append(el("p", "", c.complete ? "The whole blueprint! The great machine is waiting in the Grand Invention Hall." : `Blueprint pieces found: ${c.blueprints.length} of ${MAIN_LABS.length}. Each restored lab adds one.`), grid);
    const list = (title, scenes, empty) => {
        const wrap = el("div", "");
        wrap.append(el("strong", "", title));
        const row = el("div", "story-list");
        if (!scenes.length)
            row.append(el("span", "muted", empty));
        for (const s of scenes) {
            const b = el("button", "", `▶ ${MAIN_LABS.find(l => l.id === s.labId)?.title ?? s.title}`);
            b.addEventListener("click", () => cb?.replayStory(s));
            row.append(b);
        }
        wrap.append(row);
        return wrap;
    };
    book.append(list("Old inventor recordings", c.recordings, "Finish a lab's Mega Build to find its recording."), list("Bolt's memories", c.memories, "Restore a lab to help Bolt remember."));
    return book;
}
export function renderShelf(root, save, cb) {
    root.replaceChildren();
    const p = activeProfile(save);
    if (!p)
        return;
    if (!p.shelf.length) {
        root.append(el("p", "", "Nothing on the shelf yet. After an invention works, tap “Put on Shelf” — or pick one in 📚 My Inventions and tap “Show on shelf”."));
        return;
    }
    const grid = el("div", "shelf-grid");
    for (const item of [...p.shelf].reverse()) {
        const b = el("button", `shelf-item${item.frameId === "frame.gold" ? " gold" : item.frameId ? " wood" : ""}`);
        const thumb = el("div", "shelf-thumb");
        thumb.append(miniBuild(item.build.parts.map(x => ({ x: x.position.x, y: x.position.y, id: x.definitionId }))));
        // An invention from My Inventions shows its saved picture when there is one.
        if (item.inventionId && cb.thumb)
            void cb.thumb(item.inventionId, item.versionN ?? 1).then(src => { if (!src)
                return; const img = el("img"); img.src = src; img.alt = ""; thumb.replaceChildren(img); });
        b.append(thumb, el("strong", "", item.title), el("span", "muted", `${item.build.parts.length} parts`));
        b.addEventListener("click", () => cb.open(item.id));
        grid.append(b);
    }
    root.append(grid);
}
export function miniBuild(parts) {
    const colour = (id) => id.includes("ramp") ? "#ffa94d" : id.includes("ball") || id.includes("marble") ? "#4dabf7" : id.includes("spring") ? "#e64980" : id.includes("wheel") ? "#495057" : id.includes("friction") ? "#a0522d" : "#ffd43b";
    return svg(`<rect width="160" height="90" fill="#e7f5ff"/><rect y="80" width="160" height="10" fill="#c5d6dd"/>${parts.slice(0, 40).map(q => `<rect x="${Math.max(0, Math.min(146, q.x * 10 - 7))}" y="${Math.max(0, Math.min(76, q.y * 9.4 - 7))}" width="14" height="14" rx="4" fill="${colour(q.id)}" stroke="#18323f" stroke-width="2"/>`).join("")}`, "0 0 160 90");
}
/** Inventor select cards, styled after Aaron's "Choose your inventor" art. Tap = select, tap again = play. */
export function renderProfileSelect(root, save, selectedId, cb) {
    root.replaceChildren();
    const ordered = [...save.profiles].sort((a, b) => b.lastPlayedAtMs - a.lastPlayedAtMs);
    for (const p of ordered) {
        const card = el("div", `inventor-card${p.id === selectedId ? " selected" : ""}`);
        card.style.setProperty("--card", AVATAR_COLOURS[p.avatarStyle] ?? "#339af0");
        const pick = el("button", "inventor-pick");
        pick.setAttribute("aria-label", `${p.name}${p.id === selectedId ? " — selected, tap to play" : ""}`);
        const art = el("div", "inventor-art");
        const portrait = AVATAR_PORTRAITS[p.avatarStyle];
        const look = effectiveLook(p);
        if (look) {
            art.classList.add("has-look");
            art.append(renderLook(look));
        }
        else if (portrait) {
            const img = el("img");
            img.src = portrait;
            img.alt = "";
            art.append(img);
        }
        else
            art.append(avatarBadge(p, 110));
        const hat = !look && p.equipped.avatar ? rewardById(p.equipped.avatar) : undefined;
        if (hat)
            art.append(el("span", "inventor-hat", hat.icon));
        const stars = Object.values(p.levels).reduce((n, r) => n + r.stars.length, 0);
        const trophies = p.rewards.filter(id => id.startsWith("badge.") || id.startsWith("sticker.")).length;
        const stats = el("div", "inventor-stats");
        for (const [icon, label, value] of [["⭐", "Stars", stars], ["⚙️", "Inventions", p.inventions.length + p.shelf.filter(s => !s.inventionId).length], ["🏆", "Trophies", trophies]]) {
            const row = el("div");
            row.append(el("span", "", icon), el("span", "", label), el("strong", "", String(value)));
            stats.append(row);
        }
        pick.append(art, el("div", "inventor-name-bar", p.name), stats);
        pick.addEventListener("click", () => (p.id === selectedId ? cb.play(p.id) : cb.select(p.id)));
        const pencil = el("button", "inventor-edit", "✏️");
        pencil.setAttribute("aria-label", `Change ${p.name}'s name or look`);
        pencil.addEventListener("click", () => cb.edit(p.id));
        card.append(pick, pencil);
        root.append(card);
    }
    if (save.profiles.length < MAX_PROFILES) {
        const add = el("button", "inventor-card create");
        add.append(el("span", "create-plus", "+"), el("strong", "", "CREATE NEW INVENTOR"));
        add.addEventListener("click", cb.create);
        root.append(add);
    }
}
export function starGoalLabels(levelId) {
    const g = MISSION_STARS[levelId];
    return g ? ["Solve it", g.efficient.label, g.advanced.label] : ["Solve it"];
}
