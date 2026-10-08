import { fnv1a } from "../core/clone.js";
/**
 * Robust local saves (Milestone 10).
 *
 * - Every root save is wrapped in an envelope with a schema version, revision, byte size and checksum.
 * - Writing "current" and rotating the old good copy into "previousGood" happens in ONE store transaction.
 * - A payload is validated BEFORE it is written: an invalid payload is refused, never stored.
 * - A corrupt "current" is never rotated into "previousGood", so the last known-good copy survives.
 * - On load, a corrupt or unreadable "current" is quarantined (kept, never deleted) and the
 *   previous-good checkpoint is used instead.
 * - Old payload schemas are upgraded through an injected migration function.
 */
export const SAVE_ENVELOPE_VERSION = 2;
export const SAVE_KEYS = Object.freeze({ current: "save.current", previousGood: "save.previousGood", quarantine: "save.quarantine", newerVersionCopy: "save.newerVersionCopy" });
/** JSON with sorted keys and undefined fields dropped — identical before and after a JSON round trip. */
export function canonicalJson(value) {
    if (value === null || typeof value !== "object")
        return JSON.stringify(value) ?? "null";
    if (Array.isArray(value))
        return `[${value.map(v => v === undefined ? "null" : canonicalJson(v)).join(",")}]`;
    const record = value;
    return `{${Object.keys(record).filter(k => record[k] !== undefined).sort().map(k => `${JSON.stringify(k)}:${canonicalJson(record[k])}`).join(",")}}`;
}
export function utf8Length(text) {
    return typeof TextEncoder !== "undefined" ? new TextEncoder().encode(text).length : text.length;
}
/** Two independent 32-bit hashes → 64-bit hex digest. Detects accidental corruption; not a security feature. */
export function payloadChecksum(canonical) {
    let h = 0x9e3779b1;
    for (let i = 0; i < canonical.length; i += 1) {
        h ^= canonical.charCodeAt(i);
        h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
    }
    return `${fnv1a(canonical)}${(h >>> 0).toString(16).padStart(8, "0")}`;
}
export class MemoryStore {
    data = new Map();
    /** Test hook: make the next N writes fail before anything is applied. */
    failNextWrites = 0;
    async get(key) { return structuredClone(this.data.get(key)); }
    async setMany(entries) {
        if (this.failNextWrites > 0) {
            this.failNextWrites -= 1;
            throw new Error("Simulated storage failure");
        }
        const staged = entries.map(e => [e.key, structuredClone(e.value)]); // clone everything first: all-or-nothing
        for (const [k, v] of staged)
            this.data.set(k, v);
    }
    /** Test hook: write raw bytes over a key, bypassing the save manager. */
    corrupt(key, value) { this.data.set(key, value); }
    keys() { return [...this.data.keys()]; }
}
export class IndexedDbStore {
    dbName;
    dbVersion;
    constructor(dbName = "wobbleworks", dbVersion = 1) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
    }
    open() { return new Promise((resolve, reject) => { const req = indexedDB.open(this.dbName, this.dbVersion); req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains("kv"))
        db.createObjectStore("kv"); }; req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
    async get(key) { const db = await this.open(); return await new Promise((resolve, reject) => { const tx = db.transaction("kv", "readonly"); const req = tx.objectStore("kv").get(key); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); tx.oncomplete = () => db.close(); }); }
    /** One readwrite transaction: IndexedDB commits all puts together or aborts all of them. */
    async setMany(entries) { const db = await this.open(); await new Promise((resolve, reject) => { const tx = db.transaction("kv", "readwrite"); const store = tx.objectStore("kv"); for (const e of entries)
        store.put(e.value, e.key); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); reject(tx.error); }; tx.onabort = () => { db.close(); reject(tx.error ?? new Error("Save transaction aborted")); }; }); }
}
export class SaveManager {
    store;
    validate;
    options;
    revision = 0;
    lastByteLength = 0;
    constructor(store, validate, options = {}) {
        this.store = store;
        this.validate = validate;
        this.options = options;
    }
    /** Size in bytes of the most recent successful write (for the storage manager). */
    lastSaveBytes() { return this.lastByteLength; }
    seal(payload, revision) {
        const canonical = canonicalJson(payload);
        const schemaVersion = this.options.schemaVersionOf?.(payload) ?? Number(payload?.schemaVersion ?? 1);
        return { envelopeVersion: SAVE_ENVELOPE_VERSION, schemaVersion, revision, savedAtMs: (this.options.now ?? Date.now)(), byteLength: utf8Length(canonical), checksum: payloadChecksum(canonical), payload: JSON.parse(canonical) };
    }
    /** Checks checksum + validity of an envelope as stored. */
    open(raw) {
        if (!raw || typeof raw !== "object")
            return { ok: false };
        const env = raw;
        let payload;
        let revision = 0;
        // A newer build's envelope: never treat it as corrupt, never overwrite it.
        if (typeof env.envelopeVersion === "number" && env.envelopeVersion > SAVE_ENVELOPE_VERSION)
            return { ok: false, futureVersion: true };
        if (env.envelopeVersion === undefined && typeof env.schemaVersion === "number" && env.schemaVersion > 1 && "payload" in env)
            return { ok: false, futureVersion: true };
        if (env.envelopeVersion === SAVE_ENVELOPE_VERSION) {
            if (typeof env.checksum !== "string" || env.payload === undefined)
                return { ok: false };
            if (payloadChecksum(canonicalJson(env.payload)) !== env.checksum)
                return { ok: false };
            payload = env.payload;
            revision = Number.isInteger(env.revision) ? env.revision : 0;
        }
        else if (env.schemaVersion === 1 && "payload" in env) {
            payload = env.payload; // legacy M0–M9 envelope: no checksum existed
        }
        else
            return { ok: false };
        if (this.options.migrate) {
            const m = this.options.migrate(payload);
            if (!m)
                return { ok: false };
            if ("futureVersion" in m)
                return { ok: false, futureVersion: true };
            return this.validate(m.payload) ? { ok: true, payload: m.payload, migrated: m.migrated, revision } : { ok: false };
        }
        return this.validate(payload) ? { ok: true, payload: payload, migrated: false, revision } : { ok: false };
    }
    /** Saves are serialised: a second save waits for the first, so two writes can never interleave. */
    queue = Promise.resolve();
    save(payload, options = {}) {
        const run = this.queue.then(() => this.saveNow(payload, options), () => this.saveNow(payload, options));
        this.queue = run.catch(() => undefined);
        return run;
    }
    async saveNow(payload, options) {
        if (!this.validate(payload))
            throw new Error("Refused to save invalid data");
        const currentRaw = await this.store.get(SAVE_KEYS.current);
        const current = currentRaw === undefined ? undefined : this.open(currentRaw);
        const newer = current?.ok === false && current.futureVersion === true;
        if (newer && !options.replaceNewerVersion)
            throw new Error("A save from a newer version is stored; refusing to overwrite it");
        if (current?.ok)
            this.revision = Math.max(this.revision, current.revision);
        const next = this.seal(payload, this.revision + 1);
        const writes = [{ key: SAVE_KEYS.current, value: next }];
        // Only a verified-good current copy may become the previous-good checkpoint.
        if (current?.ok)
            writes.push({ key: SAVE_KEYS.previousGood, value: currentRaw });
        else if (newer)
            writes.push({ key: SAVE_KEYS.newerVersionCopy, value: currentRaw }); // kept in its own slot, never overwritten by corruption handling
        else if (currentRaw !== undefined)
            writes.push({ key: SAVE_KEYS.quarantine, value: { savedAtMs: next.savedAtMs, raw: currentRaw } });
        await this.store.setMany(writes); // all-or-nothing; on failure the old keys are untouched
        this.revision = next.revision;
        this.lastByteLength = next.byteLength;
        return next;
    }
    async loadWithRecovery() {
        const currentRaw = await this.store.get(SAVE_KEYS.current);
        const current = currentRaw === undefined ? undefined : this.open(currentRaw);
        if (current?.ok) {
            this.revision = current.revision;
            return { payload: current.payload, recovered: false, migrated: current.migrated, quarantined: false, unreadable: false, futureVersion: false };
        }
        const futureVersion = current?.ok === false && current.futureVersion === true;
        const previousRaw = await this.store.get(SAVE_KEYS.previousGood);
        const previous = previousRaw === undefined ? undefined : this.open(previousRaw);
        let quarantined = false;
        if (currentRaw !== undefined && !futureVersion) {
            try {
                await this.store.setMany([{ key: SAVE_KEYS.quarantine, value: { savedAtMs: (this.options.now ?? Date.now)(), raw: currentRaw } }]);
                quarantined = true;
            }
            catch { /* keep going: never block play */ }
        }
        if (previous?.ok) {
            this.revision = previous.revision;
            return { payload: previous.payload, recovered: true, migrated: previous.migrated, quarantined, unreadable: false, futureVersion };
        }
        return { recovered: false, migrated: false, quarantined, unreadable: !futureVersion && (currentRaw !== undefined || previousRaw !== undefined), futureVersion };
    }
}
/**
 * Debounced autosave: many quick changes → one save. A failed save is reported and retried on the
 * next change; it never throws into gameplay.
 */
