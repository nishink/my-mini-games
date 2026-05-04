import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';
import { notificationManager } from '../Systems/NotificationManager.js';
import { enemies } from '../Core/EnemyDB.js';
import { soundManager } from '../Core/SoundManager.js';

export class BattleScene {
    constructor() {
        this.enemy = null;
        this.isPlayerTurn = false;
        this.selectedCommandIdx = 0;
        this.commands = ['attack', 'magic', 'guard', 'run'];
        this.commandNames = ['攻撃', '魔法', '防御', '逃げる'];
        this.inputDelay = 0;
        this.returnScene = 'Dungeon';

        // アイテム情報の簡易定義（ドロップ表示用）
        this.itemCatalog = {
            potion: { id: 'potion', name: 'ポーション', description: 'HPを50回復', price: 20, type: 'consumable' },
            ether: { id: 'ether', name: 'エーテル', description: 'MPを20回復', price: 50, type: 'consumable' },
            herb: { id: 'herb', name: 'やくそう', description: 'HPを10回復', price: 10, type: 'consumable' },
            elixir: { id: 'elixir', name: 'エリクサー', description: 'HPとMPを全回復', price: 500, type: 'consumable' }
        };
    }

    async enter(container, data) {
        this.container = container;
        this.returnScene = data?.returnScene || 'Dungeon';
        const enemyKeys = Object.keys(enemies);
        const randomKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
        this.enemy = { ...enemies[data?.enemyId || randomKey] };

        this.renderLayout();
        dialogueManager.init(this.container);
        notificationManager.init(this.container);

        if (this.enemy.isBoss) {
            this.container.classList.add('boss-battle');
        }

        await dialogueManager.show('', [`${this.enemy.name} があらわれた！`]);
        this.startTurn();
    }

