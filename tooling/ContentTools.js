import { assertLevelDefinition, assertPartDefinition } from "../data/validation.js";
export function parseAndValidatePart(json) { const value = JSON.parse(json); assertPartDefinition(value); return value; }
export function parseAndValidateLevel(json, knownPartIds) { const value = JSON.parse(json); assertLevelDefinition(value, knownPartIds); return value; }
export function exportJson(value) { return `${JSON.stringify(value, null, 2)}\n`; }
export class EditorRecoveryStore {
    constructor(prefix = "wobbleworks.editor") {
        Object.defineProperty(this, "prefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: prefix
        });
    }
    save(kind, id, json) { localStorage.setItem(`${this.prefix}.${kind}.${id}`, json); }
    load(kind, id) { return localStorage.getItem(`${this.prefix}.${kind}.${id}`); }
}
