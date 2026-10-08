export class CameraController {
    x = 800;
    y = 450;
    zoom = 1;
    reset() { this.x = 800; this.y = 450; this.zoom = 1; }
    pan(dx, dy) { this.x -= dx / this.zoom; this.y -= dy / this.zoom; this.clamp(); }
    setZoom(next) { this.zoom = Math.max(0.65, Math.min(2.2, next)); this.clamp(); }
    worldToLogical(point) { return { x: (point.x - this.x) * this.zoom + 800, y: (point.y - this.y) * this.zoom + 450 }; }
    logicalToWorld(point) { return { x: (point.x - 800) / this.zoom + this.x, y: (point.y - 450) / this.zoom + this.y }; }
    clamp() { this.x = Math.max(400, Math.min(1200, this.x)); this.y = Math.max(250, Math.min(650, this.y)); }
}
