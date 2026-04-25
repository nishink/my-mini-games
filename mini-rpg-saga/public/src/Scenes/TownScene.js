import { state } from '../Core/GlobalState.js';
import { SaveManager } from '../Core/SaveManager.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';

export class TownScene {
    constructor() {
        this.tileSize = 32; // 初期値
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
            { x: 11, y: 6, name: '商人', lines: ['旅の準備はできているかい？', '今はまだ在庫がないんだ。すまないね。'], emoji: '👳' },
        ];
        
        this.moveDelay = 0;
    }

    async enter(container) {
        this.container = container;
        
        // CSSから現在のタイルサイズを取得
        const rootStyle = getComputedStyle(document.documentElement);
        this.tileSize = parseInt(rootStyle.getPropertyValue('--tile-size')) || 32;

        this.renderLayout();
        this.renderMap();
        this.updatePlayerPosition();
        
        dialogueManager.init(this.container);

        // 会話中に画面全体をクリック/タップしても進むようにする
        this.container.addEventListener('click', () => {
            if (dialogueManager.isActive) {
                dialogueManager.next();
            }
        });
    }

    renderLayout() {
        this.container.innerHTML = `
            <div id="game-ui">
                <div class="scene-header">
                    <h2>はじまりの村</h2>
                    <div class="player-brief">${state.player.name} Lv.${state.player.level}</div>
                </div>
                <div id="map-container">
                    <div id="map-grid"></div>
                    <div id="player-sprite">🏃‍♂️</div>
                </div>
                <div class="controls-guide">
                    矢印キー：移動 / スペース・Enter：話す
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
                    <button id="save-btn" class="menu-btn">冒険を記録</button>
                    <button id="menu-btn" class="menu-btn">メニュー</button>
                </div>
            </div>
        `;

        document.getElementById('save-btn').onclick = (e) => {
            e.stopPropagation(); // コンテナのクリックイベント発火を防ぐ
            if (dialogueManager.isActive) return;
            SaveManager.save();
            alert('記録しました');
        };

        this.setupVirtualController();
        
        this.gridEl = document.getElementById('map-grid');
        this.playerEl = document.getElementById('player-sprite');
        
        this.gridEl.style.display = 'grid';
        this.gridEl.style.gridTemplateColumns = `repeat(${this.map[0].length}, var(--tile-size))`;
        this.gridEl.style.gridTemplateRows = `repeat(${this.map.length}, var(--tile-size))`;
    }

    setupVirtualController() {
        const bindBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const start = (e) => {
                e.preventDefault();
                e.stopPropagation();
                input.setVirtualButton(key, true);
                btn.classList.add('active');
            };
            const end = (e) => {
                e.preventDefault();
                e.stopPropagation();
                input.setVirtualButton(key, false);
                btn.classList.remove('active');
            };
            
            btn.addEventListener('touchstart', start);
            btn.addEventListener('touchend', end);
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        };

        bindBtn('v-up', 'up');
        bindBtn('v-down', 'down');
        bindBtn('v-left', 'left');
        bindBtn('v-right', 'right');
        bindBtn('v-action', 'action');
    }

    renderMap() {
        this.gridEl.innerHTML = '';
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'tile';
                const type = this.map[y][x];
                
                if (type === 1) cell.classList.add('wall');
                
                // NPCの描画
                const npc = this.npcs.find(n => n.x === x && n.y === y);
                if (npc) {
                    cell.innerHTML = npc.emoji;
                } else if (type === 2) {
                    cell.innerHTML = '🏠';
                }
                
                this.gridEl.appendChild(cell);
            }
        }
    }

    updatePlayerPosition() {
        this.playerEl.style.left = `calc(${this.playerPos.x} * var(--tile-size))`;
        this.playerEl.style.top = `calc(${this.playerPos.y} * var(--tile-size))`;
    }

    update(deltaTime) {
        if (dialogueManager.isActive) {
            // 会話中の入力処理
            if (input.isPressed(' ') || input.isPressed('Enter')) {
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
                this.playerDir = { ...dir }; // 向いている方向を更新
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
        // NPCがいる場所も通行不可にする
        if (this.npcs.some(n => n.x === x && n.y === y)) return false;
        return true;
    }

    tryInteract() {
        // 向いている方向の1マス先をチェック
        const targetX = this.playerPos.x + this.playerDir.x;
        const targetY = this.playerPos.y + this.playerDir.y;

        const npc = this.npcs.find(n => n.x === targetX && n.y === targetY);
        if (npc) {
            dialogueManager.show(npc.name, npc.lines);
        }
    }

    async exit() {
        console.log('Exiting Town Scene');
    }
}
