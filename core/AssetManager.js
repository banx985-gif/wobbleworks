export class AssetManager {
    constructor() {
        Object.defineProperty(this, "images", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    async loadImage(id, url) {
        const existing = this.images.get(id);
        if (existing)
            return existing;
        const image = new Image();
        image.decoding = "async";
        // Older tablet browsers have no image.decode(): wait for the picture to arrive instead.
        const arrived = typeof image.decode === "function" ? undefined : new Promise((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error(`Picture didn't load: ${url}`)); });
        image.src = url;
        await (arrived !== null && arrived !== void 0 ? arrived : image.decode());
        this.images.set(id, image);
        return image;
    }
    getImage(id) { return this.images.get(id); }
}
