import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class TitleScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter() {
        this.container.innerHTML = `
            <div class="scene title-scene">
                <div class="title-logo">💣</div>
                <h1>MINI MINES</h1>
                <p class="subtitle">王道のマインスパイーパーパズル</p>
                <div class="menu-buttons">
                    <button id="start-btn" class="btn btn-primary">⛏️ ゲームスタート</button>
                </div>
                <div class="how-to-play">
                    <h3>遊び方:</h3>
                    <ul>
                        <li>9x9のマスから10個の地雷を避けてすべての安全なマスを開けます。</li>
                        <li>下部のモード切り替えボタンで「掘る（⛏️）」と「旗を置く（🚩）」を切り替えます。</li>
                        <li>数字は、そのマスの周囲8マスにある地雷の数を示しています。</li>
                        <li><b>ショートカットキー</b>: スペースキーまたは [F] キーで掘る/旗立てモードを切り替えられます。</li>
                        <li>最初の1マス目は、必ず地雷のない安全なマスが開きます。</li>
                    </ul>
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
