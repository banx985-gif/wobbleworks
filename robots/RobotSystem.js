import { blockCount, parseProgram } from "./RobotProgram.js";
/**
 * Robot Lab (M18) — Scientific Truth Contract for robotics (design §8A).
 *   - A program is a SEQUENCE of instructions carried out one after another, in order. The robot does exactly what
 *     the blocks say — nothing more. It never "understands" what you meant.
 *   - Sensors give the program information about the world (a wall ahead, the colour underneath, a box in front).
 *   - Conditions (IF … ELSE) choose between instructions using a sensor; loops (REPEAT, REPEAT UNTIL) run
 *     instructions again. Timing (WAIT) lets a robot fit in with things that move on their own.
 *   - Robots can only act on the world through their actuators: wheels, a gripper, a pusher for buttons.
 * Simplified: a top-down floor plan of 1 m cells, deterministic timing, robots move one cell at a time.
 * Never implied: that the robot understands intent without programmed rules.
 */
export const ROBOTICS_TRUTH_CONTRACT = Object.freeze({
    id: "truth.robotics.v1",
    preserve: ["programs are sequences of instructions", "sensors provide input", "conditions and loops control behaviour", "robots act through actuators"],
    simplify: ["visual blocks", "deterministic controller timing", "a top-down grid of 1 m cells"],
    neverImply: ["the robot understands intent without programmed rules"]
});
export function arenaThing(def) { const b = def?.behaviours.find(x => x.kind === "ARENA"); return b?.kind === "ARENA" ? b.thing : undefined; }
export function isRobot(def) { return Boolean(def?.behaviours.some(b => b.kind === "ROBOT")); }
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const key = (x, y) => `${x},${y}`;
const cellOf = (p) => ({ x: Math.round(p.x), y: Math.round(p.y) });
const MOVE_TIME = 1 / 1.5, TURN_TIME = 0.4, ACT_TIME = 0.3, MAX_INSTANT = 64;
export class RobotSystem {
    parts;
    robots = [];
    walls = new Set();
    tiles = new Map();
    boxes = [];
    buttons = [];
    doors = [];
    /** Sweeper bots patrol back and forth along one row (axis "x") or one column (axis "y"). */
    sweepers = [];
    conveyors = [];
    machines = [];
    lamps = [];
    pads = [];
    pending = [];
    once = new Set();
    elapsed = 0;
    products = 0;
    danceSteps = 0;
    constructor(parts, definition) {
        this.parts = parts;
        for (const p of parts) {
            const def = definition(p.definitionId);
            const c = cellOf(p.position);
            if (isRobot(def)) {
                const program = parseProgram(p.parameters.program);
                const h = ((Math.round(Number(p.parameters.heading ?? 0)) % 4) + 4) % 4;
                this.robots.push({ id: p.id, x: c.x, y: c.y, heading: h, angle: h * Math.PI / 2, program, stack: [{ blocks: program, index: 0, kind: "MAIN", path: [] }], bumps: 0, crashed: false, done: false, blocks: blockCount(program) });
                continue;
            }
            const thing = arenaThing(def);
            if (!thing)
                continue;
            const link = typeof p.parameters.link === "string" ? p.parameters.link : undefined;
            if (thing === "WALL")
                this.walls.add(key(c.x, c.y));
            else if (thing === "TILE")
                this.tiles.set(key(c.x, c.y), String(p.parameters.colour ?? "RED"));
            else if (thing === "BOX")
                this.boxes.push({ id: p.id, x: c.x, y: c.y, product: false });
            else if (thing === "BUTTON")
                this.buttons.push({ id: p.id, ...c, pressed: false, ...(link ? { link } : {}) });
            else if (thing === "DOOR")
                this.doors.push({ id: p.id, ...c, open: p.parameters.open === true });
            else if (thing === "SWEEPER") {
                const axis = p.parameters.axis === "y" ? "y" : "x";
                this.sweepers.push({ id: p.id, x0: c.x, y0: c.y, axis, from: Number(p.parameters.from ?? (axis === "x" ? c.x : c.y)), to: Number(p.parameters.to ?? (axis === "x" ? c.x + 3 : c.y + 3)), speed: Number(p.parameters.speed ?? 1), phase: Number(p.parameters.phase ?? 0) });
            }
            else if (thing === "CONVEYOR")
                this.conveyors.push({ id: p.id, ...c, dir: ((Math.round(Number(p.parameters.heading ?? 0)) % 4) + 4) % 4, on: p.parameters.on === true, timer: 0, ...(typeof p.parameters.poweredBy === "string" ? { poweredBy: p.parameters.poweredBy } : {}) });
            else if (thing === "MACHINE")
                this.machines.push({ id: p.id, ...c, on: p.parameters.on === true, timer: 0 });
            else if (thing === "LAMP")
                this.lamps.push({ id: p.id, ...c, on: false });
            else if (thing === "PAD")
                this.pads.push({ id: p.id, ...c, beats: String(p.parameters.beats ?? "").split(",").map(Number).filter(Number.isFinite), hits: new Set() });
        }
    }
    hasRobots() { return this.robots.length > 0 || this.sweepers.length > 0 || this.conveyors.length > 0; }
    /** Is a robot holding down an arena button wired to this (Power Lab) part? Buttons stay pressed once pressed. */
    linkPressed(id) { return this.buttons.some(b => b.pressed && b.link === id); }
    /** `motorDrive`: how hard a Power Lab motor is turning — a conveyor wired to a motor runs only while its motor really turns. */
    step(dt, motorDrive = () => 0) {
        this.elapsed += dt;
        for (const c of this.conveyors)
            if (c.poweredBy) {
                const on = motorDrive(c.poweredBy) !== 0;
                if (on && !c.on)
                    this.pending.push({ kind: "CONVEYOR_ON", sourceId: c.poweredBy, targetId: c.id });
                c.on = on;
            }
        for (const r of this.robots)
            this.stepRobot(r, dt);
        this.stepWorld(dt);
        // A sweeper running into a robot knocks it over.
        for (const r of this.robots)
            if (!r.crashed)
                for (const s of this.sweepers) {
                    const sp = this.sweeperPos(s);
                    if (Math.abs(sp.x - r.x) < 0.7 && Math.abs(sp.y - r.y) < 0.7) {
                        r.crashed = true;
                        r.action = undefined;
                        this.pending.push({ kind: "ROBOT_CRASH", sourceId: r.id, targetId: s.id });
                    }
                }
        // Dance pads: a robot standing on a pad on its beat.
        for (const pad of this.pads)
            for (const beat of pad.beats)
                if (!pad.hits.has(beat) && Math.abs(this.elapsed - beat) <= 0.3 && this.robots.some(r => !r.crashed && Math.round(r.x) === pad.x && Math.round(r.y) === pad.y)) {
                    pad.hits.add(beat);
                    this.danceSteps += 1;
                    this.pending.push({ kind: "DANCE_STEP", sourceId: pad.id, data: { beat } });
                }
    }
    // ---------------------------------------------------------------- robots
    stepRobot(r, dt) {
        if (r.crashed || r.done)
            return;
        if (!this.once.has(`start:${r.id}`)) {
            this.once.add(`start:${r.id}`);
            this.pending.push({ kind: "ROBOT_STARTED", sourceId: r.id, data: { blocks: r.blocks } });
        }
        if (r.action) {
            this.continueAction(r, dt);
            if (r.action)
                return;
        }
        for (let i = 0; i < MAX_INSTANT && !r.action && !r.done && !r.crashed; i++)
            this.nextBlock(r);
    }
    continueAction(r, dt) {
        const a = r.action;
        a.t += dt;
        const k = Math.min(1, a.t / a.total);
        if (a.kind === "MOVE") {
            r.x = a.fromX + (a.toX - a.fromX) * k;
            r.y = a.fromY + (a.toY - a.fromY) * k;
            const held = r.holding ? this.boxes.find(b => b.id === r.holding) : undefined;
            if (held) {
                held.x = r.x;
                held.y = r.y;
            }
        }
        if (a.kind === "TURN")
            r.angle = a.fromH + (a.toH - a.fromH) * k;
        if (a.t < a.total - 1e-9)
            return;
        if (a.kind === "MOVE") {
            r.x = a.toX;
            r.y = a.toY;
            this.pending.push({ kind: "ROBOT_MOVED", sourceId: r.id, data: { x: r.x, y: r.y } });
            if ((a.cellsLeft ?? 0) > 0) {
                r.action = undefined;
                this.startMove(r, a.cellsLeft);
                return;
            }
        }
        if (a.kind === "TURN")
            r.angle = a.toH;
        r.action = undefined;
    }
    nextBlock(r) {
        const f = r.stack[r.stack.length - 1];
        if (!f) {
            this.finish(r);
            return;
        }
        if (f.index >= f.blocks.length) {
            // End of a list: loops go round again; branches return to their parent.
            if (f.kind === "REPEAT" && (f.left ?? 0) > 1) {
                f.left = (f.left ?? 1) - 1;
                f.index = 0;
                this.pending.push({ kind: "LOOP_REPEAT", sourceId: r.id });
                return;
            }
            if (f.kind === "UNTIL") {
                if (this.sense(r, f.sensor)) {
                    r.stack.pop();
                }
                else {
                    f.index = 0;
                    this.pending.push({ kind: "LOOP_REPEAT", sourceId: r.id });
                }
                return;
            }
            r.stack.pop();
            if (!r.stack.length)
                this.finish(r);
            return;
        }
        const b = f.blocks[f.index];
        const path = [...f.path, f.index];
        f.index += 1;
        r.current = path;
        switch (b.op) {
            case "FORWARD":
                this.startMove(r, b.n);
                return;
            case "TURN": {
                const toH = r.angle + (b.dir === "L" ? -Math.PI / 2 : Math.PI / 2);
                r.heading = (r.heading + (b.dir === "L" ? 3 : 1)) % 4;
                r.action = { kind: "TURN", t: 0, total: TURN_TIME, fromH: r.angle, toH };
                this.pending.push({ kind: "ROBOT_TURNED", sourceId: r.id, data: { dir: b.dir } });
                return;
            }
            case "WAIT":
                r.action = { kind: "WAIT", t: 0, total: b.s };
                this.pending.push({ kind: "ROBOT_WAITED", sourceId: r.id, data: { seconds: b.s } });
                return;
            case "REPEAT":
                if (b.body.length)
                    r.stack.push({ blocks: b.body, index: 0, kind: "REPEAT", left: b.n, path: [...path, "body"] });
                return;
            case "UNTIL": {
                const met = this.sense(r, b.sensor);
                this.pending.push({ kind: "SENSOR_DECISION", sourceId: r.id, data: { sensor: b.sensor, result: met, block: "UNTIL" } });
                if (!met && b.body.length)
                    r.stack.push({ blocks: b.body, index: 0, kind: "UNTIL", sensor: b.sensor, path: [...path, "body"] });
                return;
            }
            case "IF": {
                const yes = this.sense(r, b.sensor);
                this.pending.push({ kind: "SENSOR_DECISION", sourceId: r.id, data: { sensor: b.sensor, result: yes, block: "IF" } });
                const list = yes ? b.then : b.else;
                if (list.length)
                    r.stack.push({ blocks: list, index: 0, kind: "BRANCH", path: [...path, yes ? "then" : "else"] });
                return;
            }
            case "GRAB": {
                r.action = { kind: "ACT", t: 0, total: ACT_TIME };
                const [fx, fy] = this.front(r);
                const box = this.boxes.find(q => !q.carriedBy && q.x === fx && q.y === fy);
                if (box && !r.holding) {
                    box.carriedBy = r.id;
                    r.holding = box.id;
                    box.x = r.x;
                    box.y = r.y;
                    this.pending.push({ kind: "BOX_GRABBED", sourceId: r.id, targetId: box.id });
                }
                else
                    this.pending.push({ kind: "GRAB_MISSED", sourceId: r.id });
                return;
            }
            case "DROP": {
                r.action = { kind: "ACT", t: 0, total: ACT_TIME };
                const [fx, fy] = this.front(r);
                const box = r.holding ? this.boxes.find(q => q.id === r.holding) : undefined;
                if (box && !this.blocked(fx, fy, r.id, true)) {
                    box.carriedBy = undefined;
                    box.x = fx;
                    box.y = fy;
                    r.holding = undefined;
                    this.pending.push({ kind: "BOX_DROPPED", sourceId: r.id, targetId: box.id, data: { x: fx, y: fy } });
                }
                else
                    this.pending.push({ kind: "DROP_MISSED", sourceId: r.id });
                return;
            }
            case "PRESS": {
                r.action = { kind: "ACT", t: 0, total: ACT_TIME };
                const [fx, fy] = this.front(r);
                const btn = this.buttons.find(q => q.x === fx && q.y === fy);
                if (btn)
                    this.press(r, btn);
                else
                    this.pending.push({ kind: "PRESS_MISSED", sourceId: r.id });
                return;
            }
        }
    }
    startMove(r, cells) {
        const [tx, ty] = this.front(r);
        if (this.blocked(tx, ty, r.id)) {
            r.bumps += 1;
            r.action = { kind: "ACT", t: 0, total: ACT_TIME };
            this.pending.push({ kind: "ROBOT_BUMP", sourceId: r.id, data: { x: tx, y: ty } });
            return;
        }
        r.action = { kind: "MOVE", t: 0, total: MOVE_TIME, fromX: r.x, fromY: r.y, toX: tx, toY: ty, cellsLeft: cells - 1 };
    }
    front(r) { const [dx, dy] = DIRS[r.heading]; return [Math.round(r.x) + dx, Math.round(r.y) + dy]; }
    finish(r) { if (r.done)
        return; r.done = true; r.doneAt = this.elapsed; r.current = undefined; this.pending.push({ kind: "ROBOT_DONE", sourceId: r.id, data: { seconds: Math.round(this.elapsed * 100) / 100, blocks: r.blocks } }); }
    /** Is a cell blocked for a robot? (Dropping a box onto a drop zone, conveyor or machine is allowed.) */
    blocked(x, y, selfId, forDrop = false) {
        if (x < 0 || x > 16 || y < 0 || y > 8.5)
            return true;
        if (this.walls.has(key(x, y)))
            return true;
        if (this.doors.some(d => !d.open && d.x === x && d.y === y))
            return true;
        if (this.robots.some(o => o.id !== selfId && !o.crashed && ((Math.round(o.x) === x && Math.round(o.y) === y) || (o.action?.kind === "MOVE" && o.action.toX === x && o.action.toY === y))))
            return true;
        if (this.sweepers.some(s => { const sp = this.sweeperPos(s); return Math.abs(sp.x - x) < 0.8 && Math.abs(sp.y - y) < 0.8; }))
            return true;
        if (this.boxes.some(b => !b.carriedBy && b.x === x && b.y === y))
            return true;
        if (!forDrop && (this.conveyors.some(c => c.x === x && c.y === y) || this.machines.some(m => m.x === x && m.y === y)))
            return true;
        return false;
    }
    /** Sensors: what the robot can find out about the world right now. */
    sense(r, s) {
        const [fx, fy] = this.front(r);
        const under = this.tiles.get(key(Math.round(r.x), Math.round(r.y)));
        switch (s) {
            case "WALL_AHEAD": return this.blocked(fx, fy, r.id) && !this.boxes.some(b => !b.carriedBy && b.x === fx && b.y === fy);
            case "PATH_CLEAR": return !this.blocked(fx, fy, r.id);
            case "ON_RED": return under === "RED";
            case "ON_GREEN": return under === "GREEN";
            case "ON_BLUE": return under === "BLUE";
            case "ON_YELLOW": return under === "YELLOW";
            case "BOX_AHEAD": return this.boxes.some(b => !b.carriedBy && b.x === fx && b.y === fy);
            case "HOLDING": return r.holding !== undefined;
        }
    }
    press(r, btn) {
        if (!btn.pressed)
            this.pending.push({ kind: "BUTTON_PRESSED", sourceId: r.id, targetId: btn.id });
        btn.pressed = true;
        const link = btn.link;
        if (!link)
            return;
        for (const d of this.doors)
            if (d.id === link && !d.open) {
                d.open = true;
                this.pending.push({ kind: "DOOR_OPENED", sourceId: btn.id, targetId: d.id });
            }
        for (const c of this.conveyors)
            if (c.id === link || link === "conveyors" || link === "all") {
                if (!c.on)
                    this.pending.push({ kind: "CONVEYOR_ON", sourceId: btn.id, targetId: c.id });
                c.on = true;
            }
        for (const m of this.machines)
            if (m.id === link || link === "machines" || link === "all") {
                if (!m.on)
                    this.pending.push({ kind: "MACHINE_ON", sourceId: btn.id, targetId: m.id });
                m.on = true;
            }
        for (const l of this.lamps)
            if (l.id === link) {
                if (!l.on)
                    this.pending.push({ kind: "LAMP_ON", sourceId: btn.id, targetId: l.id });
                l.on = true;
            }
    }
    // ---------------------------------------------------------------- the floor's own machines
    stepWorld(dt) {
        for (const c of this.conveyors) {
            if (!c.on)
                continue;
            c.timer += dt;
            if (c.timer < 0.8)
                continue;
            c.timer = 0;
            const box = this.boxes.find(b => !b.carriedBy && b.x === c.x && b.y === c.y);
            if (!box)
                continue;
            const [dx, dy] = DIRS[c.dir];
            const nx = c.x + dx, ny = c.y + dy;
            if (!this.walls.has(key(nx, ny)) && !this.boxes.some(b => b !== box && !b.carriedBy && b.x === nx && b.y === ny) && !this.robots.some(r => Math.round(r.x) === nx && Math.round(r.y) === ny)) {
                box.x = nx;
                box.y = ny;
                this.pending.push({ kind: "CONVEYOR_CARRY", sourceId: c.id, targetId: box.id });
            }
        }
        for (const m of this.machines) {
            const box = this.boxes.find(b => !b.carriedBy && b.x === m.x && b.y === m.y && !b.product);
            if (!m.on || !box) {
                m.timer = 0;
                continue;
            }
            m.timer += dt;
            if (m.timer >= 1) {
                m.timer = 0;
                box.product = true;
                this.products += 1;
                this.pending.push({ kind: "PRODUCT_MADE", sourceId: m.id, targetId: box.id });
            }
        }
    }
    sweeperPos(s) {
        const span = Math.abs(s.to - s.from);
        const d = span === 0 ? 0 : ((this.elapsed + s.phase) * s.speed) % (2 * span);
        const v = Math.min(s.from, s.to) + (d <= span ? d : 2 * span - d);
        return s.axis === "x" ? { x: v, y: s.y0 } : { x: s.x0, y: v };
    }
    // ---------------------------------------------------------------- read-only views
    robot(id) { const r = this.robots.find(q => q.id === id); return r ? { id, x: r.x, y: r.y, angle: r.angle, ...(r.holding ? { holding: r.holding } : {}), bumps: r.bumps, crashed: r.crashed, done: r.done, ...(r.doneAt !== undefined ? { doneAt: r.doneAt } : {}), ...(r.current ? { current: r.current } : {}), blocks: r.blocks } : undefined; }
    robotViews() { return this.robots.map(r => this.robot(r.id)); }
    /** Is this box resting (not carried) on the cell of that part (a drop zone or slot)? */
    boxAt(boxId, partId) { const b = this.boxes.find(q => q.id === boxId); const p = this.parts.find(q => q.id === partId); return Boolean(b && p && b.carriedBy === undefined && b.x === Math.round(p.position.x) && b.y === Math.round(p.position.y)); }
    box(id) { const b = this.boxes.find(q => q.id === id); return b ? { x: b.x, y: b.y, carried: b.carriedBy !== undefined, product: b.product } : undefined; }
    isPressed(id) { return this.buttons.some(b => b.id === id && b.pressed); }
    isOpen(id) { return this.doors.some(d => d.id === id && d.open); }
    isOn(id) { return this.conveyors.some(c => c.id === id && c.on) || this.machines.some(m => m.id === id && m.on) || this.lamps.some(l => l.id === id && l.on); }
    sweeperPosition(id) { const s = this.sweepers.find(q => q.id === id); return s ? this.sweeperPos(s) : undefined; }
    /** The program a robot is running (for goals that ask how it was written). */
    programOf(id) { return this.robots.find(r => r.id === id)?.program ?? []; }
    productCount() { return this.products; }
    danceScore() { return this.danceSteps; }
    drainEvents() { const out = this.pending; this.pending = []; return out; }
}