    renderLayout() {
        const stats = state.getDerivedStats();
        this.container.innerHTML = `
            <div id="game-ui" class="battle-ui">
                <div class="battle-arena">
                    <div class="enemy-area">
                        <div class="enemy-sprite">${this.enemy.emoji}</div>
                        <div class="enemy-info ui-panel">
                            <div class="name">${this.enemy.name}</div>
                            <div class="hp-bar-outer"><div id="enemy-hp-bar" class="hp-bar-inner" style="width: 100%"></div></div>
                        </div>
                    </div>
                </div>
                <div class="player-status-bar ui-panel">
                    <div class="p-info"><span>${state.player.name}</span> Lv.${state.player.level}</div>
                    <div class="p-stats">HP: <span id="player-hp-val">${state.player.currentHp}</span> / ${stats.maxHp}</div>
                </div>
                <div id="battle-commands" class="commands-area ui-panel hidden">
                    ${this.commands.map((cmd, i) => `
                        <button class="cmd-btn" data-idx="${i}" data-action="${cmd}">${this.commandNames[i]}</button>
                    `).join('')}
                </div>
            </div>
        `;
        this.commandBtns = this.container.querySelectorAll('.cmd-btn');
        this.commandBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                if (!this.isPlayerTurn || dialogueManager.isActive) return;
                const idx = parseInt(btn.getAttribute('data-idx'));
                this.selectedCommandIdx = idx;
                this.updateCommandUI();
                this.handleCommand(btn.getAttribute('data-action'));
            };
        });
        this.container.onclick = () => { if (dialogueManager.isActive) dialogueManager.next(); };
    }

    updateHpBars() {
        const enemyHpPercent = Math.max(0, (this.enemy.hp / this.enemy.maxHp) * 100);
        this.container.querySelector('#enemy-hp-bar').style.width = `${enemyHpPercent}%`;
        this.container.querySelector('#player-hp-val').textContent = state.player.currentHp;
    }

    startTurn() {
        this.isPlayerTurn = true;
        this.selectedCommandIdx = 0;
        this.updateCommandUI();
        this.container.querySelector('#battle-commands').classList.remove('hidden');
    }

    updateCommandUI() {
        this.commandBtns.forEach((btn, i) => {
            btn.classList.toggle('selected', i === this.selectedCommandIdx);
        });
    }

    update(deltaTime) {
        if (this.inputDelay > 0) { this.inputDelay -= deltaTime; return; }
        if (dialogueManager.isActive) {
            if (input.isPressed(' ') || input.isPressed('Enter')) { dialogueManager.next(); this.inputDelay = 250; }
            return;
        }
        if (!this.isPlayerTurn) return;
        if (input.isPressed('ArrowUp') || input.isPressed('w')) {
            this.selectedCommandIdx = (this.selectedCommandIdx - 1 + this.commands.length) % this.commands.length;
            this.updateCommandUI(); this.inputDelay = 150;
        } else if (input.isPressed('ArrowDown') || input.isPressed('s')) {
            this.selectedCommandIdx = (this.selectedCommandIdx + 1) % this.commands.length;
            this.updateCommandUI(); this.inputDelay = 150;
        }
        if (input.isPressed(' ') || input.isPressed('Enter')) {
            this.handleCommand(this.commands[this.selectedCommandIdx]);
            this.inputDelay = 300;
        }
    }

    async handleCommand(action) {
        this.isPlayerTurn = false;
        this.container.querySelector('#battle-commands').classList.add('hidden');
        
        if (action === 'attack') {
            await this.playerAttack();
        } else if (action === 'magic') {
            await this.openMagicMenu();
            return; // 魔法メニュー内で次のターンへの遷移を管理
        } else if (action === 'guard') {
            await dialogueManager.show('', [`${state.player.name} は身を固めた！`]);
        } else if (action === 'run') {
            if (this.enemy.isBoss) {
                await dialogueManager.show('', ['魔王からは逃げられない！']);
            } else if (Math.random() > 0.4) {
                await dialogueManager.show('', ['うまく逃げ切れた！']);
                sceneManager.switchScene(this.returnScene, { fromBattle: true });
                return;
            } else { 
                await dialogueManager.show('', ['逃げられなかった！']); 
            }
        }
        
        if (this.enemy.hp <= 0) await this.win();
        else await this.enemyTurn();
    }

    async openMagicMenu() {
        if (state.player.spells.length === 0) {
            await dialogueManager.show('', ['魔法を覚えていない！']);
            this.startTurn();
            return;
        }

        const magicList = state.player.spells.map(id => state.spellMaster[id]);
        
        // 最初の魔法を自動選択（簡易実装）
        const spell = magicList[0];
        await this.playerCastSpell(spell.id);
    }

    async playerCastSpell(spellId) {
        const result = state.castSpell(spellId, true);
        if (!result.success) {
            await dialogueManager.show('', [result.msg]);
            this.startTurn();
            return;
        }

        if (result.spell.type === 'recovery') {
            await dialogueManager.show('', [result.msg]);
        } else if (result.spell.type === 'attack') {
            let damage = result.spell.power + Math.floor(state.player.baseStats.int * 1.5) - this.enemy.def;
            damage = Math.max(5, damage + Math.floor(Math.random() * 5));
            this.enemy.hp -= damage;
            
            soundManager.playHit();
            const enemySprite = this.container.querySelector('.enemy-sprite');
            enemySprite.classList.add('flash');
            this.container.classList.add('shake');
            setTimeout(() => {
                enemySprite.classList.remove('flash');
                this.container.classList.remove('shake');
            }, 500);

            await dialogueManager.show('', [`${state.player.name} は ${result.spell.name} を唱えた！`, `${this.enemy.name} に ${damage} のダメージ！`]);
        }

        this.updateHpBars();
        if (this.enemy.hp <= 0) await this.win();
        else await this.enemyTurn();
    }

    async playerAttack() {
        const stats = state.getDerivedStats();
        let damage = Math.max(1, stats.atk - this.enemy.def + Math.floor(Math.random() * 3));
        this.enemy.hp -= damage;
        
        soundManager.playHit();
        const enemySprite = this.container.querySelector('.enemy-sprite');
        enemySprite.classList.add('flash');
        this.container.classList.add('shake');
        
        setTimeout(() => {
            enemySprite.classList.remove('flash');
            this.container.classList.remove('shake');
        }, 500);

        this.updateHpBars();
        await dialogueManager.show('', [`${state.player.name} の攻撃！`, `${this.enemy.name} に ${damage} のダメージ！`]);
    }

    async enemyTurn() {
        const stats = state.getDerivedStats();
        let damage = Math.max(1, this.enemy.atk - stats.def + Math.floor(Math.random() * 3));
        state.player.currentHp = Math.max(0, state.player.currentHp - damage);
        
        soundManager.playHit();
        this.container.classList.add('shake');
        const playerStats = this.container.querySelector('.player-status-bar');
        playerStats.classList.add('flash');

        setTimeout(() => {
            this.container.classList.remove('shake');
            playerStats.classList.remove('flash');
        }, 500);

        this.updateHpBars();
        await dialogueManager.show('', [`${this.enemy.name} の攻撃！`, `${state.player.name} は ${damage} のダメージを受けた！`]);
        if (state.player.currentHp <= 0) await this.lose();
        else this.startTurn();
    }

    async win() {
        const lines = [`${this.enemy.name} をたおした！`];
        
        if (this.enemy.isBoss) {
            lines.push('ついに、ついに魔王を打ち倒した！', '世界に平和が戻ったのだ！');
            await dialogueManager.show('', lines);
            sceneManager.switchScene('Ending');
            return;
        }

        lines.push(`${this.enemy.exp} の経験値と ${this.enemy.gold} G を手に入れた！`);
        
        const leveledUp = state.addExp(this.enemy.exp);
        state.player.gold += this.enemy.gold;

        if (this.enemy.drops) {
            for (const drop of this.enemy.drops) {
                if (Math.random() < drop.chance) {
                    const item = this.itemCatalog[drop.id];
                    if (item) {
                        state.addItem(item);
                        lines.push(`${item.name} を手に入れた！`);
                    }
                }
            }
        }

        if (leveledUp) {
            lines.push(`${state.player.name} はレベル ${state.player.level} に上がった！`, `全ての能力値が上昇し、HPとMPが回復した！`);
        }

        await dialogueManager.show('', lines);
        sceneManager.switchScene(this.returnScene, { fromBattle: true });
    }

    async lose() {
        await dialogueManager.show('', [`${state.player.name} は力尽きた...`]);
        state.reset();
        sceneManager.switchScene('Title');
    }

    async exit() { console.log('Exiting Battle Scene'); }
}
