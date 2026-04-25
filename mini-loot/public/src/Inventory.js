export class Inventory {
    constructor(capacity = 20) {
        this.items = [];
        this.capacity = capacity;
        this.equipped = {
            weapon: null,
            armor: null,
            accessory: null
        };
    }

    addItem(item) {
        if (this.items.length >= this.capacity) {
            return false;
        }
        this.items.push(item);
        return true;
    }

    removeItem(itemId) {
        // 装備中なら解除
        for (const slot in this.equipped) {
            if (this.equipped[slot] && this.equipped[slot].id === itemId) {
                this.equipped[slot] = null;
            }
        }
        this.items = this.items.filter(item => item.id !== itemId);
    }

    equip(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        const slot = item.type.slot;
        // 既に同じアイテムを装備していたら解除
        if (this.equipped[slot] && this.equipped[slot].id === itemId) {
            this.equipped[slot] = null;
        } else {
            this.equipped[slot] = item;
        }
    }

    isEquipped(itemId) {
        return Object.values(this.equipped).some(item => item && item.id === itemId);
    }

    getTotalStats() {
        const totals = { atk: 0, def: 0, hp: 100, mp: 50 };
        for (const item of Object.values(this.equipped)) {
            if (item && item.stats) {
                for (const [stat, value] of Object.entries(item.stats)) {
                    totals[stat] = (totals[stat] || 0) + value;
                }
            }
        }
        return totals;
    }
}
