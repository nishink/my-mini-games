import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { messageManager } from '../Systems/MessageManager.js';
import { selectionManager } from '../Systems/SelectionManager.js';
import { shopManager } from '../Systems/ShopManager.js';
import { menuManager } from '../Systems/MenuManager.js';
import { notificationManager } from '../Systems/NotificationManager.js';

/**
 * TownSceneやCastleSceneの共通ロジックをまとめたベースクラス
 */
export class BaseMapScene {
    constructor() {
        this.playerPos = { x: 0, y: 0 };
        this.playerDir = { x: 0, y: 1 };
        this.map = [[]];
        this.npcs = [];
        this.inputDelay = 0;
        this.sceneTitle = "Map";
        this.canSave = false;
        this.isProcessing = false; // 非同期処理中のガード用
    }

    async enter(container, data) {
        this.container = container;
        this.renderLayout();
        
        this.gridEl = this.container.querySelector('#map-grid');
        this.playerEl = this.container.querySelector('#player-sprite');
        
        this.renderMap();
        this.updatePlayerPosition();
        
        messageManager.init(this.container);
        selectionManager.init(this.container);
        shopManager.init(this.container);
        menuManager.init(this.container);
        notificationManager.init(this.container);

        this.inputDelay = 500;
        this.isProcessing = false;
        
        if (this.onEnter) await this.onEnter(data);
    }

    renderLayout() {
        this.container.innerHTML = `
            <div id="game-ui">
                <div class="scene-header">
                    <h2>${this.sceneTitle}</h2>
                    <div class="player-brief">${state.player.name} Lv.${state.player.level}</div>
                </div>
                
                <div id="map-view">
                    <div id="map-container">
                        <div id="map-grid"></div>
                        <div id="player-sprite" class="player-char">
                            <div class="player-body">
                                <div class="player-eyes">
                                    <div class="eye"></div>
                                    <div class="eye"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="virtual-controller">
                    <div class="d-pad">
                        <button class="v-btn" id="v-up">▲</button>
                        <div class="d-pad-mid">
                            <button class="v-btn" id="v-left">◀</button>
                            <button class="v-btn" id="v-right">▶</button>
                        </div>
                        <button class="v-btn" id="v-down">▼</button>
                    </div>
                    <div class="action-pad">
                        <button class="v-btn action-btn" id="v-action">決定</button>
                    </div>
                </div>

                <div class="actions">
                    ${this.canSave ? '<button id="v-save" class="menu-btn" tabindex="-1">記録</button>' : ''}
                    <button id="v-menu" class="menu-btn" tabindex="-1">メニュー</button>
                </div>
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
                btn.classList.add('active');
            };
            const end = (e) => {
                e.preventDefault(); e.stopPropagation();
                input.setVirtualButton(key, false);
                btn.classList.remove('active');
            };
            
            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', end, { passive: false });
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        };

        const keys = ['up', 'down', 'left', 'right', 'action', 'menu'];
        if (this.canSave) keys.push('save');
        
        keys.forEach(k => bindBtn(`v-${k}`, k));
    }

    renderMap() {
        if (!this.gridEl) return;
        this.gridEl.innerHTML = '';
        this.gridEl.style.display = 'grid';
        this.gridEl.style.gridTemplateColumns = `repeat(${this.map[0].length}, var(--tile-size))`;
        this.gridEl.style.gridTemplateRows = `repeat(${this.map.length}, var(--tile-size))`;

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'tile';
                if (this.map[y][x] === 1) cell.classList.add('wall');
                
                const npc = this.npcs.find(n => n.x === x && n.y === y);
                if (npc) cell.innerHTML = npc.emoji;
                else if (this.map[y][x] === 2) cell.innerHTML = '🏠';
                else if (this.map[y][x] === 3) cell.innerHTML = '🚩';
                
                this.gridEl.appendChild(cell);
            }
        }
    }

    updatePlayerPosition() {
        if (!this.playerEl) return;
        this.playerEl.style.left = `calc(var(--tile-size) * ${this.playerPos.x})`;
        this.playerEl.style.top = `calc(var(--tile-size) * ${this.playerPos.y})`;
        
        this.playerEl.setAttribute('data-dir-x', this.playerDir.x);
        this.playerEl.setAttribute('data-dir-y', this.playerDir.y);
    }

    update(deltaTime) {
        if (this.inputDelay > 0) {
            this.inputDelay -= deltaTime;
        }

        if (this.isProcessing || messageManager.isActive || shopManager.isActive || menuManager.isActive || selectionManager.isActive) {
            if (messageManager.isActive && (input.isPressed(' ') || input.isPressed('Enter') || input.isPressed('action'))) {
                if (this.inputDelay <= 0) {
                    messageManager.next();
                    this.inputDelay = 300;
                }
            }
            return;
        }

        if (this.inputDelay > 0) return;

        const dir = input.direction;
        if (dir.x !== 0 || dir.y !== 0) {
            this.playerDir = { ...dir };
            this.tryMove(dir.x, dir.y);
            this.inputDelay = 150;
        } else if (input.isPressed(' ') || input.isPressed('Enter') || input.isPressed('action')) {
            this.tryInteract();
            this.inputDelay = 300;
        } else if (this.canSave && input.isPressed('save')) {
            import('../Core/SaveManager.js').then(m => {
                m.SaveManager.save();
                notificationManager.show('冒険を記録しました');
            });
            input.setVirtualButton('save', false);
            this.inputDelay = 500;
        } else if (input.isPressed('menu')) {
            menuManager.open();
            input.setVirtualButton('menu', false);
            this.inputDelay = 300;
        }
    }

    tryMove(dx, dy) {
        this.playerDir = { x: dx, y: dy };
        this.updatePlayerPosition();

        const nextX = this.playerPos.x + dx;
        const nextY = this.playerPos.y + dy;

        if (nextY >= this.map.length || nextY < 0 || nextX >= this.map[0].length || nextX < 0) {
            this.handleExit(nextX, nextY);
            return;
        }

        if (this.isWalkable(nextX, nextY)) {
            this.playerPos.x = nextX;
            this.playerPos.y = nextY;
            this.updatePlayerPosition();
        }
    }

    handleExit(x, y) {
        sceneManager.switchScene('WorldMap');
    }

    isWalkable(x, y) {
        if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[0].length) return false;
        if (this.map[y][x] !== 0) return false;
        if (this.npcs.some(n => n.x === x && n.y === y)) return false;
        return true;
    }

    async tryInteract() {
        if (this.isProcessing) return;

        const targetX = this.playerPos.x + this.playerDir.x;
        const targetY = this.playerPos.y + this.playerDir.y;
        const npc = this.npcs.find(n => n.x === targetX && n.y === targetY);
        if (npc) {
            this.isProcessing = true;
            await this.handleInteraction(npc);
            this.isProcessing = false;
        }
    }

    async handleInteraction(npc) {
        await messageManager.show(npc.name, npc.lines);
    }

    async exit() {
        console.log(`Exiting ${this.sceneTitle}`);
    }
}
