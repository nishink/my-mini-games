import { SaveManager } from '../Core/SaveManager.js';
import { sceneManager } from '../Core/SceneManager.js';
import { state } from '../Core/GlobalState.js';
import { dialogManager } from '../Systems/DialogManager.js';

export class TitleScene {
    async enter(container) {
        this.container = container;
        const view = document.createElement('div');
        view.id = 'title-scene';
        view.innerHTML = `
            <div class="title-content">
                <h1>MINI RPG SAGA</h1>
                <p class="subtitle">小さな部品たちが紡ぐ、一つの冒険譚</p>
                <div class="menu-options">
                    <button id="new-game-btn" class="menu-btn">はじめから</button>
                    <button id="continue-btn" class="menu-btn" ${SaveManager.exists() ? '' : 'disabled'}>つづきから</button>
                </div>
            </div>
        `;
        container.appendChild(view);

        // ダイアログの初期化（タイトル画面でも使用するため）
        dialogManager.init(container);

        document.getElementById('new-game-btn').onclick = () => this.startNewGame();
        document.getElementById('continue-btn').onclick = () => this.continueGame();
    }

    async startNewGame() {
        if (SaveManager.exists()) {
            const confirmed = await dialogManager.confirm('既存のセーブデータが上書きされます。よろしいですか？');
            if (!confirmed) return;
        }
        state.reset();
        SaveManager.save();
        sceneManager.switchScene('Town');
    }

    continueGame() {
        if (SaveManager.load()) {
            sceneManager.switchScene('Town');
        }
    }

    async exit() {
        console.log('Exiting Title Scene');
    }
}
