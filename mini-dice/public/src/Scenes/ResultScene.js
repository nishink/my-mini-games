import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class ResultScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter(data) {
        const isWin = data.status === 'win';
        const titleText = isWin ? '👑 GAME CLEAR!' : '💀 GAME OVER...';
        const msgText = isWin ? '魔王を討伐し、世界に平和が戻りました！' : '力尽きてしまいました。ふたたび挑戦しましょう。';
        const details = `最終到達: Lv.${data.level} | 装備: ${data.weapon} / ${data.armor} | 所持金: ${data.gold}G`;

        this.container.innerHTML = `
            <div class="scene result-scene">
                <h2 class="${isWin ? 'win' : 'lose'}">${titleText}</h2>
                <p class="result-message">${msgText}</p>
                <p class="result-details">${details}</p>
                <div class="button-container">
                    <button id="restart-btn">${isWin ? 'もう一度遊ぶ' : 'リトライする'}</button>
                </div>
            </div>
        `;

        document.getElementById('restart-btn').onclick = () => {
            soundManager.playOk();
            sceneManager.switchScene('Title');
        };
    }

    update(dt) {}
    exit() {}
}
