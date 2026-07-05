export class TitleScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter() {
        this.container.innerHTML = `
            <div class="scene title-scene">
                <h1>MINI REVERSI</h1>
                <button id="pvp-btn">Player vs Player</button>
                <button id="pva-btn">Player vs AI</button>
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

import { sceneManager } from '../Core/SceneManager.js';
