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
    
    playPlace() {
        this.playBeep(520, 0.08, 'sine');
    }
    
    playFlip() {
        this.playBeep(330, 0.05, 'sine');
        setTimeout(() => this.playBeep(440, 0.05, 'sine'), 40);
        setTimeout(() => this.playBeep(550, 0.05, 'sine'), 80);
    }

    playWin() { 
        this.playBeep(523.25, 0.1);
        setTimeout(() => this.playBeep(659.25, 0.1), 100);
        setTimeout(() => this.playBeep(783.99, 0.1), 200);
        setTimeout(() => this.playBeep(1046.50, 0.3), 300);
    }

    playLose() {
        this.playBeep(392.00, 0.1, 'sawtooth');
        setTimeout(() => this.playBeep(349.23, 0.1, 'sawtooth'), 120);
        setTimeout(() => this.playBeep(311.13, 0.1, 'sawtooth'), 240);
        setTimeout(() => this.playBeep(261.63, 0.4, 'sawtooth'), 360);
    }
}

export const soundManager = new SoundManager();
