import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';
import { menuManager } from '../Systems/MenuManager.js';
import { notificationManager } from '../Systems/NotificationManager.js';
import { DungeonRenderer3D } from '../Systems/DungeonRenderer3D.js';
import { encounterTables } from '../Core/EnemyDB.js';

/**
 * DungeonSceneやDemonKingCastleSceneの共通ロジックをまとめたベースクラス（3D探索用）
 */
export class BaseDungeonScene {
    constructor() {
        this.playerPos = { x: 7, y: 13 };
        this.playerDir = { x: 0, y: -1 };
        this.map = [[]];
        this.moveDelay = 0;
        this.stepsToEncounter = 8;
        this.isEncountering = false;
        this.isProcessing = false; // 非同期イベントガード用
        this.sceneTitle = "Dungeon";
        this.encounterPool = [];
        this.sceneId = "Dungeon"; // Battle終了後の戻り先用
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
        this.isProcessing = false;
        dialogueManager.isActive = false;
        menuManager.isActive = false;

        if (!data || !data.fromBattle) {
            notificationManager.show(`${this.sceneTitle}に入った`);
        }

        this.updateView();
        
        if (this.onEnter) await this.onEnter(data);
    }

    renderLayout() {
        this.container.innerHTML = `
            <div id="game-ui" class="dungeon-ui">
                <div class="scene-header">
                    <h2>${this.sceneTitle}</h2>
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
        ['up', 'down', 'left', 'right', 'action', 'menu'].forEach(k => bindBtn(`v-${k}`, k));
    }

    updateView() {
        if (!this.renderer) return;
        this.renderer.draw(this.playerPos, this.playerDir, this.map);
        this.renderer.drawMiniMap(this.miniMapCanvas, this.playerPos, this.playerDir, this.map);
        
        const compass = this.container.querySelector('#dungeon-compass');
        if (!compass) return;
        if (this.playerDir.x === 0 && this.playerDir.y === -1) compass.textContent = '北';
        else if (this.playerDir.x === 0 && this.playerDir.y === 1) compass.textContent = '南';
        else if (this.playerDir.x === 1 && this.playerDir.y === 0) compass.textContent = '東';
        else if (this.playerDir.x === -1 && this.playerDir.y === 0) compass.textContent = '西';
    }

    update(deltaTime) {
        if (this.moveDelay > 0) {
            this.moveDelay -= deltaTime;
            return;
        }

        if (this.isProcessing || menuManager.isActive || dialogueManager.isActive || this.isEncountering) {
            if (dialogueManager.isActive && (input.isPressed('action') || input.isPressed(' ') || input.isPressed('Enter'))) {
                dialogueManager.next();
                this.moveDelay = 250;
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
        } else if (input.isPressed('action') || input.isPressed(' ') || input.isPressed('Enter')) {
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

        if (nextY >= this.map.length || nextY < 0 || nextX >= this.map[0].length || nextX < 0) {
            this.handleExit(nextX, nextY);
            return;
        }

        const tile = this.map[nextY][nextX];
        if (tile === 0) {
            this.playerPos.x = nextX;
            this.playerPos.y = nextY;
            this.updateView();
            this.checkEncounter();
        } else {
            this.updateView();
        }
    }

    handleExit(x, y) {
        sceneManager.switchScene('WorldMap');
    }

    async tryInteract() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        await this.handleInteraction();
        this.isProcessing = false;
    }

    async handleInteraction() {
        // 子クラスで実装
    }

    checkEncounter() {
        if (!this.encounterPool || this.encounterPool.length === 0) return;

        this.stepsToEncounter--;
        if (this.stepsToEncounter <= 0) {
            this.isEncountering = true;
            notificationManager.show('魔物が現れた！');
            this.stepsToEncounter = 8 + Math.floor(Math.random() * 8);
            
            const enemyId = this.encounterPool[Math.floor(Math.random() * this.encounterPool.length)];

            setTimeout(() => {
                this.isEncountering = false;
                sceneManager.switchScene('Battle', { enemyId, returnScene: this.sceneId });
            }, 800);
        }
    }

    async exit() {
        console.log(`Exiting ${this.sceneTitle}`);
    }
}
