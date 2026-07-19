import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class TitleScene {
    constructor() {
        this.container = document.getElementById('scene-container');
    }

    async enter() {
        this.container.innerHTML = `
            <div class="scene title-scene">
                <div class="title-logo">🃏</div>
                <h1>MINI SOLITAIRE</h1>
                <p class="subtitle">クロンダイク・ソリティア</p>
                <div class="menu-buttons">
                    <button id="start-btn" class="btn btn-primary">🃏 ゲームスタート</button>
                </div>
                <div class="how-to-play">
                    <h3>ルールと操作:</h3>
                    <ul>
                        <li>組札（右上）にすべてのマークのカードをAからKの順に重ねるゲームです。</li>
                        <li><b>場札（下部）</b>: カードを「赤と黒交互」「数字が1減る」ように重ねられます。</li>
                        <li><b>山札（左上）</b>: クリックするとカードが1枚めくられ、捨て札に置かれます。</li>
                        <li><b>操作方法</b>: 移動させたいカードを選択し（ハイライトされます）、次に移動先をクリックします。</li>
                        <li>場札の裏向きの一番上のカードをクリックすると表向きにできます。</li>
                        <li>場札の空の列には<b>K (キング)</b>のみ置くことができます。</li>
                    </ul>
                </div>
            </div>
        `;

        document.getElementById('start-btn').onclick = () => {
            soundManager.playShuffle();
            sceneManager.switchScene('Game');
        };
    }

    update(dt) {}
    exit() {}
}
