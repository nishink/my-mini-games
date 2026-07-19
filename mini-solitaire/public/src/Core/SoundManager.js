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

    playBeep(freq = 440, duration = 0.1, type = 'sine', gainVal = 0.1) {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playOk() { this.playBeep(880, 0.1); }
    playCancel() { this.playBeep(440, 0.1); }
    playSelect() { this.playBeep(660, 0.05); }

    playShuffle() {
        // シャッフル・シャカシャカ音
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playBeep(200 + Math.random() * 100, 0.06, 'triangle', 0.05);
            }, i * 80);
        }
    }

    playFlipCard() {
        // カードをめくるシュッという音の簡易表現
        this.playBeep(350, 0.05, 'triangle', 0.08);
        setTimeout(() => this.playBeep(450, 0.05, 'sine', 0.08), 30);
    }

    playPlaceCard() {
        // カードを置くトントンという音の簡易表現
        this.playBeep(250, 0.04, 'triangle', 0.08);
        setTimeout(() => this.playBeep(200, 0.04, 'triangle', 0.06), 40);
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
