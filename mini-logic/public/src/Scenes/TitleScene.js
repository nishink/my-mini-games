import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class TitleScene {
    async enter() {
        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="title-scene">
                <div class="glass-card title-card">
                    <div class="title-header">
                        <span class="title-icon">🧩</span>
                        <h1>MINI LOGIC</h1>
                        <span class="subtitle">お絵かきロジック / ピクロス</span>
                    </div>

                    <p class="description">
                        数字のヒントを手がかりにマスを塗り、隠されたドット絵イラストを解き明かそう！
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
                        <h2>📖 遊び方 (How to Play)</h2>
                        <ul class="howto-list">
                            <li><strong>数字のルール:</strong> 行や列の数字は、その列で「連続して塗るマスの数」を示しています。</li>
                            <li><strong>複数数字:</strong> 「2 3」とある場合は、2マス連続で塗った後、1マス以上空けて3マス塗ります。</li>
                            <li><strong>操作モード:</strong> 「塗り（⛏️）」と「バツ（❌）」を切り替えて操作します。</li>
                            <li><strong>ドラッグ機能:</strong> マウスやタッチを押しながら動かすと、一気に塗ったりバツを付けたりできます。</li>
                            <li><strong>右クリック:</strong> 右クリックで即座にバツ印をつけられます。</li>
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
            sceneManager.switchScene('StageSelect');
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
