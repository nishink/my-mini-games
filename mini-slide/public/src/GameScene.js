// ============================================================
//  GameScene — メインゲームプレイ画面
// ============================================================

import { changeScene } from '../main.js';
import { TitleScene  } from './TitleScene.js';
import { ClearScene  } from './ClearScene.js';
import { SlideLogic  } from './SlideLogic.js';

// サイズ別のシャッフル回数・タイルサイズ
const CONFIG = {
    3: { shuffle: 60,  tileSize: 96,  fontSize: 2.0  },
    4: { shuffle: 120, tileSize: 78,  fontSize: 1.6  },
    5: { shuffle: 200, tileSize: 62,  fontSize: 1.2  },
};

export class GameScene {
    constructor(container, data) {
        this.container = container;
        this.size      = data.size  || 4;
        this.modeId    = data.modeId || '4x4';
        this.label     = data.label  || '15パズル';

        const cfg = CONFIG[this.size];
        this.tileSize = cfg.tileSize;
        this.fontSize = cfg.fontSize;

        this.logic = new SlideLogic(this.size);
        this.logic.shuffle(cfg.shuffle);
        this.initialState = this.logic.clone();

        this.startTime     = Date.now();
        this.timerInterval = null;
        this.elapsedSec    = 0;
        this.locked        = false; // アニメーション中は操作ロック

        this._render();
        this._startTimer();
        this._setupKeyboard();
    }

    // --------------------------------------------------------
    //  レンダリング
    // --------------------------------------------------------
    _render() {
        const boardPx = this.size * this.tileSize + (this.size + 1) * 6 + 20; // gap + padding

        this.container.innerHTML = `
        <div class="glass-card" style="width:100%; max-width:520px;">
            <!-- Header -->
            <div class="game-header">
                <div class="game-title-area">
                    <span class="game-title-icon">🔲</span>
                    <span class="game-title">SLIDE PUZZLE</span>
                </div>
                <a href="../../index.html" class="home-btn">🏠 ホーム</a>
            </div>

            <!-- Stats -->
            <div class="stats-bar">
                <div class="stat-item">
                    <div class="stat-label">手数</div>
                    <div class="stat-value orange" id="stat-moves">0</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">タイム</div>
                    <div class="stat-value cyan" id="stat-timer">0:00</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">正位置</div>
                    <div class="stat-value" id="stat-correct">0 / ${this.size * this.size - 1}</div>
                </div>
            </div>

            <!-- Mode badge & Progress -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:100px;
                    background:linear-gradient(135deg,rgba(56,189,248,0.18),rgba(99,102,241,0.18));
                    border:1px solid rgba(56,189,248,0.28); color:var(--primary);">
                    ${this.label}
                </span>
                <span class="progress-label" id="progress-pct">0%</span>
            </div>
            <div class="progress-area" style="margin-bottom:16px;">
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" id="progress-fill" style="width:0%"></div>
                </div>
            </div>

            <!-- Board -->
            <div class="board-wrapper">
                <div class="puzzle-board" id="puzzle-board"
                    style="grid-template-columns: repeat(${this.size}, ${this.tileSize}px);
                           width: ${boardPx}px;">
                </div>
            </div>

            <!-- Buttons -->
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-reset">🔄 リセット</button>
                <button class="btn btn-secondary" id="btn-new">🎲 新しい問題</button>
                <button class="btn btn-danger"    id="btn-title">⬅ タイトル</button>
            </div>

            <p class="hint-text">空きマスに隣接するタイルをクリック、またはキーボードの矢印キーで操作</p>
        </div>
        `;

        this._renderBoard();
        this._setupButtons();
    }

    _renderBoard() {
        const board = document.getElementById('puzzle-board');
        if (!board) return;
        board.innerHTML = '';

        for (let i = 0; i < this.logic.total; i++) {
            const val  = this.logic.tiles[i];
            const tile = document.createElement('div');
            tile.className = val === 0
                ? 'tile empty'
                : `tile${this.logic.isCorrect(i) ? ' correct' : ''}`;
            tile.id = `tile-${i}`;
            tile.style.width    = `${this.tileSize}px`;
            tile.style.height   = `${this.tileSize}px`;
            tile.style.fontSize = `${this.fontSize}rem`;

            if (val !== 0) {
                tile.textContent = val;
                tile.addEventListener('click', () => this._handleClick(i));
            }
            board.appendChild(tile);
        }
    }

