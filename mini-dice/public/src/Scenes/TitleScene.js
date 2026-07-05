import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class TitleScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter() {
        this.container.innerHTML = `
            <div class="scene title-scene">
                <h1>MINI DICE RPG</h1>
                <p class="subtitle">ダイスを振って運命を切り開くすごろく冒険譚</p>
                <div class="button-container">
                    <button id="start-btn">冒険を始める</button>
                </div>
            </div>
        `;

        document.getElementById('start-btn').onclick = () => {
            soundManager.playOk();
            sceneManager.switchScene('Game');
        };
    }

    update(dt) {}
    exit() {}
}
