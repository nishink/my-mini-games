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

    playNumber(num = 1) {
        const baseFreq = 400 + num * 40;
        this.playBeep(baseFreq, 0.06, 'sine', 0.1);
    }

    playErase() {
        this.playBeep(280, 0.05, 'triangle', 0.08);
    }

    playNote() {
        this.playBeep(700, 0.04, 'sine', 0.05);
    }

    playHint() {
        this.playBeep(659.25, 0.08, 'sine', 0.1);
        setTimeout(() => this.playBeep(987.77, 0.12, 'sine', 0.1), 80);
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
