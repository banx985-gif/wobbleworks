export class AssetManager {
    images = new Map();
    async loadImage(id, url) { const existing = this.images.get(id); if (existing)
        return existing; const image = new Image(); image.decoding = "async"; image.src = url; await image.decode(); this.images.set(id, image); return image; }
    getImage(id) { return this.images.get(id); }
}
