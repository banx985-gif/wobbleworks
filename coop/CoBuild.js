import { activeProfile } from "../app/AppState.js";
/** The inventor colours (same as the inventor cards). */
const AVATAR_COLOURS = { ORANGE: "#ff922b", BLUE: "#339af0", GREEN: "#40c057", PURPLE: "#9775fa", PINK: "#f06595" };
export const CO_PATTERNS = [
    { id: "TURNS", title: "Take turns", icon: "🔁", line: "Build a bit, then pass the device." },
    { id: "PREDICT", title: "Builder & Predictor", icon: "🔮", line: "One builds. Before every TEST, the other guesses what will happen." },
    { id: "PICK", title: "Part Picker", icon: "🎁", line: "One picks the next part, the other places it." }
];
/** Who can build with the inventor: other inventors on this device, or a grown-up or friend (no profile needed). */
export function partnerChoices(save) {
    const me = activeProfile(save);
    const others = save.profiles.filter(p => p.id !== (me === null || me === void 0 ? void 0 : me.id)).map(p => { var _a; return ({ id: `profile:${p.id}`, name: p.name, colour: (_a = AVATAR_COLOURS[p.avatarStyle]) !== null && _a !== void 0 ? _a : "#339af0", profileId: p.id }); });
    return [...others, { id: "guest:grown-up", name: "Grown-up", colour: "#868e96" }, { id: "guest:friend", name: "Friend", colour: "#20c997" }];
}
export function sessionOwner(save) { var _a; const p = activeProfile(save); return p ? { id: `profile:${p.id}`, name: p.name, colour: (_a = AVATAR_COLOURS[p.avatarStyle]) !== null && _a !== void 0 ? _a : "#ff922b", profileId: p.id } : undefined; }
export class CoBuildSession {
    constructor(players, pattern) {
        Object.defineProperty(this, "players", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: players
        });
        Object.defineProperty(this, "pattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: pattern
        });
        Object.defineProperty(this, "active", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "turn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        /** Part Picker: who is picking right now (the other one places). */
        Object.defineProperty(this, "phase", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PICK"
        });
        Object.defineProperty(this, "picked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cameras", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [undefined, undefined]
        });
        Object.defineProperty(this, "guesses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "pendingGuess", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    get current() { return this.players[this.active]; }
    get waiting() { return this.players[this.active === 0 ? 1 : 0]; }
    /** Can the current player change the build right now? (Part Picker: only the placer, after a pick.) */
    canEdit() { return this.pattern !== "PICK" || this.phase === "PLACE"; }
    /** Can the parts tray be used right now? (Part Picker: only the picker, for one part.) */
    canUseTray() { return this.pattern !== "PICK" || (this.phase === "PICK" && this.picked === undefined); }
    /** Part Picker: the picker chose a part; it's placed for the placer, who now takes over. */
    pick(partId) { if (this.pattern !== "PICK" || this.phase !== "PICK" || this.picked !== undefined)
        return; this.picked = partId; }
    /**
     * Hand over to the other player. Keeps the outgoing player's camera and returns the incoming player's
     * (undefined = start from the normal view). The caller clears selection and seals undo.
     */
    pass(camera) {
        this.cameras[this.active] = { ...camera };
        this.active = this.active === 0 ? 1 : 0;
        this.turn++;
        if (this.pattern === "PICK") {
            this.phase = this.phase === "PICK" ? "PLACE" : "PICK";
            if (this.phase === "PICK")
                this.picked = undefined;
        }
        return this.cameras[this.active];
    }
    /** Builder & Predictor: the waiting player guesses before a TEST. */
    needsPrediction() { return this.pattern === "PREDICT" && this.pendingGuess === undefined; }
    predict(guess) { this.pendingGuess = { by: this.waiting.name, guess }; }
    /** After the TEST: was the guess right? `said` is how to say what happened, e.g. ["it worked", "it didn't work"]. */
    resolve(happened, said) {
        const g = this.pendingGuess;
        this.pendingGuess = undefined;
        if (!g)
            return undefined;
        this.guesses.push({ ...g, happened });
        const what = happened ? said[0] : said[1];
        if (g.guess === "UNSURE")
            return `${g.by} wasn't sure — and ${what}!`;
        return (g.guess === "YES") === happened ? `🎯 ${g.by} guessed right — ${what}!` : `😮 Surprise for ${g.by} — ${what}!`;
    }
    /** Who guessed right how often (shown when the session ends). */
    score() { const counted = this.guesses.filter(g => g.guess !== "UNSURE" && g.happened !== undefined); return { right: counted.filter(g => (g.guess === "YES") === g.happened).length, total: counted.length }; }
}
/** A name for an invention saved together: it still belongs to the device's inventor. */
export function togetherName(name, partner) { const tag = ` (with ${partner.name})`; return name.length + tag.length <= 40 ? name + tag : name.slice(0, 40 - tag.length) + tag; }
/**
 * Together Launch (M30): the one interaction designed for two hands at once. Both players hold their own button;
 * after a full second of both holding together, the rocket launches. Letting go starts the count again.
 */
export class TogetherLaunch {
    constructor() {
        Object.defineProperty(this, "held", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [false, false]
        });
        Object.defineProperty(this, "ticks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "launched", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    press(side, down) { this.held[side] = down; if (!down)
        this.ticks = 0; }
    tick() { if (this.launched)
        return true; if (this.held[0] && this.held[1])
        this.ticks++;
    else
        this.ticks = 0; if (this.ticks >= 60)
        this.launched = true; return this.launched; }
    get progress() { return Math.min(1, this.ticks / 60); }
}
