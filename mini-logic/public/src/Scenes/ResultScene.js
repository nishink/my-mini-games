import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { PUZZLES } from '../Data/Puzzles.js';

export class ResultScene {
    async enter(data = {}) {
        const { puzzle, category, time, stars } = data;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const formattedTime = `${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;
        const size = puzzle.solution.length;

        // Find next puzzle if available
        const puzzles = PUZZLES[category] || [];
        const currentIdx = puzzles.findIndex(p => p.id === puzzle.id);
        const nextPuzzle = (currentIdx >= 0 && currentIdx < puzzles.length - 1) ? puzzles[currentIdx + 1] : null;

        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="result-scene">
                <div class="glass-card result-card">
                    <h2 class="result-title">🎉 CLEAR! 🎉</h2>
                    <h3 class="puzzle-name">${puzzle.icon} ${puzzle.title}</h3>

                    <!-- Complete Pixel Art Preview -->
                    <div class="pixel-art-preview-wrapper">
                        <div class="pixel-art-grid" style="grid-template-columns: repeat(${size}, 1fr);">
                            ${puzzle.solution.map((row, r) => 
                                row.map((val, c) => `
                                    <div class="pixel-cell ${val === 1 ? 'active' : ''}" style="${val === 1 ? `background-color: ${puzzle.color};` : ''}"></div>
                                `).join('')
                            ).join('')}
                        </div>
                    </div>

                    <div class="result-stats">
                        <div class="stat-box">
                            <span class="stat-label">クリアタイム</span>
                            <span class="stat-value">⏱️ ${formattedTime}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">評価</span>
                            <span class="stat-value stars">${'⭐'.repeat(stars)}</span>
                        </div>
                    </div>

                    <div class="result-actions">
                        ${nextPuzzle ? `
                            <button id="next-btn" class="btn btn-primary btn-large">
                                次のステージへ ➡️
                            </button>
                        ` : ''}
                        <button id="retry-btn" class="btn btn-secondary">
                            🔄 もう一度遊ぶ
                        </button>
                        <button id="select-btn" class="btn btn-secondary">
                            📋 ステージ選択へ
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (nextPuzzle) {
            document.getElementById('next-btn').addEventListener('click', () => {
                soundManager.playOk();
                sceneManager.switchScene('Game', { puzzle: nextPuzzle, category });
            });
        }

        document.getElementById('retry-btn').addEventListener('click', () => {
            soundManager.playOk();
            sceneManager.switchScene('Game', { puzzle, category });
        });

        document.getElementById('select-btn').addEventListener('click', () => {
            soundManager.playCancel();
            sceneManager.switchScene('StageSelect', { category });
        });
    }

    async exit() {}
    update(deltaTime) {}
}
