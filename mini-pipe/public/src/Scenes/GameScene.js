import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { PipeEngine } from '../Data/PipeEngine.js';
import { generatePuzzle } from '../Data/PuzzleGenerator.js';
import { renderPipeCell } from '../Data/PipeRenderer.js';

export class GameScene {
    constructor() {
        this.engine = null;
        this.difficulty = null;
        this.moves = 0;
        this.startTime = 0;
        this.timerInterval = null;
        this.isComplete = false;
        this.soundEnabled = true;
        this.srcR = 0; this.srcC = 0;
        this.snkR = 0; this.snkC = 0;
    }

    async enter(data) {
        this.difficulty = data.difficulty;
        this.moves = 0;
        this.isComplete = false;
        this.startTime = Date.now();

        // パズル生成
        const { grid, solution, srcR, srcC, snkR, snkC } = generatePuzzle(
            this.difficulty.rows,
            this.difficulty.cols
        );
        this.srcR = srcR; this.srcC = srcC;
        this.snkR = snkR; this.snkC = snkC;
        this.engine = new PipeEngine(grid);
        this.solution = solution;

        this._buildUI();
        this._renderBoard();
        this._startTimer();
    }

    _buildUI() {
        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="game-scene">
                <div class="game-header">
                    <button id="back-btn" class="btn btn-secondary btn-sm">← 戻る</button>
                    <div class="game-title-bar">🔧 MINI PIPE</div>
                    <div style="display:flex;gap:6px;">
                        <button id="new-btn" class="btn btn-secondary btn-sm" title="新しいパズル">🔄</button>
                        <button id="sound-btn" class="btn btn-secondary btn-sm" title="サウンド">🔊</button>
                    </div>
                </div>

                <div class="game-stats">
                    <div class="stat-chip">
                        <span class="label">⏱</span>
                        <span class="value" id="timer-display">0:00</span>
                    </div>
                    <div class="stat-chip">
                        <span class="label">🔄</span>
                        <span class="value" id="moves-display">0</span>
                    </div>
                    <div class="stat-chip">
                        <span class="label">📐</span>
                        <span class="value">${this.difficulty.rows}×${this.difficulty.cols}</span>
                    </div>
                </div>

                <div class="pipe-board-wrapper" style="margin-top:14px;">
                    <div class="pipe-board" id="pipe-board"></div>
                </div>

                <div class="info-bar">
                    <span class="flow-label">💧 流量</span>
                    <div class="progress-bar-wrap">
                        <div class="progress-bar-fill" id="flow-bar" style="width:0%"></div>
                    </div>
                    <span class="flow-pct" id="flow-pct">0%</span>
                </div>

                <!-- 完成オーバーレイ -->
                <div id="complete-overlay" class="complete-overlay hidden">
                    <div class="glass-card complete-card">
                        <div style="font-size:3rem;margin-bottom:8px;">🎉</div>
                        <div class="complete-title">クリア！</div>
                        <div id="star-rating" class="star-rating">⭐⭐⭐</div>
                        <div class="complete-subtitle" id="complete-subtitle">全てのパイプを繋げた！</div>
                        <div class="result-stats">
                            <div class="stat-box">
                                <span class="stat-label">⏱ タイム</span>
                                <span class="stat-value" id="result-time">-</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">🔄 手数</span>
                                <span class="stat-value" id="result-moves">-</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">💧 流量</span>
                                <span class="stat-value" id="result-flow">-</span>
                            </div>
                        </div>
                        <div class="result-actions">
                            <button id="next-btn" class="btn btn-primary btn-large">🔄 もう一度</button>
                            <button id="diff-btn" class="btn btn-secondary">📊 難易度選択</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('back-btn').addEventListener('click', () => {
            soundManager.playClick();
            this._stopTimer();
            sceneManager.switchScene('DifficultySelect');
        });

        document.getElementById('new-btn').addEventListener('click', () => {
            soundManager.playClick();
            this._stopTimer();
            sceneManager.switchScene('Game', { difficulty: this.difficulty });
        });

        document.getElementById('sound-btn').addEventListener('click', () => {
            this.soundEnabled = soundManager.toggle();
            document.getElementById('sound-btn').textContent = this.soundEnabled ? '🔊' : '🔇';
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            soundManager.playClick();
            sceneManager.switchScene('Game', { difficulty: this.difficulty });
        });

        document.getElementById('diff-btn').addEventListener('click', () => {
            soundManager.playClick();
            sceneManager.switchScene('DifficultySelect');
        });
    }

