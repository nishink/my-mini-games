/**
 * Mini RPG Saga - ShopManager
 * ショップ画面の表示と購入・売却処理を管理する。
 */
import { state } from '../Core/GlobalState.js';
import { notificationManager } from './NotificationManager.js';

export class ShopManager {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.currentMode = 'buy';
        this.shopTitle = 'ショップ';
        
        this.defaultCatalog = [
            { id: 'potion', name: 'ポーション', description: 'HPを50回復', price: 20, type: 'consumable' },
            { id: 'ether', name: 'エーテル', description: 'MPを20回復', price: 50, type: 'consumable' },
            { id: 'iron_sword', name: '鉄の剣', description: '攻撃力 +10', price: 150, type: 'weapon', atk: 10 },
            { id: 'leather_armor', name: '皮の服', description: '防御力 +5', price: 100, type: 'armor', def: 5 }
        ];
        this.catalog = [...this.defaultCatalog];
    }

    init(parentContainer) {
        this.container = document.createElement('div');
        this.container.id = 'shop-window';
        this.container.className = 'hidden overlay';
        parentContainer.appendChild(this.container);
    }

    open(catalog = null, title = 'ショップ') {
        this.isActive = true;
        this.currentMode = 'buy';
        this.catalog = catalog || this.defaultCatalog;
        this.shopTitle = title;
        this.render();
        this.container.classList.remove('hidden');
    }

    render() {
        this.container.innerHTML = `
            <div class="shop-box ui-panel">
                <div class="shop-header">
                    <h3 class="shop-name">${this.shopTitle}</h3>
                    <div class="shop-gold">${state.player.gold} G</div>
                </div>
                
                <div class="shop-tabs">
                    <button class="tab-btn ${this.currentMode === 'buy' ? 'active' : ''}" data-mode="buy">買う</button>
                    <button class="tab-btn ${this.currentMode === 'sell' ? 'active' : ''}" data-mode="sell">売る</button>
                </div>

                <div class="shop-content">
                    ${this.currentMode === 'buy' ? this.renderBuyList() : this.renderSellList()}
                </div>

                <div class="shop-footer">
                    <button id="close-shop" class="menu-btn">店を出る</button>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                this.currentMode = btn.getAttribute('data-mode');
                this.render();
            };
        });

        this.container.querySelectorAll('.action-btn-sm').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const index = btn.getAttribute('data-index');
                if (this.currentMode === 'buy') this.buyItem(id);
                else this.sellItem(parseInt(index));
            };
        });

        this.container.querySelector('#close-shop').onclick = () => this.close();
    }

    renderBuyList() {
        return `
            <div class="shop-items">
                ${this.catalog.map(item => `
                    <div class="shop-item">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-desc">${item.description}</span>
                        </div>
                        <button class="action-btn-sm buy-btn" ${state.player.gold < item.price ? 'disabled' : ''} data-id="${item.id}">
                            ${item.price} G
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSellList() {
        if (state.inventory.length === 0) return '<p class="empty-msg">売れるものがありません</p>';
        return `
            <div class="shop-items">
                ${state.inventory.map((item, index) => {
                    const sellPrice = Math.floor(item.price * 0.5);
                    return `
                        <div class="shop-item">
                            <div class="item-info">
                                <span class="item-name">${item.name}</span>
                                <span class="item-desc">売値: ${sellPrice} G</span>
                            </div>
                            <button class="action-btn-sm sell-btn" data-index="${index}">売る</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    buyItem(itemId) {
        const item = this.catalog.find(i => i.id === itemId);
        if (item && state.player.gold >= item.price) {
            state.player.gold -= item.price;
            state.inventory.push({ ...item });
            this.render();
            notificationManager.show(`${item.name} を購入しました`);
        }
    }

    sellItem(index) {
        const item = state.inventory[index];
        if (item) {
            if (state.isEquipped(item)) {
                notificationManager.show('装備中のものは売れません');
                return;
            }
            const sellPrice = Math.floor(item.price * 0.5);
            state.player.gold += sellPrice;
            state.inventory.splice(index, 1);
            this.render();
            notificationManager.show(`${item.name} を売却しました`);
        }
    }

    close() {
        this.isActive = false;
        this.container.classList.add('hidden');
    }
}

export const shopManager = new ShopManager();
