import { sceneManager } from '../Core/SceneManager.js';
import { state } from '../Core/GlobalState.js';

export class TitleScene {
    constructor() {
        this.container = null;
    }

    async enter(container) {
        this.container = container;
        state.reset();
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div id="title-scene" class="battle-ui">
                <div class="title-content" style="text-align: center; margin-top: 100px;">
                    <h1 style="font-size: 3rem; color: var(--accent);">MINI DECK</h1>
                    <p style="color: var(--text-muted); font-style: italic;">デッキ構築型カードバトル</p>
                    <button id="start-btn" class="end-turn-btn" style="position: static; margin-top: 50px; font-size: 1.2rem;">冒険を始める</button>
                </div>
            </div>
        `;

        this.container.querySelector('#start-btn').onclick = () => {
            sceneManager.switchScene('Battle');
        };
    }

    async exit() {
        this.container.innerHTML = '';
    }
}
