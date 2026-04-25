export const RARITY = {
    COMMON: { id: 'common', name: 'Common', color: '#aaaaaa', weight: 60 },
    RARE: { id: 'rare', name: 'Rare', color: '#0070dd', weight: 25 },
    EPIC: { id: 'epic', name: 'Epic', color: '#a335ee', weight: 10 },
    LEGENDARY: { id: 'legendary', name: 'Legendary', color: '#ff8000', weight: 5 }
};

export const ITEM_TYPES = {
    WEAPON: { id: 'weapon', name: '武器', slot: 'weapon' },
    ARMOR: { id: 'armor', name: '防具', slot: 'armor' },
    ACCESSORY: { id: 'accessory', name: '装飾品', slot: 'accessory' }
};

export class Item {
    constructor({ id, name, type, rarity, stats, prefix = '' }) {
        this.id = id || Math.random().toString(36).substr(2, 9);
        this.baseName = name;
        this.prefix = prefix;
        this.type = type; // ITEM_TYPES value
        this.rarity = rarity; // RARITY value
        this.stats = stats; // { atk, def, hp, etc }
    }

    get fullName() {
        return this.prefix ? `${this.prefix} ${this.baseName}` : this.baseName;
    }
}
