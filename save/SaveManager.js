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
    var _a;
    if (value === null || typeof value !== "object")
        return (_a = JSON.stringify(value)) !== null && _a !== void 0 ? _a : "null";
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
    constructor() {
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        /** Test hook: make the next N writes fail before anything is applied. */
        Object.defineProperty(this, "failNextWrites", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
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
    constructor(dbName = "wobbleworks", dbVersion = 1) {
        Object.defineProperty(this, "dbName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dbName
        });
        Object.defineProperty(this, "dbVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dbVersion
        });
    }
    open() { return new Promise((resolve, reject) => { const req = indexedDB.open(this.dbName, this.dbVersion); req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains("kv"))
        db.createObjectStore("kv"); }; req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
    async get(key) { const db = await this.open(); return await new Promise((resolve, reject) => { const tx = db.transaction("kv", "readonly"); const req = tx.objectStore("kv").get(key); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); tx.oncomplete = () => db.close(); }); }
    /** One readwrite transaction: IndexedDB commits all puts together or aborts all of them. */
    async setMany(entries) { const db = await this.open(); await new Promise((resolve, reject) => { const tx = db.transaction("kv", "readwrite"); const store = tx.objectStore("kv"); for (const e of entries)
        store.put(e.value, e.key); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); reject(tx.error); }; tx.onabort = () => { var _a; db.close(); reject((_a = tx.error) !== null && _a !== void 0 ? _a : new Error("Save transaction aborted")); }; }); }
}
export class SaveManager {
    constructor(store, validate, options = {}) {
        Object.defineProperty(this, "store", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: store
        });
        Object.defineProperty(this, "validate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: validate
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "revision", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastByteLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        /** Saves are serialised: a second save waits for the first, so two writes can never interleave. */
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Promise.resolve()
        });
    }
    /** Size in bytes of the most recent successful write (for the storage manager). */
    lastSaveBytes() { return this.lastByteLength; }
    seal(payload, revision) {
        var _a, _b, _c, _d, _e;
        const canonical = canonicalJson(payload);
        const schemaVersion = (_c = (_b = (_a = this.options).schemaVersionOf) === null || _b === void 0 ? void 0 : _b.call(_a, payload)) !== null && _c !== void 0 ? _c : Number((_d = payload === null || payload === void 0 ? void 0 : payload.schemaVersion) !== null && _d !== void 0 ? _d : 1);
        return { envelopeVersion: SAVE_ENVELOPE_VERSION, schemaVersion, revision, savedAtMs: ((_e = this.options.now) !== null && _e !== void 0 ? _e : Date.now)(), byteLength: utf8Length(canonical), checksum: payloadChecksum(canonical), payload: JSON.parse(canonical) };
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
        const newer = (current === null || current === void 0 ? void 0 : current.ok) === false && current.futureVersion === true;
        if (newer && !options.replaceNewerVersion)
            throw new Error("A save from a newer version is stored; refusing to overwrite it");
        if (current === null || current === void 0 ? void 0 : current.ok)
            this.revision = Math.max(this.revision, current.revision);
        const next = this.seal(payload, this.revision + 1);
        const writes = [{ key: SAVE_KEYS.current, value: next }];
        // Only a verified-good current copy may become the previous-good checkpoint.
        if (current === null || current === void 0 ? void 0 : current.ok)
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
        var _a;
        const currentRaw = await this.store.get(SAVE_KEYS.current);
        const current = currentRaw === undefined ? undefined : this.open(currentRaw);
        if (current === null || current === void 0 ? void 0 : current.ok) {
            this.revision = current.revision;
            return { payload: current.payload, recovered: false, migrated: current.migrated, quarantined: false, unreadable: false, futureVersion: false };
        }
        const futureVersion = (current === null || current === void 0 ? void 0 : current.ok) === false && current.futureVersion === true;
        const previousRaw = await this.store.get(SAVE_KEYS.previousGood);
        const previous = previousRaw === undefined ? undefined : this.open(previousRaw);
        let quarantined = false;
        if (currentRaw !== undefined && !futureVersion) {
            try {
                await this.store.setMany([{ key: SAVE_KEYS.quarantine, value: { savedAtMs: ((_a = this.options.now) !== null && _a !== void 0 ? _a : Date.now)(), raw: currentRaw } }]);
                quarantined = true;
            }
            catch { /* keep going: never block play */ }
        }
        if (previous === null || previous === void 0 ? void 0 : previous.ok) {
            this.revision = previous.revision;
            return { payload: previous.payload, recovered: true, migrated: previous.migrated, quarantined, unreadable: false, futureVersion };
        }
        return { recovered: false, migrated: false, quarantined, unreadable: !futureVersion && (currentRaw !== undefined || previousRaw !== undefined), futureVersion };
    }
}
/**
 * Picture cache for My Inventions (M24). One small JPEG per invention version, kept under its own key so the
 * main save stays small. Pictures are only a convenience: a missing one is drawn from the build instead, and
 * cleanup only removes pictures whose version no longer exists — never one still in use.
 */
