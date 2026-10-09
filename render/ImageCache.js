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
    const scaled = (img, w, h) => {
        const key = `${img.src}|${w}|${h}`;
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
                const c = scaled(img, pw, ph);
                if (c) {
                    original(c, dx, dy, dw, dh);
                    return;
                }
            }
        }
        original(...args);
    };
}
