import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';
import { shopManager } from '../Systems/ShopManager.js';
import { menuManager } from '../Systems/MenuManager.js';
import { notificationManager } from '../Systems/NotificationManager.js';

export class CastleScene {
    constructor() {
        this.playerPos = { x: 7, y: 7 };
        this.playerDir = { x: 0, y: -1 };
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,0,0,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,3,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],
        ];

        this.npcs = [
            { x: 7, y: 3, name: '王様', lines: ['勇者よ、よくぞ参った。', '北の果てにある「魔王城」を攻略してほしい。', 'これが世界の命運を握る最後の戦いとなる。'], emoji: '👑' },
            { x: 2, y: 5, name: '近衛兵', lines: ['ここは王都グランデ。', '最高の装備を揃えてから出発するといい。'], emoji: '💂' },
            { x: 12, y: 5, name: '特級商人', lines: ['珍しい掘り出し物があるよ。', 'どれか持っていくかい？'], emoji: '🧐' },
        ];

        this.eliteCatalog = [
            { id: 'high_potion', name: 'ハイポーション', description: 'HPを150回復', price: 100, type: 'consumable' },
            { id: 'elixir', name: 'エリクサー', description: 'HPとMPを全回復', price: 500, type: 'consumable' },
            { id: 'hero_sword', name: '勇者の剣', description: '攻撃力 +40', price: 1200, type: 'weapon', atk: 40 },
            { id: 'knight_armor', name: '騎士の鎧', description: '防御力 +20', price: 800, type: 'armor', def: 20 }
        ];

        this.inputDelay = 0;
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

        this.inputDelay = 500;

        if (!state.flags.hasMetKing) {
            await dialogueManager.show('王国の兵士', ['止まれ！ここから先は王都グランデだ。', 'おお、それは「試練の証」！', 'これを持つ者こそ、我らが待ち望んだ勇者だ。', 'さあ、中へお入りください！']);
            state.flags.hasMetKing = true;
        }
    }

    renderLayout() {
        this.container.innerHTML = `
            <div id="game-ui">
                <div class="scene-header">
                    <h2>王都グランデ</h2>
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
                    <button id="menu-btn" class="menu-btn">メニュー</button>
                </div>
            </div>
        `;

        this.container.querySelector('#menu-btn').onclick = (e) => {
            e.stopPropagation();
            if (dialogueManager.isActive || shopManager.isActive || menuManager.isActive) return;
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
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', end, { passive: false });
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
                else if (this.map[y][x] === 3) cell.innerHTML = '🚩';

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
        if (this.inputDelay > 0) {
            this.inputDelay -= deltaTime;
        }

        if (dialogueManager.isActive || shopManager.isActive || menuManager.isActive) {
            if (dialogueManager.isActive && (input.isPressed(' ') || input.isPressed('Enter'))) {
                if (this.inputDelay <= 0) {
                    dialogueManager.next();
                    this.inputDelay = 300;
                }
            }
            return;
        }

        // 入力待機中は移動・アクションをスキップ
        if (this.inputDelay > 0) return;

        const dir = input.direction;
        if (dir.x !== 0 || dir.y !== 0) {
            this.playerDir = { ...dir };
            this.tryMove(dir.x, dir.y);
            this.inputDelay = 150;
        } else if (input.isPressed(' ') || input.isPressed('Enter')) {
            this.tryInteract();
            this.inputDelay = 300;
        }
    }

    tryMove(dx, dy) {
        const nextX = this.playerPos.x + dx;
        const nextY = this.playerPos.y + dy;

        // 南の出口
        if (nextY >= this.map.length) {
            sceneManager.switchScene('WorldMap');
            return;
        }

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

    async tryInteract() {
        const targetX = this.playerPos.x + this.playerDir.x;
        const targetY = this.playerPos.y + this.playerDir.y;
        const npc = this.npcs.find(n => n.x === targetX && n.y === targetY);
        if (npc) {
            if (npc.name === '特級商人') {
                await dialogueManager.show(npc.name, npc.lines);
                shopManager.open(this.eliteCatalog, '特級ショップ');
            } else if (npc.name === '王様') {
                await dialogueManager.show(npc.name, npc.lines);
                state.flags.acceptedQuest = true;
                notificationManager.show('クエスト：魔王討伐 を引き受けた');
            } else {
                await dialogueManager.show(npc.name, npc.lines);
            }
        }
    }

    async exit() {
        console.log('Exiting Castle Scene');
    }
}
