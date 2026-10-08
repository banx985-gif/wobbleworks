export class InputManager {
    element;
    pointers = new Map();
    listeners = new Set();
    constructor(element) {
        this.element = element;
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
    onDown = (e) => { const p = this.local(e); const sample = { id: e.pointerId, x: p.x, y: p.y, startX: p.x, startY: p.y, down: true, moved: false, source: e.pointerType }; this.pointers.set(e.pointerId, sample); this.element.setPointerCapture(e.pointerId); this.emit("down", sample); };
    onMove = (e) => { const old = this.pointers.get(e.pointerId); if (!old)
        return; const p = this.local(e); const sample = { ...old, x: p.x, y: p.y, moved: old.moved || Math.hypot(p.x - old.startX, p.y - old.startY) > 6 }; this.pointers.set(e.pointerId, sample); this.emit("move", sample); };
    onUp = (e) => { const old = this.pointers.get(e.pointerId); if (!old)
        return; const p = this.local(e); const sample = { ...old, x: p.x, y: p.y, down: false }; this.emit("up", sample); this.pointers.delete(e.pointerId); };
    emit(event, sample) { for (const l of this.listeners)
        l(event, sample); }
}
