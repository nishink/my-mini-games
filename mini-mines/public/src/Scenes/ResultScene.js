import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class ResultScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter(data) {
        if (data.status === 'win') {
            soundManager.playWin();
        } else {
            // 敗北時はGameSceneで大爆発音を鳴らしているので、ここでは低めのジングル
            soundManager.playLose();
        }

        const titleText = data.status === 'win' ? '🎉 ミッションクリア！' : '💥 ゲームオーバー...';
        const timerText = `${data.time} 秒`;

        this.container.innerHTML = `
            <div class="scene result-scene">
                <h2>結果発表</h2>
                <div class="winner-banner ${data.status}">${titleText}</div>
                
                <div class="score-board">
                    <div class="score-item">
                        <span>クリアタイム:</span>
                        <span class="score-value">${timerText}</span>
                    </div>
                    <div class="score-item">
                        <span>開けたマス:</span>
                        <span class="score-value">${data.openedCells} / 71</span>
                    </div>
                </div>

                <div class="result-buttons">
                    <button id="retry-btn" class="btn btn-primary">もう一度挑戦</button>
                    <button id="title-btn" class="btn btn-secondary">タイトルへ戻る</button>
                </div>
            </div>
        `;

        document.getElementById('retry-btn').onclick = () => {
            soundManager.playOk();
            sceneManager.switchScene('Game');
        };
        document.getElementById('title-btn').onclick = () => {
            soundManager.playCancel();
            sceneManager.switchScene('Title');
        };
    }

    update(dt) {}
    exit() {}
}
