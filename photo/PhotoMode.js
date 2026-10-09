import { rewardById } from "../progression/Rewards.js";
import { REWARD_PICTURES, picturePath } from "../render/RewardPictures.js";
export const PHOTO_BACKGROUNDS = [
    { id: "room", label: "This room", icon: "🏠" }, { id: "sky", label: "Blue sky", icon: "☀️" }, { id: "night", label: "Night", icon: "🌙" },
    { id: "blueprint", label: "Blueprint", icon: "📐" }, { id: "party", label: "Party", icon: "🎉" }
];
export const BASIC_STICKERS = [
    { id: "basic.star", icon: "⭐", title: "Star" }, { id: "basic.heart", icon: "❤️", title: "Heart" }, { id: "basic.sparkle", icon: "✨", title: "Sparkle" },
    { id: "basic.thumbs", icon: "👍", title: "Thumbs up" }, { id: "basic.party", icon: "🎉", title: "Party" }, { id: "basic.idea", icon: "💡", title: "Idea" }
];
/** A painted sticker (M45) as a picture that the photo keeps when it is saved. */
function stickerImage(url) { const img = document.createElement("img"); img.src = url; img.alt = ""; img.draggable = false; img.className = "photo-sticker-pic"; return img; }
export function photoStickers(rewards) {
    const earned = rewards.filter(id => id.startsWith("sticker.")).map(id => rewardById(id)).filter((r) => Boolean(r)).map(r => ({ id: r.id, icon: r.icon, title: r.title, ...(REWARD_PICTURES[r.id] ? { picture: picturePath(REWARD_PICTURES[r.id]) } : {}) }));
    // Several stickers share one painted picture: offer each picture once.
    const seen = new Set();
    return [...BASIC_STICKERS, ...earned.filter(e => !e.picture || (!seen.has(e.picture) && Boolean(seen.add(e.picture))))];
}
export const BOLT_PHOTO_POSES = ["none", "wave", "cheer", "point", "inspect", "sign"];
export function photoFileName(title, at = new Date()) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "invention";
    const d = `${at.getFullYear()}${String(at.getMonth() + 1).padStart(2, "0")}${String(at.getDate()).padStart(2, "0")}`;
    return `wobbleworks-${slug}-${d}.png`;
}
/** Photo backgrounds, drawn in world space behind the build (instead of the room's own backdrop). */
export function drawPhotoBackground(c, kind, time) {
    if (kind === "room")
        return;
    c.save();
    const X = -1200, Y = -800, W = 4000, H = 2600;
    if (kind === "sky") {
        const g = c.createLinearGradient(0, 0, 0, 900);
        g.addColorStop(0, "#74c0fc");
        g.addColorStop(1, "#e7f5ff");
        c.fillStyle = g;
        c.fillRect(X, Y, W, H);
        c.fillStyle = "#ffe066";
        c.beginPath();
        c.arc(1380, 140, 70, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#fff";
        for (const [x, y] of [[260, 160], [700, 110], [1000, 220]]) {
            c.beginPath();
            c.ellipse(x, y, 90, 30, 0, 0, Math.PI * 2);
            c.ellipse(x + 50, y - 18, 60, 28, 0, 0, Math.PI * 2);
            c.fill();
        }
        c.fillStyle = "#8ce99a";
        c.fillRect(X, 820, W, H);
    }
    if (kind === "night") {
        c.fillStyle = "#1b2a4a";
        c.fillRect(X, Y, W, H);
        c.fillStyle = "#fff";
        for (let i = 0; i < 90; i++) {
            const x = (i * 197) % 1700 - 50, y = (i * 89) % 760;
            const tw = 1.5 + Math.sin(time * 2 + i) * 0.8;
            c.fillRect(x, y, tw, tw);
        }
        c.fillStyle = "#fff3bf";
        c.beginPath();
        c.arc(1350, 150, 55, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#1b2a4a";
        c.beginPath();
        c.arc(1375, 135, 50, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#2f3e5c";
        c.fillRect(X, 820, W, H);
    }
    if (kind === "blueprint") {
        c.fillStyle = "#1864ab";
        c.fillRect(X, Y, W, H);
        c.strokeStyle = "#ffffff33";
        c.lineWidth = 2;
        for (let x = -1200; x <= 2800; x += 50) {
            c.beginPath();
            c.moveTo(x, Y);
            c.lineTo(x, Y + H);
            c.stroke();
        }
        for (let y = -800; y <= 1800; y += 50) {
            c.beginPath();
            c.moveTo(X, y);
            c.lineTo(X + W, y);
            c.stroke();
        }
        c.strokeStyle = "#ffffff88";
        c.lineWidth = 4;
        c.strokeRect(40, 40, 1520, 820);
    }
    if (kind === "party") {
        c.fillStyle = "#fff0f6";
        c.fillRect(X, Y, W, H);
        const colours = ["#f06595", "#ffd43b", "#4dabf7", "#69db7c", "#b197fc"];
        for (let i = 0; i < 140; i++) {
            c.fillStyle = colours[i % 5];
            const x = (i * 151) % 1700 - 50, y = ((i * 97) + time * 30) % 900;
            c.save();
            c.translate(x, y);
            c.rotate(i + time);
            c.fillRect(-6, -3, 12, 6);
            c.restore();
        }
        c.fillStyle = "#ffdeeb";
        c.fillRect(X, 820, W, H);
    }
    c.restore();
}
export class PhotoMode {
    constructor(host) {
        Object.defineProperty(this, "host", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: host
        });
        Object.defineProperty(this, "background", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "room"
        });
        Object.defineProperty(this, "open", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "picked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bolt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "none"
        });
        Object.defineProperty(this, "withSprocket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "overlay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "layer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "drawer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "showBtn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.overlay = document.createElement("div");
        this.overlay.id = "photo-mode";
        this.overlay.className = "photo-mode hidden";
        this.layer = document.createElement("div");
        this.layer.className = "photo-layer";
        this.layer.setAttribute("aria-label", "Photo: drag to move the picture, drag stickers to place them");
        this.bar = document.createElement("div");
        this.bar.className = "photo-bar";
        this.drawer = document.createElement("div");
        this.drawer.className = "photo-drawer hidden";
        this.showBtn = this.button("👁 Show buttons", () => this.setClean(false));
        this.showBtn.className = "photo-show hidden";
        this.overlay.append(this.layer, this.drawer, this.bar, this.showBtn);
        host.stage.append(this.overlay);
        this.bar.append(this.button("🖼️ Background", () => this.openDrawer("bg")), this.button("⭐ Stickers", () => this.openDrawer("stickers")), this.button("🤖 Pose", () => this.openDrawer("pose")), this.button("🔍＋", () => host.zoom(1.15)), this.button("🔍－", () => host.zoom(1 / 1.15)), this.button("🗑 Remove", () => this.removePicked()), this.button("🙈 Hide", () => this.setClean(true)), this.button("💾 Save picture", () => void this.savePicture(), "primary"), this.button("✕ Done", () => this.exit()));
        this.layer.addEventListener("pointerdown", e => this.pointerDown(e));
    }
    isOpen() { return this.open; }
    enter() { if (this.open)
        return; this.open = true; this.overlay.classList.remove("hidden"); this.host.app.classList.add("photo-on"); this.setClean(false); this.drawer.classList.add("hidden"); }
    exit() { if (!this.open)
        return; this.open = false; this.background = "room"; this.overlay.classList.add("hidden"); this.host.app.classList.remove("photo-on"); this.layer.replaceChildren(); this.picked = undefined; this.bolt = "none"; this.withSprocket = false; this.host.onExit(); }
    button(text, on, cls = "") { const b = document.createElement("button"); b.textContent = text; if (cls)
        b.className = cls; b.addEventListener("click", on); return b; }
    setClean(clean) { this.overlay.classList.toggle("clean", clean); this.showBtn.classList.toggle("hidden", !clean); if (clean)
        this.drawer.classList.add("hidden"); }
    openDrawer(kind) {
        if (!this.drawer.classList.contains("hidden") && this.drawer.dataset.kind === kind) {
            this.drawer.classList.add("hidden");
            return;
        }
        this.drawer.dataset.kind = kind;
        this.drawer.replaceChildren();
        if (kind === "bg")
            for (const b of PHOTO_BACKGROUNDS) {
                const btn = this.button(`${b.icon} ${b.label}`, () => { this.background = b.id; this.openDrawer("bg"); this.openDrawer("bg"); });
                btn.classList.toggle("on", this.background === b.id);
                this.drawer.append(btn);
            }
        if (kind === "stickers")
            for (const s of this.host.stickers()) {
                const btn = this.button(s.picture ? "" : s.icon, () => this.addItem("sticker", s.picture ? stickerImage(s.picture) : s.icon, 0.3 + Math.random() * 0.4, 0.25 + Math.random() * 0.4));
                if (s.picture)
                    btn.append(stickerImage(s.picture));
                btn.title = s.title;
                btn.setAttribute("aria-label", `Add ${s.title} sticker`);
                btn.classList.add("photo-sticker-btn");
                this.drawer.append(btn);
            }
        if (kind === "pose") {
            for (const pose of BOLT_PHOTO_POSES) {
                const btn = this.button(pose === "none" ? "No Bolt" : `Bolt: ${pose}`, () => { this.setBolt(pose); this.openDrawer("pose"); this.openDrawer("pose"); });
                btn.classList.toggle("on", this.bolt === pose);
                this.drawer.append(btn);
            }
            const sp = this.button(this.withSprocket ? "🐕 Sprocket: on" : "🐕 Sprocket: off", () => { this.setSprocket(!this.withSprocket); this.openDrawer("pose"); this.openDrawer("pose"); });
            sp.classList.toggle("on", this.withSprocket);
            this.drawer.append(sp);
        }
        this.drawer.classList.remove("hidden");
    }
    addItem(kind, content, fx, fy) {
        const item = document.createElement("div");
        item.className = `photo-item photo-${kind}`;
        item.dataset.kind = kind;
        item.style.left = `${fx * 100}%`;
        item.style.top = `${fy * 100}%`;
        if (typeof content === "string" && kind === "sticker") {
            const g = document.createElement("span");
            g.className = "photo-glyph";
            g.textContent = content;
            item.append(g);
        }
        else if (typeof content === "string") {
            const img = document.createElement("img");
            img.className = "photo-glyph";
            img.src = content;
            img.alt = "";
            img.draggable = false;
            item.append(img);
        }
        else {
            content.classList.add("photo-glyph");
            item.append(content);
        }
        this.layer.append(item);
        this.pick(item);
        return item;
    }
    setBolt(pose) { var _a; this.bolt = pose; (_a = this.layer.querySelector(".photo-bolt")) === null || _a === void 0 ? void 0 : _a.remove(); if (pose !== "none")
        this.addItem("bolt", this.host.boltUrl(pose), 0.14, 0.62); }
    setSprocket(on) { var _a; this.withSprocket = on; (_a = this.layer.querySelector(".photo-sprocket")) === null || _a === void 0 ? void 0 : _a.remove(); if (on)
        this.addItem("sprocket", this.host.sprocket(), 0.84, 0.7); }
    pick(item) { var _a; (_a = this.picked) === null || _a === void 0 ? void 0 : _a.classList.remove("picked"); this.picked = item; item === null || item === void 0 ? void 0 : item.classList.add("picked"); }
    removePicked() {
        const p = this.picked;
        if (!p) {
            this.host.toast("Tap a sticker first, then 🗑 Remove.");
            return;
        }
        if (p.dataset.kind === "bolt")
            this.bolt = "none";
        if (p.dataset.kind === "sprocket")
            this.withSprocket = false;
        p.remove();
        this.picked = undefined;
    }
    pointerDown(e) {
        const item = e.target.closest(".photo-item");
        const rect = this.layer.getBoundingClientRect();
        let last = { x: e.clientX, y: e.clientY };
        this.layer.setPointerCapture(e.pointerId);
        e.preventDefault();
        if (item)
            this.pick(item);
        else
            this.pick(undefined);
        const move = (ev) => {
            if (item) {
                item.style.left = `${Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)) * 100}%`;
                item.style.top = `${Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height)) * 100}%`;
            }
            else
                this.host.pan(ev.clientX - last.x, ev.clientY - last.y);
            last = { x: ev.clientX, y: ev.clientY };
        };
        const up = () => { this.layer.removeEventListener("pointermove", move); this.layer.removeEventListener("pointerup", up); this.layer.removeEventListener("pointercancel", up); };
        this.layer.addEventListener("pointermove", move);
        this.layer.addEventListener("pointerup", up);
        this.layer.addEventListener("pointercancel", up);
    }
    /** The picture exactly as shown: the playfield plus stickers and characters (never the buttons). */
    async compose() {
        var _a;
        const src = this.host.canvas;
        const out = document.createElement("canvas");
        out.width = src.width;
        out.height = src.height;
        const c = out.getContext("2d");
        c.drawImage(src, 0, 0);
        const base = src.getBoundingClientRect();
        const k = src.width / Math.max(1, base.width);
        for (const g of this.layer.querySelectorAll(".photo-glyph")) {
            const r = g.getBoundingClientRect();
            const x = (r.left - base.left) * k, y = (r.top - base.top) * k, w = r.width * k, h = r.height * k;
            if (g instanceof HTMLImageElement) {
                if (g.complete)
                    c.drawImage(g, x, y, w, h);
            }
            else if (g instanceof SVGSVGElement) {
                const img = await svgImage(g);
                if (img)
                    c.drawImage(img, x, y, w, h);
            }
            else {
                c.font = `${Math.round(h * 0.85)}px system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.fillText((_a = g.textContent) !== null && _a !== void 0 ? _a : "", x + w / 2, y + h / 2);
            }
        }
        return out;
    }
    async savePicture() {
        var _a, _b;
        const pic = await this.compose();
        const name = photoFileName(this.host.title());
        const blob = await new Promise(res => { try {
            pic.toBlob(res, "image/png");
        }
        catch {
            res(null);
        } });
        let saved = false;
        if (blob) {
            try {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = name;
                document.body.append(a);
                a.click();
                a.remove();
                window.setTimeout(() => URL.revokeObjectURL(url), 4000);
                saved = true;
            }
            catch {
                saved = false;
            }
        }
        if (!saved) {
            try {
                window.open(pic.toDataURL("image/png"), "_blank");
                saved = true;
            }
            catch {
                saved = false;
            }
        }
        const cover = (_b = (_a = this.host).useAsCover) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (cover) {
            const thumb = thumbnailFrom(pic);
            if (thumb && await cover(thumb)) {
                this.host.toast(saved ? "Picture saved! It's also your invention's picture now." : "This is your invention's picture now.");
                return;
            }
        }
        this.host.toast(saved ? "Picture saved to this device (look in Downloads or Photos)." : "This device can't save pictures from the game.");
    }
}
/** Grows a pixel box to the picture's shape (16:9 by default) and keeps it inside the canvas. */
export function fitCrop(box, canvasW, canvasH, aspect = 16 / 9) {
    let w = Math.max(box.w, 40), h = Math.max(box.h, 40);
    if (w / h < aspect)
        w = h * aspect;
    else
        h = w / aspect;
    if (w > canvasW) {
        w = canvasW;
        h = w / aspect;
    }
    if (h > canvasH) {
        h = canvasH;
        w = h * aspect;
    }
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    return { x: Math.max(0, Math.min(canvasW - w, cx - w / 2)), y: Math.max(0, Math.min(canvasH - h, cy - h / 2)), w, h };
}
/** A small JPEG copy for My Inventions: the area around the machine (`crop`, in canvas pixels), or the whole canvas. */
export function thumbnailFrom(src, w = 320, h = 180, crop) {
    try {
        const out = document.createElement("canvas");
        out.width = w;
        out.height = h;
        const c = out.getContext("2d");
        if (!c || !src.width || !src.height)
            return undefined;
        c.fillStyle = "#eef8ff";
        c.fillRect(0, 0, w, h);
        if (crop) {
            const r = fitCrop(crop, src.width, src.height, w / h);
            c.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, w, h);
            return out.toDataURL("image/jpeg", 0.72);
        }
        const s = Math.max(w / src.width, h / src.height);
        const dw = src.width * s, dh = src.height * s;
        c.drawImage(src, (w - dw) / 2, (h - dh) / 2, dw, dh);
        return out.toDataURL("image/jpeg", 0.72);
    }
    catch {
        return undefined;
    }
}
function svgImage(svg) {
    return new Promise(resolve => {
        try {
            const xml = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(undefined);
            img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml.includes("xmlns=") ? xml : xml.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'))}`;
        }
        catch {
            resolve(undefined);
        }
    });
}
