import { deepClone } from "../core/clone.js";
import { SIMULATION_PHASES, SimulationPipeline } from "../core/SimulationPipeline.js";
import { verifyBuildSnapshot } from "../core/BuildSnapshot.js";
import { PhysicsWorld } from "./PhysicsWorld.js";
export class RuntimeWorld {
    snapshotSignature;
    physics = new PhysicsWorld();
    pipeline = new SimulationPipeline();
    causalEvents = [];
    signals = new Map();
    power = new Map();
    fluids = new Map();
    actuatorCommands = new Map();
    tick = 0;
    elapsedTime = 0;
    destroyed = false;
    snapshot;
    registry;
    pendingEvents = [];
    constructor(snapshot, registry) {
        if (!verifyBuildSnapshot(snapshot))
            throw new Error("BuildSnapshot signature invalid");
        this.snapshot = deepClone(snapshot);
        this.snapshotSignature = snapshot.signature;
        this.registry = registry;
        this.constructPhysics();
        this.installPipeline();
    }
    constructPhysics() {
        for (const part of this.snapshot.parts) {
            const def = this.registry.get(part.definitionId);
            const rigid = def.behaviours.find(b => b.kind === "RIGID_BODY");
            if (!rigid || rigid.kind !== "RIGID_BODY")
                continue;
            const density = Number(part.parameters.density ?? rigid.density);
            const friction = Number(part.parameters.friction ?? rigid.friction);
            const restitution = Number(part.parameters.restitution ?? rigid.restitution);
            this.physics.addBody({ id: part.id, type: rigid.bodyType, shape: rigid.shape, position: part.position, angle: part.rotation, width: rigid.width, height: rigid.height, density, friction, restitution });
            const initialVx = Number(part.parameters.initialVx ?? 0), initialVy = Number(part.parameters.initialVy ?? 0);
            if ((initialVx !== 0 || initialVy !== 0) && rigid.bodyType === "DYNAMIC")
                this.physics.setLinearVelocity(part.id, { x: initialVx, y: initialVy });
            const motor = def.behaviours.find(b => b.kind === "MOTOR");
            if (motor?.kind === "MOTOR")
                this.physics.addMotor(part.id, motor.targetSpeed, motor.maxTorque);
        }
        for (const c of this.snapshot.connections) {
            if (c.config.kind === "ROPE")
                this.physics.addRope(c.fromPartId, c.toPartId, c.config.maxLength);
            if (c.config.kind === "HINGE")
                this.physics.addBodyHinge(c.fromPartId, c.toPartId);
            if (c.config.kind === "STRUCTURAL" && c.config.breakStrength < 999999)
                this.physics.addBreakable(c.fromPartId, c.toPartId, c.config.breakStrength);
        }
    }
    installPipeline() {
        this.pipeline.on("TICK_BEGIN", () => { this.pendingEvents = []; });
        this.pipeline.on("NETWORK_TOPOLOGY", () => this.resolveNetworks());
        this.pipeline.on("PRE_PHYSICS_SENSORS", () => this.sampleSensors());
        this.pipeline.on("LOGIC_EVALUATION", () => this.evaluateLogic());
        this.pipeline.on("ACTUATOR_RESOLUTION", () => this.resolveActuators());
        this.pipeline.on("FORCE_AND_COUPLING", () => this.applyCouplings());
        this.pipeline.on("PHYSICS_STEP", ({ dt }) => this.physics.step(dt));
        this.pipeline.on("POST_PHYSICS_CONTACTS", () => this.collectPhysicsEvents());
        this.pipeline.on("DOMAIN_TRANSFER", ({ dt }) => this.transferDomains(dt));
        this.pipeline.on("CAUSAL_EVENT_RECORDING", () => { this.causalEvents.push(...this.pendingEvents); });
        this.pipeline.on("GOAL_AND_CONCEPT_EVIDENCE", () => undefined);
        this.pipeline.on("REPLAY_SAMPLE", () => undefined);
        this.pipeline.on("PRESENTATION_QUEUE", () => undefined);
    }
    step(dt = 1 / 60) {
        if (this.destroyed)
            throw new Error("RuntimeWorld already destroyed");
        this.pipeline.step(this.tick, dt);
        this.tick += 1;
        this.elapsedTime += dt;
    }
    resolveNetworks() {
        for (const c of this.snapshot.connections) {
            if (c.config.kind === "ELECTRICAL") {
                const source = this.definition(c.fromPartId).behaviours.find(b => b.kind === "BATTERY");
                if (source?.kind === "BATTERY")
                    this.power.set(c.config.channel, Math.max(this.power.get(c.config.channel) ?? 0, source.supply));
            }
        }
    }
    sampleSensors() {
        for (const part of this.snapshot.parts) {
            if (this.definition(part.id).behaviours.some(b => b.kind === "SENSOR")) {
                const state = this.safeState(part.id);
                if (state)
                    this.signals.set(`${part.id}.rotation`, state.angle);
            }
        }
    }
    evaluateLogic() {
        for (const part of this.snapshot.parts)
            for (const behaviour of this.definition(part.id).behaviours) {
                if (behaviour.kind !== "LOGIC_CONTROLLER")
                    continue;
                for (const ins of behaviour.program) {
                    if (ins.op === "SET")
                        this.signals.set(ins.channel, ins.value);
                    else if (ins.op === "COPY")
                        this.signals.set(ins.to, this.signals.get(ins.from) ?? false);
                    else if (ins.op === "IF_GT")
                        this.signals.set(ins.thenChannel, Number(this.signals.get(ins.channel) ?? 0) > ins.threshold);
                }
            }
    }
    resolveActuators() {
        for (const part of this.snapshot.parts) {
            const def = this.definition(part.id);
            if (!def.behaviours.some(b => ["MOTOR", "PUMP", "ACTUATOR", "FAN", "ELECTROMAGNET"].includes(b.kind)))
                continue;
            const powered = [...this.power.values()].some(v => v > 0);
            const logicOn = [...this.signals.values()].some(v => v === true || (typeof v === "number" && v > 0));
            this.actuatorCommands.set(part.id, powered && (logicOn || !def.behaviours.some(b => b.kind === "ACTUATOR")) ? 1 : 0);
        }
    }
    applyCouplings() {
        for (const part of this.snapshot.parts) {
            const constantForceX = Number(part.parameters.constantForceX ?? 0);
            const constantForceY = Number(part.parameters.constantForceY ?? 0);
            if (constantForceX !== 0 || constantForceY !== 0) {
                try {
                    this.physics.applyForce(part.id, { x: constantForceX, y: constantForceY });
                    this.event("EXTERNAL_FORCE_APPLIED", part.id, undefined, { x: constantForceX, y: constantForceY });
                }
                catch { /* non-physics part */ }
            }
            const command = this.actuatorCommands.get(part.id) ?? 0;
            if (command <= 0)
                continue;
            const def = this.definition(part.id);
            const fan = def.behaviours.find(b => b.kind === "FAN");
            if (fan?.kind === "FAN")
                for (const other of this.snapshot.parts)
                    if (other.id !== part.id) {
                        const a = this.safeState(part.id), b = this.safeState(other.id);
                        if (!a || !b)
                            continue;
                        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
                        if (d > 0 && d < fan.range)
                            this.physics.applyForce(other.id, { x: dx / d * fan.force * (1 - d / fan.range), y: dy / d * fan.force * (1 - d / fan.range) });
                    }
            const actuator = def.behaviours.find(b => b.kind === "ACTUATOR");
            if (actuator?.kind === "ACTUATOR") {
                try {
                    this.physics.applyForce(part.id, { x: actuator.strength, y: 0 });
                }
                catch { }
            }
        }
        const magnetic = this.snapshot.parts.filter(p => this.definition(p.id).behaviours.some(b => b.kind === "MAGNET" || b.kind === "ELECTROMAGNET"));
        for (let i = 0; i < magnetic.length; i += 1)
            for (let j = i + 1; j < magnetic.length; j += 1) {
                const aPart = magnetic[i], bPart = magnetic[j];
                const aState = this.safeState(aPart.id), bState = this.safeState(bPart.id);
                if (!aState || !bState)
                    continue;
                const aDef = this.definition(aPart.id), bDef = this.definition(bPart.id);
                const aMag = aDef.behaviours.find(b => b.kind === "MAGNET" || b.kind === "ELECTROMAGNET");
                const bMag = bDef.behaviours.find(b => b.kind === "MAGNET" || b.kind === "ELECTROMAGNET");
                if (!aMag || !bMag)
                    continue;
                const aStrength = aMag.kind === "MAGNET" ? aMag.strength : ((this.actuatorCommands.get(aPart.id) ?? 0) > 0 ? aMag.strength : 0);
                const bStrength = bMag.kind === "MAGNET" ? bMag.strength : ((this.actuatorCommands.get(bPart.id) ?? 0) > 0 ? bMag.strength : 0);
                if (aStrength <= 0 || bStrength <= 0)
                    continue;
                const dx = bState.x - aState.x, dy = bState.y - aState.y, d = Math.max(0.35, Math.hypot(dx, dy));
                if (d > 4)
                    continue;
                const force = Math.min(18, (aStrength * bStrength) / (d * d));
                const nx = dx / d, ny = dy / d;
                try {
                    this.physics.applyForce(aPart.id, { x: nx * force, y: ny * force });
                }
                catch { }
                try {
                    this.physics.applyForce(bPart.id, { x: -nx * force, y: -ny * force });
                }
                catch { }
            }
        for (const springPart of this.snapshot.parts) {
            const spring = this.definition(springPart.id).behaviours.find(b => b.kind === "SPRING_PAD");
            if (spring?.kind !== "SPRING_PAD")
                continue;
            const springState = this.safeState(springPart.id);
            if (!springState)
                continue;
            for (const other of this.snapshot.parts) {
                if (other.id === springPart.id)
                    continue;
                const rigid = this.definition(other.id).behaviours.find(b => b.kind === "RIGID_BODY");
                if (rigid?.kind !== "RIGID_BODY" || rigid.bodyType !== "DYNAMIC")
                    continue;
                const state = this.safeState(other.id);
                if (!state)
                    continue;
                const dx = Math.abs(state.x - springState.x), dy = springState.y - state.y;
                if (dx <= spring.range && dy >= -0.3 && dy <= spring.range) {
                    this.physics.applyForce(other.id, { x: 0, y: -spring.force });
                    this.event("SPRING_LAUNCH", springPart.id, other.id, { force: spring.force });
                }
            }
        }
        for (const c of this.snapshot.connections)
            if (c.config.kind === "ROTATIONAL") {
                const a = this.safeState(c.fromPartId);
                if (!a)
                    continue;
                const speed = a.angularVelocity * c.config.ratio * (c.config.invertDirection ? -1 : 1);
                try {
                    this.physics.setAngularVelocity(c.toPartId, speed);
                }
                catch { /* non-physics network node */ }
            }
    }
    collectPhysicsEvents() {
        for (const broken of this.physics.brokenJointEvents)
            this.event("STRUCTURE_BROKE", broken.a, broken.b);
        for (const contact of this.physics.contactEvents) {
            this.event("PHYSICS_CONTACT", contact.a, contact.b, { friction: contact.friction, tangentSpeedBefore: contact.tangentSpeedBefore, tangentSpeedAfter: contact.tangentSpeedAfter });
            if (contact.tangentSpeedBefore - contact.tangentSpeedAfter > 0.005 && contact.friction >= 0.5)
                this.event("FRICTION_SLOWED", contact.a, contact.b, { friction: contact.friction });
            const aDef = this.safeDefinition(contact.a), bDef = this.safeDefinition(contact.b);
            if (aDef?.id === "motion.ramp" || bDef?.id === "motion.ramp")
                this.event("RAMP_CONTACT", contact.a, contact.b);
            if (aDef?.id === "motion.bounce-pad" || bDef?.id === "motion.bounce-pad")
                this.event("BOUNCE_PAD_CONTACT", contact.a, contact.b);
        }
    }
    transferDomains(dt) {
        for (const part of this.snapshot.parts) {
            const def = this.definition(part.id);
            const pump = def.behaviours.find(b => b.kind === "PUMP");
            if (pump?.kind === "PUMP" && (this.actuatorCommands.get(part.id) ?? 0) > 0) {
                const moved = pump.maxFlow * dt;
                this.fluids.set("water", (this.fluids.get("water") ?? 0) + moved);
                this.event("PUMP_MOVED_WATER", part.id, undefined, { amount: moved });
            }
            const generator = def.behaviours.find(b => b.kind === "GENERATOR");
            if (generator?.kind === "GENERATOR") {
                const state = this.safeState(part.id);
                const generated = Math.abs(state?.angularVelocity ?? 0) * generator.efficiency;
                if (generated > 0.001) {
                    for (const c of this.snapshot.connections)
                        if (c.fromPartId === part.id && c.config.kind === "ELECTRICAL")
                            this.power.set(c.config.channel, generated);
                    this.event("GENERATOR_POWERED", part.id, undefined, { amount: generated });
                }
            }
            const wheel = def.behaviours.find(b => b.kind === "WATER_WHEEL");
            if (wheel?.kind === "WATER_WHEEL") {
                const flow = this.fluids.get("water") ?? 0;
                if (flow > 0) {
                    try {
                        this.physics.setAngularVelocity(part.id, flow * wheel.efficiency);
                    }
                    catch { }
                    this.event("WATER_DROVE_WHEEL", "water", part.id, { flow });
                }
            }
        }
    }
    event(kind, sourceId, targetId, data) {
        const value = { id: `evt-${this.tick}-${this.pendingEvents.length}`, tick: this.tick, kind, sourceId, ...(targetId ? { targetId } : {}), ...(data ? { data } : {}) };
        this.pendingEvents.push(value);
    }
    definition(instanceId) {
        const instance = this.snapshot.parts.find(p => p.id === instanceId);
        if (!instance)
            throw new Error(`Unknown part instance ${instanceId}`);
        return this.registry.get(instance.definitionId);
    }
    safeDefinition(instanceId) { try {
        return this.definition(instanceId);
    }
    catch {
        return undefined;
    } }
    safeState(id) { try {
        return this.physics.state(id);
    }
    catch {
        return undefined;
    } }
    phaseTrace() { return [...this.pipeline.trace]; }
    destroy() { this.destroyed = true; this.physics.destroy(); this.signals.clear(); this.power.clear(); this.fluids.clear(); this.actuatorCommands.clear(); }
    static expectedPhases() { return SIMULATION_PHASES; }
}
