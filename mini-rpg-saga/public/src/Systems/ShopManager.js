/**
 * Mini RPG Saga - ShopManager
 * ショップ画面の表示と購入処理を管理する。
 */
import { state } from '../Core/GlobalState.js';

export class ShopManager {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.items = [
            { id: 'potion', name: 'ポーション', description: 'HPを50回復する', price: 20 },
            { id: 'ether', name: 'エーテル', description: 'MPを20回復する', price: 50 },
            { id: 'herb', name: 'やくそう', description: '毒を治す', price: 10 },
            { id: 'iron_sword', name: '鉄の剣', description: '攻撃力 +5', price: 150 },
            { id: 'leather_armor', name: '皮の服', description: '防御力 +3', price: 100 }
        ];
    }

    init(parentContainer) {
        this.container = document.createElement('div');
        this.container.id = 'shop-window';
        this.container.className = 'hidden overlay';
        parentContainer.appendChild(this.container);
    }

    open() {
        this.isActive = true;
        this.render();
        this.container.classList.remove('hidden');
    }

    render() {
        this.container.innerHTML = `
            <div class="shop-box ui-panel">
                <div class="shop-header">
                    <h3>よろず屋</h3>
                    <div class="shop-gold">所持金: ${state.player.gold} G</div>
                </div>
                <div class="shop-items">
                    ${this.items.map(item => `
                        <div class="shop-item" data-id="${item.id}">
                            <div class="item-info">
                                <span class="item-name">${item.name}</span>
                                <span class="item-desc">${item.description}</span>
                            </div>
                            <button class="buy-btn" ${state.player.gold < item.price ? 'disabled' : ''} data-id="${item.id}">
                                ${item.price} G
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="shop-footer">
                    <button id="close-shop" class="menu-btn">店を出る</button>
                </div>
            </div>
        `;

        // イベントリスナーの登録
        this.container.querySelectorAll('.buy-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute('data-id');
                this.buyItem(id);
            };
        });

        this.container.querySelector('#close-shop').onclick = () => {
            this.close();
        };
    }

    buyItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item && state.player.gold >= item.price) {
            state.player.gold -= item.price;
            state.inventory.push({ ...item, quantity: 1 }); // 本来はスタック処理などが必要
            this.render(); // 再描画
            alert(`${item.name} を購入しました！`);
        } else {
            alert('お金が足りません！');
        }
    }

    close() {
        this.isActive = false;
        this.container.classList.add('hidden');
    }
}

export const shopManager = new ShopManager();
