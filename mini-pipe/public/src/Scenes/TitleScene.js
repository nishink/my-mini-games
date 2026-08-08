import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class TitleScene {
    async enter() {
        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="title-scene">
                <div class="glass-card title-card">
                    <div class="title-header">
                        <span class="title-icon">🔧</span>
                        <h1>MINI PIPE</h1>
                        <span class="subtitle">パイプパズル</span>
                    </div>

                    <p class="description">
                        パイプを回転させて、💧 水源 から 🏁 ゴール まで水を届けよう！<br>
                        全てのパイプを繋いで100%を目指せ！
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
                        <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:12px;color:#38bdf8;">📖 ルールと遊び方</h2>
                        <ul class="howto-list">
                            <li><strong>💧 水源 (緑のセル):</strong> 水が出発するセルです。回転できません。</li>
                            <li><strong>🏁 ゴール (黄色のセル):</strong> 水を届けるターゲットです。</li>
                            <li><strong>クリックで回転:</strong> パイプをタップ/クリックして90°回転させましょう。</li>
                            <li><strong>繋げる:</strong> 隣接するセルの開口部が向かい合っていると接続されます。</li>
                            <li><strong>目標:</strong> 水源からゴールまで水が流れれば完成！全パイプを通せればパーフェクト！</li>
                        </ul>
                        <button id="close-howto-btn" class="btn btn-primary" style="margin-top: 12px; width: 100%;">
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
            soundManager.playClick();
            modal.classList.remove('hidden');
        });
        document.getElementById('close-howto-btn').addEventListener('click', () => {
            soundManager.playClick();
            modal.classList.add('hidden');
        });
    }

    async exit() {}
    update() {}
}
