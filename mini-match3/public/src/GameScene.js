// ============================================================
// GameScene.js — UI rendering & game state management
// ============================================================
import {
    COLS, ROWS, COLORS,
    SPECIAL, GEM_ICONS,
    createBoard, swapGems, findMatches,
    expandSpecials, collapseAndFill,
    scoreGroup, hasValidMove, findHint
} from './Board.js';

const GAME_DURATION = 120; // seconds
const ANIM_MATCH_MS  = 350;
const ANIM_FALL_MS   = 260;
const CHAIN_DELAY_MS = 180;
const HINT_IDLE_MS   = 8000; // show hint after 8s inactivity

export class GameScene {
    constructor(container) {
        this.container = container;
        this.grid       = null;
        this.score      = 0;
        this.best       = parseInt(localStorage.getItem('match3_best') || '0', 10);
        this.combo      = 1;
        this.timeLeft   = GAME_DURATION;
        this.timerInterval = null;
        this.hintTimeout   = null;
        this.selected   = null; // [r, c]
        this.busy       = false; // lock input during animations
        this.lastInteract = Date.now();
        this._el        = {}; // cached DOM refs
    }

    // ── Scenes ──────────────────────────────────────────────

    showTitle() {
        this.container.innerHTML = `
            <div class="overlay" id="title-overlay">
                <div class="overlay-card">
                    <span class="overlay-icon">💎</span>
                    <div class="overlay-title">MATCH 3</div>
                    <p class="overlay-sub">
                        同じ色のジェムを<strong>3つ以上</strong>並べて消そう！<br>
                        隣のジェムと入れ替えて揃える。<br>
                        4つで<strong>矢印ジェム</strong>、5つで<strong>爆弾ジェム</strong>が生成！<br><br>
                        ベストスコア: <strong>${this.best.toLocaleString()}</strong>
                    </p>
                    <div class="overlay-buttons">
                        <button class="btn btn-primary" id="start-btn">🎮 ゲームスタート</button>
                        <a href="../../index.html" class="btn btn-secondary">🏠 ホームへ戻る</a>
                    </div>
                </div>
            </div>`;
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    }

