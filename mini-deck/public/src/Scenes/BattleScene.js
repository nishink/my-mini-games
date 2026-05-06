import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { cards } from '../Core/CardMaster.js';
import { enemies, encounterList } from '../Core/EnemyDB.js';
import { messageManager } from '../Systems/MessageManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class BattleScene {
    constructor() {
        this.container = null;
        this.enemy = null;
        this.isPlayerTurn = true;
        this.selectedCardIdx = -1;
    }

    async enter(container) {
        this.container = container;
        
        // 敵の選定
        const enemyId = encounterList[Math.floor(Math.random() * encounterList.length)];
        this.enemy = { ...enemies[enemyId], block: 0 };
        
        state.initBattle();
        state.startTurn();

        this.renderLayout();
        messageManager.init(this.container);
        this.updateUI();
        
        await messageManager.show('', [`${this.enemy.name} があらわれた！`]);
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="battle-ui">
                <div class="battle-header">
                    <div id="turn-count" class="turn-count"></div>
                    <div id="deck-stats" class="deck-stats"></div>
                </div>

                <div class="enemy-area">
                    <div class="char-info">
                        <div id="enemy-intent" class="intent-icon"></div>
                        <div class="sprite">${this.enemy.emoji}</div>
                        <div class="name">${this.enemy.name}</div>
                        <div class="hp-bar-outer">
                            <div id="enemy-hp-bar" class="hp-bar-inner"></div>
                            <div id="enemy-hp-text" class="hp-text"></div>
                        </div>
                        <div id="enemy-block" class="block-icon hidden"></div>
                    </div>
                </div>

                <div class="player-area">
                    <div class="player-hud">
                        <div id="energy-display" class="energy-display"></div>
                        
                        <div class="char-info">
                            <div class="hp-bar-outer">
                                <div id="player-hp-bar" class="hp-bar-inner"></div>
                                <div id="player-hp-text" class="hp-text"></div>
                            </div>
                            <div id="player-block" class="block-icon hidden"></div>
                            <div id="player-name" class="name"></div>
                        </div>

                        <button id="end-turn-btn" class="end-turn-btn">ターン終了</button>
                    </div>

                    <div id="hand" class="hand-container"></div>
                </div>
            </div>
        `;

        // 静的なボタンのリスナーのみここで設定
        this.container.querySelector('#end-turn-btn').onclick = () => this.handleEndTurn();

        this.container.onclick = () => {
            if (messageManager.isActive) messageManager.next();
        };
    }

    updateUI() {
        // ヘッダー
        const turnCountEl = this.container.querySelector('#turn-count');
        if (turnCountEl) {
            turnCountEl.innerHTML = `Turn ${state.battle.turn} <button id="help-btn" class="help-btn">?</button>`;
            const helpBtn = turnCountEl.querySelector('#help-btn');
            if (helpBtn) helpBtn.onclick = (e) => { e.stopPropagation(); this.showGuide(); };
        }
        
        const deckStatsEl = this.container.querySelector('#deck-stats');
        if (deckStatsEl) {
            deckStatsEl.textContent = `山札: ${state.battle.drawPile.length} | 捨て札: ${state.battle.discardPile.length}`;
        }

        // 敵情報
        const enemyIntentEl = this.container.querySelector('#enemy-intent');
        if (enemyIntentEl) enemyIntentEl.textContent = this.getIntentIcon();
        
        const enemyHpBar = this.container.querySelector('#enemy-hp-bar');
        if (enemyHpBar) enemyHpBar.style.width = `${(this.enemy.hp / this.enemy.maxHp) * 100}%`;
        
        const enemyHpText = this.container.querySelector('#enemy-hp-text');
        if (enemyHpText) enemyHpText.textContent = `${this.enemy.hp} / ${this.enemy.maxHp}`;
        
        const eb = this.container.querySelector('#enemy-block');
        if (eb) {
            eb.textContent = `🛡️ ${this.enemy.block}`;
            eb.classList.toggle('hidden', this.enemy.block <= 0);
        }

        // プレイヤー情報
        const energyDisp = this.container.querySelector('#energy-display');
        if (energyDisp) energyDisp.textContent = state.player.energy;
        
        const playerHpBar = this.container.querySelector('#player-hp-bar');
        if (playerHpBar) playerHpBar.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
        
        const playerHpText = this.container.querySelector('#player-hp-text');
        if (playerHpText) playerHpText.textContent = `${state.player.hp} / ${state.player.maxHp}`;
        
        const pb = this.container.querySelector('#player-block');
        if (pb) {
            pb.textContent = `🛡️ ${state.player.block}`;
            pb.classList.toggle('hidden', state.player.block <= 0);
        }
        
        const playerNameEl = this.container.querySelector('#player-name');
        if (playerNameEl) {
            playerNameEl.innerHTML = `勇者 ${state.player.strength > 0 ? `<span style="color:var(--accent)">💪+${state.player.strength}</span>` : ''}`;
        }

        // 手札
        const hand = this.container.querySelector('#hand');
        if (hand) {
            hand.innerHTML = this.renderHand();
            hand.querySelectorAll('.card').forEach(el => {
                el.onclick = (e) => {
                    e.stopPropagation();
                    this.handleCardPlay(parseInt(el.dataset.idx));
                };
            });
        }

        // ボタン状態
        const endTurnBtn = this.container.querySelector('#end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.disabled = !this.isPlayerTurn || messageManager.isActive;
        }
    }

    renderHand() {
        return state.battle.hand.map((cardId, i) => {
            const card = cards[cardId];
            return `
                <div class="card" data-idx="${i}" style="border-color: ${card.color}">
                    <div class="card-cost">${card.cost}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-type">${card.type.toUpperCase()}</div>
                    <div class="card-desc">${card.desc}</div>
                </div>
            `;
        }).join('');
    }

    getIntentIcon() {
        const turnIdx = (state.battle.turn - 1) % this.enemy.pattern.length;
        const action = this.enemy.pattern[turnIdx];
        return action.intent + (action.type === 'attack' ? action.value : '');
    }

    setupListeners() {
        const cardEls = this.container.querySelectorAll('.card');
        cardEls.forEach(el => {
            el.onclick = () => this.handleCardPlay(parseInt(el.dataset.idx));
        });

        this.container.querySelector('#end-turn-btn').onclick = () => this.handleEndTurn();
        this.container.querySelector('#help-btn').onclick = () => this.showGuide();
    }

    showGuide() {
        const guide = document.createElement('div');
        guide.className = 'guide-overlay';
        guide.innerHTML = `
            <div class="guide-box ui-panel">
                <h2>遊び方のガイド</h2>
                <div class="guide-item">
                    <strong>1. カードを使う</strong>
                    <p>手札をクリックして使います。左上の数字がコストです。</p>
                </div>
                <div class="guide-item">
                    <strong>2. 敵の行動を見る</strong>
                    <p>敵の頭上のアイコンは次のターンの行動です（⚔️は攻撃）。</p>
                </div>
                <div class="guide-item">
                    <strong>3. 防御を固める</strong>
                    <p>敵が攻撃してくるなら「防御」カードで🛡️を得ましょう。</p>
                </div>
                <div class="guide-item">
                    <strong>4. ターンを終える</strong>
                    <p>「ターン終了」を押すと敵の番になります。手札は入れ替わります。</p>
                </div>
                <button class="close-guide-btn">わかった！</button>
            </div>
        `;
        this.container.appendChild(guide);
        guide.querySelector('.close-guide-btn').onclick = () => guide.remove();
    }

    async handleCardPlay(idx) {
        if (!this.isPlayerTurn || messageManager.isActive) return;

        const cardId = state.battle.hand[idx];
        const card = cards[cardId];

        if (state.player.energy < card.cost) {
            return;
        }

        state.playCard(idx);
        
        const lines = [`${state.player.name} は ${card.name} を使った！`];
        
        if (card.type === 'attack') {
            let damage = card.value + state.player.strength;
            lines.push(`${this.enemy.name} に ${damage} ダメージ！`);
            this.updateUI(); 
            await messageManager.show('', lines);
            await this.dealDamage(this.enemy, damage);
        } else if (card.type === 'skill') {
            lines.push(`ブロックを ${card.value} 得た`);
            state.player.block += card.value;
            this.updateUI(); 
            await messageManager.show('', lines);
        } else if (card.type === 'power') {
            lines.push(`筋力が ${card.value} 上がった！`);
            state.player.strength += card.value;
            this.updateUI(); 
            await messageManager.show('', lines);
        }

        soundManager.playOk();
        this.updateUI();

        if (this.enemy.hp <= 0) {
            await this.win();
        }
    }

    async dealDamage(target, amount) {
        const initialHp = target.hp;
        let remaining = amount;
        if (target.block > 0) {
            const blockDamage = Math.min(target.block, remaining);
            target.block -= blockDamage;
            remaining -= blockDamage;
        }
        
        if (remaining > 0) {
            target.hp = Math.max(0, target.hp - remaining);
        }
        
        const actualDamage = initialHp - target.hp;
        
        soundManager.playHit();
        // 簡易的なフラッシュ演出
        const sprite = this.container.querySelector(target === this.enemy ? '.enemy-area .sprite' : '.player-area .sprite');
        if (sprite) {
            sprite.classList.add('flash');
            setTimeout(() => sprite.classList.remove('flash'), 300);
        }
        this.updateUI();
        return actualDamage;
    }

    async handleEndTurn() {
        if (!this.isPlayerTurn || messageManager.isActive) return;
        
        this.isPlayerTurn = false;
        state.endTurn();
        this.updateUI();

        await messageManager.show('', [`${this.enemy.name} のターン`]);
        await this.enemyTurn();
        
        if (state.player.hp <= 0) {
            await this.lose();
        } else {
            state.startTurn();
            this.isPlayerTurn = true;
            this.updateUI();
        }
    }

    async enemyTurn() {
        const turnIdx = (state.battle.turn - 1) % this.enemy.pattern.length;
        const action = this.enemy.pattern[turnIdx];

        const lines = [];
        if (action.type === 'attack') {
            lines.push(`${this.enemy.name} の攻撃！`);
            const damageDealt = await this.dealDamage(state.player, action.value);
            if (damageDealt === 0 && action.value > 0) {
                lines.push(`ブロックが全てのダメージを防いだ！`);
            } else {
                lines.push(`${state.player.name} は ${damageDealt} ダメージを受けた`);
            }
            await messageManager.show('', lines);
        } else if (action.type === 'skill') {
            lines.push(`${this.enemy.name} は ${action.desc} を行った`);
            lines.push(`防御力が ${action.value} 上がった`);
            await messageManager.show('', lines);
            this.enemy.block += action.value;
        }
        this.updateUI();
    }

    async win() {
        await messageManager.show('', [`${this.enemy.name} をたおした！`]);
        sceneManager.switchScene('Reward');
    }

    async lose() {
        await messageManager.show('', ['力尽きた...']);
        sceneManager.switchScene('Title');
    }

    async exit() {
        this.container.innerHTML = '';
    }
}
