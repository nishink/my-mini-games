import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { SUDOKU_PUZZLES } from '../Data/SudokuPuzzles.js';

export class ResultScene {
    async enter(data = {}) {
        const { puzzle, difficulty, time, mistakes, stars } = data;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const formattedTime = `${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;

        const puzzles = SUDOKU_PUZZLES[difficulty] || [];
        const currentIdx = puzzles.findIndex(p => p.id === puzzle.id);
        const nextPuzzle = (currentIdx >= 0 && currentIdx < puzzles.length - 1) ? puzzles[currentIdx + 1] : null;

        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="result-scene">
                <div class="glass-card result-card">
                    <h2 class="result-title">🎉 CLEAR! 🎉</h2>
                    <h3 class="puzzle-name">🧩 ${puzzle.title}</h3>

                    <div class="result-stats">
                        <div class="stat-box">
                            <span class="stat-label">クリアタイム</span>
                            <span class="stat-value">⏱️ ${formattedTime}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">ミス回数</span>
                            <span class="stat-value">⚠️ ${mistakes} 回</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">評価</span>
                            <span class="stat-value stars">${'⭐'.repeat(stars)}</span>
                        </div>
                    </div>

                    <div class="result-actions">
                        ${nextPuzzle ? `
                            <button id="next-btn" class="btn btn-primary btn-large">
                                次のパズルへ ➡️
                            </button>
                        ` : ''}
                        <button id="retry-btn" class="btn btn-secondary">
                            🔄 もう一度解く
                        </button>
                        <button id="select-btn" class="btn btn-secondary">
                            📋 難易度選択へ
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (nextPuzzle) {
            document.getElementById('next-btn').addEventListener('click', () => {
                soundManager.playOk();
                sceneManager.switchScene('Game', { puzzle: nextPuzzle, difficulty });
            });
        }

        document.getElementById('retry-btn').addEventListener('click', () => {
            soundManager.playOk();
            sceneManager.switchScene('Game', { puzzle, difficulty });
        });

        document.getElementById('select-btn').addEventListener('click', () => {
            soundManager.playCancel();
            sceneManager.switchScene('DifficultySelect', { difficulty });
        });
    }

    async exit() {}
    update(deltaTime) {}
}
