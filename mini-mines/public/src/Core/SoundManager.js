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
    
    playClick() {
        this.playBeep(600, 0.05, 'sine');
    }

    playFlag() {
        this.playBeep(400, 0.08, 'triangle');
        setTimeout(() => this.playBeep(500, 0.08, 'triangle'), 60);
    }

    playExplosion() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // ノイズジェネレータで爆発音をシミュレート
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5秒
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // ローパスフィルターで低音に
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    playWin() { 
        this.playBeep(523.25, 0.1);
        setTimeout(() => this.playBeep(659.25, 0.1), 100);
        setTimeout(() => this.playBeep(783.99, 0.1), 200);
        setTimeout(() => this.playBeep(1046.50, 0.3), 300);
    }

    playLose() {
        this.playExplosion();
        setTimeout(() => {
            this.playBeep(196.00, 0.2, 'sawtooth');
            setTimeout(() => this.playBeep(146.83, 0.4, 'sawtooth'), 200);
        }, 150);
    }
}

export const soundManager = new SoundManager();
