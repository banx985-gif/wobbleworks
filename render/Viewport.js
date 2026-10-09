export const LOGICAL_WIDTH = 1600;
export const LOGICAL_HEIGHT = 900;
export class Viewport {
    constructor() {
        Object.defineProperty(this, "scale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "offsetX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "offsetY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    resize(cssWidth, cssHeight) {
        this.scale = Math.min(cssWidth / LOGICAL_WIDTH, cssHeight / LOGICAL_HEIGHT);
        this.offsetX = (cssWidth - LOGICAL_WIDTH * this.scale) / 2;
        this.offsetY = (cssHeight - LOGICAL_HEIGHT * this.scale) / 2;
    }
    screenToLogical(x, y) { return { x: (x - this.offsetX) / this.scale, y: (y - this.offsetY) / this.scale }; }
    logicalToScreen(x, y) { return { x: this.offsetX + x * this.scale, y: this.offsetY + y * this.scale }; }
}
