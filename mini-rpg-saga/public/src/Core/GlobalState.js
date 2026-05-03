import { soundManager } from './SoundManager.js';

/**
 * Mini RPG Saga - GlobalState
 */
export class GlobalState {
    constructor() {
        if (GlobalState.instance) {
            return GlobalState.instance;
        }

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
            currentMp: 75
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
            
            const stats = this.getDerivedStats();
            this.player.currentHp = stats.maxHp;
            this.player.currentMp = stats.maxMp;
            
            leveledUp = true;
        }
        return leveledUp;
    }

    upgradeStat(stat) {
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
            this.flags = { ...this.flags, ...data.flags }; // 既存のデフォルトフラグとマージ

            // 互換性維持：古いセーブデータに新しいパラメータがない場合の補完
            if (!this.player.bonusStats) {
                this.player.bonusStats = { str: 0, dex: 0, int: 0, vit: 0 };
            }
            if (this.player.statPoints === undefined) {
                this.player.statPoints = 0;
            }

            return true;
        } catch (e) {
            console.error('Failed to deserialize state:', e);
            return false;
        }
    }
}

export const state = new GlobalState();
