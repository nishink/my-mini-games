import { sceneManager } from '../Core/SceneManager.js';

export class ResultScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }
    
    async enter(data) {
        let winMessage = "";
        if (data.winner === 'draw') {
            winMessage = "引き分け！";
        } else if (data.mode === 'pva') {
            winMessage = data.winner === 'player' ? "あなたの勝ち！" : "AIの勝ち！";
        } else {
            winMessage = data.winner === 'sente' ? "先手 (Sente) の勝ち！" : "後手 (Gote) の勝ち！";
        }

        this.container.innerHTML = `
            <div class="scene result-scene">
                <h2>対局結果</h2>
                <h1 class="winner-message">${winMessage}</h1>
                <p class="result-details">${data.reason || ''}</p>
                <div class="button-container">
                    <button id="back-btn">タイトルへ戻る</button>
                </div>
            </div>
        `;

        document.getElementById('back-btn').onclick = () => {
            sceneManager.switchScene('Title');
        };
    }

    update(dt) {}
    exit() {}
}
