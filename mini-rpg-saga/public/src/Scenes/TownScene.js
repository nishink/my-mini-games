import { state } from '../Core/GlobalState.js';
import { SaveManager } from '../Core/SaveManager.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';
import { shopManager } from '../Systems/ShopManager.js';
import { menuManager } from '../Systems/MenuManager.js';
import { notificationManager } from '../Systems/NotificationManager.js';
import { dialogManager } from '../Systems/DialogManager.js';

export class TownScene {
    constructor() {
        this.playerPos = { x: 5, y: 7 };
        this.playerDir = { x: 0, y: -1 };
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,2,0,0,0,0,0,0,0,0,2,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,2,0,0,0,0,0,0,0,0,2,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,0,1,1,1,1,1,1,1],
        ];

        this.npcs = [
            { x: 2, y: 2, name: '村人', lines: ['ようこそ、はじまりの村へ！', '村の外は魔物がいっぱいだよ。気を付けてね。'], emoji: '👨‍🌾' },
            { x: 11, y: 2, name: '長老', lines: ['おお、若き勇者よ。', '北にある「試練の洞窟」へ向かうのじゃ。'], emoji: '👴' },
            { x: 2, y: 6, name: '看板', lines: ['【はじまりの村】', '南：冒険の世界へ'], emoji: '🪧' },
            { x: 11, y: 6, name: '商人', lines: ['いらっしゃい！', '旅の準備はできているかい？'], emoji: '👳' },
        ];
        
        this.moveDelay = 0;
    }

    async enter(container) {
        this.container = container;
        this.renderLayout();
        
        this.gridEl = this.container.querySelector('#map-grid');
        this.playerEl = this.container.querySelector('#player-sprite');
        
        this.renderMap();
        this.updatePlayerPosition();
        
        dialogueManager.init(this.container);
        shopManager.init(this.container);
        menuManager.init(this.container);
        notificationManager.init(this.container);
        dialogManager.init(this.container);

        this.container.addEventListener('click', () => {
            if (dialogueManager.isActive) dialogueManager.next();
        });
    }

    renderLayout() {
        this.container.innerHTML = `
            <div id="game-ui">
                <div class="scene-header">
                    <h2>はじまりの村</h2>
                    <div class="player-brief">${state.player.name} Lv.${state.player.level}</div>
                </div>
                
                <div id="map-view">
                    <div id="map-container">
                        <div id="map-grid"></div>
                        <div id="player-sprite">🏃‍♂️</div>
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
                    <button id="save-btn" class="menu-btn">記録</button>
                    <button id="menu-btn" class="menu-btn">メニュー</button>
                </div>
            </div>
        `;

        this.container.querySelector('#save-btn').onclick = (e) => {
            e.stopPropagation();
            if (dialogueManager.isActive || shopManager.isActive || menuManager.isActive || dialogManager.isActive) return;
            SaveManager.save();
            notificationManager.show('冒険を記録しました');
        };

        this.container.querySelector('#menu-btn').onclick = (e) => {
            e.stopPropagation();
            if (dialogueManager.isActive || shopManager.isActive || menuManager.isActive || dialogManager.isActive) return;
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

        ['up', 'down', 'left', 'right', 'action'].forEach(k => bindBtn(`v-${k}`, k));
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
                
                this.gridEl.appendChild(cell);
            }
        }
    }

    updatePlayerPosition() {
        if (!this.playerEl) return;
        this.playerEl.style.left = `calc(var(--tile-size) * ${this.playerPos.x})`;
        this.playerEl.style.top = `calc(var(--tile-size) * ${this.playerPos.y})`;
    }

    update(deltaTime) {
        if (dialogueManager.isActive || shopManager.isActive || menuManager.isActive || dialogManager.isActive) {
            if (dialogueManager.isActive && (input.isPressed(' ') || input.isPressed('Enter'))) {
                if (this.moveDelay <= 0) {
                    dialogueManager.next();
                    this.moveDelay = 300;
                }
            }
            if (this.moveDelay > 0) this.moveDelay -= deltaTime;
            return;
        }

        if (this.moveDelay > 0) {
            this.moveDelay -= deltaTime;
        } else {
            const dir = input.direction;
            if (dir.x !== 0 || dir.y !== 0) {
                this.playerDir = { ...dir };
                this.tryMove(dir.x, dir.y);
                this.moveDelay = 150;
            }

            if (input.isPressed(' ') || input.isPressed('Enter')) {
                this.tryInteract();
                this.moveDelay = 300;
            }
        }
    }

    tryMove(dx, dy) {
        const nextX = this.playerPos.x + dx;
        const nextY = this.playerPos.y + dy;
        if (this.isWalkable(nextX, nextY)) {
            this.playerPos.x = nextX;
            this.playerPos.y = nextY;
            this.updatePlayerPosition();
        }
    }

    isWalkable(x, y) {
        if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[0].length) return false;
        if (this.map[y][x] !== 0) return false;
        if (this.npcs.some(n => n.x === x && n.y === y)) return false;
        return true;
    }

    tryInteract() {
        const targetX = this.playerPos.x + this.playerDir.x;
        const targetY = this.playerPos.y + this.playerDir.y;
        const npc = this.npcs.find(n => n.x === targetX && n.y === targetY);
        if (npc) {
            if (npc.name === '商人') {
                dialogueManager.show(npc.name, ['いらっしゃい！', '旅に必要なものはそろっているかな？'], () => {
                    shopManager.open();
                });
            } else {
                dialogueManager.show(npc.name, npc.lines);
            }
        }
    }

    async exit() {
        console.log('Exiting Town Scene');
    }
}
