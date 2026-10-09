export class LifecycleCoordinator {
    constructor(pauseSafely, persistSafely, onForeground) {
        Object.defineProperty(this, "pauseSafely", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: pauseSafely
        });
        Object.defineProperty(this, "persistSafely", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: persistSafely
        });
        Object.defineProperty(this, "onForeground", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onForeground
        });
        Object.defineProperty(this, "backgrounded", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    async background() {
        if (this.backgrounded)
            return;
        this.backgrounded = true;
        this.pauseSafely();
        await this.persistSafely();
    }
    foreground() {
        if (!this.backgrounded)
            return;
        this.backgrounded = false;
        this.onForeground();
    }
    isBackgrounded() { return this.backgrounded; }
}
