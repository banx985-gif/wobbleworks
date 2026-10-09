export class SceneManager {
    constructor() {
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    set(scene) { var _a, _b, _c, _d; (_b = (_a = this.current) === null || _a === void 0 ? void 0 : _a.exit) === null || _b === void 0 ? void 0 : _b.call(_a); this.current = scene; (_d = (_c = this.current).enter) === null || _d === void 0 ? void 0 : _d.call(_c); }
    update(dt) { var _a; (_a = this.current) === null || _a === void 0 ? void 0 : _a.update(dt); }
    render() { var _a; (_a = this.current) === null || _a === void 0 ? void 0 : _a.render(); }
}
