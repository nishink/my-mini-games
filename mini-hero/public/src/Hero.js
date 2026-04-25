import { ExperienceSystem } from './ExperienceSystem.js';

export class Hero {
    constructor() {
        this.level = 1;
        this.exp = 0;
        this.statPoints = 0;
        
        // 基本ステータス
        this.baseStats = {
            str: 5,
            dex: 5,
            int: 5,
            vit: 5
        };
    }

    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        
        while (this.exp >= ExperienceSystem.getExpForNextLevel(this.level)) {
            this.exp -= ExperienceSystem.getExpForNextLevel(this.level);
            this.levelUp();
            leveledUp = true;
        }
        
        return leveledUp;
    }

    levelUp() {
        this.level++;
        this.statPoints += 3; // 1レベルにつき3ポイント
    }

    allocateStat(statName) {
        if (this.statPoints > 0) {
            this.baseStats[statName]++;
            this.statPoints--;
            return true;
        }
        return false;
    }

    get derivedStats() {
        return {
            atk: this.baseStats.str * 2 + Math.floor(this.baseStats.dex * 0.5),
            def: Math.floor(this.baseStats.vit * 1.5),
            hp: 100 + this.baseStats.vit * 10,
            mp: 50 + this.baseStats.int * 5
        };
    }

    get expPercent() {
        const next = ExperienceSystem.getExpForNextLevel(this.level);
        return (this.exp / next) * 100;
    }
}
