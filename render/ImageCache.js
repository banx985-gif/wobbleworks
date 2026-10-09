/**
 * Faster drawing of painted art (M38). The part pictures are ~400–500 px but are drawn at ~50–150 px; shrinking
 * them again on every frame was the main drawing cost in busy rooms. This keeps a small cache of copies already
 * shrunk to the size they are drawn at (rounded up to a size bucket, so zooming doesn't make endless copies).
 * Drawing only: what is drawn, and where, is unchanged.
 */
const MAX_ENTRIES = 400;
const BUCKET = 32;
export function installImageCache(ctx) {
    const original = ctx.drawImage.bind(ctx);
    const cache = new Map();
    const scaled = (img, w, h, crop, filter = "none") => {
        const key = `${img.src}|${w}|${h}${crop ? `|${crop.join(",")}` : ""}${filter !== "none" ? `|${filter}` : ""}`;
        const hit = cache.get(key);
        if (hit) {
            cache.delete(key);
            cache.set(key, hit);
            return hit;
        }
        if (typeof document === "undefined")
            return undefined;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d");
        if (!g)
            return undefined;
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = "high";
        if (filter !== "none")
            g.filter = filter;
        if (crop)
            g.drawImage(img, crop[0], crop[1], crop[2], crop[3], 0, 0, w, h);
        else
            g.drawImage(img, 0, 0, w, h);
        cache.set(key, c);
        if (cache.size > MAX_ENTRIES)
            cache.delete(cache.keys().next().value);
        return c;
    };
    ctx.drawImage = (...args) => {
        const img = args[0];
        if (args.length === 5 && img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0) {
            const [, dx, dy, dw, dh] = args;
            const t = ctx.getTransform();
            const sx = Math.hypot(t.a, t.b), sy = Math.hypot(t.c, t.d);
            const pw = Math.ceil(Math.abs(dw) * sx / BUCKET) * BUCKET, ph = Math.ceil(Math.abs(dh) * sy / BUCKET) * BUCKET;
            // Only worth it when the picture is drawn at well under half its real size.
            if (pw > 0 && ph > 0 && pw * 2 <= img.naturalWidth && ph * 2 <= img.naturalHeight) {
                // M50: a colour filter (e.g. a switched-off bulb greyed out) is baked into the copy once, not worked out every frame.
                const filter = typeof ctx.filter === "string" ? ctx.filter : "none";
                const c = scaled(img, pw, ph, undefined, filter);
                if (c) {
                    if (filter !== "none")
                        ctx.filter = "none";
                    original(c, dx, dy, dw, dh);
                    if (filter !== "none")
                        ctx.filter = filter;
                    return;
                }
            }
        }
        // M50: a cut-out of a bigger picture (sx, sy, sw, sh → dx, dy, dw, dh) gets its own ready-shrunk copy too.
        if (args.length === 9 && img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0) {
            const [, sx, sy, sw, sh, dx, dy, dw, dh] = args;
            const t = ctx.getTransform();
            const s = Math.hypot(t.a, t.b), s2 = Math.hypot(t.c, t.d);
            const pw = Math.ceil(Math.abs(dw) * s / BUCKET) * BUCKET, ph = Math.ceil(Math.abs(dh) * s2 / BUCKET) * BUCKET;
            if (pw > 0 && ph > 0 && pw * 2 <= sw && ph * 2 <= sh) {
                const c = scaled(img, pw, ph, [sx, sy, sw, sh]);
                if (c) {
                    original(c, dx, dy, dw, dh);
                    return;
                }
            }
        }
        original(...args);
    };
}
