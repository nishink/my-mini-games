import { cards } from './CardMaster.js';

/**
 * mini-deck - GlobalState
 */
export class GlobalState {
    constructor() {
        if (GlobalState.instance) return GlobalState.instance;
        this.reset();
        GlobalState.instance = this;
    }

    reset() {
        this.player = {
            name: '勇者',
            hp: 50,
            maxHp: 50,
            block: 0,
            energy: 3,
            maxEnergy: 3,
            strength: 0,
            deck: [
                'strike', 'strike', 'strike', 'strike', 'strike',
                'defend', 'defend', 'defend', 'defend',
                'bash'
            ]
        };

        this.battle = {
            drawPile: [],
            hand: [],
            discardPile: [],
            turn: 0
        };
    }

    // デッキをシャッフルして山札を作成
    initBattle() {
        this.player.block = 0;
        this.player.strength = 0;
        this.battle.drawPile = [...this.player.deck].sort(() => Math.random() - 0.5);
        this.battle.hand = [];
        this.battle.discardPile = [];
        this.battle.turn = 1;
    }

    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.battle.drawPile.length === 0) {
                if (this.battle.discardPile.length === 0) break;
                // 捨て札をシャッフルして山札へ
                this.battle.drawPile = [...this.battle.discardPile].sort(() => Math.random() - 0.5);
                this.battle.discardPile = [];
            }
            this.battle.hand.push(this.battle.drawPile.pop());
        }
    }

    playCard(index) {
        const cardId = this.battle.hand[index];
        const card = cards[cardId];
        if (this.player.energy >= card.cost) {
            this.player.energy -= card.cost;
            this.battle.hand.splice(index, 1);
            this.battle.discardPile.push(cardId);
            return card;
        }
        return null;
    }

    endTurn() {
        // 残った手札を捨てる
        this.battle.discardPile.push(...this.battle.hand);
        this.battle.hand = [];
    }

    startTurn() {
        this.player.block = 0; // ブロックは自分のターン開始時にリセット
        this.player.energy = this.player.maxEnergy;
        this.drawCards(5);
        this.battle.turn++;
    }

    addCardToDeck(cardId) {
        this.player.deck.push(cardId);
    }
}

export const state = new GlobalState();
