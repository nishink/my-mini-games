import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { PUZZLE_SIZES, PUZZLES } from '../Data/Puzzles.js';

export class StageSelectScene {
    constructor() {
        this.selectedCategory = '5x5';
    }

    async enter(data = {}) {
        if (data.category) {
            this.selectedCategory = data.category;
        }

        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="stage-select-scene">
                <header class="scene-header">
                    <button id="back-btn" class="btn btn-secondary">
                        ⬅️ タイトルへ
                    </button>
                    <h2>ステージ選択</h2>
                    <div style="width: 100px;"></div>
                </header>

                <!-- サイズ切り替えタブ -->
                <div class="category-tabs">
                    ${PUZZLE_SIZES.map(cat => `
                        <button class="tab-btn ${cat.key === this.selectedCategory ? 'active' : ''}" data-cat="${cat.key}">
                            ${cat.label}
                        </button>
                    `).join('')}
                </div>

                <!-- ステージグリッド -->
                <div class="stages-grid" id="stages-container">
                    <!-- Dynamic rendering -->
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
                const cat = e.currentTarget.getAttribute('data-cat');
                if (cat !== this.selectedCategory) {
                    soundManager.playSelect();
                    this.selectedCategory = cat;
                    tabs.forEach(t => t.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.renderStages();
                }
            });
        });

        this.renderStages();
    }

    renderStages() {
        const grid = document.getElementById('stages-container');
        const puzzles = PUZZLES[this.selectedCategory] || [];
        const records = this.getRecords();

        grid.innerHTML = puzzles.map((puzzle, index) => {
            const rec = records[puzzle.id];
            const isCleared = !!rec;
            const timeText = isCleared ? `${Math.floor(rec.time / 60)}:${('0' + (rec.time % 60)).slice(-2)}` : '--:--';
            const stars = isCleared ? '⭐'.repeat(rec.stars) : '☆☆☆';

            return `
                <div class="stage-card glass-card ${isCleared ? 'cleared' : ''}" data-id="${puzzle.id}" data-index="${index}">
                    <div class="stage-badge">${index + 1}</div>
                    <div class="stage-icon">${isCleared ? puzzle.icon : '❓'}</div>
                    <h3 class="stage-title">${isCleared ? puzzle.title : `Stage ${index + 1}`}</h3>
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
            card.addEventListener('click', (e) => {
                const puzzleId = card.getAttribute('data-id');
                const puzzle = puzzles.find(p => p.id === puzzleId);
                if (puzzle) {
                    soundManager.playOk();
                    sceneManager.switchScene('Game', { puzzle, category: this.selectedCategory });
                }
            });
        });
    }

    getRecords() {
        try {
            return JSON.parse(localStorage.getItem('mini_logic_records') || '{}');
        } catch {
            return {};
        }
    }

    async exit() {}
    update(deltaTime) {}
}
