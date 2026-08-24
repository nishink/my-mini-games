// ============================================================
//  ClearScene — クリア結果画面
// ============================================================

import { changeScene }  from '../main.js';
import { TitleScene }   from './TitleScene.js';
import { GameScene }    from './GameScene.js';

const DIFFICULTY_LABEL = { easy: 'イージー', normal: 'ノーマル', hard: 'ハード' };

/** 手数に応じてランクを計算する */
function calcRank(moves, size) {
    const base = size * size;
    if (moves <= base * 0.5)  return { rank: 'S', emoji: '🏆', label: 'パーフェクト！' };
    if (moves <= base * 0.8)  return { rank: 'A', emoji: '⭐', label: '素晴らしい！' };
    if (moves <= base * 1.2)  return { rank: 'B', emoji: '👍', label: 'グッドジョブ！' };
    if (moves <= base * 1.8)  return { rank: 'C', emoji: '🙂', label: 'クリア！'       };
    return                          { rank: 'D', emoji: '💪', label: 'もう一度挑戦！' };
}

/** 秒数を mm:ss 形式に変換 */
function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export class ClearScene {
    /**
     * @param {HTMLElement} container
     * @param {{ difficulty:string, size:number, moves:number, timeSec:number }} data
     */
    constructor(container, data) {
        this.container  = container;
        this.difficulty = data.difficulty || 'normal';
        this.size       = data.size || 5;
        this.moves      = data.moves || 0;
        this.timeSec    = data.timeSec || 0;
        this._render();
    }

    _render() {
        const { rank, emoji, label } = calcRank(this.moves, this.size);

        this.container.innerHTML = `
        <div class="glass-card" style="width:100%; max-width:480px; text-align:center;">
            <!-- Header -->
            <div class="game-header" style="margin-bottom:28px;">
                <div class="game-title-area">
                    <span class="game-title-icon">💡</span>
                    <span class="game-title">LIGHTS OUT</span>
                </div>
                <a href="../../index.html" class="home-btn">🏠 ホーム</a>
            </div>

            <!-- Clear Banner -->
            <div style="margin-bottom:24px;">
                <span style="font-size:4rem; display:block; margin-bottom:8px;
                    filter: drop-shadow(0 0 24px rgba(250,204,21,0.9));
                    animation: pop 0.5s cubic-bezier(0.16,1,0.3,1) both;">
                    ${emoji}
                </span>
                <div style="font-size:2rem; font-weight:800;
                    background: linear-gradient(135deg,#facc15,#f59e0b);
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                    background-clip:text; margin-bottom:4px;">
                    ゲームクリア！
                </div>
                <div style="font-size:1rem; color:var(--text-sub);">${label}</div>
            </div>

            <!-- Rank -->
            <div style="display:flex; justify-content:center; margin-bottom:28px;">
                <div style="
                    width: 80px; height: 80px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.5rem; font-weight: 900;
                    background: radial-gradient(circle at 35% 35%, rgba(250,204,21,0.3), rgba(245,158,11,0.1));
                    border: 2px solid rgba(250,204,21,0.4);
                    box-shadow: 0 0 24px rgba(250,204,21,0.3);
                    color: #facc15;
                    animation: pop 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
                ">${rank}</div>
            </div>

            <!-- Stats -->
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:28px;">
                <div class="stat-item">
                    <div class="stat-label">手数</div>
                    <div class="stat-value accent">${this.moves}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">タイム</div>
                    <div class="stat-value primary">${fmtTime(this.timeSec)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">難易度</div>
                    <div class="stat-value" style="font-size:0.85rem;">${DIFFICULTY_LABEL[this.difficulty]}</div>
                </div>
            </div>

            <!-- Buttons -->
            <div class="btn-row" style="flex-direction:column;">
                <button class="btn btn-primary" id="btn-next" style="font-size:1rem; padding:14px;">
                    🎲 次のパズル
                </button>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-secondary" id="btn-harder" style="flex:1;">⬆ 一段階上げる</button>
                    <button class="btn btn-danger"    id="btn-title"  style="flex:1;">⬅ タイトルへ</button>
                </div>
            </div>
        </div>
        `;

        document.getElementById('btn-next').addEventListener('click', () => {
            changeScene(GameScene, { difficulty: this.difficulty, size: this.size });
        });

        document.getElementById('btn-harder').addEventListener('click', () => {
            const next = { easy: 'normal', normal: 'hard', hard: 'hard' }[this.difficulty];
            const sizeMap = { easy: 4, normal: 5, hard: 6 };
            changeScene(GameScene, { difficulty: next, size: sizeMap[next] });
        });

        document.getElementById('btn-title').addEventListener('click', () => {
            changeScene(TitleScene);
        });
    }
}
