// ============================================================
//  TitleScene — タイトル・サイズ選択画面
// ============================================================

import { changeScene } from '../main.js';
import { GameScene   } from './GameScene.js';

const MODES = [
    { id: '3x3', size: 3, label: '8パズル',  emoji: '🌱', desc: '3×3 / かんたん' },
    { id: '4x4', size: 4, label: '15パズル', emoji: '⚡', desc: '4×4 / スタンダード' },
    { id: '5x5', size: 5, label: '24パズル', emoji: '🔥', desc: '5×5 / むずかしい' },
];

export class TitleScene {
    constructor(container) {
        this.container = container;
        this.selectedMode = '4x4';
        this._render();
    }

    _render() {
        this.container.innerHTML = `
        <div class="glass-card" style="width:100%; max-width:500px;">
            <!-- Header -->
            <div class="game-header">
                <div class="game-title-area">
                    <span class="game-title-icon">🔲</span>
                    <span class="game-title">SLIDE PUZZLE</span>
                </div>
                <a href="../../index.html" class="home-btn">🏠 ホーム</a>
            </div>

            <!-- Hero -->
            <div style="text-align:center; margin-bottom:28px;">
                <div style="font-size:4rem; margin-bottom:12px;
                    filter: drop-shadow(0 0 20px rgba(56,189,248,0.6));">
                    🔲
                </div>
                <p style="color:var(--text-sub); font-size:0.9rem; line-height:1.7; max-width:320px; margin:0 auto;">
                    <strong style="color:var(--text-main);">空きマスへ隣接タイルをスライド</strong>させて<br>
                    <strong style="color:var(--primary);">1〜数字を順番</strong>に並べればクリア！
                </p>
            </div>

            <!-- モード選択 -->
            <p style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--text-sub); margin-bottom:8px; text-align:center;">
                サイズを選択
            </p>
            <div class="difficulty-row" id="mode-row">
                ${MODES.map(m => `
                    <button class="diff-btn ${m.id === this.selectedMode ? 'active' : ''}"
                            data-id="${m.id}">
                        <div style="font-size:1.2rem; margin-bottom:2px;">${m.emoji}</div>
                        <div style="font-size:0.85rem;">${m.label}</div>
                        <div style="font-size:0.68rem; opacity:0.6;">${m.desc}</div>
                    </button>
                `).join('')}
            </div>

            <!-- Start -->
            <button class="btn btn-primary" id="start-btn" style="width:100%; font-size:1rem; padding:16px; margin-bottom:20px;">
                🎮 ゲームスタート
            </button>

            <!-- How to play -->
            <div style="padding:16px; background:rgba(255,255,255,0.03); border-radius:12px; border:1px solid var(--border-color);">
                <p style="font-size:0.7rem; font-weight:700; color:var(--text-sub); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">
                    遊び方
                </p>
                <ul style="list-style:none; display:flex; flex-direction:column; gap:6px;">
                    <li class="hint-text">🖱️ 空きマスに隣接しているタイルをクリックするとスライド</li>
                    <li class="hint-text">⬆️ 上下左右キーで空きマスに向かって移動できます</li>
                    <li class="hint-text">✅ <strong style="color:var(--primary);">青く光るタイル</strong>は正しい位置にあります</li>
                    <li class="hint-text">🏆 少ない手数・短い時間でクリアするほど高評価！</li>
                </ul>
            </div>
        </div>
        `;

        this.container.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedMode = btn.dataset.id;
                this.container.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            const mode = MODES.find(m => m.id === this.selectedMode);
            changeScene(GameScene, { size: mode.size, modeId: mode.id, label: mode.label });
        });
    }
}
