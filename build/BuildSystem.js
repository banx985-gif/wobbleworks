import { createBuildSnapshot } from "../core/BuildSnapshot.js";
import { deepClone } from "../core/clone.js";
export class BuildSystem {
    constructor(seed) {
        var _a, _b;
        Object.defineProperty(this, "parts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "connections", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "undoStack", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "redoStack", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "revision", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.parts = [...deepClone((_a = seed === null || seed === void 0 ? void 0 : seed.parts) !== null && _a !== void 0 ? _a : [])];
        this.connections = [...deepClone((_b = seed === null || seed === void 0 ? void 0 : seed.connections) !== null && _b !== void 0 ? _b : [])];
    }
    replaceAll(seed) { var _a, _b; this.parts = [...deepClone((_a = seed.parts) !== null && _a !== void 0 ? _a : [])]; this.connections = [...deepClone((_b = seed.connections) !== null && _b !== void 0 ? _b : [])]; this.undoStack.length = 0; this.redoStack.length = 0; this.revision += 1; }
    allParts() { return this.parts; }
    allConnections() { return this.connections; }
    getPart(id) { return this.parts.find(p => p.id === id); }
    add(definitionId, position, parameters = {}) {
        const part = { id: `part-${crypto.randomUUID()}`, definitionId, position: { ...position }, rotation: 0, parameters: { ...parameters } };
        this.parts.push(part);
        this.commit({ kind: "ADD", part });
        return part;
    }
    delete(id) {
        const part = this.getPart(id);
        if (!part)
            return;
        const connections = this.connections.filter(c => c.fromPartId === id || c.toPartId === id);
        this.parts = this.parts.filter(p => p.id !== id);
        this.connections = this.connections.filter(c => !connections.includes(c));
        this.commit({ kind: "DELETE", part, connections: deepClone(connections) });
    }
    move(id, to) {
        const index = this.parts.findIndex(p => p.id === id);
        if (index < 0)
            return;
        const current = this.parts[index];
        const next = { ...current, position: { ...to } };
        this.parts[index] = next;
        this.commit({ kind: "MOVE", id, from: current.position, to: next.position });
    }
    rotate(id, deltaRadians) {
        const index = this.parts.findIndex(p => p.id === id);
        if (index < 0)
            return;
        const current = this.parts[index];
        const next = { ...current, rotation: current.rotation + deltaRadians };
        this.parts[index] = next;
        this.commit({ kind: "ROTATE", id, from: current.rotation, to: next.rotation });
    }
    /** Change position, rotation and/or parameters in one undoable step. */
    reshape(id, change) {
        const index = this.parts.findIndex(p => p.id === id);
        if (index < 0)
            return;
        const current = this.parts[index];
        const next = { ...current, ...(change.position ? { position: { ...change.position } } : {}), ...(change.rotation !== undefined ? { rotation: change.rotation } : {}), ...(change.parameters ? { parameters: { ...current.parameters, ...change.parameters } } : {}) };
        this.parts[index] = next;
        this.commit({ kind: "RESHAPE", id, from: current, to: next });
    }
    connect(fromPartId, fromPortId, toPartId, toPortId, config) {
        const connection = { id: `conn-${crypto.randomUUID()}`, fromPartId, fromPortId, toPartId, toPortId, config };
        this.connections.push(connection);
        this.commit({ kind: "CONNECT", connection });
        return connection;
    }
    disconnect(id) {
        const connection = this.connections.find(c => c.id === id);
        if (!connection)
            return;
        this.connections = this.connections.filter(c => c.id !== id);
        this.commit({ kind: "DISCONNECT", connection });
    }
    duplicate(ids, offset = { x: 0.35, y: 0.35 }) {
        const created = [];
        for (const id of ids) {
            const p = this.getPart(id);
            if (!p)
                continue;
            created.push(this.add(p.definitionId, { x: p.position.x + offset.x, y: p.position.y + offset.y }, p.parameters));
        }
        return created;
    }
    groupMove(ids, delta) {
        for (const id of ids) {
            const p = this.getPart(id);
            if (p)
                this.move(id, { x: p.position.x + delta.x, y: p.position.y + delta.y });
        }
    }
    snapshot(id = "build.active") { return createBuildSnapshot({ id, revision: this.revision, parts: this.parts, connections: this.connections }); }
    undo() { const mutation = this.undoStack.pop(); if (!mutation)
        return; this.applyInverse(mutation); this.redoStack.push(mutation); this.revision += 1; }
    redo() { const mutation = this.redoStack.pop(); if (!mutation)
        return; this.apply(mutation); this.undoStack.push(mutation); this.revision += 1; }
    canUndo() { return this.undoStack.length > 0; }
    /** Co-build (M30): a turn ends — undo and redo now only reach back to here (nobody can undo the other player's work). */
    sealHistory() { this.undoStack.length = 0; this.redoStack.length = 0; }
    canRedo() { return this.redoStack.length > 0; }
    commit(mutation) { this.undoStack.push(deepClone(mutation)); this.redoStack.length = 0; this.revision += 1; }
    replacePart(id, updater) { const i = this.parts.findIndex(p => p.id === id); if (i >= 0)
        this.parts[i] = updater(this.parts[i]); }
    apply(m) {
        if (m.kind === "ADD")
            this.parts.push(deepClone(m.part));
        if (m.kind === "DELETE") {
            this.parts = this.parts.filter(p => p.id !== m.part.id);
            this.connections = this.connections.filter(c => !m.connections.some(x => x.id === c.id));
        }
        if (m.kind === "MOVE")
            this.replacePart(m.id, p => ({ ...p, position: { ...m.to } }));
        if (m.kind === "ROTATE")
            this.replacePart(m.id, p => ({ ...p, rotation: m.to }));
        if (m.kind === "CONNECT")
            this.connections.push(deepClone(m.connection));
        if (m.kind === "DISCONNECT")
            this.connections = this.connections.filter(c => c.id !== m.connection.id);
        if (m.kind === "RESHAPE")
            this.replacePart(m.id, () => deepClone(m.to));
    }
    applyInverse(m) {
        if (m.kind === "ADD")
            this.parts = this.parts.filter(p => p.id !== m.part.id);
        if (m.kind === "DELETE") {
            this.parts.push(deepClone(m.part));
            this.connections.push(...deepClone(m.connections));
        }
        if (m.kind === "MOVE")
            this.replacePart(m.id, p => ({ ...p, position: { ...m.from } }));
        if (m.kind === "ROTATE")
            this.replacePart(m.id, p => ({ ...p, rotation: m.from }));
        if (m.kind === "CONNECT")
            this.connections = this.connections.filter(c => c.id !== m.connection.id);
        if (m.kind === "DISCONNECT")
            this.connections.push(deepClone(m.connection));
        if (m.kind === "RESHAPE")
            this.replacePart(m.id, () => deepClone(m.from));
    }
}
