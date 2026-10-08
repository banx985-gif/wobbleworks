export const EMPTY_HISTORY = Object.freeze({ unaidedSolves: 0, helpedSolves: 0, hintsUsed: 0 });
export function isAdvanced(history) {
    return history.unaidedSolves >= 3 && history.unaidedSolves >= history.helpedSolves * 2;
}
/** Watches one attempt at one challenge. Pure bookkeeping — nothing here touches the simulation. */
export class AdaptiveObserver {
    failures = 0;
    unchangedFailures = 0;
    lastFailedSignature;
    selectMisses = 0;
    dragErrors = 0;
    hints = 0;
    startedAtMs;
    tipShownFor = new Set();
    constructor(nowMs = 0) { this.startedAtMs = nowMs; }
    reset(nowMs) { this.failures = this.unchangedFailures = this.selectMisses = this.dragErrors = this.hints = 0; this.lastFailedSignature = undefined; this.startedAtMs = nowMs; this.tipShownFor.clear(); }
    /** `signature` identifies the exact build that was tested (BuildSnapshot.signature). */
    noteFailure(signature) {
        this.failures += 1;
        this.unchangedFailures = signature === this.lastFailedSignature ? this.unchangedFailures + 1 : 0;
        this.lastFailedSignature = signature;
    }
    noteSelectMiss() { this.selectMisses += 1; }
    noteDragError() { this.dragErrors += 1; }
    noteHint() { this.hints += 1; }
    hintsUsed() { return this.hints; }
    failedTests() { return this.failures; }
    guidance(settings, history, nowMs) {
        const advanced = isAdvanced(history);
        const patience = advanced ? 2 : 1; // advanced players get fewer, later prompts
        const minutes = (nowMs - this.startedAtMs) / 60000;
        const struggling = this.failures >= 3 * patience || minutes >= 3 * patience;
        const fumbling = this.selectMisses >= 2 || this.dragErrors >= 2;
        const snapRadius = !settings.snapAssist ? 0 : fumbling || struggling ? 1.1 : 0.7;
        let boltTip;
        if (settings.boltTips) {
            if (this.unchangedFailures >= 1 && !this.tipShownFor.has("unchanged"))
                boltTip = "Same machine, same result! Try changing just ONE thing.";
            else if (this.failures >= 2 * patience && this.hints === 0 && !this.tipShownFor.has("hint"))
                boltTip = "Want a clue? Tap the light bulb — clues are free!";
            else if (struggling && !this.tipShownFor.has("struggle"))
                boltTip = "Tricky one! Look at what happened in the last test — where did it go wrong?";
        }
        return {
            touchPadding: fumbling ? 0.34 : 0.18,
            snapRadius,
            wheelSnap: settings.snapAssist && (fumbling || this.failures >= 2),
            offerHint: settings.boltTips && (this.failures >= 2 * patience || minutes >= 2 * patience),
            highlightParts: settings.boltTips && struggling,
            replayInstruction: this.unchangedFailures >= 2,
            ...(boltTip ? { boltTip } : {}),
            showMeasurements: advanced
        };
    }
    /** Call when a tip has been shown so the same tip is not repeated in this attempt. */
    markTipShown(tip) {
        if (tip.startsWith("Same machine"))
            this.tipShownFor.add("unchanged");
        else if (tip.startsWith("Want a clue"))
            this.tipShownFor.add("hint");
        else
            this.tipShownFor.add("struggle");
    }
}
/** Updates the saved history after a solve. Hints never change stars — this only tunes future prompts. */
export function historyAfterSolve(history, hintsUsed, failedTests) {
    const h = history ?? EMPTY_HISTORY;
    const helped = hintsUsed > 0 || failedTests >= 4;
    return { unaidedSolves: h.unaidedSolves + (helped ? 0 : 1), helpedSolves: h.helpedSolves + (helped ? 1 : 0), hintsUsed: h.hintsUsed + hintsUsed };
}
