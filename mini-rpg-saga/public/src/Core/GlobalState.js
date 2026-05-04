import { soundManager } from './SoundManager.js';

/**
 * Mini RPG Saga - GlobalState
 * ゲーム全体のステート（プレイヤーの状態、インベントリ、フラグなど）を管理するシングルトン。
 */
export class GlobalState {
    constructor() {
        if (GlobalState.instance) {
            return GlobalState.instance;
        }

        this.spellMaster = {
            heal: { id: 'heal', name: 'ヒール', cost: 10, type: 'recovery', power: 50, field: true, desc: 'HPを約50回復' },
            fire: { id: 'fire', name: 'ファイア', cost: 15, type: 'attack', power: 40, field: false, desc: '敵に火炎ダメージ' }
        };

        this.reset();
        GlobalState.instance = this;
    }

    reset() {
        this.player = {
            name: '勇者',
            level: 1,
            exp: 0,
            gold: 100,
            baseStats: {
                str: 5,
                dex: 5,
                int: 5,
                vit: 5
            },
            bonusStats: {
                str: 0,
                dex: 0,
                int: 0,
                vit: 0
            },
            statPoints: 0,
            currentHp: 150,
            currentMp: 75,
            spells: []
        };

        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };

        this.flags = {
            hasMetKing: false,
            acceptedQuest: false,
            tutorialComplete: false,
            defeatedBoss: false
        };

        this.currentScene = 'Title';
    }

    getDerivedStats() {
        let bonusAtk = 0;
        let bonusDef = 0;

        if (this.equipment.weapon) bonusAtk += this.equipment.weapon.atk || 0;
        if (this.equipment.armor) bonusDef += this.equipment.armor.def || 0;

        // 安全な値の取得（undefined対策）
        const b = this.player.bonusStats || { str: 0, vit: 0, int: 0 };
        const totalStr = this.player.baseStats.str + (b.str || 0);
        const totalVit = this.player.baseStats.vit + (b.vit || 0);
        const totalInt = this.player.baseStats.int + (b.int || 0);

        const stats = {
            atk: (totalStr * 2) + bonusAtk,
            def: Math.floor(totalVit * 1.5) + bonusDef,
            maxHp: 100 + totalVit * 10,
            maxMp: 50 + totalInt * 5
        };

        return stats;
    }

    equipItem(item) {
        if (item.type === 'weapon') this.equipment.weapon = item;
        else if (item.type === 'armor') this.equipment.armor = item;
    }

    unequipItem(slot) {
        if (slot === 'weapon') this.equipment.weapon = null;
        else if (slot === 'armor') this.equipment.armor = null;
    }

    consumeItem(index) {
        const item = this.inventory[index];
        if (!item || item.type !== 'consumable') return false;

        const stats = this.getDerivedStats();
        let used = false;

        if (item.id === 'potion') {
            if (this.player.currentHp < stats.maxHp) {
                this.player.currentHp = Math.min(stats.maxHp, this.player.currentHp + 50);
                used = true;
                soundManager.playHeal();
            }
        } else if (item.id === 'ether') {
            if (this.player.currentMp < stats.maxMp) {
                this.player.currentMp = Math.min(stats.maxMp, this.player.currentMp + 20);
                used = true;
                soundManager.playOk();
            }
        } else if (item.id === 'herb') {
            this.player.currentHp = Math.min(stats.maxHp, this.player.currentHp + 10);
            used = true;
            soundManager.playHeal();
        }

        if (used) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }

    getNextLevelExp() {
        return this.player.level * 50;
    }

    addExp(amount) {
        this.player.exp += amount;
        let leveledUp = false;
        
        while (this.player.exp >= this.getNextLevelExp()) {
            this.player.exp -= this.getNextLevelExp();
            this.player.level++;
            this.player.statPoints += 3; // レベルアップで3ポイント付与
            
            this.player.baseStats.str += 1;
            this.player.baseStats.vit += 1;
            this.player.baseStats.int += 1;
            this.player.baseStats.dex += 1;

            // 魔法の習得
            if (this.player.level === 2) this.learnSpell('heal');
            if (this.player.level === 4) this.learnSpell('fire');
            
            const stats = this.getDerivedStats();
            this.player.currentHp = stats.maxHp;
            this.player.currentMp = stats.maxMp;
            
            leveledUp = true;
        }
        return leveledUp;
    }

    learnSpell(spellId) {
        if (!this.player.spells) this.player.spells = [];
        if (!this.player.spells.includes(spellId)) {
            this.player.spells.push(spellId);
            return true;
        }
        return false;
    }

    castSpell(spellId, isBattle = false) {
        const spell = this.spellMaster[spellId];
        if (!spell || this.player.currentMp < spell.cost) return { success: false, msg: 'MPが足りません' };
        if (!isBattle && !spell.field) return { success: false, msg: 'ここでは使えません' };

        this.player.currentMp -= spell.cost;
        let resultMsg = '';

        if (spell.type === 'recovery') {
            const stats = this.getDerivedStats();
            const amount = spell.power + Math.floor((this.player.baseStats.int + (this.player.bonusStats?.int || 0)) * 0.5);
            this.player.currentHp = Math.min(stats.maxHp, this.player.currentHp + amount);
            resultMsg = `${spell.name}を唱えた！ HPが ${amount} 回復した！`;
            soundManager.playHeal();
        }

        return { success: true, msg: resultMsg, spell };
    }

    rest() {
        const stats = this.getDerivedStats();
        this.player.currentHp = stats.maxHp;
        this.player.currentMp = stats.maxMp;
    }

    upgradeStat(stat) {
        if (!this.player.bonusStats) this.player.bonusStats = { str: 0, dex: 0, int: 0, vit: 0 };
        if (this.player.statPoints > 0 && this.player.bonusStats.hasOwnProperty(stat)) {
            this.player.bonusStats[stat]++;
            this.player.statPoints--;
            return true;
        }
        return false;
    }

    addItem(item) {
        if (!item) return;
        this.inventory.push({ ...item });
    }

    isEquipped(item) {
        if (!item) return false;
        return (this.equipment.weapon && this.equipment.weapon.id === item.id) ||
               (this.equipment.armor && this.equipment.armor.id === item.id);
    }

    serialize() {
        return JSON.stringify({
            player: this.player,
            inventory: this.inventory,
            equipment: this.equipment,
            flags: this.flags
        });
    }

    deserialize(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.player = data.player;
            this.inventory = data.inventory;
            this.equipment = data.equipment;
            this.flags = { ...this.flags, ...data.flags };

            // 互換性補完
            if (!this.player.bonusStats) {
                this.player.bonusStats = { str: 0, dex: 0, int: 0, vit: 0 };
            }
            if (this.player.statPoints === undefined) {
                this.player.statPoints = 0;
            }
            if (!this.player.spells) {
                this.player.spells = [];
            }

            return true;
        } catch (e) {
            console.error('Failed to deserialize state:', e);
            return false;
        }
    }
}

export const state = new GlobalState();
