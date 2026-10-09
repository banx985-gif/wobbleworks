import { validateAppSave } from "../app/AppState.js";
import { migrateAppSave } from "./Migrations.js";
import { canonicalJson, payloadChecksum, utf8Length } from "./SaveManager.js";
/**
 * Parent-gated backup export / import (Milestone 10).
 * A backup is one JSON file. Import checks, in order: size, JSON, format, checksum,
 * schema version (migrating older ones), unsafe keys, identifiers and full content shape.
 */
export const BACKUP_FORMAT = "wobbleworks-backup";
export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_MAX_BYTES = 4 * 1024 * 1024;
const MAX_DEPTH = 40;
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);
export const IMPORT_MESSAGES = Object.freeze({
    TOO_LARGE: "That file is too big to be a WobbleWorks backup.",
    NOT_JSON: "That file isn't a WobbleWorks backup.",
    WRONG_FORMAT: "That file isn't a WobbleWorks backup.",
    CHECKSUM_MISMATCH: "This backup is damaged or was edited, so it wasn't loaded.",
    UNSUPPORTED_VERSION: "This backup came from a newer version of WobbleWorks. Update the game, then try again.",
    UNSAFE_CONTENT: "This backup contains data WobbleWorks can't safely load.",
    BAD_IDENTIFIER: "This backup contains names or ids WobbleWorks can't safely load.",
    INVALID_CONTENT: "This backup is incomplete or damaged, so it wasn't loaded."
});
export function exportBackup(save, nowMs = Date.now()) {
    if (!validateAppSave(save))
        throw new Error("Current save is not valid; export refused");
    const canonical = canonicalJson(save);
    const pkg = {
        format: BACKUP_FORMAT, formatVersion: BACKUP_FORMAT_VERSION, app: "WobbleWorks", exportedAtMs: nowMs,
        schemaVersion: save.schemaVersion, byteLength: utf8Length(canonical), checksum: payloadChecksum(canonical),
        profileCount: save.profiles.length, payload: JSON.parse(canonical)
    };
    return JSON.stringify(pkg);
}
export function backupFileName(nowMs = Date.now()) {
    const d = new Date(nowMs);
    const pad = (n) => String(n).padStart(2, "0");
    return `wobbleworks-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}
function scanUnsafe(value, depth = 0) {
    if (depth > MAX_DEPTH)
        return "UNSAFE";
    if (value === null || typeof value !== "object") {
        if (typeof value === "number" && !Number.isFinite(value))
            return "UNSAFE";
        if (typeof value === "string" && value.length > 20000)
            return "UNSAFE";
        return "OK";
    }
    if (Array.isArray(value)) {
        for (const v of value)
            if (scanUnsafe(v, depth + 1) === "UNSAFE")
                return "UNSAFE";
        return "OK";
    }
    for (const key of Object.keys(value)) {
        if (FORBIDDEN_KEYS.has(key))
            return "UNSAFE";
        if (scanUnsafe(value[key], depth + 1) === "UNSAFE")
            return "UNSAFE";
    }
    return "OK";
}
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:_-]{0,95}$/;
function identifiersOk(save) {
    const profiles = Array.isArray(save.profiles) ? save.profiles : [];
    const ids = new Set();
    for (const p of profiles) {
        if (typeof (p === null || p === void 0 ? void 0 : p.id) !== "string" || !SAFE_ID.test(p.id) || ids.has(p.id))
            return false;
        ids.add(p.id);
        if (typeof p.name !== "string" || /[<>{}\\]/.test(p.name))
            return false;
    }
    if (save.activeProfileId !== undefined && (typeof save.activeProfileId !== "string" || !ids.has(save.activeProfileId)))
        return false;
    return true;
}
export function importBackup(text) {
    if (typeof text !== "string" || utf8Length(text) > BACKUP_MAX_BYTES)
        return { ok: false, reason: "TOO_LARGE" };
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch {
        return { ok: false, reason: "NOT_JSON" };
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        return { ok: false, reason: "WRONG_FORMAT" };
    if (scanUnsafe(parsed) === "UNSAFE")
        return { ok: false, reason: "UNSAFE_CONTENT" };
    const pkg = parsed;
    if (pkg.format !== BACKUP_FORMAT || pkg.app !== "WobbleWorks" || typeof pkg.payload !== "object" || pkg.payload === null)
        return { ok: false, reason: "WRONG_FORMAT" };
    if (typeof pkg.formatVersion !== "number" || pkg.formatVersion > BACKUP_FORMAT_VERSION)
        return { ok: false, reason: "UNSUPPORTED_VERSION" };
    if (typeof pkg.checksum !== "string" || payloadChecksum(canonicalJson(pkg.payload)) !== pkg.checksum)
        return { ok: false, reason: "CHECKSUM_MISMATCH" };
    const migrated = migrateAppSave(pkg.payload);
    if (!migrated.ok)
        return { ok: false, reason: migrated.reason === "FUTURE_VERSION" ? "UNSUPPORTED_VERSION" : "INVALID_CONTENT" };
    if (!identifiersOk(migrated.save))
        return { ok: false, reason: "BAD_IDENTIFIER" };
    if (!validateAppSave(migrated.save))
        return { ok: false, reason: "INVALID_CONTENT" };
    return { ok: true, save: migrated.save, migrated: migrated.migrated, profileCount: migrated.save.profiles.length };
}
