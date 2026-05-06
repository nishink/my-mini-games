/**
 * Mini RPG Saga - SoundManager
 * Web Audio APIを使用して簡単なSEを生成・再生する。
 */
export class SoundManager {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playBeep(freq = 440, duration = 0.1, type = 'sine') {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playOk() { this.playBeep(880, 0.1); }
    playCancel() { this.playBeep(440, 0.1); }
    playSelect() { this.playBeep(660, 0.05); }
    playHit() { this.playBeep(150, 0.2, 'square'); }
    playHeal() { 
        this.playBeep(523.25, 0.1);
        setTimeout(() => this.playBeep(659.25, 0.1), 100);
        setTimeout(() => this.playBeep(783.99, 0.2), 200);
    }
}

export const soundManager = new SoundManager();
