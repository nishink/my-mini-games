// ============================================================
//  GameScene — メインゲームプレイ画面
// ============================================================

import { changeScene }  from '../main.js';
import { TitleScene }   from './TitleScene.js';
import { ClearScene }   from './ClearScene.js';
import { LightsLogic }  from './LightsLogic.js';

const CELL_SIZE_MAP = { 4: 90, 5: 72, 6: 60 };
const DIFFICULTY_LABEL = { easy: 'イージー', normal: 'ノーマル', hard: 'ハード' };

export class GameScene {
    /**
     * @param {HTMLElement} container
     * @param {{ difficulty: string, size: number }} data
     */
    constructor(container, data) {
        this.container  = container;
        this.difficulty = data.difficulty || 'normal';
        this.size       = data.size || 5;
        this.cellSize   = CELL_SIZE_MAP[this.size] || 72;

        this.logic      = LightsLogic.generate(this.size, this.difficulty);
        this.totalLightsInit = this.logic.lightsOn();

        this.startTime  = Date.now();
        this.timerInterval = null;
        this.elapsedSec = 0;

        this._render();
        this._startTimer();
    }

    // --------------------------------------------------------
    //  レンダリング
    // --------------------------------------------------------
    _render() {
        this.container.innerHTML = `
        <div class="glass-card" style="width:100%; max-width:520px;">
            <!-- Header -->
            <div class="game-header">
                <div class="game-title-area">
                    <span class="game-title-icon">💡</span>
                    <span class="game-title">LIGHTS OUT</span>
                </div>
                <a href="../../index.html" class="home-btn">🏠 ホーム</a>
            </div>

            <!-- Stats -->
            <div class="stats-bar">
                <div class="stat-item">
                    <div class="stat-label">手数</div>
                    <div class="stat-value accent" id="stat-moves">0</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">タイム</div>
                    <div class="stat-value primary" id="stat-timer">0:00</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">残りライト</div>
                    <div class="stat-value" id="stat-lights">${this.logic.lightsOn()}</div>
                </div>
            </div>

            <!-- Level & Progress -->
            <div class="level-info">
                <span class="level-badge">${DIFFICULTY_LABEL[this.difficulty]} / ${this.size}×${this.size}</span>
                <span class="lights-count" id="lights-count">
                    点灯中: <span>${this.logic.lightsOn()}</span> / ${this.size * this.size}
                </span>
            </div>
            <div class="progress-area">
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" id="progress-fill" style="width:${this._progressPct()}%"></div>
                </div>
                <span class="progress-label" id="progress-label">${Math.round(this._progressPct())}%消灯</span>
            </div>

            <!-- Grid -->
            <div class="grid-wrapper">
                <div class="lights-grid" id="lights-grid"
                     style="grid-template-columns: repeat(${this.size}, ${this.cellSize}px);">
                </div>
            </div>

            <!-- Buttons -->
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-restart">🔄 リセット</button>
                <button class="btn btn-secondary" id="btn-new">🎲 新しい問題</button>
                <button class="btn btn-danger"    id="btn-title">⬅ タイトル</button>
            </div>

            <p class="hint-text">クリックするとそのマスと上下左右が反転します</p>
        </div>
        `;

        this._renderGrid();
        this._setupButtons();
    }

    _renderGrid() {
        const gridEl = document.getElementById('lights-grid');
        gridEl.innerHTML = '';

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = document.createElement('div');
                cell.className = `light-cell ${this.logic.grid[r][c] ? 'on' : 'off'}`;
                cell.id = `cell-${r}-${c}`;
                cell.style.width  = `${this.cellSize}px`;
                cell.style.height = `${this.cellSize}px`;
                cell.addEventListener('click', () => this._handleClick(r, c));
                gridEl.appendChild(cell);
            }
        }
    }

    // --------------------------------------------------------
    //  クリック処理
    // --------------------------------------------------------
    _handleClick(r, c) {
        const toggled = this.logic.click(r, c);

        // 反転アニメーション
        toggled.forEach(({ r: tr, c: tc }) => {
            const el = document.getElementById(`cell-${tr}-${tc}`);
            if (!el) return;
            el.classList.remove('on', 'off', 'flash');
            // reflow trick
            void el.offsetWidth;
            el.classList.add(this.logic.grid[tr][tc] ? 'on' : 'off', 'flash');
        });

        this._updateStats();

        if (this.logic.isSolved()) {
            clearInterval(this.timerInterval);
            // 少し待ってからクリア演出
            setTimeout(() => this._goToClear(), 600);
        }
    }

    // --------------------------------------------------------
    //  UI 更新
    // --------------------------------------------------------
    _updateStats() {
        const moves  = this.logic.moves;
        const lights = this.logic.lightsOn();

        document.getElementById('stat-moves').textContent  = moves;
        document.getElementById('stat-lights').textContent = lights;

        const countEl = document.getElementById('lights-count');
        if (countEl) {
            countEl.innerHTML = `点灯中: <span>${lights}</span> / ${this.size * this.size}`;
        }

        const pct = this._progressPct();
        const fillEl  = document.getElementById('progress-fill');
        const labelEl = document.getElementById('progress-label');
        if (fillEl)  fillEl.style.width  = `${pct}%`;
        if (labelEl) labelEl.textContent = `${Math.round(pct)}%消灯`;
    }

    _progressPct() {
        const total  = this.size * this.size;
        const offCnt = total - this.logic.lightsOn();
        return (offCnt / total) * 100;
    }

    // --------------------------------------------------------
    //  タイマー
    // --------------------------------------------------------
    _startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
            const m = Math.floor(this.elapsedSec / 60);
            const s = this.elapsedSec % 60;
            const timerEl = document.getElementById('stat-timer');
            if (timerEl) timerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
        }, 500);
    }

    // --------------------------------------------------------
    //  ボタン
    // --------------------------------------------------------
    _setupButtons() {
        document.getElementById('btn-restart').addEventListener('click', () => {
            clearInterval(this.timerInterval);
            changeScene(GameScene, { difficulty: this.difficulty, size: this.size });
        });

        document.getElementById('btn-new').addEventListener('click', () => {
            clearInterval(this.timerInterval);
            this.logic    = LightsLogic.generate(this.size, this.difficulty);
            this.startTime = Date.now();
            this.elapsedSec = 0;
            this._render();
            this._startTimer();
        });

        document.getElementById('btn-title').addEventListener('click', () => {
            clearInterval(this.timerInterval);
            changeScene(TitleScene);
        });
    }

    // --------------------------------------------------------
    //  クリア画面へ
    // --------------------------------------------------------
    _goToClear() {
        changeScene(ClearScene, {
            difficulty: this.difficulty,
            size:       this.size,
            moves:      this.logic.moves,
            timeSec:    this.elapsedSec,
        });
    }

    // --------------------------------------------------------
    //  破棄時にタイマーを止める
    // --------------------------------------------------------
    destroy() {
        clearInterval(this.timerInterval);
    }
}
