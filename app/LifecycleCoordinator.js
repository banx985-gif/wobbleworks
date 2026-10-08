export class LifecycleCoordinator {
    pauseSafely;
    persistSafely;
    onForeground;
    backgrounded = false;
    constructor(pauseSafely, persistSafely, onForeground) {
        this.pauseSafely = pauseSafely;
        this.persistSafely = persistSafely;
        this.onForeground = onForeground;
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
