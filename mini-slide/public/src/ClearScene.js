// ============================================================
//  ClearScene — クリア結果画面
// ============================================================

import { changeScene } from '../main.js';
import { TitleScene  } from './TitleScene.js';
import { GameScene   } from './GameScene.js';

/** 手数・時間からランクを計算する */
function calcRank(moves, size, timeSec) {
    // 期待最低手数の目安 (size^2 * 係数)
    const base = size * size;
    const timeBonus = timeSec < 30 ? 1 : timeSec < 60 ? 0 : timeSec < 120 ? -1 : -2;
    let score = 0;
    if      (moves <= base * 1.0) score = 5;
    else if (moves <= base * 1.5) score = 4;
    else if (moves <= base * 2.5) score = 3;
    else if (moves <= base * 4.0) score = 2;
    else                           score = 1;
    score = Math.min(5, Math.max(1, score + timeBonus));

    const ranks = [
        null,
        { rank: 'D', emoji: '💪', label: 'クリア！' },
        { rank: 'C', emoji: '🙂', label: 'グッドジョブ！' },
        { rank: 'B', emoji: '👍', label: '素晴らしい！' },
        { rank: 'A', emoji: '⭐', label: 'エクセレント！' },
        { rank: 'S', emoji: '🏆', label: 'パーフェクト！' },
    ];
    return ranks[score];
}

function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export class ClearScene {
    constructor(container, data) {
        this.container = container;
        this.size      = data.size    || 4;
        this.modeId    = data.modeId  || '4x4';
        this.label     = data.label   || '15パズル';
        this.moves     = data.moves   || 0;
        this.timeSec   = data.timeSec || 0;
        this._render();
    }

    _render() {
        const { rank, emoji, label } = calcRank(this.moves, this.size, this.timeSec);

        // ランク色
        const rankColors = {
            S: { bg: 'linear-gradient(135deg,rgba(250,204,21,0.3),rgba(245,158,11,0.15))', border: 'rgba(250,204,21,0.45)', color: '#facc15' },
            A: { bg: 'linear-gradient(135deg,rgba(56,189,248,0.3),rgba(99,102,241,0.15))', border: 'rgba(56,189,248,0.45)',  color: '#38bdf8' },
            B: { bg: 'linear-gradient(135deg,rgba(34,197,94,0.3),rgba(16,185,129,0.15))',  border: 'rgba(34,197,94,0.45)',   color: '#22c55e' },
            C: { bg: 'linear-gradient(135deg,rgba(251,146,60,0.3),rgba(245,158,11,0.15))', border: 'rgba(251,146,60,0.45)',  color: '#fb923c' },
            D: { bg: 'linear-gradient(135deg,rgba(148,163,184,0.2),rgba(100,116,139,0.1))',border: 'rgba(148,163,184,0.3)',  color: '#94a3b8' },
        };
        const rc = rankColors[rank] || rankColors.D;

        this.container.innerHTML = `
        <div class="glass-card" style="width:100%; max-width:480px; text-align:center;">
            <!-- Header -->
            <div class="game-header" style="margin-bottom:28px;">
                <div class="game-title-area">
                    <span class="game-title-icon">🔲</span>
                    <span class="game-title">SLIDE PUZZLE</span>
                </div>
                <a href="../../index.html" class="home-btn">🏠 ホーム</a>
            </div>

            <!-- Clear Banner -->
            <div style="margin-bottom:20px;">
                <span style="font-size:3.6rem; display:block; margin-bottom:10px;
                    filter:drop-shadow(0 0 20px rgba(56,189,248,0.8));
                    animation: pop 0.5s cubic-bezier(0.16,1,0.3,1) both;">
                    ${emoji}
                </span>
                <div style="font-size:2rem; font-weight:800; margin-bottom:4px;
                    background:linear-gradient(135deg,#38bdf8,#818cf8);
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
                    パズル完成！
                </div>
                <div style="color:var(--text-sub); font-size:1rem;">${label} — ${this.label}</div>
            </div>

            <!-- Rank badge -->
            <div style="display:flex; justify-content:center; margin-bottom:24px;">
                <div style="
                    width:80px; height:80px; border-radius:50%;
                    display:flex; align-items:center; justify-content:center;
                    font-size:2.4rem; font-weight:900;
                    background: ${rc.bg};
                    border: 2px solid ${rc.border};
                    box-shadow: 0 0 24px ${rc.border};
                    color: ${rc.color};
                    animation: pop 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
                ">${rank}</div>
            </div>
            <div style="font-size:1rem; color:var(--text-sub); margin-bottom:24px;">${label}</div>

            <!-- Stats grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:28px;">
                <div class="stat-item">
                    <div class="stat-label">手数</div>
                    <div class="stat-value orange">${this.moves}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">タイム</div>
                    <div class="stat-value cyan">${fmtTime(this.timeSec)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">サイズ</div>
                    <div class="stat-value" style="font-size:0.85rem;">${this.size}×${this.size}</div>
                </div>
            </div>

            <!-- Buttons -->
            <div class="btn-row" style="flex-direction:column; gap:10px;">
                <button class="btn btn-primary" id="btn-retry" style="font-size:1rem; padding:14px;">
                    🎲 もう一度 (同じサイズ)
                </button>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-secondary" id="btn-harder" style="flex:1;">⬆ 一段階難しく</button>
                    <button class="btn btn-danger"    id="btn-title"  style="flex:1;">⬅ タイトルへ</button>
                </div>
            </div>
        </div>
        `;

        document.getElementById('btn-retry').addEventListener('click', () => {
            changeScene(GameScene, { size: this.size, modeId: this.modeId, label: this.label });
        });

        document.getElementById('btn-harder').addEventListener('click', () => {
            const next = { 3: { size: 4, modeId: '4x4', label: '15パズル' },
                           4: { size: 5, modeId: '5x5', label: '24パズル' },
                           5: { size: 5, modeId: '5x5', label: '24パズル' } }[this.size];
            changeScene(GameScene, next);
        });

        document.getElementById('btn-title').addEventListener('click', () => {
            changeScene(TitleScene);
        });
    }
}
