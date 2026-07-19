import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class TitleScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter() {
        this.container.innerHTML = `
            <div class="scene title-scene">
                <div class="title-logo">🛑</div>
                <h1>MINI HEX</h1>
                <p class="subtitle">六角形タイルの領土拡大バトル</p>
                <div class="menu-buttons">
                    <button id="pva-btn" class="btn btn-primary">🆚 vs AI</button>
                    <button id="pvp-btn" class="btn btn-secondary">👥 ローカル対戦</button>
                </div>
                <div class="how-to-play">
                    <h3>遊び方:</h3>
                    <ul>
                        <li>自分の駒を選択し、移動先を選びます。</li>
                        <li><b>距離1 (隣接)</b>: 駒が複製されて増えます。</li>
                        <li><b>距離2 (ジャンプ)</b>: 駒が飛び移ります。</li>
                        <li>移動後、移動先の隣の敵の駒がすべて自分の色に変わります。</li>
                        <li>盤面が埋まるか、お互い動けなくなった時点で、駒の多い方が勝ち！</li>
                    </ul>
                </div>
            </div>
        `;

        document.getElementById('pva-btn').onclick = () => {
            soundManager.playOk();
            sceneManager.switchScene('Game', { mode: 'pva' });
        };
        document.getElementById('pvp-btn').onclick = () => {
            soundManager.playOk();
            sceneManager.switchScene('Game', { mode: 'pvp' });
        };
    }

    update(dt) {}
    exit() {}
}
