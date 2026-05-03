import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';
import { menuManager } from '../Systems/MenuManager.js';
import { notificationManager } from '../Systems/NotificationManager.js';
import { DungeonRenderer3D } from '../Systems/DungeonRenderer3D.js';

export class DemonKingCastleScene {
    constructor() {
        this.playerPos = { x: 7, y: 13 };
        this.playerDir = { x: 0, y: -1 };
        // 最終ダンジョン：複雑な迷路
        this.map = [
            [1,1,1,1,1,1,1,2,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
            [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
            [1,0,0,0,1,0,1,0,1,0,1,0,0,0,1],
            [1,0,1,0,0,0,1,0,1,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,1,1,1,1,1,1,1,0,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
        ];
        this.moveDelay = 0;
        this.stepsToEncounter = 5; // エンカウント率高め
        this.isEncountering = false;
    }

    async enter(container, data) {
        this.container = container;
        this.renderLayout();
        const canvas = this.container.querySelector('#dungeon-canvas');
        this.miniMapCanvas = this.container.querySelector('#mini-map-canvas');
        this.renderer = new DungeonRenderer3D(canvas);
        
        dialogueManager.init(this.container);
        menuManager.init(this.container);
        notificationManager.init(this.container);

        // 状態のリセット
        this.moveDelay = 0;
        this.isEncountering = false;
        dialogueManager.isActive = false;
        menuManager.isActive = false;

        if (!data || !data.fromBattle) {
            notificationManager.show('最終決戦：魔王城');
        }

        this.updateView();
    }

    renderLayout() {
        this.container.innerHTML = `
            <div id="game-ui" class="dungeon-ui demon-castle-ui">
                <div class="scene-header">
                    <h2>魔王城</h2>
                    <div class="player-brief">${state.player.name} HP:${state.player.currentHp}</div>
                </div>
                <div id="map-view" class="first-person-view">
                    <canvas id="dungeon-canvas" width="400" height="300"></canvas>
                    <div id="dungeon-compass">北</div>
                    <div id="mini-map-container"><canvas id="mini-map-canvas"></canvas></div>
                </div>
                <div id="virtual-controller">
                    <div class="d-pad">
                        <button class="v-btn" id="v-up">前進</button>
                        <div class="d-pad-mid">
                            <button class="v-btn" id="v-left">左向</button>
                            <button class="v-btn" id="v-right">右向</button>
                        </div>
                        <button class="v-btn" id="v-down">後退</button>
                    </div>
                    <div class="action-pad"><button class="v-btn action-btn" id="v-action">決定</button></div>
                </div>
                <div class="actions"><button id="v-menu" class="menu-btn">メニュー</button></div>
            </div>
        `;
        this.setupVirtualController();
    }

    setupVirtualController() {
        const bindBtn = (id, key) => {
            const btn = this.container.querySelector(`#${id}`);
            if (!btn) return;
            const start = (e) => { 
                e.preventDefault(); e.stopPropagation();
                input.setVirtualButton(key, true); 
            };
            const end = (e) => { e.preventDefault(); e.stopPropagation(); input.setVirtualButton(key, false); };
            btn.addEventListener('touchstart', start); btn.addEventListener('touchend', end);
            btn.addEventListener('mousedown', start); btn.addEventListener('mouseup', end);
        };
        ['up', 'down', 'left', 'right', 'action', 'menu'].forEach(k => bindBtn(`v-${k}`, k));
    }

    updateView() {
        if (!this.renderer) return;
        this.renderer.draw(this.playerPos, this.playerDir, this.map);
        this.renderer.drawMiniMap(this.miniMapCanvas, this.playerPos, this.playerDir, this.map);
    }

    update(deltaTime) {
        if (this.moveDelay > 0) { this.moveDelay -= deltaTime; return; }

        if (dialogueManager.isActive || menuManager.isActive || this.isEncountering) {
            if (dialogueManager.isActive && input.isPressed('action')) {
                dialogueManager.next();
                this.moveDelay = 300;
            }
            return;
        }

        if (input.isPressed('menu')) {
            menuManager.open();
            input.setVirtualButton('menu', false);
            this.moveDelay = 300;
            return;
        }

        const dir = input.direction;
        if (dir.y !== 0) {
            this.tryMove(this.playerDir.x * -dir.y, this.playerDir.y * -dir.y);
            this.moveDelay = 200;
        } else if (dir.x !== 0) {
            this.rotate(dir.x);
            this.moveDelay = 200;
        }
    }

    rotate(dir) {
        const { x, y } = this.playerDir;
        if (dir > 0) { this.playerDir.x = -y; this.playerDir.y = x; }
        else { this.playerDir.x = y; this.playerDir.y = -x; }
        this.updateView();
    }

    tryMove(dx, dy) {
        const nextX = this.playerPos.x + dx;
        const nextY = this.playerPos.y + dy;
        
        if (nextY >= this.map.length) {
            sceneManager.switchScene('WorldMap');
            return;
        }

        if (nextY >= 0 && nextY < this.map.length && nextX >= 0 && nextX < this.map[0].length) {
            const tile = this.map[nextY][nextX];
            if (tile === 2) {
                this.startBossBattle();
                return;
            }
            if (tile === 0) {
                this.playerPos.x = nextX;
                this.playerPos.y = nextY;
                this.updateView();
                this.checkEncounter();
            }
        }
    }

    checkEncounter() {
        this.stepsToEncounter--;
        if (this.stepsToEncounter <= 0) {
            this.isEncountering = true;
            notificationManager.show('魔王の軍勢が立ちふさがる！');
            this.stepsToEncounter = 4 + Math.floor(Math.random() * 4);
            const enemyId = Math.random() > 0.3 ? 'skeleton' : 'dragon';
            setTimeout(() => {
                this.isEncountering = false;
                sceneManager.switchScene('Battle', { enemyId, returnScene: 'DemonKingCastle' });
            }, 800);
        }
    }

    async startBossBattle() {
        await dialogueManager.show('魔王', ['よくぞここまでたどり着いた、勇者よ。', 'だが、ここがお前の墓場となるのだ！']);
        sceneManager.switchScene('Battle', { enemyId: 'demon_king', isBoss: true });
    }

    async exit() { console.log('Exiting Demon King Castle'); }
}
