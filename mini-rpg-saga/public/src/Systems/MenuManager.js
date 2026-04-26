/**
 * Mini RPG Saga - MenuManager
 * メニュー画面（ステータス、装備、もちもの）を管理する。
 */
import { state } from '../Core/GlobalState.js';
import { notificationManager } from './NotificationManager.js';

export class MenuManager {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.currentTab = 'status';
    }

    init(parentContainer) {
        this.container = document.createElement('div');
        this.container.id = 'menu-window';
        this.container.className = 'hidden overlay';
        parentContainer.appendChild(this.container);
    }

    open() {
        this.isActive = true;
        this.currentTab = 'status';
        this.render();
        this.container.classList.remove('hidden');
    }

    render() {
        const stats = state.getDerivedStats();
        
        this.container.innerHTML = `
            <div class="menu-box ui-panel">
                <div class="menu-tabs">
                    <button class="tab-btn ${this.currentTab === 'status' ? 'active' : ''}" data-tab="status">能力</button>
                    <button class="tab-btn ${this.currentTab === 'equip' ? 'active' : ''}" data-tab="equip">装備</button>
                    <button class="tab-btn ${this.currentTab === 'items' ? 'active' : ''}" data-tab="items">道具</button>
                </div>

                <div class="menu-content">
                    ${this.renderContent(stats)}
                </div>

                <div class="menu-footer">
                    <button id="close-menu" class="menu-btn">閉じる</button>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                this.currentTab = btn.getAttribute('data-tab');
                this.render();
            };
        });

        this.container.querySelectorAll('.action-btn-sm').forEach(btn => {
            btn.onclick = () => {
                const index = btn.getAttribute('data-index');
                const action = btn.getAttribute('data-action');
                const slot = btn.getAttribute('data-slot');

                if (action === 'equip') this.equipItem(parseInt(index));
                else if (action === 'unequip') this.unequipItem(slot);
                else if (action === 'use') this.useItem(parseInt(index));
            };
        });

        this.container.querySelector('#close-menu').onclick = () => this.close();
    }

    renderContent(stats) {
        switch (this.currentTab) {
            case 'status': return this.renderStatus(stats);
            case 'equip': return this.renderEquip();
            case 'items': return this.renderItems();
            default: return '';
        }
    }

    renderStatus(stats) {
        return `
            <div class="stats-list">
                <div class="status-header">
                    <span class="p-name">${state.player.name}</span>
                    <span class="p-lv">Lv.${state.player.level}</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-row"><span>HP</span> <span>${state.player.currentHp} / ${stats.maxHp}</span></div>
                <div class="stat-row"><span>MP</span> <span>${state.player.currentMp} / ${stats.maxMp}</span></div>
                <div class="stat-row"><span>攻撃力</span> <span>${stats.atk}</span></div>
                <div class="stat-row"><span>防御力</span> <span>${stats.def}</span></div>
                <div class="stat-divider"></div>
                <div class="stat-row"><span>武器</span> <span class="eq-val">${state.equipment.weapon ? state.equipment.weapon.name : 'なし'}</span></div>
                <div class="stat-row"><span>防具</span> <span class="eq-val">${state.equipment.armor ? state.equipment.armor.name : 'なし'}</span></div>
            </div>
        `;
    }

    renderEquip() {
        const gear = state.inventory.filter(item => item.type === 'weapon' || item.type === 'armor' || item.id.includes('sword') || item.id.includes('armor'));
        if (gear.length === 0) return '<p class="empty-msg">装備できるものがありません</p>';
        
        return `
            <div class="inventory-list">
                ${state.inventory.map((item, index) => {
                    const canEquip = item.type === 'weapon' || item.type === 'armor' || item.id.includes('sword') || item.id.includes('armor');
                    if (!canEquip) return '';
                    const isEquipped = state.isEquipped(item);
                    const slot = (item.type === 'weapon' || item.id.includes('sword')) ? 'weapon' : 'armor';

                    return `
                        <div class="inventory-item">
                            <div class="item-info">
                                <span class="item-name">${isEquipped ? '<span class="eq-mark">[E]</span> ' : ''}${item.name}</span>
                                <span class="item-desc">${item.description}</span>
                            </div>
                            ${isEquipped ? `
                                <button class="action-btn-sm unequip-btn" data-action="unequip" data-slot="${slot}">外す</button>
                            ` : `
                                <button class="action-btn-sm equip-btn" data-action="equip" data-index="${index}">装備</button>
                            `}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderItems() {
        const consumables = state.inventory.filter(item => item.type === 'consumable' || item.id.includes('potion') || item.id.includes('ether'));
        if (consumables.length === 0) return '<p class="empty-msg">使える道具がありません</p>';
        
        return `
            <div class="inventory-list">
                ${state.inventory.map((item, index) => {
                    const isConsumable = item.type === 'consumable' || item.id.includes('potion') || item.id.includes('ether');
                    if (!isConsumable) return '';
                    return `
                        <div class="inventory-item">
                            <div class="item-info">
                                <span class="item-name">${item.name}</span>
                                <span class="item-desc">${item.description}</span>
                            </div>
                            <button class="action-btn-sm use-btn" data-action="use" data-index="${index}">使用</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    equipItem(index) {
        const item = state.inventory[index];
        if (item) {
            state.equipItem(item);
            notificationManager.show(`${item.name} を装備しました`);
            this.render();
        }
    }

    unequipItem(slot) {
        state.unequipItem(slot);
        notificationManager.show('装備を外しました');
        this.render();
    }

    useItem(index) {
        const item = state.inventory[index];
        const itemName = item ? item.name : 'アイテム';
        if (state.consumeItem(index)) {
            notificationManager.show(`${itemName} を使用しました`);
            this.render();
        } else {
            notificationManager.show('今は使えません');
        }
    }

    close() {
        this.isActive = false;
        this.container.classList.add('hidden');
    }
}

export const menuManager = new MenuManager();
