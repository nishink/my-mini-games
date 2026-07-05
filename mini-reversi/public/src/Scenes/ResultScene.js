import { sceneManager } from '../Core/SceneManager.js';

export class ResultScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }
    async enter(data) {
        this.container.innerHTML = `
            <div class="scene">
                <h2>Result</h2>
                <p>${data.winner} Wins!</p>
                <p>Black: ${data.black}, White: ${data.white}</p>
                <button id="back-btn">Back to Title</button>
            </div>
        `;
        document.getElementById('back-btn').onclick = () => {
            sceneManager.switchScene('Title');
        };
    }
    update(dt) {}
    exit() {}
}
