import { SaveManager } from '../Core/SaveManager.js';
import { sceneManager } from '../Core/SceneManager.js';
import { selectionManager } from '../Systems/SelectionManager.js';

export class TitleScene {
    constructor() {
        this.container = null;
    }

    async enter(container) {
        this.container = container;
        const view = document.createElement('div');
        view.id = 'title-scene';
        view.className = 'scene';
        view.innerHTML = `
            <div class="title-content">
                <h1 class="game-title">Mini RPG Saga</h1>
                <p class="game-subtitle">〜勇者と魔王の叙事詩〜</p>
                <div class="title-menu">
                    <button id="start-btn" class="menu-btn">冒険を始める</button>
                    <button id="load-btn" class="menu-btn ${!SaveManager.exists() ? 'disabled' : ''}" ${!SaveManager.exists() ? 'disabled' : ''}>つづきから</button>
                    <button id="clear-btn" class="menu-btn ${!SaveManager.exists() ? 'disabled' : ''}" ${!SaveManager.exists() ? 'disabled' : ''}>データを消去</button>
                </div>
            </div>
        `;
        container.appendChild(view);

        selectionManager.init(this.container);

        view.querySelector('#start-btn').onclick = () => {
            SaveManager.clear();
            sceneManager.switchScene('Town');
        };

        view.querySelector('#load-btn').onclick = () => {
            if (SaveManager.load()) {
                sceneManager.switchScene('Town');
            }
        };

        view.querySelector('#clear-btn').onclick = async () => {
            const confirmed = await selectionManager.confirm('本当にセーブデータを消去しますか？');
            if (confirmed) {
                SaveManager.clear();
                location.reload();
            }
        };
    }

    async exit() {
        this.container.innerHTML = '';
    }
}
