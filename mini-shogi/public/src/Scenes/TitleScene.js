import { sceneManager } from '../Core/SceneManager.js';

export class TitleScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter() {
        this.container.innerHTML = `
            <div class="scene title-scene">
                <h1>MINI SHOGI</h1>
                <p class="subtitle">5x5マスのミニ将棋（5五将棋）</p>
                <div class="button-container">
                    <button id="pvp-btn">Player vs Player</button>
                    <button id="pva-btn">Player vs AI</button>
                </div>
            </div>
        `;

        document.getElementById('pvp-btn').onclick = () => {
            sceneManager.switchScene('Game', { mode: 'pvp' });
        };
        document.getElementById('pva-btn').onclick = () => {
            sceneManager.switchScene('Game', { mode: 'pva' });
        };
    }

    update(dt) {}
    exit() {}
}
