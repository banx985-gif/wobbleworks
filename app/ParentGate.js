/**
 * Simple grown-up gate (design §56): the adult types a 3-digit number that is shown in WORDS.
 * Young readers can't easily pass it; adults pass it in seconds. Not a security boundary —
 * it only keeps purchases, backups and profile deletion away from accidental child taps.
 */
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
/** Small deterministic generator so tests can pin a challenge. */
export function makeParentChallenge(random = Math.random) {
    const digits = [0, 0, 0].map((_, i) => {
        const n = Math.floor(random() * 10) % 10;
        return i === 0 && n === 0 ? 7 : n;
    });
    return { digits, prompt: digits.map(d => WORDS[d].toUpperCase()).join(" · ") };
}
export class ParentGate {
    random;
    challenge;
    entered = [];
    failures = 0;
    lockedUntilMs = 0;
    constructor(random = Math.random) {
        this.random = random;
        this.challenge = makeParentChallenge(random);
    }
    current() { return this.challenge; }
    enteredDigits() { return this.entered; }
    reset() { this.challenge = makeParentChallenge(this.random); this.entered = []; }
    isLocked(nowMs) { return nowMs < this.lockedUntilMs; }
    /** Returns "PASS" when the third correct digit lands, "FAIL" on a wrong full entry, otherwise "MORE". */
    press(digit, nowMs) {
        if (this.isLocked(nowMs))
            return "LOCKED";
        if (!Number.isInteger(digit) || digit < 0 || digit > 9)
            return "MORE";
        this.entered.push(digit);
        if (this.entered.length < this.challenge.digits.length)
            return "MORE";
        const ok = this.entered.every((d, i) => d === this.challenge.digits[i]);
        if (ok) {
            this.failures = 0;
            this.reset();
            return "PASS";
        }
        this.failures += 1;
        if (this.failures >= 3) {
            this.lockedUntilMs = nowMs + 15000;
            this.failures = 0;
        }
        this.reset();
        return "FAIL";
    }
    backspace() { this.entered.pop(); }
}
