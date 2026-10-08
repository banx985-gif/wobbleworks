export class Telemetry {
    key = "wobbleworks.gate-a.telemetry";
    data = { dragAttempts: 0, retries: 0, testPresses: 0 };
    constructor() { try {
        this.data = { ...this.data, ...JSON.parse(localStorage.getItem(this.key) ?? "{}") };
    }
    catch { } }
    inc(field) { this.data[field] += 1; try {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    }
    catch { } }
    snapshot() { return { ...this.data }; }
}
