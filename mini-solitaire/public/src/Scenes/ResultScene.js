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
            soundManager.playLose();
        }

        const titleText = data.status === 'win' ? '🎉 クリア！' : 'ゲーム終了';
        const statsHtml = data.status === 'win' 
            ? `<div class="score-item"><span>クリアタイム:</span><span class="score-value">${data.time} 秒</span></div>`
            : `<div class="score-item"><span>組札に入れた枚数:</span><span class="score-value">${data.foundationCount} / 52 枚</span></div>`;

        this.container.innerHTML = `
            <div class="scene result-scene">
                <h2>結果発表</h2>
                <div class="winner-banner win">${titleText}</div>
                
                <div class="score-board">
                    ${statsHtml}
                    <div class="score-item">
                        <span>移動回数:</span>
                        <span class="score-value">${data.moves} 回</span>
                    </div>
                </div>

                <div class="result-buttons">
                    <button id="retry-btn" class="btn btn-primary">もう一度遊ぶ</button>
                    <button id="title-btn" class="btn btn-secondary">タイトルへ戻る</button>
                </div>
            </div>
        `;

        document.getElementById('retry-btn').onclick = () => {
            soundManager.playShuffle();
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
