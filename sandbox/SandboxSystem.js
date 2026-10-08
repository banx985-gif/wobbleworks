/**
 * Sandbox objects (M23): air drag, floating balloons, moving platforms and fragile things.
 * Truth: drag and lift come from AIR — where a zone has no air (the Moon) a feather falls like a hammer and a balloon
 * doesn't float. A moving platform carries what rests on it. Fragile things break only from a hard hit.
 */
const RHO = 1.2;
function beh(def, kind) { return def?.behaviours.find(b => b.kind === kind); }
export class SandboxSystem {
    parts;
    drag = [];
    buoyant = [];
    fragile = [];
    platforms = [];
    broken = new Set();
    carried = new Set();
    pending = [];
    elapsed = 0;
    active;
    constructor(parts, definition) {
        this.parts = parts;
        for (const p of parts) {
            const d = definition(p.definitionId);
            const dr = beh(d, "AIR_DRAG"), bu = beh(d, "BUOYANT"), fr = beh(d, "FRAGILE"), r = beh(d, "RIGID_BODY");
            if (dr)
                this.drag.push({ part: p, area: dr.area });
            if (bu)
                this.buoyant.push({ part: p, lift: bu.lift });
            if (fr)
                this.fragile.push({ part: p, breakSpeed: fr.breakSpeed });
            if (beh(d, "KINEMATIC_PATH") && r)
                this.platforms.push({ part: p, width: r.width, height: r.height });
        }
        this.active = this.drag.length + this.buoyant.length + this.fragile.length + this.platforms.length > 0;
    }
    /** Force phase. `airAt(x)`: is there air here (the Space Centre's zones decide; elsewhere yes). */
    step(dt, physics, airAt) {
        if (!this.active)
            return;
        this.elapsed += dt;
        for (const { part, area } of this.drag) {
            let st;
            try {
                st = physics.state(part.id);
            }
            catch {
                continue;
            }
            if (!airAt(st.x))
                continue;
            const v = Math.hypot(st.vx, st.vy);
            if (v < 0.01)
                continue;
            // Drag can slow a very light thing to a stop, never push it backwards: cap it at what one tick could take away.
            const f = Math.min(0.5 * RHO * area * v * v, physics.mass(part.id) * v / dt * 0.5);
            physics.applyForce(part.id, { x: -f * st.vx / v, y: -f * st.vy / v });
        }
        for (const { part, lift } of this.buoyant) {
            let st;
            try {
                st = physics.state(part.id);
            }
            catch {
                continue;
            }
            if (airAt(st.x))
                physics.applyForce(part.id, { x: 0, y: -lift });
            else if (!this.carried.has(`noair:${part.id}`)) {
                this.carried.add(`noair:${part.id}`);
                this.pending.push({ kind: "NO_AIR_TO_FLOAT", sourceId: part.id });
            }
        }
        for (const pl of this.platforms) {
            const p = pl.part;
            const period = Math.max(1, Number(p.parameters.period ?? 4));
            const k = Math.sin(this.elapsed / period * Math.PI * 2);
            const x = p.position.x + Number(p.parameters.dx ?? 3) * 0.5 * k, y = p.position.y + Number(p.parameters.dy ?? 0) * 0.5 * k;
            let before;
            try {
                before = physics.state(p.id);
            }
            catch {
                continue;
            }
            physics.setStaticPose(p.id, x, y);
            const vx = (x - before.x) / dt, vy = (y - before.y) / dt;
            // Whatever rests on top rides along.
            for (const q of this.parts) {
                if (q.id === p.id)
                    continue;
                let s;
                try {
                    s = physics.state(q.id);
                }
                catch {
                    continue;
                }
                if (!Number.isFinite(physics.mass(q.id)))
                    continue;
                const top = y - pl.height / 2;
                if (Math.abs(s.x - x) <= pl.width / 2 && s.y < top && top - s.y < 0.9 && Math.abs(s.vy - vy) < 1.5) {
                    physics.setLinearVelocity(q.id, { x: vx, y: s.vy });
                    if (!this.carried.has(q.id)) {
                        this.carried.add(q.id);
                        this.pending.push({ kind: "PLATFORM_CARRY", sourceId: p.id, targetId: q.id });
                    }
                }
            }
        }
    }
    /** After the physics step: did a fragile thing just stop hard? */
    observe(physics) {
        for (const f of this.fragile) {
            if (this.broken.has(f.part.id))
                continue;
            let st;
            try {
                st = physics.state(f.part.id);
            }
            catch {
                continue;
            }
            const prev = f.lastV;
            f.lastV = { vx: st.vx, vy: st.vy };
            if (!prev)
                continue;
            const hit = Math.hypot(st.vx - prev.vx, st.vy - prev.vy);
            const speed = Math.hypot(prev.vx, prev.vy);
            if (hit > 1 && speed > f.breakSpeed) {
                this.broken.add(f.part.id);
                this.pending.push({ kind: "OBJECT_BROKE", sourceId: f.part.id, data: { speed: Math.round(speed * 100) / 100 } });
            }
        }
    }
    isBroken(id) { return this.broken.has(id); }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