    // --------------------------------------------------------
    //  クリック処理
    // --------------------------------------------------------
    _handleClick(idx) {
        if (this.locked) return;
        const moved = this.logic.slide(idx);
        if (!moved) return;

        this.locked = true;
        this._renderBoard();
        this._updateStats();
        setTimeout(() => { this.locked = false; }, 130);

        if (this.logic.isSolved()) {
            clearInterval(this.timerInterval);
            setTimeout(() => this._goToClear(), 400);
        }
    }

    // --------------------------------------------------------
    //  キーボード操作
    //  矢印キー: 空きマスの方向にあるタイルをスライド
    // --------------------------------------------------------
    _setupKeyboard() {
        this._keyHandler = (e) => {
            if (this.locked) return;
            const empty = this.logic.emptyIdx;
            const size  = this.size;
            let targetIdx = -1;

            switch (e.key) {
                case 'ArrowUp':    targetIdx = empty + size; break; // 空きマスの下のタイルを上へ
                case 'ArrowDown':  targetIdx = empty - size; break;
                case 'ArrowLeft':  targetIdx = empty + 1;    break;
                case 'ArrowRight': targetIdx = empty - 1;    break;
                default: return;
            }
            e.preventDefault();

            if (targetIdx < 0 || targetIdx >= this.logic.total) return;

            // 同じ行/列であることを確認
            const eR = Math.floor(empty / size);
            const eC = empty % size;
            const tR = Math.floor(targetIdx / size);
            const tC = targetIdx % size;
            if (eR !== tR && eC !== tC) return;

            this._handleClick(targetIdx);
        };
        window.addEventListener('keydown', this._keyHandler);
    }

    _removeKeyboard() {
        window.removeEventListener('keydown', this._keyHandler);
    }

    // --------------------------------------------------------
    //  UI更新
    // --------------------------------------------------------
    _updateStats() {
        const moves   = this.logic.moves;
        const correct = this.logic.correctCount();
        const total   = this.logic.total - 1; // 空きマス除く
        const pct     = Math.round((correct / total) * 100);

        const mvEl = document.getElementById('stat-moves');
        const crEl = document.getElementById('stat-correct');
        const pfEl = document.getElementById('progress-fill');
        const ppEl = document.getElementById('progress-pct');

        if (mvEl) mvEl.textContent = moves;
        if (crEl) crEl.textContent = `${correct} / ${total}`;
        if (pfEl) pfEl.style.width = `${pct}%`;
        if (ppEl) ppEl.textContent = `${pct}%`;
    }

    // --------------------------------------------------------
    //  タイマー
    // --------------------------------------------------------
    _startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
            const m = Math.floor(this.elapsedSec / 60);
            const s = this.elapsedSec % 60;
            const el = document.getElementById('stat-timer');
            if (el) el.textContent = `${m}:${String(s).padStart(2, '0')}`;
        }, 500);
    }

    // --------------------------------------------------------
    //  ボタン
    // --------------------------------------------------------
    _setupButtons() {
        document.getElementById('btn-reset').addEventListener('click', () => {
            this._removeKeyboard();
            clearInterval(this.timerInterval);
            changeScene(GameScene, { size: this.size, modeId: this.modeId, label: this.label });
        });

        document.getElementById('btn-new').addEventListener('click', () => {
            this._removeKeyboard();
            clearInterval(this.timerInterval);
            // 新しいシャッフルで再生成
            const cfg = CONFIG[this.size];
            this.logic = new SlideLogic(this.size);
            this.logic.shuffle(cfg.shuffle);
            this.startTime  = Date.now();
            this.elapsedSec = 0;
            this.locked     = false;
            this._render();
            this._startTimer();
            this._setupKeyboard();
        });

        document.getElementById('btn-title').addEventListener('click', () => {
            this._removeKeyboard();
            clearInterval(this.timerInterval);
            changeScene(TitleScene);
        });
    }

    // --------------------------------------------------------
    //  クリア画面へ
    // --------------------------------------------------------
    _goToClear() {
        this._removeKeyboard();
        changeScene(ClearScene, {
            size:     this.size,
            modeId:   this.modeId,
            label:    this.label,
            moves:    this.logic.moves,
            timeSec:  this.elapsedSec,
        });
    }
}
