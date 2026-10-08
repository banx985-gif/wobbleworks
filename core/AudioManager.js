export class AudioManager {
    context;
    masterGain = 0.35;
    setMasterGain(value) { this.masterGain = Math.max(0, Math.min(1, value)); }
    async unlock() { this.context ??= new AudioContext(); if (this.context.state === "suspended")
        await this.context.resume(); }
    beep(frequency = 440, duration = 0.05) { if (!this.context)
        return; const osc = this.context.createOscillator(); const gain = this.context.createGain(); gain.gain.value = this.masterGain; osc.frequency.value = frequency; osc.connect(gain).connect(this.context.destination); osc.start(); osc.stop(this.context.currentTime + duration); }
}
