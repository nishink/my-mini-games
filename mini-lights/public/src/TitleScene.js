// ============================================================
//  TitleScene — タイトル・難易度選択画面
// ============================================================

import { changeScene }  from '../main.js';
import { GameScene }    from './GameScene.js';

const DIFFICULTIES = [
    { id: 'easy',   label: 'イージー', size: 4, emoji: '🌱' },
    { id: 'normal', label: 'ノーマル', size: 5, emoji: '⚡' },
    { id: 'hard',   label: 'ハード',   size: 6, emoji: '🔥' },
];

export class TitleScene {
    constructor(container) {
        this.container = container;
        this.selectedDiff = 'normal';
        this._render();
    }

    _render() {
        this.container.innerHTML = `
        <div class="glass-card" style="width:100%; max-width:500px;">
            <!-- Header -->
            <div class="game-header">
                <div class="game-title-area">
                    <span class="game-title-icon">💡</span>
                    <span class="game-title">LIGHTS OUT</span>
                </div>
                <a href="../../index.html" class="home-btn">🏠 ホーム</a>
            </div>

            <!-- Hero -->
            <div style="text-align:center; margin-bottom:28px;">
                <div style="font-size:4.5rem; margin-bottom:12px; filter: drop-shadow(0 0 20px rgba(250,204,21,0.8));">
                    💡
                </div>
                <p style="color:var(--text-sub); font-size:0.9rem; line-height:1.7; max-width:320px; margin:0 auto;">
                    パネルをクリックすると<strong style="color:var(--text-main);">そのパネルと上下左右</strong>のライトが反転。<br>
                    <strong style="color:var(--light-on);">全てのライトを消灯</strong>させればクリアです！
                </p>
            </div>

            <!-- 難易度 -->
            <p style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--text-sub); margin-bottom:8px; text-align:center;">
                難易度を選択
            </p>
            <div class="difficulty-row" id="diff-row">
                ${DIFFICULTIES.map(d => `
                    <button class="diff-btn ${d.id === this.selectedDiff ? 'active' : ''}"
                            id="diff-${d.id}" data-id="${d.id}">
                        <div style="font-size:1.2rem; margin-bottom:2px;">${d.emoji}</div>
                        <div>${d.label}</div>
                        <div style="font-size:0.7rem; opacity:0.6;">${d.size}×${d.size}</div>
                    </button>
                `).join('')}
            </div>

            <!-- Start -->
            <button class="btn btn-primary" id="start-btn" style="width:100%; font-size:1rem; padding:16px;">
                🎮 ゲームスタート
            </button>

            <!-- How to play -->
            <div style="margin-top:20px; padding:16px; background:rgba(255,255,255,0.03); border-radius:12px; border:1px solid var(--border-color);">
                <p style="font-size:0.72rem; font-weight:700; color:var(--text-sub); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">
                    遊び方
                </p>
                <ul style="list-style:none; display:flex; flex-direction:column; gap:6px;">
                    <li class="hint-text">💡 点灯しているライトをクリックして反転させる</li>
                    <li class="hint-text">🔄 クリックするとそのマスと上下左右が同時に切り替わる</li>
                    <li class="hint-text">🏆 少ない手数で全消灯させるほど高評価！</li>
                </ul>
            </div>
        </div>
        `;

        // イベント
        this.container.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedDiff = btn.dataset.id;
                this.container.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            const diff = DIFFICULTIES.find(d => d.id === this.selectedDiff);
            changeScene(GameScene, { difficulty: diff.id, size: diff.size });
        });
    }
}
