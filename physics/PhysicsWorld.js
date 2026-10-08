/**
 * Deterministic Gate-A physics backend.
 * The production adapter boundary is intentionally narrow so Planck can replace this backend
 * without changing BuildSnapshot, connections, goals or content data.
 */
export class PhysicsWorld {
    bodies = new Map();
    springs = [];
    ropes = [];
    motors = [];
    hinges = [];
    breakables = [];
    gravity;
    brokenJointEvents = [];
    contactEvents = [];
    constructor(gravity = { x: 0, y: 9.81 }) { this.gravity = gravity; }
    addBody(spec) {
        const mass = spec.type === "STATIC" ? Number.POSITIVE_INFINITY : Math.max(0.05, (spec.density ?? 1) * spec.width * spec.height);
        this.bodies.set(spec.id, {
            id: spec.id, type: spec.type, shape: spec.shape, x: spec.position.x, y: spec.position.y,
            angle: spec.angle ?? 0, width: spec.width, height: spec.height, vx: 0, vy: 0,
            angularVelocity: 0, mass, friction: spec.friction ?? 0.4, restitution: spec.restitution ?? 0.2,
            forceX: 0, forceY: 0, lastForceX: 0, lastForceY: 0, ...(spec.group ? { group: spec.group } : {})
        });
    }
    addSpring(a, b, restLength, stiffness = 20, damping = 1.5) { this.springs.push({ a, b, restLength, stiffness, damping }); }
    addRope(a, b, maxLength) { this.ropes.push({ a, b, maxLength }); }
    addMotor(bodyId, targetSpeed, maxTorque) { this.motors.push({ bodyId, targetSpeed, maxTorque }); }
    addHinge(bodyId, anchor) {
        const b = this.mustBody(bodyId);
        this.hinges.push({ bodyId, anchor, radius: Math.hypot(b.x - anchor.x, b.y - anchor.y) });
    }
    addBodyHinge(anchorBodyId, bodyId) {
        const anchor = this.mustBody(anchorBodyId), b = this.mustBody(bodyId);
        this.hinges.push({ bodyId, anchorBodyId, radius: Math.hypot(b.x - anchor.x, b.y - anchor.y) });
    }
    addBreakable(a, b, threshold) { this.breakables.push({ a, b, threshold, broken: false }); }
    applyForce(id, force) { const b = this.mustBody(id); if (b.type === "DYNAMIC") {
        b.forceX += force.x;
        b.forceY += force.y;
    } }
    setAngularVelocity(id, speed) { const b = this.mustBody(id); if (b.type === "DYNAMIC")
        b.angularVelocity = speed; }
    /** Constraint helpers (Magnet Factory guides and crane hooks): place a dynamic body exactly. */
    setPose(id, x, y, angle) { const b = this.mustBody(id); if (b.type !== "DYNAMIC")
        return; b.x = x; b.y = y; if (angle !== undefined) {
        b.angle = angle;
        b.angularVelocity = 0;
    } }
    /** Flight Hangar: a craft weighs its body plus everything attached to it (set once at the start of a TEST). */
    setMass(id, mass) { const b = this.mustBody(id); if (b.type === "DYNAMIC")
        b.mass = Math.max(0.02, mass); }
    /** Space Centre: gravity can differ per environment (mass never changes). */
    setGravity(g) { this.gravity = g; }
    getGravity() { return this.gravity; }
    setLinearVelocity(id, velocity) { const b = this.mustBody(id); if (b.type === "DYNAMIC") {
        b.vx = velocity.x;
        b.vy = velocity.y;
    } }
    step(dt) {
        this.brokenJointEvents.length = 0;
        this.contactEvents.length = 0;
        this.solveSprings();
        this.solveMotors(dt);
        for (const b of this.bodies.values()) {
            if (b.type !== "DYNAMIC")
                continue;
            b.lastForceX = b.forceX;
            b.lastForceY = b.forceY;
            b.vx += (this.gravity.x + b.forceX / b.mass) * dt;
            b.vy += (this.gravity.y + b.forceY / b.mass) * dt;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.angle += b.angularVelocity * dt;
            b.forceX = 0;
            b.forceY = 0;
            this.solveWorldBounds(b);
        }
        this.solveRopes();
        this.solveBodyCollisions();
        // Positional joint constraints are solved after contacts so connected children do not drift away from moving parents.
        this.solveHinges();
        this.checkBreakables();
    }
    solveSprings() {
        for (const s of this.springs) {
            const a = this.mustBody(s.a), b = this.mustBody(s.b);
            const dx = b.x - a.x, dy = b.y - a.y, dist = Math.max(0.0001, Math.hypot(dx, dy));
            const nx = dx / dist, ny = dy / dist;
            const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
            const force = (dist - s.restLength) * s.stiffness + (rvx * nx + rvy * ny) * s.damping;
            if (a.type === "DYNAMIC") {
                a.forceX += nx * force;
                a.forceY += ny * force;
            }
            if (b.type === "DYNAMIC") {
                b.forceX -= nx * force;
                b.forceY -= ny * force;
            }
        }
    }
    solveMotors(dt) {
        for (const m of this.motors) {
            const b = this.mustBody(m.bodyId);
            if (b.type !== "DYNAMIC")
                continue;
            const error = m.targetSpeed - b.angularVelocity;
            const impulse = Math.max(-m.maxTorque * dt, Math.min(m.maxTorque * dt, error));
            b.angularVelocity += impulse;
        }
    }
    solveRopes() {
        for (const r of this.ropes) {
            const a = this.mustBody(r.a), b = this.mustBody(r.b);
            const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
            if (dist <= r.maxLength || dist === 0)
                continue;
            const excess = dist - r.maxLength, nx = dx / dist, ny = dy / dist;
            if (a.type === "DYNAMIC" && b.type === "DYNAMIC") {
                a.x += nx * excess * 0.5;
                a.y += ny * excess * 0.5;
                b.x -= nx * excess * 0.5;
                b.y -= ny * excess * 0.5;
            }
            else if (a.type === "DYNAMIC") {
                a.x += nx * excess;
                a.y += ny * excess;
            }
            else if (b.type === "DYNAMIC") {
                b.x -= nx * excess;
                b.y -= ny * excess;
            }
        }
    }
    solveHinges() {
        for (const h of this.hinges) {
            const b = this.mustBody(h.bodyId);
            if (b.type !== "DYNAMIC")
                continue;
            const anchor = h.anchorBodyId ? this.mustBody(h.anchorBodyId) : h.anchor;
            if (!anchor)
                continue;
            const ax = anchor.x, ay = anchor.y;
            const dx = b.x - ax, dy = b.y - ay, dist = Math.max(0.0001, Math.hypot(dx, dy));
            b.x = ax + dx / dist * h.radius;
            b.y = ay + dy / dist * h.radius;
        }
    }
    solveWorldBounds(b) {
        const floor = 8.4, left = 0.25, right = 15.75;
        const radiusX = b.width / 2, radiusY = b.height / 2;
        if (b.y + radiusY > floor) {
            b.y = floor - radiusY;
            b.vy = -Math.abs(b.vy) * b.restitution;
            b.vx *= Math.max(0, 1 - b.friction * 0.03);
        }
        if (b.x - radiusX < left) {
            b.x = left + radiusX;
            b.vx = Math.abs(b.vx) * b.restitution;
        }
        if (b.x + radiusX > right) {
            b.x = right - radiusX;
            b.vx = -Math.abs(b.vx) * b.restitution;
        }
    }
    solveBodyCollisions() {
        const list = [...this.bodies.values()];
        for (let i = 0; i < list.length; i += 1)
            for (let j = i + 1; j < list.length; j += 1) {
                const a = list[i], b = list[j];
                if (a.type === "STATIC" && b.type === "STATIC")
                    continue;
                if (a.group !== undefined && a.group === b.group)
                    continue;
                const surfaceBody = a.type === "DYNAMIC" && b.type === "STATIC" && b.shape === "BOX" && b.height <= 0.35 && Math.abs(b.angle) < 0.0001 ? a
                    : b.type === "DYNAMIC" && a.type === "STATIC" && a.shape === "BOX" && a.height <= 0.35 && Math.abs(a.angle) < 0.0001 ? b : undefined;
                const surface = surfaceBody === a ? b : surfaceBody === b ? a : undefined;
                if (surfaceBody && surface && this.solveDynamicOnSurface(surfaceBody, surface))
                    continue;
                const rampBody = a.type === "DYNAMIC" && b.type === "STATIC" && b.shape === "RAMP" ? a
                    : b.type === "DYNAMIC" && a.type === "STATIC" && a.shape === "RAMP" ? b : undefined;
                const ramp = rampBody === a ? b : rampBody === b ? a : undefined;
                if (rampBody && ramp) {
                    this.solveCircleVsRamp(rampBody, ramp);
                    continue;
                }
                if (a.shape === "RAMP" || b.shape === "RAMP")
                    continue;
                const dynamicCircle = a.type === "DYNAMIC" && a.shape === "CIRCLE" && b.type === "STATIC" && b.shape === "BOX" ? a
                    : b.type === "DYNAMIC" && b.shape === "CIRCLE" && a.type === "STATIC" && a.shape === "BOX" ? b : undefined;
                const staticBox = dynamicCircle === a ? b : dynamicCircle === b ? a : undefined;
                if (dynamicCircle && staticBox && Math.abs(staticBox.angle) > 0.0001) {
                    this.solveCircleVsOrientedBox(dynamicCircle, staticBox);
                    continue;
                }
                const overlapX = (a.width + b.width) / 2 - Math.abs(a.x - b.x);
                const overlapY = (a.height + b.height) / 2 - Math.abs(a.y - b.y);
                if (overlapX <= 0 || overlapY <= 0)
                    continue;
                const move = a.type === "DYNAMIC" ? a : b.type === "DYNAMIC" ? b : null;
                if (!move)
                    continue;
                const other = move === a ? b : a;
                const contactFriction = other.type === "STATIC" ? other.friction : Math.max(move.friction, other.friction);
                if (overlapY <= overlapX) {
                    const sign = move.y < other.y ? -1 : 1;
                    const before = Math.abs(move.vx);
                    move.y += sign * overlapY;
                    move.vy *= -Math.max(move.restitution, other.restitution);
                    move.vx *= Math.max(0, 1 - contactFriction * 0.08);
                    this.contactEvents.push({ a: move.id, b: other.id, friction: contactFriction, tangentSpeedBefore: before, tangentSpeedAfter: Math.abs(move.vx) });
                }
                else {
                    const sign = move.x < other.x ? -1 : 1;
                    const before = Math.abs(move.vy);
                    move.x += sign * overlapX;
                    move.vx *= -Math.max(move.restitution, other.restitution);
                    move.vy *= Math.max(0, 1 - contactFriction * 0.08);
                    this.contactEvents.push({ a: move.id, b: other.id, friction: contactFriction, tangentSpeedBefore: before, tangentSpeedAfter: Math.abs(move.vy) });
                }
            }
    }
    solveDynamicOnSurface(body, surface) {
        const overlapX = (body.width + surface.width) / 2 - Math.abs(body.x - surface.x);
        if (overlapX <= 0 || body.y >= surface.y)
            return false;
        const surfaceTop = surface.y - surface.height / 2;
        const bodyBottom = body.y + body.height / 2;
        const penetration = bodyBottom - surfaceTop;
        if (penetration <= 0 || penetration > Math.max(0.5, body.height))
            return false;
        const before = Math.abs(body.vx);
        body.y -= penetration;
        if (body.vy > 0)
            body.vy = -body.vy * Math.max(body.restitution, surface.restitution);
        body.vx *= Math.max(0, 1 - surface.friction * 0.08);
        this.contactEvents.push({ a: body.id, b: surface.id, friction: surface.friction, tangentSpeedBefore: before, tangentSpeedAfter: Math.abs(body.vx) });
        return true;
    }
    solveCircleVsRamp(circle, ramp) {
        const radius = Math.min(circle.width, circle.height) / 2;
        const half = ramp.width / 2, cos = Math.cos(ramp.angle), sin = Math.sin(ramp.angle);
        const x1 = ramp.x - cos * half, y1 = ramp.y - sin * half;
        const x2 = ramp.x + cos * half, y2 = ramp.y + sin * half;
        const segX = x2 - x1, segY = y2 - y1, segLen2 = segX * segX + segY * segY;
        if (segLen2 <= 0.0001)
            return;
        const t = ((circle.x - x1) * segX + (circle.y - y1) * segY) / segLen2;
        if (t < 0 || t > 1)
            return;
        const closestX = x1 + segX * t, closestY = y1 + segY * t;
        const nx = sin, ny = -cos; // one-sided surface: screen-space up
        const signed = (circle.x - closestX) * nx + (circle.y - closestY) * ny;
        if (signed < 0 || signed >= radius)
            return;
        const penetration = radius - signed;
        circle.x += nx * penetration;
        circle.y += ny * penetration;
        const normalSpeed = circle.vx * nx + circle.vy * ny;
        if (normalSpeed < 0) {
            // A ramp is a support surface, not a springboard: cancel only inward velocity.
            circle.vx -= normalSpeed * nx;
            circle.vy -= normalSpeed * ny;
        }
        const tangentX = cos, tangentY = sin;
        const tangentSpeed = circle.vx * tangentX + circle.vy * tangentY;
        const friction = Math.max(0, 1 - ramp.friction * 0.01);
        const adjusted = tangentSpeed * friction;
        circle.vx += (adjusted - tangentSpeed) * tangentX;
        circle.vy += (adjusted - tangentSpeed) * tangentY;
        this.contactEvents.push({ a: circle.id, b: ramp.id, friction: ramp.friction, tangentSpeedBefore: Math.abs(tangentSpeed), tangentSpeedAfter: Math.abs(adjusted) });
    }
    solveCircleVsOrientedBox(circle, box) {
        const radius = Math.min(circle.width, circle.height) / 2;
        const cos = Math.cos(box.angle), sin = Math.sin(box.angle);
        const dx = circle.x - box.x, dy = circle.y - box.y;
        const localX = dx * cos + dy * sin, localY = -dx * sin + dy * cos;
        const halfW = box.width / 2, halfH = box.height / 2;
        const closestX = Math.max(-halfW, Math.min(halfW, localX));
        const closestY = Math.max(-halfH, Math.min(halfH, localY));
        let nx = localX - closestX, ny = localY - closestY;
        let dist = Math.hypot(nx, ny);
        if (dist >= radius)
            return;
        if (dist < 0.0001) {
            const toX = halfW - Math.abs(localX), toY = halfH - Math.abs(localY);
            if (toX < toY) {
                nx = localX < 0 ? -1 : 1;
                ny = 0;
                dist = 0;
            }
            else {
                nx = 0;
                ny = localY < 0 ? -1 : 1;
                dist = 0;
            }
        }
        else {
            nx /= dist;
            ny /= dist;
        }
        const penetration = radius - dist;
        const worldNx = nx * cos - ny * sin, worldNy = nx * sin + ny * cos;
        circle.x += worldNx * penetration;
        circle.y += worldNy * penetration;
        const normalSpeed = circle.vx * worldNx + circle.vy * worldNy;
        if (normalSpeed < 0) {
            const bounce = 1 + Math.max(circle.restitution, box.restitution);
            circle.vx -= bounce * normalSpeed * worldNx;
            circle.vy -= bounce * normalSpeed * worldNy;
            const tangentX = -worldNy, tangentY = worldNx;
            const tangentSpeed = circle.vx * tangentX + circle.vy * tangentY;
            const friction = Math.max(0, 1 - box.friction * 0.015);
            const adjusted = tangentSpeed * friction;
            circle.vx += (adjusted - tangentSpeed) * tangentX;
            circle.vy += (adjusted - tangentSpeed) * tangentY;
            this.contactEvents.push({ a: circle.id, b: box.id, friction: box.friction, tangentSpeedBefore: Math.abs(tangentSpeed), tangentSpeedAfter: Math.abs(adjusted) });
        }
    }
    checkBreakables() {
        for (const joint of this.breakables) {
            if (joint.broken)
                continue;
            const a = this.mustBody(joint.a), b = this.mustBody(joint.b);
            const relative = Math.hypot(a.vx - b.vx, a.vy - b.vy) * Math.min(Number.isFinite(a.mass) ? a.mass : 1, Number.isFinite(b.mass) ? b.mass : 1);
            if (relative > joint.threshold) {
                joint.broken = true;
                this.brokenJointEvents.push({ a: joint.a, b: joint.b });
            }
        }
    }
    state(id) { const b = this.mustBody(id); return { id: b.id, x: b.x, y: b.y, angle: b.angle, vx: b.vx, vy: b.vy, angularVelocity: b.angularVelocity }; }
    states() { return [...this.bodies.keys()].sort().map(id => this.state(id)); }
    mass(id) { return this.mustBody(id).mass; }
    friction(id) { return this.mustBody(id).friction; }
    forceVectors() {
        const vectors = [];
        for (const b of this.bodies.values()) {
            if (b.type !== "DYNAMIC")
                continue;
            vectors.push({ bodyId: b.id, kind: "WEIGHT", vector: { x: this.gravity.x * b.mass, y: this.gravity.y * b.mass } });
            if (Math.hypot(b.lastForceX, b.lastForceY) > 0.001)
                vectors.push({ bodyId: b.id, kind: "APPLIED", vector: { x: b.lastForceX, y: b.lastForceY } });
        }
        return vectors;
    }
    destroy() { this.bodies.clear(); this.springs.length = this.ropes.length = this.motors.length = this.hinges.length = this.breakables.length = 0; }
    mustBody(id) { const b = this.bodies.get(id); if (!b)
        throw new Error(`Unknown physics body ${id}`); return b; }
}