    _renderBoard() {
        const board = document.getElementById('pipe-board');
        if (!board) return;

        const rows = this.difficulty.rows;
        const cols = this.difficulty.cols;

        board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        board.innerHTML = '';

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = this.engine.getCell(r, c);
                const el = document.createElement('div');
                el.classList.add('pipe-cell');
                el.dataset.r = r;
                el.dataset.c = c;

                if (cell.isSource) {
                    el.classList.add('source');
                    const label = document.createElement('span');
                    label.classList.add('cell-label');
                    label.textContent = '💧';
                    label.style.color = '#22c55e';
                    el.appendChild(label);
                } else if (cell.isSink) {
                    el.classList.add('sink');
                    const label = document.createElement('span');
                    label.classList.add('cell-label');
                    label.textContent = '🏁';
                    label.style.color = '#f59e0b';
                    el.appendChild(label);
                }

                renderPipeCell(cell, el);

                if (!cell.isSource && !cell.isSink) {
                    el.addEventListener('click', () => this._onCellClick(r, c, el));
                }

                board.appendChild(el);
            }
        }

        this._updateFlowUI();
    }

    _onCellClick(r, c, el) {
        if (this.isComplete) return;
        this.engine.rotateCell(r, c);
        this.moves++;

        // 回転アニメーション
        el.classList.remove('rotating');
        void el.offsetWidth;
        el.classList.add('rotating');
        soundManager.playRotate();

        // セルを再描画
        const cell = this.engine.getCell(r, c);
        renderPipeCell(cell, el);

        // 全セル更新（流れのシミュレーション）
        const stats = this.engine.simulate();
        this._refreshAllCells();
        this._updateFlowUI(stats);

        document.getElementById('moves-display').textContent = this.moves;

        if (stats.complete && !this.isComplete) {
            this.isComplete = true;
            this._stopTimer();
            setTimeout(() => {
                soundManager.playComplete();
                this._showComplete(stats);
            }, 400);
        } else if (stats.filledCells > 1) {
            soundManager.playFlow();
        }
    }

    _refreshAllCells() {
        const rows = this.difficulty.rows;
        const cols = this.difficulty.cols;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = this.engine.getCell(r, c);
                const el = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
                if (!el) continue;

                el.classList.toggle('filled', cell.filled);
                el.classList.toggle('completed', cell.filled && this.isComplete);
                renderPipeCell(cell, el);
            }
        }
    }

    _updateFlowUI(stats) {
        if (!stats) {
            stats = this.engine.simulate();
        }
        const bar = document.getElementById('flow-bar');
        const pct = document.getElementById('flow-pct');
        if (bar) bar.style.width = `${stats.percentage}%`;
        if (pct) pct.textContent = `${stats.percentage}%`;
    }

    _startTimer() {
        this._stopTimer();
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const el = document.getElementById('timer-display');
            if (el) {
                const secs = Math.floor((Date.now() - this.startTime) / 1000);
                const m = Math.floor(secs / 60);
                const s = secs % 60;
                el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
            }
        }, 500);
    }

    _stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    _showComplete(stats) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

        // スター評価: 手数と流量で判定
        let stars = 1;
        if (stats.percentage >= 90 && this.moves < this.difficulty.rows * this.difficulty.cols * 2) stars = 3;
        else if (stats.percentage >= 70) stars = 2;

        const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

        document.getElementById('star-rating').textContent = starStr;
        document.getElementById('result-time').textContent = timeStr;
        document.getElementById('result-moves').textContent = `${this.moves}回`;
        document.getElementById('result-flow').textContent = `${stats.percentage}%`;

        const subtitle = stats.percentage === 100
            ? 'パーフェクト！全パイプを水が流れた！'
            : `水源からゴールまで届けた！（流量: ${stats.percentage}%）`;
        document.getElementById('complete-subtitle').textContent = subtitle;

        // ボード全体を完成アニメーション
        document.querySelectorAll('.pipe-cell.filled').forEach(el => {
            el.classList.add('completed');
        });

        document.getElementById('complete-overlay').classList.remove('hidden');
    }

    async exit() {
        this._stopTimer();
    }

    update() {}
}
