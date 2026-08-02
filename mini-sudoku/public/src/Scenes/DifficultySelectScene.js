import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { DIFFICULTY_LEVELS, SUDOKU_PUZZLES } from '../Data/SudokuPuzzles.js';

export class DifficultySelectScene {
    constructor() {
        this.selectedDiff = 'easy';
    }

    async enter(data = {}) {
        if (data.difficulty) {
            this.selectedDiff = data.difficulty;
        }

        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="stage-select-scene">
                <header class="scene-header">
                    <button id="back-btn" class="btn btn-secondary">
                        ⬅️ タイトルへ
                    </button>
                    <h2>難易度選択</h2>
                    <div style="width: 80px;"></div>
                </header>

                <div class="category-tabs">
                    ${DIFFICULTY_LEVELS.map(level => `
                        <button class="tab-btn ${level.key === this.selectedDiff ? 'active' : ''}" data-diff="${level.key}">
                            ${level.icon} ${level.label}
                        </button>
                    `).join('')}
                </div>

                <div class="stages-grid" id="stages-container">
                    <!-- Dynamic puzzles -->
                </div>
            </div>
        `;

        document.getElementById('back-btn').addEventListener('click', () => {
            soundManager.playCancel();
            sceneManager.switchScene('Title');
        });

        const tabs = container.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const diff = e.currentTarget.getAttribute('data-diff');
                if (diff !== this.selectedDiff) {
                    soundManager.playSelect();
                    this.selectedDiff = diff;
                    tabs.forEach(t => t.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.renderPuzzles();
                }
            });
        });

        this.renderPuzzles();
    }

    renderPuzzles() {
        const grid = document.getElementById('stages-container');
        const puzzles = SUDOKU_PUZZLES[this.selectedDiff] || [];
        const records = this.getRecords();

        grid.innerHTML = puzzles.map((p, index) => {
            const rec = records[p.id];
            const isCleared = !!rec;
            const timeText = isCleared ? `${Math.floor(rec.time / 60)}:${('0' + (rec.time % 60)).slice(-2)}` : '--:--';
            const stars = isCleared ? '⭐'.repeat(rec.stars) : '☆☆☆';

            return `
                <div class="stage-card glass-card ${isCleared ? 'cleared' : ''}" data-id="${p.id}">
                    <div class="stage-badge">${index + 1}</div>
                    <div class="stage-icon">🧩</div>
                    <h3 class="stage-title">${p.title}</h3>
                    <div class="stage-info">
                        <span class="stars">${stars}</span>
                        <span class="best-time">⏱️ ${timeText}</span>
                    </div>
                    <button class="btn btn-primary stage-play-btn">
                        ${isCleared ? 'もう一度プレイ' : '挑戦する'}
                    </button>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.stage-card').forEach(card => {
            card.addEventListener('click', () => {
                const puzzleId = card.getAttribute('data-id');
                const puzzle = puzzles.find(p => p.id === puzzleId);
                if (puzzle) {
                    soundManager.playOk();
                    sceneManager.switchScene('Game', { puzzle, difficulty: this.selectedDiff });
                }
            });
        });
    }

    getRecords() {
        try {
            return JSON.parse(localStorage.getItem('mini_sudoku_records') || '{}');
        } catch {
            return {};
        }
    }

    async exit() {}
    update(deltaTime) {}
}
