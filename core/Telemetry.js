export class Telemetry {
    constructor() {
        var _a;
        Object.defineProperty(this, "key", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "wobbleworks.gate-a.telemetry"
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { dragAttempts: 0, retries: 0, testPresses: 0 }
        });
        try {
            this.data = { ...this.data, ...JSON.parse((_a = localStorage.getItem(this.key)) !== null && _a !== void 0 ? _a : "{}") };
        }
        catch { }
    }
    inc(field) { this.data[field] += 1; try {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    }
    catch { } }
    snapshot() { return { ...this.data }; }
}
