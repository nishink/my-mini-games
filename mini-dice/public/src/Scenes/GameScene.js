import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { DiceLogic } from '../Systems/DiceLogic.js';

export class GameScene {
    constructor() {
        this.container = document.getElementById('scene-container');
        this.logic = new DiceLogic();
        this.isAnimating = false;
        this.currentView = 'map'; // 'map' | 'battle'
        this.mapCoords = [
            { r: 0, c: 0 }, // 0: Start
            { r: 0, c: 1 }, // 1
            { r: 0, c: 2 }, // 2
            { r: 0, c: 3 }, // 3
            { r: 0, c: 4 }, // 4
            { r: 1, c: 4 }, // 5 (折り返し)
            { r: 1, c: 3 }, // 6
            { r: 1, c: 2 }, // 7
            { r: 1, c: 1 }, // 8
            { r: 1, c: 0 }, // 9
            { r: 2, c: 0 }, // 10 (折り返し)
            { r: 2, c: 1 }, // 11
            { r: 2, c: 2 }, // 12
            { r: 2, c: 3 }, // 13
            { r: 2, c: 4 }  // 14: Boss
        ];
    }

    async enter() {
        this.logic.reset();
        this.isAnimating = false;
        this.currentView = 'map';
        this.initUI();
        this.render();
    }

