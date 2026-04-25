import { Item, RARITY, ITEM_TYPES } from './Item.js';

const ITEM_POOL = [
    { name: '剣', type: ITEM_TYPES.WEAPON, baseStats: { atk: 10 } },
    { name: '斧', type: ITEM_TYPES.WEAPON, baseStats: { atk: 15 } },
    { name: '杖', type: ITEM_TYPES.WEAPON, baseStats: { atk: 5, mp: 20 } },
    { name: '盾', type: ITEM_TYPES.ARMOR, baseStats: { def: 8 } },
    { name: '鎧', type: ITEM_TYPES.ARMOR, baseStats: { def: 12, hp: 50 } },
    { name: '指輪', type: ITEM_TYPES.ACCESSORY, baseStats: { hp: 20, mp: 10 } },
    { name: 'アミュレット', type: ITEM_TYPES.ACCESSORY, baseStats: { atk: 2, def: 2 } }
];

const PREFIXES = {
    [RARITY.COMMON.id]: ['', '古びた', '普通の'],
    [RARITY.RARE.id]: ['鋭い', '頑丈な', '良質な'],
    [RARITY.EPIC.id]: ['英雄の', '魔力を持った', '輝く'],
    [RARITY.LEGENDARY.id]: ['伝説の', '神々の', '究極の']
};

export class LootSystem {
    static generateItem() {
        // 1. レアリティの決定
        const rarity = this.rollRarity();
        
        // 2. ベースアイテムの選択
        const base = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
        
        // 3. 接頭辞の決定
        const prefixes = PREFIXES[rarity.id];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        // 4. ステータスの計算 (レアリティによる補正)
        const stats = this.calculateStats(base.baseStats, rarity);
        
        return new Item({
            name: base.name,
            type: base.type,
            rarity: rarity,
            prefix: prefix,
            stats: stats
        });
    }

    static rollRarity() {
        const totalWeight = Object.values(RARITY).reduce((sum, r) => sum + r.weight, 0);
        let roll = Math.random() * totalWeight;
        
        for (const rarity of Object.values(RARITY)) {
            if (roll < rarity.weight) return rarity;
            roll -= rarity.weight;
        }
        return RARITY.COMMON;
    }

    static calculateStats(baseStats, rarity) {
        const multiplier = {
            [RARITY.COMMON.id]: 1.0,
            [RARITY.RARE.id]: 1.5,
            [RARITY.EPIC.id]: 2.5,
            [RARITY.LEGENDARY.id]: 5.0
        }[rarity.id];

        const stats = {};
        for (const [key, value] of Object.entries(baseStats)) {
            // ベース値 * 倍率 + 乱数(0~20%の振れ幅)
            stats[key] = Math.floor(value * multiplier * (1 + Math.random() * 0.2));
        }
        return stats;
    }
}
