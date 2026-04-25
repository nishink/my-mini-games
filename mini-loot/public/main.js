import { Inventory } from './src/Inventory.js';
import { LootSystem } from './src/LootSystem.js';
import { UI } from './src/UI.js';

class Game {
    constructor() {
        this.inventory = new Inventory(30);
        this.ui = new UI(this.inventory);
        this.lootBtn = document.getElementById('loot-btn');

        this.init();
    }

    init() {
        this.lootBtn.addEventListener('click', () => this.getLoot());
        
        // 初回レンダリング
        this.ui.render();
        
        console.log('Mini Loot Initialized');
    }

    getLoot() {
        const item = LootSystem.generateItem();
        const success = this.inventory.addItem(item);
        
        if (success) {
            this.ui.showToast(`入手: ${item.fullName}`, item.rarity);
            this.ui.render();
        } else {
            this.ui.showToast('インベントリがいっぱいです！');
        }
    }
}

// 開始
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