export class AutosaveScheduler {
    write;
    delayMs;
    timers;
    timer;
    pending;
    inFlight;
    lastError;
    savesCompleted = 0;
    constructor(write, delayMs = 600, timers = { set: (fn, ms) => setTimeout(fn, ms), clear: t => clearTimeout(t) }) {
        this.write = write;
        this.delayMs = delayMs;
        this.timers = timers;
    }
    request(payload) {
        this.pending = payload;
        if (this.timer !== undefined)
            this.timers.clear(this.timer);
        this.timer = this.timers.set(() => { this.timer = undefined; void this.flush(); }, this.delayMs);
    }
    hasPending() { return this.pending !== undefined; }
    /** Resolves only when everything requested so far has been written (or has failed once). */
    async flush() {
        if (this.timer !== undefined) {
            this.timers.clear(this.timer);
            this.timer = undefined;
        }
        for (let guard = 0; guard < 8; guard += 1) {
            if (this.inFlight) {
                await this.inFlight;
                continue;
            }
            const payload = this.pending;
            if (payload === undefined)
                return;
            this.pending = undefined;
            let failed = false;
            this.inFlight = (async () => {
                try {
                    await this.write(payload);
                    this.savesCompleted += 1;
                    this.lastError = undefined;
                }
                catch (error) {
                    this.lastError = error;
                    failed = true;
                    if (this.pending === undefined)
                        this.pending = payload;
                }
            })();
            await this.inFlight;
            this.inFlight = undefined;
            if (failed)
                return; // keep the payload pending for the next change / flush; never spin on a broken disk
        }
    }
}
