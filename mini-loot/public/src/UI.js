import { ITEM_TYPES } from './Item.js';

export class UI {
    constructor(inventory) {
        this.inventory = inventory;
        this.grid = document.getElementById('inventory-grid');
        this.invCount = document.getElementById('inv-count');
        this.invCapacity = document.getElementById('inv-capacity');
        this.statElements = {
            atk: document.getElementById('stat-atk'),
            def: document.getElementById('stat-def'),
            hp: document.getElementById('stat-hp'),
            mp: document.getElementById('stat-mp')
        };
        this.eqSlots = {
            weapon: document.getElementById('eq-weapon'),
            armor: document.getElementById('eq-armor'),
            accessory: document.getElementById('eq-accessory')
        };
        this.toastContainer = document.getElementById('toast-container');
        
        this.invCapacity.textContent = inventory.capacity;
    }

    render() {
        this.renderInventory();
        this.renderStats();
        this.renderEquipment();
    }

    renderInventory() {
        this.grid.innerHTML = '';
        this.invCount.textContent = this.inventory.items.length;

        this.inventory.items.forEach(item => {
            const el = document.createElement('div');
            el.className = `inv-item ${this.inventory.isEquipped(item.id) ? 'equipped' : ''}`;
            el.innerHTML = `
                <div class="item-icon rarity-${item.rarity.id}">${this.getItemEmoji(item)}</div>
                <div class="item-info">
                    <div class="rarity-${item.rarity.id}">${item.fullName}</div>
                    <div>${this.getStatsString(item.stats)}</div>
                </div>
            `;
            el.onclick = () => this.onItemClick(item);
            el.oncontextmenu = (e) => {
                e.preventDefault();
                this.onItemRightClick(item);
            };
            this.grid.appendChild(el);
        });
    }

    renderStats() {
        const stats = this.inventory.getTotalStats();
        for (const [key, el] of Object.entries(this.statElements)) {
            el.textContent = stats[key];
        }
    }

    renderEquipment() {
        for (const [slot, el] of Object.entries(this.eqSlots)) {
            const item = this.inventory.equipped[slot];
            if (item) {
                el.textContent = item.fullName;
                el.className = `slot-content rarity-${item.rarity.id}`;
            } else {
                el.textContent = 'Empty';
                el.className = 'slot-content';
            }
        }
    }

    getItemEmoji(item) {
        switch (item.type) {
            case ITEM_TYPES.WEAPON: return '⚔️';
            case ITEM_TYPES.ARMOR: return '🛡️';
            case ITEM_TYPES.ACCESSORY: return '💍';
            default: return '📦';
        }
    }

    getStatsString(stats) {
        return Object.entries(stats)
            .map(([key, val]) => `${key.toUpperCase()}:+${val}`)
            .join(' ');
    }

    onItemClick(item) {
        this.inventory.equip(item.id);
        this.render();
    }

    onItemRightClick(item) {
        if (confirm(`${item.fullName} を売却しますか？`)) {
            this.inventory.removeItem(item.id);
            this.render();
        }
    }

    showToast(message, rarity) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (rarity) toast.style.borderLeftColor = rarity.color;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}
