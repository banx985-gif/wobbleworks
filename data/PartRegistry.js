import { assertPartDefinition } from "./validation.js";
export class PartRegistry {
    definitions = new Map();
    register(definition) {
        assertPartDefinition(definition);
        if (this.definitions.has(definition.id))
            throw new Error(`Duplicate part id ${definition.id}`);
        this.definitions.set(definition.id, definition);
    }
    get(id) {
        const value = this.definitions.get(id);
        if (!value)
            throw new Error(`Unknown part definition ${id}`);
        return value;
    }
    has(id) { return this.definitions.has(id); }
    all() { return [...this.definitions.values()]; }
    families() { return new Set(this.all().map(p => p.familyId)); }
}