    showGameOver() {
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('match3_best', this.best);
        }
        const isNew = this.score >= this.best;
        const el = document.createElement('div');
        el.className = 'overlay';
        el.innerHTML = `
            <div class="overlay-card">
                <span class="overlay-icon">${isNew ? '🏆' : '💎'}</span>
                <div class="overlay-title">${isNew ? 'NEW BEST!' : 'TIME UP!'}</div>
                <p class="overlay-sub">
                    スコア <span class="score-big">${this.score.toLocaleString()}</span>
                    ベスト: <strong>${this.best.toLocaleString()}</strong>
                </p>
                <div class="overlay-buttons">
                    <button class="btn btn-primary" id="retry-btn">🔄 もう一度</button>
                    <a href="../../index.html" class="btn btn-secondary">🏠 ホームへ戻る</a>
                </div>
            </div>`;
        document.body.appendChild(el);
        document.getElementById('retry-btn').addEventListener('click', () => {
            el.remove();
            this.startGame();
        });
    }

    // ── Game lifecycle ───────────────────────────────────────

    startGame() {
        this.score    = 0;
        this.combo    = 1;
        this.timeLeft = GAME_DURATION;
        this.selected = null;
        this.busy     = false;
        this.grid     = createBoard();
        this._renderLayout();
        this._renderBoard();
        this._startTimer();
        this._resetHintTimer();
    }

    _startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this._updateTimerUI();
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.busy = true;
                this._clearHintTimer();
                setTimeout(() => this.showGameOver(), 400);
            }
        }, 1000);
    }

    // ── Layout ──────────────────────────────────────────────

    _renderLayout() {
        this.container.innerHTML = `
            <div class="glass-card">
                <div class="game-header">
                    <div class="game-title-area">
                        <span class="game-title-icon">💎</span>
                        <span class="game-title">MATCH 3</span>
                    </div>
                    <a href="../../index.html" class="home-btn">🏠 ホーム</a>
                </div>

                <div class="stats-bar">
                    <div class="stat-item">
                        <div class="stat-label">スコア</div>
                        <div class="stat-value accent" id="stat-score">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">ベスト</div>
                        <div class="stat-value primary" id="stat-best">${this.best.toLocaleString()}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">残り時間</div>
                        <div class="stat-value success" id="stat-time">${GAME_DURATION}</div>
                    </div>
                </div>

                <div class="timer-track">
                    <div class="timer-fill" id="timer-fill" style="width:100%"></div>
                </div>

                <div class="combo-display" id="combo-display"></div>

                <div class="board-wrapper">
                    <div class="board" id="board"></div>
                </div>

                <div class="btn-row">
                    <button class="btn btn-secondary" id="hint-btn">💡 ヒント</button>
                    <button class="btn btn-primary"   id="reset-btn">🔄 リスタート</button>
                </div>
                <p class="hint-text">ジェムをタップして選択 → 隣のジェムと入れ替え</p>
            </div>`;

        this._el = {
            score:     document.getElementById('stat-score'),
            best:      document.getElementById('stat-best'),
            time:      document.getElementById('stat-time'),
            timerFill: document.getElementById('timer-fill'),
            combo:     document.getElementById('combo-display'),
            board:     document.getElementById('board'),
        };

        document.getElementById('hint-btn').addEventListener('click', () => this._showHint());
        document.getElementById('reset-btn').addEventListener('click', () => {
            clearInterval(this.timerInterval);
            this._clearHintTimer();
            this.startGame();
        });
    }

    // ── Board rendering ──────────────────────────────────────

    _renderBoard() {
        const boardEl = this._el.board;
        boardEl.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const gem = this.grid[r][c];
                const el  = this._createGemEl(gem, r, c);
                boardEl.appendChild(el);
            }
        }
    }

    _createGemEl(gem, r, c) {
        const el = document.createElement('div');
        el.className = 'gem';
        el.dataset.r     = r;
        el.dataset.c     = c;
        el.dataset.color = gem.color;
        el.dataset.id    = gem.id;

        if (gem.special) {
            el.classList.add(`special-${gem.special}`);
            el.dataset.icon = GEM_ICONS[gem.special] || '';
        }

        el.addEventListener('click', () => this._onGemClick(r, c));
        return el;
    }

    _gemEl(r, c) {
        return this._el.board.querySelector(`.gem[data-r="${r}"][data-c="${c}"]`);
    }

    _updateGemEl(r, c) {
        const old = this._gemEl(r, c);
        if (!old) return;
        const gem = this.grid[r][c];
        const el  = this._createGemEl(gem, r, c);
        old.replaceWith(el);
        return el;
    }

    // ── Timer UI ─────────────────────────────────────────────

    _updateTimerUI() {
        const el   = this._el.time;
        const fill = this._el.timerFill;
        if (!el) return;
        el.textContent = this.timeLeft;
        const pct = (this.timeLeft / GAME_DURATION) * 100;
        fill.style.width = `${pct}%`;
        if (this.timeLeft <= 20) fill.classList.add('warning');
        // Pulse when low
        if (this.timeLeft <= 10) {
            el.style.color = '#ef4444';
            el.style.animation = 'none';
            void el.offsetWidth;
            el.style.animation = 'combo-bounce 0.4s ease';
        }
    }

    // ── Score UI ─────────────────────────────────────────────

    _addScore(pts, r, c) {
        this.score += pts;
        this._el.score.textContent = this.score.toLocaleString();
        if (this.score > this.best) {
            this.best = this.score;
            this._el.best.textContent = this.best.toLocaleString();
            localStorage.setItem('match3_best', this.best);
        }

        // Float popup
        const gemEl = this._gemEl(r, c);
        if (gemEl) {
            const rect = gemEl.getBoundingClientRect();
            const popup = document.createElement('div');
            popup.className = 'score-popup';
            popup.textContent = `+${pts}`;
            popup.style.left = `${rect.left + rect.width / 2 - 20}px`;
            popup.style.top  = `${rect.top + window.scrollY}px`;
            document.body.appendChild(popup);
            popup.addEventListener('animationend', () => popup.remove());
        }
    }

    _showCombo() {
        const el = this._el.combo;
        if (this.combo <= 1) { el.innerHTML = ''; return; }
        el.innerHTML = `<span class="combo-text">🔥 COMBO ×${this.combo}!</span>`;
    }

    // ── Input handling ───────────────────────────────────────

    _onGemClick(r, c) {
        if (this.busy) return;
        this._resetHintTimer();
        this.lastInteract = Date.now();

        if (!this.selected) {
            // First selection
            this.selected = [r, c];
            this._gemEl(r, c)?.classList.add('selected');
            return;
        }

        const [sr, sc] = this.selected;

        // Deselect if same gem
        if (sr === r && sc === c) {
            this._gemEl(r, c)?.classList.remove('selected');
            this.selected = null;
            return;
        }

        // If adjacent, try swap
        const dr = Math.abs(r - sr), dc = Math.abs(c - sc);
        if (dr + dc === 1) {
            this._gemEl(sr, sc)?.classList.remove('selected');
            this.selected = null;
            this._trySwap(sr, sc, r, c);
        } else {
            // Re-select
            this._gemEl(sr, sc)?.classList.remove('selected');
            this.selected = [r, c];
            this._gemEl(r, c)?.classList.add('selected');
        }
    }

    async _trySwap(r1, c1, r2, c2) {
        this.busy = true;

        swapGems(this.grid, r1, c1, r2, c2);
        const { allMatched } = findMatches(this.grid);

        if (allMatched.size === 0) {
            // No match — swap back with animation
            swapGems(this.grid, r1, c1, r2, c2);
            // Brief shake
            const e1 = this._gemEl(r1, c1);
            const e2 = this._gemEl(r2, c2);
            [e1, e2].forEach(e => {
                if (!e) return;
                e.style.transition = 'transform 0.08s ease';
                e.style.transform  = 'scale(0.85)';
                setTimeout(() => { e.style.transform = ''; e.style.transition = ''; }, 180);
            });
            this.combo = 1;
            this._showCombo();
            this.busy = false;
            return;
        }

        this.combo = 1;
        await this._processMatches();
        this.combo = 1;
        this._showCombo();
        this.busy = false;
    }

    // ── Match processing loop ────────────────────────────────

    async _processMatches() {
        while (true) {
            const { allMatched, matchGroups } = findMatches(this.grid);
            if (allMatched.size === 0) break;

            // Collect specials to place (center of each 4+/5+ match)
            const specialToPlace = new Map();
            let totalScore = 0;

            for (const g of matchGroups) {
                const pts = scoreGroup(g.cells.length, this.combo);
                totalScore += pts;

                if (g.special !== SPECIAL.NONE) {
                    // Place special at center of the match
                    const mid = Math.floor(g.cells.length / 2);
                    const [cr, cc] = g.cells[mid];
                    const key = `${cr},${cc}`;
                    specialToPlace.set(key, { color: g.cells[0] ? this.grid[g.cells[0][0]][g.cells[0][1]].color : 'red', special: g.special });
                }
            }

            // Expand specials
            const toRemove = expandSpecials(this.grid, allMatched);

            // Animate matched gems
            toRemove.forEach(([r, c]) => {
                this._gemEl(r, c)?.classList.add('matched');
            });

            // Add score at center of board
            const centerR = Math.floor(ROWS / 2);
            const centerC = Math.floor(COLS / 2);
            this._addScore(totalScore, centerR, centerC);
            this._showCombo();

            await this._wait(ANIM_MATCH_MS);

            // Collapse board
            collapseAndFill(this.grid, toRemove, specialToPlace);
            this._renderBoard();

            // Animate new gems falling in
            // (new gems at top rows)
            const topGems = [];
            for (let c = 0; c < COLS; c++) {
                for (let r = 0; r < 4; r++) {
                    const el = this._gemEl(r, c);
                    if (el) el.classList.add('falling');
                }
            }

            await this._wait(ANIM_FALL_MS);

            // Remove fall animation classes
            this._el.board.querySelectorAll('.falling').forEach(e => e.classList.remove('falling'));

            this.combo++;
            await this._wait(CHAIN_DELAY_MS);

            // Shuffle if no moves
            if (!hasValidMove(this.grid)) {
                this._shuffleBoard();
            }
        }
    }

    _shuffleBoard() {
        // Flat shuffle of colors
        const colors = [];
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                colors.push(this.grid[r][c].color);
        for (let i = colors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colors[i], colors[j]] = [colors[j], colors[i]];
        }
        let idx = 0;
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                this.grid[r][c] = { color: colors[idx++], special: null, id: this.grid[r][c].id };
        this._renderBoard();
    }

    // ── Hint ─────────────────────────────────────────────────

    _showHint() {
        if (this.busy) return;
        const hint = findHint(this.grid);
        if (!hint) return;
        const [[r1, c1], [r2, c2]] = hint;
        this._gemEl(r1, c1)?.classList.add('hint');
        this._gemEl(r2, c2)?.classList.add('hint');
        setTimeout(() => {
            this._gemEl(r1, c1)?.classList.remove('hint');
            this._gemEl(r2, c2)?.classList.remove('hint');
        }, 1600);
    }

    _resetHintTimer() {
        this._clearHintTimer();
        this.hintTimeout = setTimeout(() => {
            if (!this.busy) this._showHint();
        }, HINT_IDLE_MS);
    }

    _clearHintTimer() {
        clearTimeout(this.hintTimeout);
        this.hintTimeout = null;
    }

    // ── Utilities ────────────────────────────────────────────

    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
