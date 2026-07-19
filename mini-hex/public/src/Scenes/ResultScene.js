import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class ResultScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter(data) {
        const isAIWinner = data.winner === 'AI';
        const isPlayerWinner = data.winner === 'Player 1' || data.winner === 'Player';
        
        // BGM的なジングルを再生
        if (data.mode === 'pva') {
            if (isPlayerWinner) {
                soundManager.playWin();
            } else {
                soundManager.playLose();
            }
        } else {
            soundManager.playWin();
        }

        const winnerText = data.winner === 'Draw' ? '引き分け！' : `${data.winner} の勝利！`;

        this.container.innerHTML = `
            <div class="scene result-scene">
                <h2>対戦結果</h2>
                <div class="winner-banner">${winnerText}</div>
                <div class="score-board">
                    <div class="score-item player1">
                        <span class="color-dot blue"></span>
                        <span class="player-name">${data.mode === 'pva' ? 'プレイヤー' : 'プレイヤー 1'}</span>
                        <span class="score-value">${data.p1Score}</span>
                    </div>
                    <div class="score-item player2">
                        <span class="color-dot red"></span>
                        <span class="player-name">${data.mode === 'pva' ? 'AI' : 'プレイヤー 2'}</span>
                        <span class="score-value">${data.p2Score}</span>
                    </div>
                </div>
                <div class="result-buttons">
                    <button id="retry-btn" class="btn btn-primary">もう一度遊ぶ</button>
                    <button id="title-btn" class="btn btn-secondary">タイトルへ戻る</button>
                </div>
            </div>
        `;

        document.getElementById('retry-btn').onclick = () => {
            soundManager.playOk();
            sceneManager.switchScene('Game', { mode: data.mode });
        };
        document.getElementById('title-btn').onclick = () => {
            soundManager.playCancel();
            sceneManager.switchScene('Title');
        };
    }

    update(dt) {}
    exit() {}
}
