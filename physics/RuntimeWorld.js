import { deepClone } from "../core/clone.js";
import { SIMULATION_PHASES, SimulationPipeline } from "../core/SimulationPipeline.js";
import { verifyBuildSnapshot } from "../core/BuildSnapshot.js";
import { PhysicsWorld } from "./PhysicsWorld.js";
import { GearSystem } from "../gears/GearSystem.js";
import { StructureSystem } from "../structures/StructureSystem.js";
import { CircuitSystem } from "../power/CircuitSystem.js";
import { MagnetSystem } from "../magnets/MagnetSystem.js";
import { FluidSystem } from "../water/FluidSystem.js";
import { FlightSystem } from "../flight/FlightSystem.js";
import { RobotSystem } from "../robots/RobotSystem.js";
import { SpaceSystem } from "../space/SpaceSystem.js";
import { ChainSystem } from "../chain/ChainSystem.js";
import { CreatureSystem } from "../creatures/CreatureSystem.js";
import { MusicSystem } from "../music/MusicSystem.js";
import { SandboxSystem } from "../sandbox/SandboxSystem.js";
export class RuntimeWorld {
    constructor(snapshot, registry) {
        var _a;
        Object.defineProperty(this, "snapshotSignature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "physics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new PhysicsWorld()
        });
        /** Gear Garage rotation (M12): constrained gear relationships, no tooth collisions. */
        Object.defineProperty(this, "gears", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Builder Bay structures (M13): beams, ropes, braces, and the loads that cross them. */
        Object.defineProperty(this, "structures", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Power Lab circuits (M14): batteries, wires, switches and loads, solved every tick. */
        Object.defineProperty(this, "circuits", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Magnet Factory (M15): bar magnets, electromagnets and magnetic materials. */
        Object.defineProperty(this, "magnets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Water Works (M16): pipes, tanks, valves, pumps, nozzles and water wheels. */
        Object.defineProperty(this, "water", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Flight Hangar (M17): gliders and their wings, tails, propellers, balloons and parachutes; fans' wind. */
        Object.defineProperty(this, "flight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Robot Lab (M18): programmed robots on the top-down arena floor. */
        Object.defineProperty(this, "robots", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Space Centre (M19): gravity zones, rockets, rovers, toy planets and launchers. */
        Object.defineProperty(this, "space", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Chain Reaction Workshop (M21): the chain counter and its toy mechanisms. */
        Object.defineProperty(this, "chain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "creatures", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "music", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Sandbox (M23): air drag, floating balloons, moving platforms, fragile things. */
        Object.defineProperty(this, "sandbox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reedWas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        /** Switches flipped and buttons held by a finger this tick (a child's starting action). */
        Object.defineProperty(this, "fingerThisTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        /** Buttons held down by a finger during this TEST, and switches flipped since the last tick. */
        Object.defineProperty(this, "fingerPressed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "flips", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "unmounted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "carried", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "lifted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "flung", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "magnetLoaded", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "pipeline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new SimulationPipeline()
        });
        Object.defineProperty(this, "causalEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "signals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "power", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "fluids", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "actuatorCommands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "tick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "elapsedTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "destroyed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "snapshot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "registry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pendingEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        /** Parts by id (the snapshot never changes during a TEST). */
        Object.defineProperty(this, "partById", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!verifyBuildSnapshot(snapshot))
            throw new Error("BuildSnapshot signature invalid");
        this.snapshot = deepClone(snapshot);
        this.partById = new Map(this.snapshot.parts.map(p => [p.id, p]));
        this.snapshotSignature = snapshot.signature;
        this.registry = registry;
        this.constructPhysics();
        // A winch carries its rope load: the turning force the load needs (weight × drum radius) goes into the gear train.
        const extraLoads = new Map();
        for (const part of this.snapshot.parts) {
            const rope = part.parameters.ropeTo;
            const out = registry.get(part.definitionId).behaviours.find(b => b.kind === "GEAR_OUTPUT");
            if (typeof rope === "string" && (out === null || out === void 0 ? void 0 : out.kind) === "GEAR_OUTPUT" && out.output === "WINCH") {
                try {
                    extraLoads.set(part.id, this.physics.mass(rope) * 9.81 * ((_a = out.drum) !== null && _a !== void 0 ? _a : 0.3));
                }
                catch { /* load missing */ }
            }
        }
        this.structures = new StructureSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.gears = new GearSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined, this.snapshot.connections, extraLoads);
        this.circuits = new CircuitSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.robots = new RobotSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.sandbox = new SandboxSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.chain = new ChainSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.space = new SpaceSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.flight = new FlightSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.water = new FluidSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.magnets = new MagnetSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.creatures = new CreatureSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.creatures.start(this.physics);
        this.music = new MusicSystem(this.snapshot.parts, id => registry.has(id) ? registry.get(id) : undefined);
        this.installPipeline();
    }
    constructPhysics() {
        var _a, _b, _c, _d, _e;
        for (const part of this.snapshot.parts) {
            const def = this.registry.get(part.definitionId);
            const rigid = def.behaviours.find(b => b.kind === "RIGID_BODY");
            if (!rigid || rigid.kind !== "RIGID_BODY")
                continue;
            const density = Number((_a = part.parameters.density) !== null && _a !== void 0 ? _a : rigid.density);
            const friction = Number((_b = part.parameters.friction) !== null && _b !== void 0 ? _b : rigid.friction);
            const restitution = Number((_c = part.parameters.restitution) !== null && _c !== void 0 ? _c : rigid.restitution);
            // Boxes collide as upright rectangles, so a magnet turned a quarter turn gets its width and height swapped instead of an angle.
            const quarter = rigid.shape === "BOX" && def.behaviours.some(b => b.kind === "MAGNET_BAR") && Math.abs(Math.sin(part.rotation)) > 0.99;
            this.physics.addBody({ id: part.id, type: rigid.bodyType, shape: rigid.shape, position: part.position, angle: quarter ? 0 : part.rotation, width: quarter ? rigid.height : rigid.width, height: quarter ? rigid.width : rigid.height, density, friction, restitution, ...(typeof part.parameters.collisionGroup === "string" ? { group: part.parameters.collisionGroup } : {}) });
            const initialVx = Number((_d = part.parameters.initialVx) !== null && _d !== void 0 ? _d : 0), initialVy = Number((_e = part.parameters.initialVy) !== null && _e !== void 0 ? _e : 0);
            if ((initialVx !== 0 || initialVy !== 0) && rigid.bodyType === "DYNAMIC")
                this.physics.setLinearVelocity(part.id, { x: initialVx, y: initialVy });
            const motor = def.behaviours.find(b => b.kind === "MOTOR");
            if ((motor === null || motor === void 0 ? void 0 : motor.kind) === "MOTOR")
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
        this.pipeline.on("NETWORK_TOPOLOGY", ({ dt }) => { this.resolveNetworks(); this.stepCircuits(dt); });
        this.pipeline.on("PRE_PHYSICS_SENSORS", () => this.sampleSensors());
        this.pipeline.on("LOGIC_EVALUATION", ({ dt }) => { this.evaluateLogic(); if (this.robots.hasRobots()) {
            this.robots.step(dt, id => this.circuits.motorDrive(id), id => this.robotSignal(id));
            for (const e of this.robots.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        } });
        this.pipeline.on("ACTUATOR_RESOLUTION", () => this.resolveActuators());
        this.pipeline.on("FORCE_AND_COUPLING", ({ dt }) => { if (this.chain.active) {
            this.chain.step(this.physics);
            for (const e of this.chain.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        } this.stepMagnets(dt); this.applyJets(); this.stepFlight(dt); this.stepSpace(dt); if (this.sandbox.active) {
            this.sandbox.step(dt, this.physics, x => this.space.airAt(x));
            for (const e of this.sandbox.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        } if (this.creatures.active) {
            this.creatures.step(dt, this.physics);
            for (const e of this.creatures.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        } this.applyCouplings(); this.gears.step(dt); this.applyGearCouplings(); this.stepStructures(dt); });
        this.pipeline.on("PHYSICS_STEP", ({ dt }) => this.physics.step(dt));
        this.pipeline.on("POST_PHYSICS_CONTACTS", () => { this.magnets.applyGuides(this.physics); if (this.flight.hasFlight() || this.space.hasSpace()) {
            this.flight.observe(this.physics);
            for (const e of this.flight.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        } if (this.space.hasSpace()) {
            this.space.observe(this.physics);
            for (const e of this.space.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        } if (this.sandbox.active) {
            this.sandbox.observe(this.physics);
            for (const e of this.sandbox.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        } this.collectPhysicsEvents(); });
        this.pipeline.on("DOMAIN_TRANSFER", ({ dt }) => { this.transferDomains(dt); if (this.music.active) {
            this.music.observe(this.tick, this.physics, id => { var _a; return (_a = this.gears.state(id)) === null || _a === void 0 ? void 0 : _a.angle; }, id => { var _a; return ((_a = this.circuits.load(id)) === null || _a === void 0 ? void 0 : _a.on) === true; }, () => this.robots.anyLinkPressed(), this.pendingEvents, id => this.creatures.isClip(id), id => this.water.waterReceived(id));
            for (const e of this.music.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        } });
        this.pipeline.on("CAUSAL_EVENT_RECORDING", () => { this.causalEvents.push(...this.pendingEvents); });
        this.pipeline.on("GOAL_AND_CONCEPT_EVIDENCE", () => this.observeChain());
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
        var _a;
        for (const c of this.snapshot.connections) {
            if (c.config.kind === "ELECTRICAL") {
                const source = this.definition(c.fromPartId).behaviours.find(b => b.kind === "BATTERY");
                if ((source === null || source === void 0 ? void 0 : source.kind) === "BATTERY")
                    this.power.set(c.config.channel, Math.max((_a = this.power.get(c.config.channel)) !== null && _a !== void 0 ? _a : 0, source.supply));
            }
        }
    }
    /** A finger on a button during a TEST (held while down). */
    pressButton(id, down) { if (down)
        this.fingerPressed.add(id);
    else
        this.fingerPressed.delete(id); }
    /** A tap on a switch during a TEST flips it on the next tick. */
    flipSwitch(id) { this.flips.add(id); }
    /** Is this button held down: by a finger, by Bolt's scheduled press, or by something resting on it? */
    buttonPressed(id) {
        var _a;
        if (this.fingerPressed.has(id))
            return true;
        if (this.robots.linkPressed(id))
            return true;
        if (this.chain.buttonHeld(id))
            return true;
        // A magnet switch closes when the magnetic field where it sits is strong enough (magnetism → electricity/logic).
        const sensor = (_a = this.safeDefinition(id)) === null || _a === void 0 ? void 0 : _a.behaviours.find(b => b.kind === "MAGNET_SENSOR");
        if ((sensor === null || sensor === void 0 ? void 0 : sensor.kind) === "MAGNET_SENSOR") {
            const p = this.partById.get(id);
            if (!p)
                return false;
            const f = this.magnets.fieldAt(p.position.x, p.position.y);
            return Math.hypot(f.x, f.y) >= sensor.threshold;
        }
        const part = this.partById.get(id);
        if (!part)
            return false;
        // A sensor contact closed by a Robot Lab box resting in its slot ("boxId:slotId").
        if (typeof part.parameters.closedWhenBoxAt === "string") {
            const [box, slot] = part.parameters.closedWhenBoxAt.split(":");
            return this.robots.boxAt(box !== null && box !== void 0 ? box : "", slot !== null && slot !== void 0 ? slot : "");
        }
        const from = Number(part.parameters.pressFrom), to = Number(part.parameters.pressTo);
        if (Number.isFinite(from) && this.elapsedTime >= from && (!Number.isFinite(to) || this.elapsedTime < to))
            return true;
        const rigid = this.definition(id).behaviours.find(b => b.kind === "RIGID_BODY");
        if ((rigid === null || rigid === void 0 ? void 0 : rigid.kind) !== "RIGID_BODY")
            return false;
        const top = part.position.y - rigid.height / 2;
        return this.snapshot.parts.some(o => {
            if (o.id === id)
                return false;
            const r = this.definition(o.id).behaviours.find(b => b.kind === "RIGID_BODY");
            if ((r === null || r === void 0 ? void 0 : r.kind) !== "RIGID_BODY" || r.bodyType !== "DYNAMIC")
                return false;
            const st = this.safeState(o.id);
            if (!st)
                return false;
            const bottom = st.y + r.height / 2;
            return Math.abs(st.x - part.position.x) <= rigid.width / 2 + 0.1 && bottom >= top - 0.15 && bottom <= top + 0.25;
        });
    }
    /** Water jets push what they hit (their flow times their speed). */
    applyJets() {
        for (const jet of this.water.jetStates()) {
            if (jet.points.length < 2)
                continue;
            for (const part of this.snapshot.parts) {
                if (!this.isDynamicBody(part.id))
                    continue;
                const s = this.safeState(part.id);
                if (!s)
                    continue;
                for (let i = 1; i < jet.points.length; i++) {
                    const p = jet.points[i], q = jet.points[i - 1];
                    if (Math.hypot(p.x - s.x, p.y - s.y) > 0.4)
                        continue;
                    const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy) || 1;
                    const f = Math.min(1, jet.flow * jet.speed * 0.4);
                    this.physics.applyForce(part.id, { x: dx / d * f, y: dy / d * f });
                    this.event("WATER_JET_PUSH", jet.id, part.id, { force: Math.round(f * 100) / 100 });
                    break;
                }
            }
        }
    }
    stepFlight(dt) {
        if (!this.flight.hasFlight())
            return;
        this.flight.step(dt, this.physics);
        for (const e of this.flight.drainEvents())
            this.event(e.kind, e.sourceId, e.targetId, e.data);
    }
    /** Space Centre. A stage waits for an earlier one with `waitFor: "KIND:sourceId[:targetId]"` (an event already recorded),
     *  or for a Power Lab part with `waitFor: "POWERED:partId"` (current flowing through it) or a gear with `"TURNED:gearId"`. */
    stepSpace(dt) {
        if (!this.space.hasSpace())
            return;
        this.space.step(dt, this.physics, spec => {
            var _a, _b;
            const [kind, source, target] = spec.split(":");
            if (kind === "POWERED")
                return Math.abs(this.circuits.current(source !== null && source !== void 0 ? source : "")) > 0.3;
            if (kind === "TURNED")
                return Math.abs((_b = (_a = this.gears.state(source !== null && source !== void 0 ? source : "")) === null || _a === void 0 ? void 0 : _a.angle) !== null && _b !== void 0 ? _b : 0) >= Number(target !== null && target !== void 0 ? target : 1.5);
            if (kind === "BOX_AT")
                return this.robots.boxAt(source !== null && source !== void 0 ? source : "", target !== null && target !== void 0 ? target : "");
            return this.causalEvents.some(e => e.kind === kind && e.sourceId === source && (!target || e.targetId === target));
        }, (x, y) => this.flight.windAt(x, y));
        for (const e of this.space.drainEvents())
            this.event(e.kind, e.sourceId, e.targetId, e.data);
    }
    /** Parts joined to this one by wires (same connected circuit). */
    circuitMates(id) {
        const els = this.circuits.layout.elements;
        const start = els.find(e => e.partId === id);
        if (!start)
            return [];
        const nodes = new Set([start.a, start.b]);
        let grew = true;
        while (grew) {
            grew = false;
            for (const e of els)
                if ((nodes.has(e.a) || nodes.has(e.b)) && !(nodes.has(e.a) && nodes.has(e.b))) {
                    nodes.add(e.a);
                    nodes.add(e.b);
                    grew = true;
                }
        }
        return els.filter(e => nodes.has(e.a) || nodes.has(e.b)).map(e => e.partId);
    }
    /** A robot listening for a signal: the part it listens to has power, is pressed, or has been set off by the chain. */
    robotSignal(robotId) {
        var _a, _b, _c;
        const listen = (_a = this.partById.get(robotId)) === null || _a === void 0 ? void 0 : _a.parameters.listen;
        if (typeof listen !== "string")
            return false;
        return ((_c = (_b = this.circuits.load(listen)) === null || _b === void 0 ? void 0 : _b.level) !== null && _c !== void 0 ? _c : 0) > 0.3 || this.buttonPressed(listen) || this.chain.inChain(listen);
    }
    /** Chain Reaction Workshop: after this tick's events are recorded, grow the chain from what every system measured. */
    observeChain() {
        if (!this.chain.active)
            return;
        const axleMates = (id) => { const a = this.gears.analysis.axleOf.get(id); return a === undefined ? [] : [...this.gears.analysis.axleOf.entries()].filter(([o, k]) => k === a && o !== id).map(([o]) => o); };
        this.chain.observe({
            tick: this.tick, physics: this.physics, causalEvents: this.causalEvents,
            isDynamicBody: id => this.isDynamicBody(id), buttonPressed: id => this.buttonPressed(id),
            loadLevel: id => { var _a, _b; return (_b = (_a = this.circuits.load(id)) === null || _a === void 0 ? void 0 : _a.level) !== null && _b !== void 0 ? _b : 0; },
            gearSpeed: id => this.gears.nodes.some(n => n.id === id) ? this.gears.omega(id) : Number.NaN,
            gearNeighbours: id => [...axleMates(id), ...this.gears.analysis.links.filter(l => l.a === id || l.b === id).map(l => l.a === id ? l.b : l.a)],
            jetFlow: id => { var _a, _b; return (_b = (_a = this.water.jetStates().find(j => j.id === id)) === null || _a === void 0 ? void 0 : _a.flow) !== null && _b !== void 0 ? _b : Number.NaN; },
            fingerControls: () => this.fingerThisTick,
            circuitMates: id => this.circuitMates(id)
        });
        // Recorded straight away: the chain's own edges belong to this tick.
        for (const e of this.chain.drainEvents())
            this.causalEvents.push({ id: `evt-${this.tick}-c${this.causalEvents.length}`, tick: this.tick, kind: e.kind, sourceId: e.sourceId, ...(e.targetId ? { targetId: e.targetId } : {}), ...(e.data ? { data: e.data } : {}) });
    }
    stepMagnets(dt) {
        if (!this.magnets.hasMagnets())
            return;
        this.magnets.step(dt, this.physics, id => this.circuits.motorDrive(id));
        for (const e of this.magnets.drainEvents())
            this.event(e.kind, e.sourceId, e.targetId, e.data);
    }
    /** Circuits first in the tick (network topology): then electric motors drive their gear trains at the current they get. */
    stepCircuits(dt) {
        var _a, _b;
        if (!this.circuits.layout.elements.length && !this.water.layout.ports.length)
            return;
        for (const p of this.snapshot.parts) {
            if (!((_a = this.safeDefinition(p.id)) === null || _a === void 0 ? void 0 : _a.behaviours.some(b => b.kind === "MAGNET_SENSOR")))
                continue;
            const on = this.buttonPressed(p.id);
            if (on !== ((_b = this.reedWas.get(p.id)) !== null && _b !== void 0 ? _b : false)) {
                this.reedWas.set(p.id, on);
                this.event(on ? "MAGNET_SWITCH_CLOSED" : "MAGNET_SWITCH_OPENED", p.id);
            }
        }
        this.circuits.step(dt, id => this.buttonPressed(id), this.flips, id => this.gears.omega(id));
        // Water after electricity (pumps need current); valves tapped during the TEST flip here too.
        if (this.water.layout.ports.length) {
            this.water.step(dt, id => Math.abs(this.circuits.motorDrive(id)), id => { var _a, _b; return (_b = (_a = this.gears.state(id)) === null || _a === void 0 ? void 0 : _a.angle) !== null && _b !== void 0 ? _b : 0; }, this.flips);
            for (const n of this.gears.nodes)
                if (this.gears.isHydraulic(n.id))
                    this.gears.setDriveScale(n.id, this.water.wheelDrive(n.id));
            for (const e of this.water.drainEvents())
                this.event(e.kind, e.sourceId, e.targetId, e.data);
        }
        this.fingerThisTick = [...this.flips, ...this.fingerPressed];
        this.flips.clear();
        for (const n of this.gears.nodes)
            if (this.gears.isElectric(n.id))
                this.gears.setDriveScale(n.id, this.circuits.motorDrive(n.id));
        for (const e of this.circuits.drainEvents())
            this.event(e.kind, e.sourceId, e.targetId, e.data);
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
        var _a, _b;
        for (const part of this.snapshot.parts)
            for (const behaviour of this.definition(part.id).behaviours) {
                if (behaviour.kind !== "LOGIC_CONTROLLER")
                    continue;
                for (const ins of behaviour.program) {
                    if (ins.op === "SET")
                        this.signals.set(ins.channel, ins.value);
                    else if (ins.op === "COPY")
                        this.signals.set(ins.to, (_a = this.signals.get(ins.from)) !== null && _a !== void 0 ? _a : false);
                    else if (ins.op === "IF_GT")
                        this.signals.set(ins.thenChannel, Number((_b = this.signals.get(ins.channel)) !== null && _b !== void 0 ? _b : 0) > ins.threshold);
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
        var _a, _b, _c, _d, _e;
        for (const part of this.snapshot.parts) {
            const constantForceX = Number((_a = part.parameters.constantForceX) !== null && _a !== void 0 ? _a : 0);
            const constantForceY = Number((_b = part.parameters.constantForceY) !== null && _b !== void 0 ? _b : 0);
            if (constantForceX !== 0 || constantForceY !== 0) {
                try {
                    this.physics.applyForce(part.id, { x: constantForceX, y: constantForceY });
                    this.event("EXTERNAL_FORCE_APPLIED", part.id, undefined, { x: constantForceX, y: constantForceY });
                }
                catch { /* non-physics part */ }
            }
            const command = (_c = this.actuatorCommands.get(part.id)) !== null && _c !== void 0 ? _c : 0;
            if (command <= 0)
                continue;
            const def = this.definition(part.id);
            const fan = def.behaviours.find(b => b.kind === "FAN");
            if ((fan === null || fan === void 0 ? void 0 : fan.kind) === "FAN")
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
            if ((actuator === null || actuator === void 0 ? void 0 : actuator.kind) === "ACTUATOR") {
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
                const aStrength = aMag.kind === "MAGNET" ? aMag.strength : (((_d = this.actuatorCommands.get(aPart.id)) !== null && _d !== void 0 ? _d : 0) > 0 ? aMag.strength : 0);
                const bStrength = bMag.kind === "MAGNET" ? bMag.strength : (((_e = this.actuatorCommands.get(bPart.id)) !== null && _e !== void 0 ? _e : 0) > 0 ? bMag.strength : 0);
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
            if ((spring === null || spring === void 0 ? void 0 : spring.kind) !== "SPRING_PAD")
                continue;
            const springState = this.safeState(springPart.id);
            if (!springState)
                continue;
            for (const other of this.snapshot.parts) {
                if (other.id === springPart.id)
                    continue;
                const rigid = this.definition(other.id).behaviours.find(b => b.kind === "RIGID_BODY");
                if ((rigid === null || rigid === void 0 ? void 0 : rigid.kind) !== "RIGID_BODY" || rigid.bodyType !== "DYNAMIC")
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
    /** Gear outputs reaching back into Motion: winches lift real bodies, conveyors carry them. */
    applyGearCouplings() {
        var _a;
        for (const e of this.gears.drainEvents())
            this.event(e.kind, e.sourceId, e.targetId, e.data);
        for (const n of this.gears.nodes) {
            if (!n.output)
                continue;
            const w = this.gears.omega(n.id);
            if (n.output.kind === "WINCH" && typeof n.parameters.ropeTo === "string") {
                const loadId = n.parameters.ropeTo;
                const s = this.safeState(loadId);
                const start = this.partById.get(loadId);
                if (!s || !start)
                    continue;
                const rigid = this.definition(loadId).behaviours.find(b => b.kind === "RIGID_BODY");
                const half = (rigid === null || rigid === void 0 ? void 0 : rigid.kind) === "RIGID_BODY" ? rigid.height / 2 : 0.4;
                const top = n.y + n.output.drum + half + 0.1;
                const mass = this.physics.mass(loadId);
                const liftedBy = start.position.y - s.y;
                // A crane winch must hang from the structure the child built (Builder Bay); with nothing holding it up it can't lift.
                if (n.parameters.mountOnStructure === true && !this.structures.hasJointNear(n.x, n.y)) {
                    if (!this.unmounted.has(n.id)) {
                        this.unmounted.add(n.id);
                        this.event("WINCH_UNSUPPORTED", n.id);
                    }
                    if (liftedBy > 0.05)
                        this.physics.setLinearVelocity(loadId, { x: 0, y: s.vy });
                    continue;
                }
                const hold = () => { this.physics.setLinearVelocity(loadId, { x: 0, y: 0 }); this.physics.applyForce(loadId, { x: 0, y: -mass * 9.81 }); };
                if (w !== 0) {
                    if (s.y <= top) {
                        this.gears.hold(n.id);
                        hold();
                    }
                    else {
                        this.physics.setLinearVelocity(loadId, { x: 0, y: -Math.abs(w) * n.output.drum });
                        this.physics.applyForce(loadId, { x: 0, y: -mass * 9.81 });
                    }
                }
                else if (liftedBy > 0.05)
                    hold();
                if (liftedBy > 0.3 && !this.lifted.has(n.id)) {
                    this.lifted.add(n.id);
                    this.event("WINCH_LIFT", n.id, loadId, { height: Math.round(liftedBy * 100) / 100 });
                }
            }
            if (n.output.kind === "CONVEYOR" && typeof n.parameters.drives === "string" && w !== 0) {
                const beltId = n.parameters.drives;
                const belt = this.partById.get(beltId);
                if (!belt)
                    continue;
                const rigid = this.definition(beltId).behaviours.find(b => b.kind === "RIGID_BODY");
                if ((rigid === null || rigid === void 0 ? void 0 : rigid.kind) !== "RIGID_BODY")
                    continue;
                const surfaceSpeed = w * n.output.drum;
                const topY = belt.position.y - rigid.height / 2;
                for (const part of this.snapshot.parts) {
                    if (part.id === beltId)
                        continue;
                    const s = this.safeState(part.id);
                    if (!s)
                        continue;
                    const r = this.definition(part.id).behaviours.find(b => b.kind === "RIGID_BODY");
                    if ((r === null || r === void 0 ? void 0 : r.kind) !== "RIGID_BODY" || r.bodyType !== "DYNAMIC")
                        continue;
                    const bottom = s.y + r.height / 2;
                    if (Math.abs(s.x - belt.position.x) <= rigid.width / 2 && bottom >= topY - 0.12 && bottom <= topY + 0.15) {
                        this.physics.setLinearVelocity(part.id, { x: s.vx + (surfaceSpeed - s.vx) * 0.3, y: s.vy });
                        if (!this.carried.has(part.id)) {
                            this.carried.add(part.id);
                            this.event("CONVEYOR_CARRY", beltId, part.id, { speed: Math.round(surfaceSpeed * 100) / 100 });
                        }
                    }
                }
            }
            if (n.output.kind === "CAROUSEL" && Math.abs(w) > Number((_a = n.parameters.flingAbove) !== null && _a !== void 0 ? _a : 2.6) && !this.flung.has(n.id)) {
                this.flung.add(n.id);
                this.event("SPROCKET_FLUNG", n.id, undefined, { speed: Math.round(Math.abs(w) * 100) / 100 });
            }
        }
    }
    /** Structures carry gravity loads, travellers and anything hanging from them (a crane winch's rope). */
    stepStructures(dt) {
        var _a;
        const hanging = [];
        for (const n of this.gears.nodes) {
            if (((_a = n.output) === null || _a === void 0 ? void 0 : _a.kind) !== "WINCH" || n.parameters.mountOnStructure !== true || typeof n.parameters.ropeTo !== "string")
                continue;
            const start = this.partById.get(n.parameters.ropeTo);
            const s = this.safeState(String(n.parameters.ropeTo));
            if (!start || !s)
                continue;
            // The rope pulls down on the mount with the load's weight once the load is off the ground (load units: newtons × 0.5).
            if (start.position.y - s.y > 0.02)
                hanging.push({ x: n.x, y: n.y, force: this.physics.mass(String(n.parameters.ropeTo)) * 9.81 * 0.5, sourceId: n.id });
        }
        // A magnet mounted on a structure is pulled by whatever it pulls (Newton's third law): that pull loads the structure.
        for (const m of this.magnets.magnets()) {
            const f = this.magnets.force(m.id);
            const part = this.partById.get(m.id);
            if (!f || !part || f.y <= 0.05 || !this.structures.hasJointNear(part.position.x, part.position.y))
                continue;
            hanging.push({ x: part.position.x, y: part.position.y, force: f.y * 0.5, sourceId: m.id });
            if (!this.magnetLoaded.has(m.id)) {
                this.magnetLoaded.add(m.id);
                this.event("STRUCTURE_MAGNET_LOAD", m.id, undefined, { force: Math.round(f.y * 100) / 100 });
            }
        }
        this.structures.step(dt, hanging);
        for (const e of this.structures.drainEvents())
            this.event(e.kind, e.sourceId, e.targetId, e.data);
    }
    collectPhysicsEvents() {
        for (const broken of this.physics.brokenJointEvents)
            this.event("STRUCTURE_BROKE", broken.a, broken.b);
        for (const contact of this.physics.contactEvents) {
            this.event("PHYSICS_CONTACT", contact.a, contact.b, { friction: contact.friction, tangentSpeedBefore: contact.tangentSpeedBefore, tangentSpeedAfter: contact.tangentSpeedAfter });
            if (contact.tangentSpeedBefore - contact.tangentSpeedAfter > 0.005 && contact.friction >= 0.5)
                this.event("FRICTION_SLOWED", contact.a, contact.b, { friction: contact.friction });
            const aDef = this.safeDefinition(contact.a), bDef = this.safeDefinition(contact.b);
            if ((aDef === null || aDef === void 0 ? void 0 : aDef.id) === "motion.ramp" || (bDef === null || bDef === void 0 ? void 0 : bDef.id) === "motion.ramp")
                this.event("RAMP_CONTACT", contact.a, contact.b);
            if ((aDef === null || aDef === void 0 ? void 0 : aDef.id) === "motion.bounce-pad" || (bDef === null || bDef === void 0 ? void 0 : bDef.id) === "motion.bounce-pad")
                this.event("BOUNCE_PAD_CONTACT", contact.a, contact.b);
        }
    }
    transferDomains(dt) {
        var _a, _b, _c, _d;
        for (const part of this.snapshot.parts) {
            const def = this.definition(part.id);
            const pump = def.behaviours.find(b => b.kind === "PUMP");
            if ((pump === null || pump === void 0 ? void 0 : pump.kind) === "PUMP" && ((_a = this.actuatorCommands.get(part.id)) !== null && _a !== void 0 ? _a : 0) > 0) {
                const moved = pump.maxFlow * dt;
                this.fluids.set("water", ((_b = this.fluids.get("water")) !== null && _b !== void 0 ? _b : 0) + moved);
                this.event("PUMP_MOVED_WATER", part.id, undefined, { amount: moved });
            }
            const generator = def.behaviours.find(b => b.kind === "GENERATOR");
            if ((generator === null || generator === void 0 ? void 0 : generator.kind) === "GENERATOR") {
                const state = this.safeState(part.id);
                const generated = Math.abs((_c = state === null || state === void 0 ? void 0 : state.angularVelocity) !== null && _c !== void 0 ? _c : 0) * generator.efficiency;
                if (generated > 0.001) {
                    for (const c of this.snapshot.connections)
                        if (c.fromPartId === part.id && c.config.kind === "ELECTRICAL")
                            this.power.set(c.config.channel, generated);
                    this.event("GENERATOR_POWERED", part.id, undefined, { amount: generated });
                }
            }
            const wheel = def.behaviours.find(b => b.kind === "WATER_WHEEL");
            if ((wheel === null || wheel === void 0 ? void 0 : wheel.kind) === "WATER_WHEEL") {
                const flow = (_d = this.fluids.get("water")) !== null && _d !== void 0 ? _d : 0;
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
        const instance = this.partById.get(instanceId);
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
    safeState(id) { return this.physics.has(id) ? this.physics.state(id) : undefined; }
    /** Read-only lookups for goals and evidence. */
    partDefinition(instanceId) { return this.safeDefinition(instanceId); }
    isDynamicBody(id) { try {
        return Number.isFinite(this.physics.mass(id));
    }
    catch {
        return false;
    } }
    phaseTrace() { return [...this.pipeline.trace]; }
    destroy() { this.destroyed = true; this.physics.destroy(); this.signals.clear(); this.power.clear(); this.fluids.clear(); this.actuatorCommands.clear(); }
    static expectedPhases() { return SIMULATION_PHASES; }
}
