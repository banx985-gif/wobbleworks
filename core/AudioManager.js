import { MIN_REPEAT_SECONDS, MUSIC_DUCK, SOUND_FAMILIES, musicFor, stepHz } from "../audio/SoundLibrary.js";
/**
 * Game audio (M36). Two independent channels — sound effects and music — each with its own volume (Bolt's voice is
 * the browser's speech, with its own volume set where it is spoken). Sounds play from a recording when one is filed
 * (assets/audio/<id>.*, listed in the asset manifest as "audio.<id>"), otherwise they are synthesised from the
 * library recipe. Music for each place is generated live from its theme. Everything pauses when the game is hidden.
 */
export class AudioManager {
    constructor(makeContext = () => new AudioContext()) {
        Object.defineProperty(this, "makeContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: makeContext
        });
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sfxBus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "musicBus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "noise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "levels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { sfx: 1, music: 0.8, voice: 1 }
        });
        Object.defineProperty(this, "ducked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "urls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "buffers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "lastPlayed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "music", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
    }
    /** Volumes for the two channels (0 = silent … 1 = full). Each slider only changes its own channel. */
    setMix(levels) { this.levels = levels; this.applyGains(); if (levels.music <= 0)
        this.stopMusic(); }
    /** Older callers: scale sound effects only. */
    setMasterGain(value) { this.setMix({ ...this.levels, sfx: Math.max(0, Math.min(1, value / 0.35)) }); }
    mix() { return this.levels; }
    /** Music dips while Bolt is talking. */
    duck(on) { this.ducked = on; this.applyGains(); }
    applyGains() {
        var _a, _b;
        if (!this.context)
            return;
        const t = this.context.currentTime;
        (_a = this.sfxBus) === null || _a === void 0 ? void 0 : _a.gain.setTargetAtTime(0.35 * this.levels.sfx, t, 0.02);
        (_b = this.musicBus) === null || _b === void 0 ? void 0 : _b.gain.setTargetAtTime(0.18 * this.levels.music * (this.ducked ? MUSIC_DUCK : 1), t, 0.08);
    }
    /** Recordings that have arrived: sound id → url. */
    setRecordings(urls) { for (const [id, url] of Object.entries(urls))
        this.urls.set(id, url); }
    async unlock() {
        if (!this.context) {
            this.context = this.makeContext();
            this.sfxBus = this.context.createGain();
            this.sfxBus.connect(this.context.destination);
            this.musicBus = this.context.createGain();
            this.musicBus.connect(this.context.destination);
            this.applyGains();
        }
        if (this.context.state === "suspended")
            await this.context.resume();
    }
    /** The game went into the background: everything stops at once. */
    async suspend() { if (this.context && this.context.state === "running")
        await this.context.suspend(); }
    async resume() { if (this.context && this.context.state === "suspended")
        await this.context.resume(); }
    isRunning() { var _a; return ((_a = this.context) === null || _a === void 0 ? void 0 : _a.state) === "running"; }
    /** A short tone (kept for small UI blips). */
    beep(frequency = 440, duration = 0.05) { this.layer({ wave: "sine", freq: frequency, dur: duration, gain: 0.8 }, this.sfxBus); }
    /** Play a sound family by id. Repeats closer than MIN_REPEAT_SECONDS are skipped. Returns whether it played. */
    play(id, gainScale = 1) {
        var _a;
        const c = this.context;
        if (!c || !this.sfxBus || this.levels.sfx <= 0)
            return false;
        const last = (_a = this.lastPlayed.get(id)) !== null && _a !== void 0 ? _a : -1;
        if (last >= 0 && c.currentTime - last < MIN_REPEAT_SECONDS)
            return false;
        this.lastPlayed.set(id, c.currentTime);
        const buffer = this.buffers.get(id);
        if (buffer) {
            const src = c.createBufferSource();
            src.buffer = buffer;
            const g = c.createGain();
            g.gain.value = gainScale;
            src.connect(g).connect(this.sfxBus);
            src.start();
            return true;
        }
        const url = this.urls.get(id);
        if (url)
            void this.load(id, url);
        const recipe = SOUND_FAMILIES[id];
        if (!recipe)
            return false;
        for (const l of recipe.layers)
            this.layer({ ...l, gain: l.gain * gainScale }, this.sfxBus);
        return true;
    }
    async load(id, url) {
        const c = this.context;
        if (!c || this.buffers.has(id))
            return;
        this.urls.delete(id);
        try {
            const r = await fetch(url);
            if (r.ok)
                this.buffers.set(id, await c.decodeAudioData(await r.arrayBuffer()));
        }
        catch { /* keep the synthesised sound */ }
    }
    noiseBuffer() {
        const c = this.context;
        if (this.noise)
            return this.noise;
        const b = c.createBuffer(1, Math.floor(c.sampleRate), c.sampleRate);
        const d = b.getChannelData(0);
        let seed = 7;
        for (let i = 0; i < d.length; i++) {
            seed = (seed * 16807) % 2147483647;
            d[i] = (seed / 2147483647) * 2 - 1;
        }
        return (this.noise = b);
    }
    /** One synthesised layer: an oscillator (or noise) with a quick attack and a smooth fade. */
    layer(l, bus, at) {
        var _a, _b;
        const c = this.context;
        if (!c || !bus)
            return;
        const start = (at !== null && at !== void 0 ? at : c.currentTime) + ((_a = l.delay) !== null && _a !== void 0 ? _a : 0);
        const end = start + Math.max(0.02, l.dur);
        const attack = Math.min((_b = l.attack) !== null && _b !== void 0 ? _b : 0.005, l.dur / 2);
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(Math.max(0.0002, l.gain), start + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        let out = g;
        if (l.filter) {
            const f = c.createBiquadFilter();
            f.type = l.filter.type;
            f.frequency.value = l.filter.freq;
            g.connect(f);
            out = f;
        }
        out.connect(bus);
        if (l.wave === "noise") {
            const s = c.createBufferSource();
            s.buffer = this.noiseBuffer();
            s.loop = true;
            s.connect(g);
            s.start(start);
            s.stop(end + 0.02);
            return;
        }
        const o = c.createOscillator();
        o.type = l.wave;
        o.frequency.setValueAtTime(Math.max(20, l.freq), start);
        if (l.freqEnd)
            o.frequency.exponentialRampToValueAtTime(Math.max(20, l.freqEnd), end);
        o.connect(g);
        o.start(start);
        o.stop(end + 0.02);
    }
    // ---------------------------------------------------------------- music
    /** Start (or keep) the music for a place. Nothing plays until the player has touched the screen once. */
    playMusic(placeId) {
        var _a;
        if (((_a = this.music) === null || _a === void 0 ? void 0 : _a.id) === placeId)
            return;
        this.stopMusic();
        const c = this.context;
        if (!c || !this.musicBus || this.levels.music <= 0)
            return;
        const theme = musicFor(placeId);
        this.music = { id: placeId, theme, step: 0, nextTime: c.currentTime + 0.1, timer: undefined };
        this.music.timer = setInterval(() => this.schedule(), 40);
        this.schedule();
    }
    stopMusic() { var _a; if ((_a = this.music) === null || _a === void 0 ? void 0 : _a.timer)
        clearInterval(this.music.timer); this.music = undefined; }
    currentMusic() { var _a; return (_a = this.music) === null || _a === void 0 ? void 0 : _a.id; }
    schedule() {
        const c = this.context, m = this.music;
        if (!c || !m || !this.musicBus)
            return;
        if (c.state !== "running")
            return;
        const eighth = 60 / m.theme.tempo / 2;
        while (m.nextTime < c.currentTime + 0.15) {
            const bar = Math.floor(m.step / 8) % m.theme.melody.length, beat = m.step % 8;
            const note = m.theme.melody[bar][beat];
            if (note >= 0)
                this.voice(m.theme.lead, stepHz(m.theme, note), m.nextTime, eighth);
            if (beat === 0 || beat === 4)
                this.layer({ wave: "triangle", freq: stepHz(m.theme, m.theme.bass[bar % m.theme.bass.length]) / 4, dur: eighth * 3.5, gain: 0.5 }, this.musicBus, m.nextTime);
            const d = m.theme.drums[beat];
            if (d === 1)
                this.layer({ wave: "sine", freq: 150, freqEnd: 50, dur: 0.14, gain: 0.7 }, this.musicBus, m.nextTime);
            else if (d === 2)
                this.layer({ wave: "noise", freq: 0, dur: 0.03, gain: 0.25, filter: { type: "highpass", freq: 6000 } }, this.musicBus, m.nextTime);
            m.nextTime += eighth;
            m.step++;
        }
    }
    voice(v, hz, at, eighth) {
        const bus = this.musicBus;
        if (!bus)
            return;
        if (v === "marimba") {
            this.layer({ wave: "sine", freq: hz, dur: 0.35, gain: 0.6 }, bus, at);
            this.layer({ wave: "sine", freq: hz * 4, dur: 0.06, gain: 0.12 }, bus, at);
        }
        else if (v === "xylophone") {
            this.layer({ wave: "triangle", freq: hz * 2, dur: 0.18, gain: 0.45 }, bus, at);
            this.layer({ wave: "sine", freq: hz * 6, dur: 0.04, gain: 0.08 }, bus, at);
        }
        else if (v === "pluck")
            this.layer({ wave: "sawtooth", freq: hz, dur: 0.16, gain: 0.3, filter: { type: "lowpass", freq: hz * 3 } }, bus, at);
        else if (v === "bell") {
            this.layer({ wave: "sine", freq: hz * 2, dur: 0.8, gain: 0.35 }, bus, at);
            this.layer({ wave: "sine", freq: hz * 5.04, dur: 0.4, gain: 0.08 }, bus, at);
        }
        else
            this.layer({ wave: "sawtooth", freq: hz, dur: eighth * 1.6, gain: 0.25, attack: 0.04, filter: { type: "lowpass", freq: 1400 } }, bus, at);
    }
}
