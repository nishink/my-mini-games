import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';

export class CastleScene {
    constructor() {
        this.inputDelay = 0;
    }

    async enter(container) {
        this.container = container;
        this.render();
        dialogueManager.init(this.container);
        
        this.inputDelay = 500;
        await dialogueManager.show('王国の兵士', ['止まれ！ここから先は王都グランデだ。', 'おお、それは「試練の証」！', 'これを持つ者こそ、我らが待ち望んだ勇者だ。', 'さあ、中へお入りください！']);
    }

    render() {
        this.container.innerHTML = `
            <div id="game-ui" class="castle-ui">
                <div class="scene-header">
                    <h2>王都グランデ</h2>
                    <div class="player-brief">${state.player.name} Lv.${state.player.level}</div>
                </div>
                <div id="map-view">
                    <div class="castle-gate">🏰</div>
                    <div class="construction-msg">王都の内部は現在建設中です...<br>（第5段階で実装予定）</div>
                </div>
                <div class="actions">
                    <button id="back-btn" class="menu-btn">ワールドマップへ</button>
                </div>
            </div>
        `;

        this.container.querySelector('#back-btn').onclick = () => {
            sceneManager.switchScene('WorldMap');
        };
    }

    update(deltaTime) {
        if (this.inputDelay > 0) {
            this.inputDelay -= deltaTime;
        }

        if (dialogueManager.isActive) {
            if (this.inputDelay <= 0 && (input.isPressed(' ') || input.isPressed('Enter'))) {
                dialogueManager.next();
                this.inputDelay = 300;
            }
            return;
        }
    }

    async exit() {
        console.log('Exiting Castle Scene');
    }
}
