/**
 * SoundManager - Web Audio API を使ったシンプルな効果音生成
 */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    _getCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.ctx;
    }

    _playTone(freq, type, duration, vol = 0.18, delay = 0) {
        if (!this.enabled) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration);
        } catch (e) { /* ignore */ }
    }

    playRotate() {
        this._playTone(440, 'triangle', 0.08, 0.12);
        this._playTone(660, 'triangle', 0.07, 0.08, 0.05);
    }

    playFlow() {
        // 水が流れるサウンド
        this._playTone(220, 'sine', 0.15, 0.08);
        this._playTone(330, 'sine', 0.12, 0.06, 0.07);
    }

    playComplete() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            this._playTone(freq, 'sine', 0.3, 0.15, i * 0.1);
        });
    }

    playClick() {
        this._playTone(800, 'square', 0.05, 0.08);
    }

    playOk() {
        this._playTone(600, 'sine', 0.12, 0.12);
        this._playTone(900, 'sine', 0.1, 0.1, 0.1);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

export const soundManager = new SoundManager();