export const THUMB_INDEX_KEY = "thumbs.index";
export const THUMB_PREFIX = "thumb.";
export const THUMB_MAX_CHARS = 120000;
export class ThumbnailCache {
    constructor(store) {
        Object.defineProperty(this, "store", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: store
        });
        Object.defineProperty(this, "index", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "memory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    async keys() {
        if (!this.index) {
            try {
                const raw = await this.store.get(THUMB_INDEX_KEY);
                this.index = Array.isArray(raw) ? raw.filter((k) => typeof k === "string") : [];
            }
            catch {
                this.index = [];
            }
        }
        return this.index;
    }
    async list() { return [...await this.keys()]; }
    async get(key) {
        const hit = this.memory.get(key);
        if (hit)
            return hit;
        try {
            const v = await this.store.get(THUMB_PREFIX + key);
            if (typeof v === "string" && v.startsWith("data:image/")) {
                this.memory.set(key, v);
                return v;
            }
        }
        catch { /* a missing picture is fine */ }
        return undefined;
    }
    /** Stores a picture (refused if it isn't a small image). The picture and the index are written together. */
    async put(key, dataUrl) {
        if (!dataUrl.startsWith("data:image/") || dataUrl.length > THUMB_MAX_CHARS)
            return false;
        const keys = await this.keys();
        const next = keys.includes(key) ? keys : [...keys, key];
        try {
            await this.store.setMany([{ key: THUMB_PREFIX + key, value: dataUrl }, { key: THUMB_INDEX_KEY, value: next }]);
        }
        catch {
            return false;
        }
        this.index = next;
        this.memory.set(key, dataUrl);
        return true;
    }
    /** Copies a picture to a new key (a restored version or a duplicate uses the same picture). */
    async copy(from, to) { const v = await this.get(from); return v ? this.put(to, v) : false; }
    /** Removes pictures whose key isn't in `live`. Returns how many were removed. */
    async prune(live) {
        const keys = await this.keys();
        const dead = keys.filter(k => !live.has(k));
        if (!dead.length)
            return 0;
        const next = keys.filter(k => live.has(k));
        try {
            await this.store.setMany([...dead.map(k => ({ key: THUMB_PREFIX + k, value: null })), { key: THUMB_INDEX_KEY, value: next }]);
        }
        catch {
            return 0;
        }
        this.index = next;
        for (const k of dead)
            this.memory.delete(k);
        return dead.length;
    }
    async bytes() { var _a, _b; let n = 0; for (const k of await this.keys())
        n += (_b = (_a = (await this.get(k))) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0; return n; }
}
/**
 * Debounced autosave: many quick changes → one save. A failed save is reported and retried on the
 * next change; it never throws into gameplay.
 */
export class AutosaveScheduler {
    constructor(write, delayMs = 600, timers = { set: (fn, ms) => setTimeout(fn, ms), clear: t => clearTimeout(t) }) {
        Object.defineProperty(this, "write", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: write
        });
        Object.defineProperty(this, "delayMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: delayMs
        });
        Object.defineProperty(this, "timers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: timers
        });
        Object.defineProperty(this, "timer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pending", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inFlight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "savesCompleted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
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