    initUI() {
        this.container.innerHTML = `
            <div class="scene game-scene">
                <!-- ステータスバー -->
                <div class="status-bar">
                    <div class="status-item">Lv.<span id="p-level">1</span></div>
                    <div class="status-item hp-item">
                        HP: <span id="p-hp">40</span>/<span id="p-maxhp">40</span>
                        <div class="hp-gauge"><div class="hp-fill" id="p-hp-fill" style="width: 100%;"></div></div>
                    </div>
                    <div class="status-item">🪙 <span id="p-gold">10</span>G</div>
                    <div class="status-item">🧪回復薬: <span id="p-potions">2</span>個</div>
                    <div class="status-item equipment-item">⚔️<span id="p-weapon">素手</span> / 🛡️<span id="p-armor">旅人の服</span></div>
                </div>

                <!-- マップビュー -->
                <div id="map-view" class="view-panel">
                    <div class="map-grid-container">
                        <div class="map-grid" id="map-grid"></div>
                    </div>

                    <div class="dice-section">
                        <div id="dice-display" class="dice-box">⚀</div>
                        <div class="action-buttons" id="map-actions">
                            <button id="roll-btn">ダイスを振る</button>
                        </div>
                    </div>

                    <!-- イベントメッセージログ -->
                    <div id="event-log" class="event-log-panel hidden">
                        <p id="event-text"></p>
                        <div class="event-actions" id="event-actions">
                            <button id="event-ok-btn">進む</button>
                        </div>
                    </div>
                </div>

                <!-- バトルビュー -->
                <div id="battle-view" class="view-panel hidden">
                    <div class="battle-arena">
                        <!-- 敵ステータス -->
                        <div class="enemy-card">
                            <div class="enemy-icon" id="e-icon">🐉</div>
                            <div class="enemy-name" id="e-name">魔王</div>
                            <div class="hp-item">
                                <span id="e-hp">80</span>/<span id="e-maxhp">80</span>
                                <div class="hp-gauge"><div class="hp-fill enemy" id="e-hp-fill" style="width: 100%;"></div></div>
                            </div>
                        </div>
                    </div>

                    <!-- バトルログ -->
                    <div class="battle-log" id="battle-log-text"></div>

                    <!-- バトルコマンド -->
                    <div class="battle-commands" id="battle-actions">
                        <button id="b-attack-btn">たたかう</button>
                        <button id="b-heal-btn">回復薬を使う</button>
                        <button id="b-escape-btn">逃げる</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('roll-btn').addEventListener('click', () => this.rollDiceWithAnimation());
        document.getElementById('event-ok-btn').addEventListener('click', () => this.closeEventLog());
        
        document.getElementById('b-attack-btn').addEventListener('click', () => this.handleBattleAction('attack'));
        document.getElementById('b-heal-btn').addEventListener('click', () => this.handleBattleAction('heal'));
        document.getElementById('b-escape-btn').addEventListener('click', () => this.handleBattleAction('escape'));
    }

    render() {
        this.renderStats();
        if (this.currentView === 'map') {
            this.renderMap();
        } else {
            this.renderBattle();
        }
    }

    // ステータス表示の同期
    renderStats() {
        const p = this.logic.player;
        document.getElementById('p-level').textContent = p.level;
        document.getElementById('p-hp').textContent = p.hp;
        document.getElementById('p-maxhp').textContent = p.maxHp;
        document.getElementById('p-gold').textContent = p.gold;
        document.getElementById('p-potions').textContent = p.potions;
        document.getElementById('p-weapon').textContent = p.weapon.name;
        document.getElementById('p-armor').textContent = p.armor.name;

        const hpPercent = Math.max(0, (p.hp / p.maxHp) * 100);
        document.getElementById('p-hp-fill').style.width = `${hpPercent}%`;
    }

    // マップの描画
    renderMap() {
        const gridElem = document.getElementById('map-grid');
        gridElem.innerHTML = '';

        this.logic.map.forEach((cell, idx) => {
            const cellElem = document.createElement('div');
            cellElem.className = `map-cell ${cell.type}`;
            
            // S字配置の座標設定
            const coord = this.mapCoords[idx];
            cellElem.style.gridRow = coord.r + 1;
            cellElem.style.gridColumn = coord.c + 1;

            // マス目のインデックス表示
            const indexElem = document.createElement('div');
            indexElem.className = 'cell-index';
            indexElem.textContent = idx === 0 ? 'START' : (idx === 14 ? 'GOAL' : idx);
            cellElem.appendChild(indexElem);

            // マス目のアイコン
            const iconElem = document.createElement('div');
            iconElem.className = 'cell-icon';
            iconElem.textContent = this.getCellIcon(cell.type);
            cellElem.appendChild(iconElem);

            // プレイヤー駒の描画
            if (this.logic.player.position === idx) {
                const playerPiece = document.createElement('div');
                playerPiece.className = 'player-piece';
                playerPiece.textContent = '🧙';
                cellElem.appendChild(playerPiece);
            }

            gridElem.appendChild(cellElem);
        });
    }

    // バトル画面の描画
    renderBattle() {
        if (!this.logic.inBattle || !this.logic.activeEnemy) return;

        const e = this.logic.activeEnemy;
        document.getElementById('e-name').textContent = e.name;
        document.getElementById('e-icon').textContent = e.icon;
        document.getElementById('e-hp').textContent = e.hp;
        document.getElementById('e-maxhp').textContent = e.maxHp;

        const hpPercent = Math.max(0, (e.hp / e.maxHp) * 100);
        document.getElementById('e-hp-fill').style.width = `${hpPercent}%`;

        // 逃げるボタンの制御 (ボス戦は逃げられない)
        const cell = this.logic.map[this.logic.player.position];
        const escapeBtn = document.getElementById('b-escape-btn');
        if (cell.type === 'boss') {
            escapeBtn.disabled = true;
            escapeBtn.style.opacity = '0.5';
        } else {
            escapeBtn.disabled = false;
            escapeBtn.style.opacity = '1';
        }

        // バトルログの更新
        const logBox = document.getElementById('battle-log-text');
        logBox.innerHTML = this.logic.battleLogs.map(log => `<p>${log}</p>`).join('');
        logBox.scrollTop = logBox.scrollHeight;
    }

    getCellIcon(type) {
        switch (type) {
            case 'start': return '⛺';
            case 'enemy': return '⚔️';
            case 'chest': return '🎁';
            case 'inn': return '🏨';
            case 'trap': return '⚠️';
            case 'boss': return '👑';
            default: return '🍃';
        }
    }

    // ダイスアニメーションと移動実行
    rollDiceWithAnimation() {
        if (this.isAnimating || this.logic.inBattle || this.logic.gameOver) return;
        this.isAnimating = true;
        soundManager.playSelect();

        // アクションを非表示にして進行ロック
        document.getElementById('map-actions').classList.add('hidden');
        document.getElementById('event-log').classList.add('hidden');

        const diceElem = document.getElementById('dice-display');
        let count = 0;
        const interval = setInterval(() => {
            const tempRoll = Math.floor(Math.random() * 6) + 1;
            diceElem.textContent = this.getDiceNumberChar(tempRoll);
            count++;
            if (count > 12) {
                clearInterval(interval);
                const roll = this.logic.rollDice();
                diceElem.textContent = this.getDiceNumberChar(roll);
                soundManager.playOk();
                
                setTimeout(() => {
                    this.animateMovement(roll);
                }, 500);
            }
        }, 80);
    }

    getDiceNumberChar(num) {
        const diceChars = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return diceChars[num - 1] || '🎲';
    }

    // プレイヤーの移動アニメーション
    animateMovement(steps) {
        let remainingSteps = steps;
        const moveInterval = setInterval(() => {
            if (remainingSteps > 0 && this.logic.player.position < 14) {
                this.logic.stepForward();
                soundManager.playSelect();
                this.render();
                remainingSteps--;
            } else {
                clearInterval(moveInterval);
                this.isAnimating = false;
                
                // 到着イベント実行
                this.logic.triggerEvent();
                this.render();
                this.showEventLog();
            }
        }, 300); // 0.3秒間隔で進む
    }

    // イベントログの表示
    showEventLog() {
        const logPanel = document.getElementById('event-log');
        const textElem = document.getElementById('event-text');
        const actionsElem = document.getElementById('event-actions');
        
        textElem.textContent = this.logic.eventMessage;
        logPanel.classList.remove('hidden');

        const cell = this.logic.map[this.logic.player.position];

        if (cell.type === 'inn') {
            const cost = this.logic.player.position === 7 ? 10 : 15;
            actionsElem.innerHTML = `
                <button id="inn-yes-btn">泊まる (${cost}G)</button>
                <button id="inn-no-btn">立ち去る</button>
            `;
            document.getElementById('inn-yes-btn').onclick = () => {
                if (this.logic.useInn(cost)) {
                    soundManager.playHeal();
                    this.renderStats();
                    textElem.textContent = this.logic.eventMessage;
                    actionsElem.innerHTML = `<button id="event-ok-btn">進む</button>`;
                    document.getElementById('event-ok-btn').onclick = () => this.closeEventLog();
                } else {
                    soundManager.playCancel();
                    alert("ゴールドが足りません！");
                }
            };
            document.getElementById('inn-no-btn').onclick = () => {
                soundManager.playCancel();
                this.closeEventLog();
            };
        } else {
            actionsElem.innerHTML = `<button id="event-ok-btn">進む</button>`;
            document.getElementById('event-ok-btn').onclick = () => this.closeEventLog();
        }
    }

    closeEventLog() {
        document.getElementById('event-log').classList.add('hidden');
        
        if (this.logic.inBattle) {
            // バトル開始
            this.switchView('battle');
        } else if (this.logic.gameOver) {
            this.handleGameOver();
        } else {
            // ダイスロール再開可能に
            document.getElementById('map-actions').classList.remove('hidden');
        }
    }

    // バトルコマンド処理
    handleBattleAction(action) {
        if (this.isAnimating || !this.logic.inBattle) return;

        soundManager.playSelect();
        const res = this.logic.executeBattleRound(action);
        this.render();

        if (res.status === 'escaped') {
            soundManager.playCancel();
            this.isAnimating = true;
            setTimeout(() => {
                this.isAnimating = false;
                this.switchView('map');
            }, 1500);
        } else if (res.status === 'win') {
            soundManager.playHeal(); // 勝利ファンファーレ代わり
            
            // 攻撃ボタンなどを無効化
            document.getElementById('battle-actions').innerHTML = `
                <button id="battle-finish-btn" class="win-btn">勝利！進む</button>
            `;
            document.getElementById('battle-finish-btn').onclick = () => {
                soundManager.playOk();
                if (this.logic.gameClear) {
                    this.handleGameClear();
                } else {
                    // 通常バトル勝利後、コマンドを元に戻してマップへ
                    this.restoreBattleButtons();
                    this.switchView('map');
                }
            };
        } else if (res.status === 'gameover' || this.logic.gameOver) {
            this.handleGameOver();
        } else {
            // 通常ラウンド進行
            soundManager.playHit();
        }
    }

    restoreBattleButtons() {
        const actions = document.getElementById('battle-actions');
        actions.innerHTML = `
            <button id="b-attack-btn">たたかう</button>
            <button id="b-heal-btn">回復薬を使う</button>
            <button id="b-escape-btn">逃げる</button>
        `;
        // リスナーの再バインド
        document.getElementById('b-attack-btn').addEventListener('click', () => this.handleBattleAction('attack'));
        document.getElementById('b-heal-btn').addEventListener('click', () => this.handleBattleAction('heal'));
        document.getElementById('b-escape-btn').addEventListener('click', () => this.handleBattleAction('escape'));
    }

    switchView(view) {
        this.currentView = view;
        const mapView = document.getElementById('map-view');
        const battleView = document.getElementById('battle-view');

        if (view === 'map') {
            mapView.classList.remove('hidden');
            battleView.classList.add('hidden');
            document.getElementById('map-actions').classList.remove('hidden');
            this.render();
        } else {
            mapView.classList.add('hidden');
            battleView.classList.remove('hidden');
            this.renderBattle();
        }
    }

    handleGameOver() {
        soundManager.playCancel();
        setTimeout(() => {
            sceneManager.switchScene('Result', {
                status: 'lose',
                level: this.logic.player.level,
                weapon: this.logic.player.weapon.name,
                armor: this.logic.player.armor.name,
                gold: this.logic.player.gold
            });
        }, 1500);
    }

    handleGameClear() {
        soundManager.playHeal();
        setTimeout(() => {
            sceneManager.switchScene('Result', {
                status: 'win',
                level: this.logic.player.level,
                weapon: this.logic.player.weapon.name,
                armor: this.logic.player.armor.name,
                gold: this.logic.player.gold
            });
        }, 1500);
    }

    update(dt) {}
    exit() {}
}
