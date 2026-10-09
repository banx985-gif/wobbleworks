export class InputManager {
    constructor(element) {
        Object.defineProperty(this, "element", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: element
        });
        Object.defineProperty(this, "pointers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "onDown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (e) => { const p = this.local(e); const sample = { id: e.pointerId, x: p.x, y: p.y, startX: p.x, startY: p.y, down: true, moved: false, source: e.pointerType }; this.pointers.set(e.pointerId, sample); this.element.setPointerCapture(e.pointerId); this.emit("down", sample); }
        });
        Object.defineProperty(this, "onMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (e) => { const old = this.pointers.get(e.pointerId); if (!old)
                return; const p = this.local(e); const sample = { ...old, x: p.x, y: p.y, moved: old.moved || Math.hypot(p.x - old.startX, p.y - old.startY) > 6 }; this.pointers.set(e.pointerId, sample); this.emit("move", sample); }
        });
        Object.defineProperty(this, "onUp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (e) => { const old = this.pointers.get(e.pointerId); if (!old)
                return; const p = this.local(e); const sample = { ...old, x: p.x, y: p.y, down: false }; this.emit("up", sample); this.pointers.delete(e.pointerId); }
        });
        element.style.touchAction = "none";
        element.addEventListener("pointerdown", this.onDown);
        element.addEventListener("pointermove", this.onMove);
        element.addEventListener("pointerup", this.onUp);
        element.addEventListener("pointercancel", this.onUp);
    }
    on(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
    active() { return [...this.pointers.values()]; }
    destroy() { this.element.removeEventListener("pointerdown", this.onDown); this.element.removeEventListener("pointermove", this.onMove); this.element.removeEventListener("pointerup", this.onUp); this.element.removeEventListener("pointercancel", this.onUp); }
    local(e) { const r = this.element.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    emit(event, sample) { for (const l of this.listeners)
        l(event, sample); }
}
