import { LOGICAL_HEIGHT, LOGICAL_WIDTH, Viewport } from "./Viewport.js";
import { PART_ART_SOURCE, partArtRect, rampArtRect } from "./PartArt.js";
import { drawBuilderBayBackdrop, drawJoints, drawStructurePart, structureKind, structureLayer } from "./StructureRenderer.js";
import { drawLevelScenery } from "./LevelScenery.js";
import { drawCircuitPart, drawCircuitScanner, drawCircuitTerminals, isCircuitPart } from "./PowerRenderer.js";
import { drawLabBackdrop } from "./LabBackdrops.js";
import { drawMagnetForces, drawMagnetPart, isMagnetPart } from "./MagnetRenderer.js";
import { drawWaterEffects, drawWaterPart, drawWaterPorts, isWaterPart } from "./WaterRenderer.js";
import { drawFlightForces, drawFlightPart, isFlightPart } from "./FlightRenderer.js";
import { drawRobotFloor, drawRobotPart, isRobotPart } from "./RobotRenderer.js";
import { drawDoorPanel, drawGearGarageBackdrop, drawGearLinks, drawGearPart, drawRotationView, gearBehaviour, gearOutput } from "./GearRenderer.js";
export class CanvasRenderer {
    canvas;
    ctx;
    viewport = new Viewport();
    art = () => undefined;
    /** Hand the renderer the loaded pictures. Until then (or for a missing picture) parts are drawn in code. */
    setArt(lookup) { this.art = lookup; }
    constructor(canvas) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Canvas 2D unavailable");
        this.ctx = ctx;
        this.resize();
    }
    resize() { const ratio = Math.min(2, devicePixelRatio || 1); const rect = this.canvas.getBoundingClientRect(); this.canvas.width = Math.max(1, Math.floor(rect.width * ratio)); this.canvas.height = Math.max(1, Math.floor(rect.height * ratio)); this.viewport.resize(rect.width, rect.height); this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0); }
    begin(camera) {
        const c = this.ctx;
        const rect = this.canvas.getBoundingClientRect();
        c.clearRect(0, 0, rect.width, rect.height);
        c.save();
        c.translate(this.viewport.offsetX, this.viewport.offsetY);
        c.scale(this.viewport.scale, this.viewport.scale);
        c.fillStyle = "#eef8ff";
        c.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        c.fillStyle = "#d7ecb8";
        c.fillRect(0, 820, LOGICAL_WIDTH, 80);
        c.strokeStyle = "#203040";
        c.lineWidth = 3;
        c.strokeRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        if (camera) {
            c.translate(800, 450);
            c.scale(camera.zoom, camera.zoom);
            c.translate(-camera.x, -camera.y);
        }
    }
    end() { this.ctx.restore(); }
    drawMotionYardBackdrop() {
        const c = this.ctx;
        const sky = c.createLinearGradient(0, 0, 0, 820);
        sky.addColorStop(0, "#c9efff");
        sky.addColorStop(1, "#f7fdff");
        c.fillStyle = sky;
        c.fillRect(0, 0, 1600, 820);
        c.fillStyle = "#c7e7ef";
        c.beginPath();
        c.moveTo(0, 630);
        c.lineTo(180, 520);
        c.lineTo(320, 590);
        c.lineTo(510, 470);
        c.lineTo(700, 600);
        c.lineTo(900, 500);
        c.lineTo(1120, 610);
        c.lineTo(1360, 480);
        c.lineTo(1600, 590);
        c.lineTo(1600, 820);
        c.lineTo(0, 820);
        c.closePath();
        c.fill();
        c.fillStyle = "#edf3f5";
        c.fillRect(0, 650, 1600, 170);
        c.strokeStyle = "#9fb5bc";
        c.lineWidth = 2;
        for (let x = 0; x <= 1600; x += 100) {
            c.beginPath();
            c.moveTo(x, 650);
            c.lineTo(x, 820);
            c.stroke();
        }
        for (let y = 650; y <= 820; y += 50) {
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(1600, y);
            c.stroke();
        }
        c.fillStyle = "#f7b731";
        c.fillRect(0, 812, 1600, 18);
        c.fillStyle = "#203040";
        for (let x = 0; x < 1600; x += 70)
            c.fillRect(x, 812, 34, 18);
        c.fillStyle = "#ffffffcc";
        c.strokeStyle = "#203040";
        c.lineWidth = 5;
        c.beginPath();
        c.roundRect(60, 70, 310, 115, 28);
        c.fill();
        c.stroke();
        c.fillStyle = "#203040";
        c.font = "900 42px system-ui";
        c.textAlign = "center";
        c.fillText("MOTION YARD", 215, 125);
        c.font = "800 20px system-ui";
        c.fillText("ROLL • PUSH • BOUNCE • TEST", 215, 160);
        for (const x of [470, 690, 910, 1130]) {
            c.fillStyle = "#ff922b";
            c.strokeStyle = "#203040";
            c.lineWidth = 5;
            c.fillRect(x, 590, 18, 60);
            c.strokeRect(x, 590, 18, 60);
            c.fillStyle = "#fff";
            c.fillRect(x - 24, 600, 66, 12);
            c.strokeRect(x - 24, 600, 66, 12);
        }
    }
    drawParts(parts, registry, runtimeStates, selectedId, gears, time = 0, structures, showStress = false, runtime) {
        const states = new Map(runtimeStates?.map(s => [s.id, s]) ?? []);
        // Draw order only: fixed things first (zones, ramps, pads), then shafts, then gears, then moving things in front.
        const layer = (p) => { const def = registry.get(p.definitionId); if (isRobotPart(def)) {
            const t = def.behaviours.find(b => b.kind === "ARENA");
            return t?.kind === "ARENA" ? (t.thing === "TILE" || t.thing === "GOAL" || t.thing === "DROP" || t.thing === "PAD" ? -1 : t.thing === "BOX" || t.thing === "SWEEPER" ? 3 : 0) : 3.5;
        } if (isFlightPart(def))
            return def.id === "flight.cliff" ? -1 : def.behaviours.some(b => b.kind === "AERO" && (b.part === "PARACHUTE" || b.part === "BALLOON" || b.part === "TAIL")) ? 2.5 : def.behaviours.some(b => b.kind === "AERO") ? 3.5 : def.behaviours.some(b => b.kind === "CRAFT") ? 3 : 0.5; if (isWaterPart(def))
            return def.behaviours.some(b => b.kind === "PIPE") ? 0.7 : def.behaviours.some(b => b.kind === "WATER_TARGET") ? -1 : def.behaviours.some(b => b.kind === "GEAR") ? 1 : 0.5; if (isCircuitPart(def))
            return def.behaviours.some(b => b.kind === "WIRE") ? 2.5 : def.behaviours.some(b => b.kind === "GEAR") ? 1 : 0.5; if (structureKind(def))
            return [-2, -1, 1.5, 1.6, 4][structureLayer(def)] ?? 4; const g = gearBehaviour(def); if (g)
            return g.role === "SHAFT" ? 1 : 2; const r = def.behaviours.find(b => b.kind === "RIGID_BODY"); return !r || (r.kind === "RIGID_BODY" && r.bodyType === "STATIC") ? 0 : 3; };
        const ordered = [-2, -1, 0, 0.5, 0.7, 1, 1.5, 1.6, 2, 2.5, 3, 3.5, 4].flatMap(k => parts.filter(p => layer(p) === k));
        const structCtx = { ...(structures ? { structures } : {}), registry: (id) => registry.get(id), art: this.art, time, showStress };
        const magnetCtx = { ...(runtime ? { magnets: runtime.magnets } : {}), states, art: this.art, time, scanner: showStress };
        const robotCtx = { ...(runtime ? { robots: runtime.robots } : {}), time, scanner: showStress };
        const flightCtx = { ...(runtime ? { flight: runtime.flight } : {}), states, art: this.art, time, scanner: showStress, pose: (id) => runtime?.flight.attachedPose(id, runtime.physics) };
        const waterCtx = { ...(runtime ? { water: runtime.water } : {}), art: this.art, time, scanner: showStress, gearAngle: (id) => gears?.state(id)?.angle ?? 0 };
        const powerCtx = { ...(runtime ? { circuits: runtime.circuits } : {}), art: this.art, time, scanner: showStress };
        const gearCtx = { ...(gears ? { gears } : {}), states, parts, registry: (id) => registry.get(id), time, art: this.art };
        for (const part of ordered) {
            const def = registry.get(part.definitionId);
            const rigid = def.behaviours.find(b => b.kind === "RIGID_BODY");
            if (drawStructurePart(this.ctx, part, def, selectedId === part.id, structCtx))
                continue;
            if (isMagnetPart(def) && drawMagnetPart(this.ctx, part, def, selectedId === part.id, magnetCtx))
                continue;
            if (isRobotPart(def) && drawRobotPart(this.ctx, part, def, selectedId === part.id, robotCtx))
                continue;
            if (isFlightPart(def) && drawFlightPart(this.ctx, part, def, selectedId === part.id, flightCtx))
                continue;
            if (isWaterPart(def) && drawWaterPart(this.ctx, part, def, selectedId === part.id, waterCtx))
                continue;
            if (isCircuitPart(def) && drawCircuitPart(this.ctx, part, def, selectedId === part.id, powerCtx))
                continue;
            if (gearBehaviour(def)) {
                if (gearOutput(def)?.output === "DOOR")
                    drawDoorPanel(this.ctx, part, gears?.state(part.id)?.turns ?? 0);
                drawGearPart(this.ctx, part, def, selectedId === part.id, gearCtx);
                if (part.parameters.locked === true) {
                    const c = this.ctx;
                    c.save();
                    c.fillStyle = "#203040";
                    c.font = "900 15px system-ui";
                    c.textAlign = "center";
                    c.fillText("●", part.position.x * 100, part.position.y * 100 + 5);
                    c.restore();
                }
                continue;
            }
            if (part.definitionId === "motion.conveyor") {
                this.drawConveyor(part, def, gears);
                continue;
            }
            const state = states.get(part.id);
            const x = (state?.x ?? part.position.x) * 100;
            const y = (state?.y ?? part.position.y) * 100;
            const angle = state?.angle ?? part.rotation;
            const width = rigid?.kind === "RIGID_BODY" ? rigid.width * 100 : 80;
            const height = rigid?.kind === "RIGID_BODY" ? rigid.height * 100 : 60;
            const selected = selectedId === part.id;
            const c = this.ctx;
            if (part.definitionId === "motion.goal-zone" && this.drawGoalZoneArt(x, y, width, part.tags ?? []))
                continue;
            if (part.definitionId === "motion.ramp" && this.drawRampArt(x, y, width, angle, selected))
                continue;
            c.save();
            c.translate(x, y);
            c.rotate(angle);
            c.strokeStyle = "#203040";
            c.lineWidth = selected ? 8 : 5;
            c.lineJoin = "round";
            c.lineCap = "round";
            if (!this.drawPartArt(part.definitionId, width, height, selected) && !this.drawMotionPart(part.definitionId, width, height, selected)) {
                c.fillStyle = selected ? "#ffd14a" : this.categoryColor(def.category);
                if (rigid?.kind === "RIGID_BODY" && rigid.shape === "CIRCLE") {
                    c.beginPath();
                    c.arc(0, 0, width / 2, 0, Math.PI * 2);
                    c.fill();
                    c.stroke();
                }
                else {
                    c.beginPath();
                    c.roundRect(-width / 2, -height / 2, width, height, Math.min(18, width / 4, height / 4));
                    c.fill();
                    c.stroke();
                }
                c.fillStyle = "#13202b";
                c.font = "700 20px system-ui";
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.fillText(def.displayName.slice(0, 11), 0, 0);
            }
            if (part.parameters.locked === true) {
                c.fillStyle = "#203040";
                c.font = "900 17px system-ui";
                c.textAlign = "right";
                c.fillText("●", width / 2 - 5, -height / 2 + 15);
            }
            c.restore();
        }
    }
    /** A Motion conveyor belt; its stripes move with whatever drum drives it. */
    drawConveyor(part, def, gears) {
        const r = def.behaviours.find(b => b.kind === "RIGID_BODY");
        if (r?.kind !== "RIGID_BODY")
            return;
        const c = this.ctx;
        const w = r.width * 100, h = r.height * 100, x = part.position.x * 100, y = part.position.y * 100;
        const drum = gears?.nodes.find(n => n.parameters.drives === part.id);
        const travel = drum && gears ? (gears.state(drum.id)?.angle ?? 0) * (drum.output?.drum ?? 0.35) * 100 : 0;
        c.save();
        c.fillStyle = "#495057";
        c.strokeStyle = "#203040";
        c.lineWidth = 5;
        c.beginPath();
        c.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
        c.fill();
        c.stroke();
        c.beginPath();
        c.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
        c.clip();
        c.strokeStyle = "#ffd43b";
        c.lineWidth = 4;
        const step = 40;
        const off = ((travel % step) + step) % step;
        for (let sx = x - w / 2 - step + off; sx < x + w / 2 + step; sx += step) {
            c.beginPath();
            c.moveTo(sx, y - h / 2 + 4);
            c.lineTo(sx + 10, y);
            c.lineTo(sx, y + h / 2 - 4);
            c.stroke();
        }
        c.restore();
    }
    /** Painted scenery for this mission, behind everything else (drawing only). */
    drawScenery(levelId) { drawLevelScenery(this.ctx, levelId, this.art); }
    /** Backdrop for a lab added from M14 on. */
    drawLabBackdrop(labId, time) { drawLabBackdrop(this.ctx, labId, time); }
    drawMagnetForces(runtime) { drawMagnetForces(this.ctx, runtime.magnets, new Map(runtime.physics.states().map(s => [s.id, s]))); }
    drawRobotFloor() { drawRobotFloor(this.ctx); }
    drawFlightForces(runtime) { drawFlightForces(this.ctx, runtime.flight, new Map(runtime.physics.states().map(s => [s.id, s]))); }
    drawWaterEffects(runtime, time) { drawWaterEffects(this.ctx, runtime.water, time); }
    drawWaterPorts(layout) { drawWaterPorts(this.ctx, layout); }
    drawCircuitTerminals(layout) { drawCircuitTerminals(this.ctx, layout); }
    drawCircuitScanner(parts, registry, circuits) { drawCircuitScanner(this.ctx, parts, id => registry.get(id), circuits); }
    drawBuilderBayBackdrop() { drawBuilderBayBackdrop(this.ctx); }
    drawJoints(layout) { drawJoints(this.ctx, layout, this.art); }
    drawGearGarageBackdrop(time) { drawGearGarageBackdrop(this.ctx, time); }
    drawGearLinks(analysis, building) { drawGearLinks(this.ctx, analysis, building); }
    drawRotationView(gears, showValues) { drawRotationView(this.ctx, gears, showValues); }
    /** Painted part picture fitted to the physics size (see PartArt.ts). False when there is no picture yet. */
    drawPartArt(id, w, h, selected) {
        const image = this.art(PART_ART_SOURCE[id] ?? id);
        const rect = image ? partArtRect(id, w, h) : undefined;
        if (!image || !rect)
            return false;
        const c = this.ctx;
        if (selected) {
            c.save();
            c.shadowColor = "#ffd43b";
            c.shadowBlur = 26;
        }
        c.drawImage(image, rect.x, rect.y, rect.width, rect.height);
        if (selected) {
            c.restore();
            this.selectionOutline(w, h, id === "motion.ball" || id === "motion.wheel" || id === "motion.roller");
        }
        return true;
    }
    drawRampArt(x, y, w, angle, selected) {
        const image = this.art("motion.ramp");
        if (!image)
            return false;
        const c = this.ctx;
        const r = rampArtRect(x, y, w, angle);
        c.save();
        if (selected) {
            c.shadowColor = "#ffd43b";
            c.shadowBlur = 26;
        }
        if (r.mirror) {
            c.translate(r.x + r.width, r.y);
            c.scale(-1, 1);
            c.drawImage(image, 0, 0, r.width, r.height);
        }
        else
            c.drawImage(image, r.x, r.y, r.width, r.height);
        c.restore();
        if (selected) {
            c.save();
            c.translate(x, y);
            c.rotate(angle);
            c.strokeStyle = "#ffd43b";
            c.lineWidth = 6;
            c.setLineDash([14, 10]);
            c.beginPath();
            c.moveTo(-w / 2, 0);
            c.lineTo(w / 2, 0);
            c.stroke();
            c.restore();
        }
        return true;
    }
    selectionOutline(w, h, round) {
        const c = this.ctx;
        c.save();
        c.strokeStyle = "#ffd43b";
        c.lineWidth = 5;
        c.setLineDash([12, 9]);
        c.beginPath();
        if (round)
            c.arc(0, 0, w / 2 + 4, 0, Math.PI * 2);
        else
            c.roundRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 10);
        c.stroke();
        c.restore();
    }
    /** Goal zone: glowing ring + flag (or a target board when the zone is a target). */
    drawGoalZoneArt(x, y, w, tags) {
        const ring = this.art("fx.zone-ring");
        if (!ring)
            return false;
        const c = this.ctx;
        const radius = Math.max(80, w * 0.9);
        const isTarget = tags.some(t => t.includes("target") || t.includes("bath") || t.includes("switch"));
        const marker = isTarget ? this.art("level.target") : this.art("level.goal-flag");
        c.save();
        c.globalAlpha = 0.9;
        const rw = radius * 2.2, rh = rw / 1.34;
        c.drawImage(ring, x - rw / 2, y + radius * 0.55 - rh * 0.78, rw, rh);
        c.globalAlpha = 1;
        if (marker) {
            const mh = radius * 1.35;
            const mw = isTarget ? mh * 1.62 : mh * 0.89;
            c.drawImage(marker, x - mw / 2, y - mh * 0.62, mw, mh);
        }
        c.restore();
        return true;
    }
    /** Hint 3: translucent blueprint ghosts of part of one valid solution. */
    drawGhostParts(ghosts, registry, pulse) {
        const c = this.ctx;
        for (const g of ghosts) {
            const def = registry.get(g.definitionId);
            const rigid = def.behaviours.find(b => b.kind === "RIGID_BODY");
            const w = rigid?.kind === "RIGID_BODY" ? rigid.width * 100 : 80, h = rigid?.kind === "RIGID_BODY" ? rigid.height * 100 : 60;
            const x = g.x * 100, y = g.y * 100;
            if (structureKind(def) === "BEAM") {
                c.save();
                c.globalAlpha = 0.42 + 0.12 * Math.sin(pulse * 3);
                drawStructurePart(c, { id: "ghost", definitionId: g.definitionId, position: { x: g.x, y: g.y }, rotation: g.rotation, parameters: g.length !== undefined ? { length: g.length } : {} }, def, false, { registry: id => registry.get(id), art: this.art, time: pulse, showStress: false });
                c.restore();
                this.drawPointer(x, y - 20, pulse);
                continue;
            }
            const gb = gearBehaviour(def);
            if (gb) {
                c.save();
                c.globalAlpha = 0.4 + 0.12 * Math.sin(pulse * 3);
                drawGearPart(c, { id: "ghost", definitionId: g.definitionId, position: { x: g.x, y: g.y }, rotation: pulse * 0.6, parameters: {} }, def, false, { states: new Map(), parts: [], registry: id => registry.get(id), time: pulse });
                c.restore();
                c.save();
                c.strokeStyle = "#1c7ed6";
                c.lineWidth = 4;
                c.setLineDash([10, 8]);
                c.beginPath();
                c.arc(x, y, gb.radius * 100 + 6, 0, Math.PI * 2);
                c.stroke();
                c.restore();
                this.drawPointer(x, y - gb.radius * 100 - 10, pulse);
                continue;
            }
            c.save();
            c.globalAlpha = 0.38 + 0.12 * Math.sin(pulse * 3);
            if (!(g.definitionId === "motion.ramp" && this.drawRampArt(x, y, w, g.rotation, false))) {
                c.translate(x, y);
                c.rotate(g.rotation);
                c.strokeStyle = "#203040";
                c.lineWidth = 5;
                if (!this.drawPartArt(g.definitionId, w, h, false))
                    this.drawMotionPart(g.definitionId, w, h, false);
            }
            c.restore();
            c.save();
            c.translate(x, y);
            c.rotate(g.rotation);
            c.strokeStyle = "#1c7ed6";
            c.lineWidth = 4;
            c.setLineDash([10, 8]);
            c.globalAlpha = 0.85;
            if (g.definitionId === "motion.ramp") {
                c.beginPath();
                c.moveTo(-w / 2, 0);
                c.lineTo(w / 2, 0);
                c.stroke();
            }
            else {
                c.beginPath();
                c.roundRect(-w / 2, -h / 2, w, h, 8);
                c.stroke();
            }
            c.restore();
            this.drawPointer(x, y - Math.max(h, 40) / 2 - 10, pulse);
        }
    }
    /** The painted tapping hand (ui.hint.tap), bobbing just above a world point. */
    drawPointer(x, y, pulse) {
        const hand = this.art("ui.hint.tap");
        const c = this.ctx;
        const bob = Math.sin(pulse * 5) * 8;
        if (hand) {
            c.drawImage(hand, x - 8, y - 92 + bob, 80, 85);
            return;
        }
        c.save();
        c.fillStyle = "#ffd43b";
        c.strokeStyle = "#203040";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(x, y + bob);
        c.lineTo(x + 22, y - 34 + bob);
        c.lineTo(x - 22, y - 34 + bob);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
    }
    /** Force Scanner arrows. `showValues` (advanced players) adds the measured size in newtons. */
    drawForceVectors(vectors, states, showValues = false) {
        const stateMap = new Map(states.map(s => [s.id, s]));
        const c = this.ctx;
        for (const force of vectors) {
            const s = stateMap.get(force.bodyId);
            if (!s)
                continue;
            const mag = Math.hypot(force.vector.x, force.vector.y);
            if (mag < .001)
                continue;
            const scale = Math.min(110, 24 + Math.sqrt(mag) * 18);
            const ux = force.vector.x / mag, uy = force.vector.y / mag;
            const x = s.x * 100, y = s.y * 100, ex = x + ux * scale, ey = y + uy * scale;
            const pushArt = force.kind === "WEIGHT" ? undefined : this.art("fx.push-arrow");
            if (pushArt) {
                const len = scale + 24, th = Math.max(30, len / 1.47);
                c.save();
                c.translate(x, y);
                c.rotate(Math.atan2(uy, ux));
                c.drawImage(pushArt, 0, -th / 2, len, th);
                c.restore();
                c.save();
                c.fillStyle = "#e8590c";
                c.strokeStyle = "#fff";
                c.lineWidth = 5;
                c.font = "900 18px system-ui";
                c.textAlign = "left";
                const label = showValues ? `PUSH ${mag.toFixed(1)} N` : "PUSH";
                c.strokeText(label, ex + 12, ey - 12);
                c.fillText(label, ex + 12, ey - 12);
                c.restore();
                continue;
            }
            c.save();
            c.strokeStyle = force.kind === "WEIGHT" ? "#845ef7" : "#e8590c";
            c.fillStyle = c.strokeStyle;
            c.lineWidth = 7;
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(ex, ey);
            c.stroke();
            const a = Math.atan2(ey - y, ex - x);
            c.beginPath();
            c.moveTo(ex, ey);
            c.lineTo(ex - 20 * Math.cos(a - .5), ey - 20 * Math.sin(a - .5));
            c.lineTo(ex - 20 * Math.cos(a + .5), ey - 20 * Math.sin(a + .5));
            c.closePath();
            c.fill();
            c.font = "900 18px system-ui";
            c.textAlign = "left";
            c.fillText(`${force.kind === "WEIGHT" ? "WEIGHT" : "PUSH"}${showValues ? ` ${mag.toFixed(1)} N` : ""}`, ex + 8, ey - 8);
            c.restore();
        }
    }
    drawMotionPart(id, w, h, selected) {
        const c = this.ctx, ink = "#203040", select = selected ? "#ffd43b" : undefined;
        if (id === "motion.goal-zone") {
            c.save();
            c.globalAlpha = .75;
            c.strokeStyle = "#2b8a3e";
            c.lineWidth = 7;
            c.setLineDash([18, 12]);
            c.beginPath();
            c.arc(0, 0, Math.max(38, w * .55), 0, Math.PI * 2);
            c.stroke();
            c.setLineDash([]);
            c.fillStyle = "#2b8a3e";
            c.font = "900 22px system-ui";
            c.textAlign = "center";
            c.fillText("GOAL", 0, 7);
            c.restore();
            return true;
        }
        if (id === "motion.ramp") {
            c.fillStyle = select ?? "#ffb84d";
            c.beginPath();
            c.moveTo(-w / 2, h / 2);
            c.lineTo(w / 2, h / 2);
            c.lineTo(w / 2, -h / 2);
            c.closePath();
            c.fill();
            c.stroke();
            c.strokeStyle = "#fff8";
            c.lineWidth = 6;
            c.beginPath();
            c.moveTo(-w * .33, h * .2);
            c.lineTo(w * .28, -h * .2);
            c.stroke();
            return true;
        }
        if (id === "motion.ball" || id === "motion.marble") {
            c.fillStyle = select ?? (id === "motion.marble" ? "#51cf66" : "#4dabf7");
            c.beginPath();
            c.arc(0, 0, w / 2, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = "#fff9";
            c.beginPath();
            c.arc(-w * .16, -w * .16, w * .11, 0, Math.PI * 2);
            c.fill();
            return true;
        }
        if (id === "motion.wheel" || id === "motion.roller") {
            c.fillStyle = select ?? "#74c0fc";
            c.beginPath();
            c.arc(0, 0, w / 2, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = "#fff";
            c.beginPath();
            c.arc(0, 0, w * .15, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
                c.beginPath();
                c.moveTo(Math.cos(a) * w * .16, Math.sin(a) * w * .16);
                c.lineTo(Math.cos(a) * w * .42, Math.sin(a) * w * .42);
                c.stroke();
            }
            return true;
        }
        if (id === "motion.cart") {
            c.fillStyle = select ?? "#4dabf7";
            c.beginPath();
            c.roundRect(-w / 2, -h / 2, w, h, 14);
            c.fill();
            c.stroke();
            c.fillStyle = "#ffd43b";
            c.fillRect(-w * .3, -h * .15, w * .6, h * .3);
            c.strokeRect(-w * .3, -h * .15, w * .6, h * .3);
            return true;
        }
        if (id === "motion.spring") {
            c.fillStyle = select ?? "#b2f2bb";
            c.beginPath();
            c.roundRect(-w / 2, -h / 2, w, h, 12);
            c.fill();
            c.stroke();
            c.strokeStyle = ink;
            c.lineWidth = 7;
            c.beginPath();
            for (let x = -w * .33, i = 0; x <= w * .33; x += w * .11, i++)
                c.lineTo(x, (i % 2 ? -.22 : .22) * h);
            c.stroke();
            return true;
        }
        if (id === "motion.friction-high" || id === "motion.friction-low" || id === "motion.bounce-pad") {
            c.fillStyle = select ?? (id === "motion.friction-high" ? "#ff8787" : id === "motion.friction-low" ? "#a5d8ff" : "#b197fc");
            c.beginPath();
            c.roundRect(-w / 2, -h / 2, w, h, 10);
            c.fill();
            c.stroke();
            c.strokeStyle = "#fff";
            c.lineWidth = 5;
            if (id === "motion.friction-high") {
                for (let x = -w * .4; x < w * .4; x += 22) {
                    c.beginPath();
                    c.moveTo(x, h * .2);
                    c.lineTo(x + 10, -h * .2);
                    c.lineTo(x + 20, h * .2);
                    c.stroke();
                }
            }
            else {
                for (let x = -w * .35; x < w * .35; x += 28) {
                    c.beginPath();
                    c.moveTo(x, 0);
                    c.lineTo(x + 18, 0);
                    c.stroke();
                }
            }
            return true;
        }
        if (id === "motion.barrier") {
            c.fillStyle = select ?? "#ff6b6b";
            c.fillRect(-w / 2, -h / 2, w, h);
            c.strokeRect(-w / 2, -h / 2, w, h);
            c.strokeStyle = "#fff";
            c.lineWidth = 9;
            for (let y = -h / 2 + 12; y < h / 2; y += 30) {
                c.beginPath();
                c.moveTo(-w / 2, y + 18);
                c.lineTo(w / 2, y - 18);
                c.stroke();
            }
            return true;
        }
        if (id === "motion.platform") {
            c.fillStyle = select ?? "#adb5bd";
            c.beginPath();
            c.roundRect(-w / 2, -h / 2, w, h, 10);
            c.fill();
            c.stroke();
            return true;
        }
        if (id === "motion.parcel") {
            c.fillStyle = select ?? "#f6b26b";
            c.fillRect(-w / 2, -h / 2, w, h);
            c.strokeRect(-w / 2, -h / 2, w, h);
            c.strokeStyle = "#8d5524";
            c.lineWidth = 7;
            c.beginPath();
            c.moveTo(0, -h / 2);
            c.lineTo(0, h / 2);
            c.stroke();
            return true;
        }
        if (id === "silly.duck") {
            c.fillStyle = select ?? "#ffd43b";
            c.beginPath();
            c.ellipse(-w * .05, h * .05, w * .42, h * .3, 0, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.beginPath();
            c.arc(w * .22, -h * .22, Math.min(w, h) * .24, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = "#ff922b";
            c.beginPath();
            c.moveTo(w * .4, -h * .2);
            c.lineTo(w * .62, -h * .08);
            c.lineTo(w * .4, 0);
            c.closePath();
            c.fill();
            c.stroke();
            c.fillStyle = ink;
            c.beginPath();
            c.arc(w * .28, -h * .28, 4, 0, Math.PI * 2);
            c.fill();
            return true;
        }
        return false;
    }
    categoryColor(category) { return { STRUCTURE: "#f6b26b", MOTION: "#74c0fc", GEAR: "#c7a0ff", POWER: "#ffe066", MAGNET: "#ff8787", WATER: "#66d9e8", AIR: "#a5d8ff", LOGIC: "#8ce99a", SPACE: "#b197fc", MUSICAL: "#ffa8a8", SILLY: "#ffd8a8" }[category] ?? "#ddd"; }
}
