export class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playBeep(freq = 440, duration = 0.1, type = 'sine', gainVal = 0.1) {
        if (this.muted) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playOk() { this.playBeep(880, 0.1); }
    playCancel() { this.playBeep(440, 0.1); }
    playSelect() { this.playBeep(660, 0.05); }

    playClick() {
        this.playBeep(520, 0.04, 'sine', 0.08);
    }

    playFill() {
        this.playBeep(440, 0.06, 'sine', 0.12);
        setTimeout(() => this.playBeep(660, 0.06, 'sine', 0.1), 40);
    }

    playCross() {
        this.playBeep(320, 0.05, 'triangle', 0.1);
    }

    playUnfill() {
        this.playBeep(300, 0.04, 'sine', 0.06);
    }

    playLineComplete() {
        this.playBeep(587.33, 0.08, 'triangle', 0.1); // D5
        setTimeout(() => this.playBeep(880, 0.12, 'triangle', 0.12), 70); // A5
    }

    playHint() {
        this.playBeep(659.25, 0.08, 'sine', 0.1); // E5
        setTimeout(() => this.playBeep(987.77, 0.12, 'sine', 0.1), 80); // B5
    }

    playError() {
        this.playBeep(180, 0.15, 'sawtooth', 0.15);
    }

    playWin() {
        if (this.muted) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playBeep(freq, 0.2, 'triangle', 0.15);
            }, i * 90);
        });
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

export const soundManager = new SoundManager();
