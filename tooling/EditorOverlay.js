import { DEFAULT_PARTS } from "../content/defaultParts.js";
import { createDefaultRegistry } from "../content/defaultParts.js";
import { portsCompatible } from "../data/connectors.js";
import { parseAndValidateLevel, parseAndValidatePart, exportJson, EditorRecoveryStore } from "./ContentTools.js";
export class EditorOverlay {
    root = document.createElement("aside");
    text = document.createElement("textarea");
    status = document.createElement("div");
    preview = document.createElement("div");
    mode = "part";
    recovery = new EditorRecoveryStore();
    registry = createDefaultRegistry();
    constructor() {
        this.root.className = "editor-overlay hidden";
        this.root.innerHTML = `<div class="editor-header"><strong>Milestone 6 Content Tool</strong><button data-action="close" aria-label="Close tools">×</button></div><div class="editor-tabs"><button data-mode="part">Part Editor</button><button data-mode="level">Level Editor</button></div>`;
        this.text.spellcheck = false;
        this.preview.className = "editor-preview";
        this.root.append(this.text, this.preview, this.status);
        const row = document.createElement("div");
        row.className = "editor-actions";
        row.innerHTML = `<button data-action="validate">Validate</button><button data-action="connections">Test Connections</button><button data-action="preview">Preview</button><button data-action="instant-test">Instant TEST</button><button data-action="duplicate">Duplicate</button><button data-action="autosave">Autosave</button><button data-action="recover">Recover</button><button data-action="export">Export JSON</button>`;
        this.root.append(row);
        document.body.append(this.root);
        this.root.addEventListener("click", e => this.onClick(e));
        this.loadExample();
    }
    toggle() { this.root.classList.toggle("hidden"); }
    onClick(e) {
        const target = e.target;
        const action = target.dataset.action;
        const mode = target.dataset.mode;
        if (mode) {
            this.mode = mode;
            this.loadExample();
            return;
        }
        if (action === "close")
            this.toggle();
        if (action === "validate")
            this.validate();
        if (action === "connections")
            this.testConnections();
        if (action === "preview")
            this.renderPreview();
        if (action === "instant-test")
            this.instantTest();
        if (action === "duplicate")
            this.duplicate();
        if (action === "autosave")
            this.autosave();
        if (action === "recover")
            this.recover();
        if (action === "export")
            this.download();
    }
    loadExample() {
        if (this.mode === "part") {
            this.text.value = exportJson({ ...DEFAULT_PARTS[0], art: { assetId: "debug.motion.ball", pivot: { x: 0.5, y: 0.5 }, logicalSize: { x: 0.6, y: 0.6 } }, presets: [{ id: "standard", displayName: "Standard Ball", parameters: {} }] });
        }
        else {
            this.text.value = exportJson({ schemaVersion: 1, id: "motion.graybox", title: "Motion Yard Graybox", environmentId: "env.motion-yard", availablePartIds: ["motion.ball", "motion.cart", "motion.wheel", "structure.block"], starterParts: [{ id: "graybox-floor", definitionId: "structure.block", position: { x: 8, y: 7.7 }, rotation: 0, parameters: {} }, { id: "graybox-ball", definitionId: "motion.ball", position: { x: 8, y: 3.5 }, rotation: 0, parameters: {} }], starterConnections: [], staticObjects: [], spawns: [{ id: "spawn-ball", definitionId: "motion.ball", position: { x: 5, y: 2.5 }, rotation: 0 }], constraints: [{ id: "constraint-parts", kind: "MAX_PARTS", value: 12 }], environmentModifiers: [], goals: [{ id: "goal-distance", kind: "METRIC", metric: "distanceTravelled", comparator: "GTE", value: 3 }], evidenceRules: [{ id: "evidence-motion", conceptId: "motion.slope-effects", eventKind: "OBJECT_MOVED", minimumCount: 1, truthContractId: "truth.motion" }], hints: ["Try changing the ramp."], narrationCues: [] });
        }
        this.status.textContent = "";
        this.preview.textContent = "";
    }
    parse() { return this.mode === "part" ? parseAndValidatePart(this.text.value) : parseAndValidateLevel(this.text.value, new Set(DEFAULT_PARTS.map(p => p.id))); }
    validate() { try {
        this.parse();
        this.status.textContent = "✓ Schema + references valid";
        return true;
    }
    catch (error) {
        this.status.textContent = `✗ ${error.message}`;
        return false;
    } }
    testConnections() {
        if (this.mode !== "part") {
            this.status.textContent = "Connection test applies to Part Editor.";
            return;
        }
        try {
            const part = parseAndValidatePart(this.text.value);
            const matches = [];
            for (const own of part.ports)
                for (const candidate of this.registry.all())
                    for (const other of candidate.ports)
                        if (portsCompatible(own, other))
                            matches.push(`${own.id} ↔ ${candidate.id}.${other.id}`);
            this.preview.textContent = matches.length ? `Compatible port tests (${matches.length}):\n${matches.slice(0, 18).join("\n")}${matches.length > 18 ? "\n…" : ""}` : "No compatible registered ports.";
            this.status.textContent = "✓ Connection capability test completed";
        }
        catch (error) {
            this.status.textContent = `✗ ${error.message}`;
        }
    }
    renderPreview() {
        try {
            const value = this.parse();
            if (this.mode === "part") {
                const p = value;
                this.preview.textContent = `${p.displayName}\n${p.category}\n${p.behaviours.map(b => b.kind).join(" + ")}\nPorts: ${p.ports.map(x => `${x.family}:${x.id}`).join(", ") || "none"}\nArt: ${p.art?.assetId ?? "debug shape"}\nPresets: ${p.presets?.length ?? 0}`;
            }
            else {
                const l = value;
                this.preview.textContent = `${l.title}\nEnvironment: ${l.environmentId}\nStarter parts: ${l.starterParts.length}\nAvailable parts: ${l.availablePartIds.length}\nGoals: ${l.goals.length}\nEvidence rules: ${l.evidenceRules.length}\nConstraints: ${l.constraints?.length ?? 0}`;
            }
            this.status.textContent = "✓ Deterministic editor preview built from validated data";
        }
        catch (error) {
            this.status.textContent = `✗ ${error.message}`;
        }
    }
    instantTest() {
        if (this.mode !== "level") {
            this.status.textContent = "Instant TEST applies to Level Editor.";
            return;
        }
        try {
            const level = parseAndValidateLevel(this.text.value, new Set(DEFAULT_PARTS.map(p => p.id)));
            window.dispatchEvent(new CustomEvent("wobbleworks:preview-level", { detail: level }));
            this.status.textContent = "✓ Level sent to deterministic TEST preview";
            this.root.classList.add("hidden");
        }
        catch (error) {
            this.status.textContent = `✗ ${error.message}`;
        }
    }
    duplicate() { try {
        const value = structuredClone(this.parse());
        value.id = `${value.id}-copy`;
        if (value.title)
            value.title += " Copy";
        if (value.displayName)
            value.displayName += " Copy";
        this.text.value = exportJson(value);
        this.status.textContent = "Duplicated with a new stable ID";
    }
    catch (error) {
        this.status.textContent = `✗ ${error.message}`;
    } }
    autosave() { try {
        const parsed = this.parse();
        this.recovery.save(this.mode, parsed.id, this.text.value);
        this.status.textContent = `Autosaved ${parsed.id} locally`;
    }
    catch (error) {
        this.status.textContent = `✗ ${error.message}`;
    } }
    recover() { try {
        const parsed = JSON.parse(this.text.value);
        if (!parsed.id)
            throw new Error("Current JSON needs an id to recover its autosave");
        const saved = this.recovery.load(this.mode, parsed.id);
        if (!saved)
            throw new Error(`No autosave found for ${parsed.id}`);
        this.text.value = saved;
        this.status.textContent = `Recovered ${parsed.id}`;
    }
    catch (error) {
        this.status.textContent = `✗ ${error.message}`;
    } }
    download() { if (!this.validate())
        return; const blob = new Blob([this.text.value], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `wobbleworks-${this.mode}.json`; a.click(); URL.revokeObjectURL(a.href); }
}
