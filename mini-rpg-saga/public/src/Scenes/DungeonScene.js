import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';
import { menuManager } from '../Systems/MenuManager.js';
import { notificationManager } from '../Systems/NotificationManager.js';
import { DungeonRenderer3D } from '../Systems/DungeonRenderer3D.js';

export class DungeonScene {
    constructor() {
        this.playerPos = { x: 7, y: 13 };
        this.playerDir = { x: 0, y: -1 };
        this.map = [
            [1,1,1,1,1,1,1,2,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,1,1,0,1,0,1,1,1,1,1,0,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,0,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
        ];
        this.moveDelay = 0;
        this.stepsToEncounter = 8;
        this.isEncountering = false;
    }

    async enter(container, data) {
        this.container = container;
        this.renderLayout();
        const canvas = this.container.querySelector('#dungeon-canvas');
        this.miniMapCanvas = this.container.querySelector('#mini-map-canvas');
        this.renderer = new DungeonRenderer3D(canvas);
        this.updateView();
        
        dialogueManager.init(this.container);
        menuManager.init(this.container);
        notificationManager.init(this.container);

        // 状態の強制リセット
        this.moveDelay = 0;
        this.isEncountering = false;
        dialogueManager.isActive = false;
        menuManager.isActive = false;

        if (!data || !data.fromBattle) {
            notificationManager.show('試練の洞窟に入った');
        }

        this.container.querySelector('#map-view').onclick = () => {
            if (dialogueManager.isActive) dialogueManager.next();
        };
    }

    renderLayout() {
        this.container.innerHTML = `
            <div id="game-ui" class="dungeon-ui">
                <div class="scene-header">
                    <h2>試練の洞窟</h2>
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
                <div class="actions"><button id="menu-btn" class="menu-btn">メニュー</button></div>
            </div>
        `;
        this.container.querySelector('#menu-btn').onclick = (e) => {
            e.stopPropagation();
            if (menuManager.isActive || this.isEncountering) return;
            menuManager.open();
        };
        this.setupVirtualController();
    }

    setupVirtualController() {
        const bindBtn = (id, key) => {
            const btn = this.container.querySelector(`#${id}`);
            if (!btn) return;
            const start = (e) => { 
                e.preventDefault(); e.stopPropagation();
                if (dialogueManager.isActive) {
                    dialogueManager.next();
                    return;
                }
                input.setVirtualButton(key, true); 
            };
            const end = (e) => { e.preventDefault(); e.stopPropagation(); input.setVirtualButton(key, false); };
            btn.addEventListener('touchstart', start); btn.addEventListener('touchend', end);
            btn.addEventListener('mousedown', start); btn.addEventListener('mouseup', end);
        };
        ['up', 'down', 'left', 'right', 'action'].forEach(k => bindBtn(`v-${k}`, k));
    }

    updateView() {
        if (!this.renderer) return;
        this.renderer.draw(this.playerPos, this.playerDir, this.map);
        this.renderer.drawMiniMap(this.miniMapCanvas, this.playerPos, this.playerDir, this.map);
        const compass = this.container.querySelector('#dungeon-compass');
        if (this.playerDir.x === 0 && this.playerDir.y === -1) compass.textContent = '北';
        if (this.playerDir.x === 0 && this.playerDir.y === 1) compass.textContent = '南';
        if (this.playerDir.x === 1 && this.playerDir.y === 0) compass.textContent = '東';
        if (this.playerDir.x === -1 && this.playerDir.y === 0) compass.textContent = '西';
    }

    isWall(x, y) {
        if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[0].length) return true;
        return this.map[y][x] === 1;
    }

    update(deltaTime) {
        // 巨大な経過時間は制限する
        const dt = Math.min(deltaTime, 100);

        if (this.moveDelay > 0) {
            this.moveDelay -= dt;
            return;
        }

        if (menuManager.isActive || dialogueManager.isActive || this.isEncountering) {
            if (dialogueManager.isActive && (input.isPressed(' ') || input.isPressed('Enter'))) {
                dialogueManager.next();
                this.moveDelay = 250;
            }
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
        
        if (input.isPressed(' ') || input.isPressed('Enter')) {
            this.tryInteract();
            this.moveDelay = 300;
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
        if (nextY >= this.map.length && this.playerPos.x === 7) {
            sceneManager.switchScene('WorldMap');
            return;
        }
        if (!this.isWall(nextX, nextY)) {
            this.playerPos.x = nextX;
            this.playerPos.y = nextY;
            this.updateView();
            this.checkEncounter();
        }
    }

    async tryInteract() {
        const targetX = this.playerPos.x + this.playerDir.x;
        const targetY = this.playerPos.y + this.playerDir.y;
        if (targetY >= 0 && targetY < this.map.length && targetX >= 0 && targetX < this.map[0].length) {
            if (this.map[targetY][targetX] === 2) {
                sceneManager.switchScene('MiniGame', {
                    message: '宝箱には鍵がかかっている！',
                    onSuccess: async () => {
                        await dialogueManager.show('宝箱', ['鍵を開けることに成功した！', '中には輝く宝石が入っていた！', '「試練の証」を手に入れた！']);
                        this.map[targetY][targetX] = 0;
                        state.flags.tutorialComplete = true;
                    },
                    onFailure: async () => {
                        await dialogueManager.show('宝箱', ['鍵を開けるのに失敗した...']);
                    }
                });
            }
        }
    }

    checkEncounter() {
        this.stepsToEncounter--;
        if (this.stepsToEncounter <= 0) {
            this.isEncountering = true;
            notificationManager.show('魔物が現れた！');
            this.stepsToEncounter = 10 + Math.floor(Math.random() * 10);
            setTimeout(() => {
                this.isEncountering = false;
                sceneManager.switchScene('Battle');
            }, 800);
        }
    }

    async exit() { console.log('Exiting Dungeon Scene'); }
}
