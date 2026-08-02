import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class TitleScene {
    async enter() {
        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="title-scene">
                <div class="glass-card title-card">
                    <div class="title-header">
                        <span class="title-icon">🔢</span>
                        <h1>MINI SUDOKU</h1>
                        <span class="subtitle">ナンプレ / 数独</span>
                    </div>

                    <p class="description">
                        縦・横・3x3のブロックに1から9までの数字を重ならないように配置するロジックパズル！
                    </p>

                    <div class="title-actions">
                        <button id="start-btn" class="btn btn-primary btn-large">
                            🎮 ゲームスタート
                        </button>
                        <button id="howto-btn" class="btn btn-secondary">
                            📖 遊び方
                        </button>
                    </div>
                </div>

                <!-- 遊び方モーダル -->
                <div id="howto-modal" class="modal hidden">
                    <div class="modal-content glass-card">
                        <h2>📖 ルールと遊び方</h2>
                        <ul class="howto-list">
                            <li><strong>基本ルール:</strong> 空いているマスに1〜9の数字を入れます。</li>
                            <li><strong>重複禁止:</strong> 同じ「行」「列」「3×3ブロック」の中で数字が重複してはいけません。</li>
                            <li><strong>メモ機能 (✏️):</strong> 候補となる複数の数字を小さなメモとしてマスに残せます。</li>
                            <li><strong>ハイライト機能:</strong> 選択したマスと同じ数字や、同一の行・列・ブロックが強調表示されます。</li>
                        </ul>
                        <button id="close-howto-btn" class="btn btn-primary" style="margin-top: 15px; width: 100%;">
                            閉じる
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('start-btn').addEventListener('click', () => {
            soundManager.playOk();
            sceneManager.switchScene('DifficultySelect');
        });

        const modal = document.getElementById('howto-modal');
        document.getElementById('howto-btn').addEventListener('click', () => {
            soundManager.playSelect();
            modal.classList.remove('hidden');
        });

        document.getElementById('close-howto-btn').addEventListener('click', () => {
            soundManager.playClick();
            modal.classList.add('hidden');
        });
    }

    async exit() {}
    update(deltaTime) {}
}
