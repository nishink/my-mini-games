/**
 * Mini RPG Saga - MenuManager
 * メニュー画面（ステータス、インベントリ）を管理する。
 */
import { state } from '../Core/GlobalState.js';

export class MenuManager {
    constructor() {
        this.container = null;
        this.isActive = false;
    }

    init(parentContainer) {
        this.container = document.createElement('div');
        this.container.id = 'menu-window';
        this.container.className = 'hidden overlay';
        parentContainer.appendChild(this.container);
    }

    open() {
        this.isActive = true;
        this.render();
        this.container.classList.remove('hidden');
    }

    render() {
        const stats = state.getDerivedStats();
        
        this.container.innerHTML = `
            <div class="menu-box ui-panel">
                <div class="menu-tabs">
                    <button class="tab-btn active" data-tab="status">ステータス</button>
                    <button class="tab-btn" data-tab="items">もちもの</button>
                </div>

                <div id="menu-content-status" class="menu-content">
                    <div class="status-grid">
                        <div class="status-header">
                            <span class="p-name">${state.player.name}</span>
                            <span class="p-lv">Lv.${state.player.level}</span>
                        </div>
                        <div class="stats-list">
                            <div class="stat-row"><span>HP</span> <span>${state.player.currentHp} / ${stats.maxHp}</span></div>
                            <div class="stat-row"><span>MP</span> <span>${state.player.currentMp} / ${stats.maxMp}</span></div>
                            <div class="stat-row"><span>攻撃力</span> <span>${stats.atk}</span></div>
                            <div class="stat-row"><span>防御力</span> <span>${stats.def}</span></div>
                            <div class="stat-divider"></div>
                            <div class="stat-row"><span>STR</span> <span>${state.player.baseStats.str}</span></div>
                            <div class="stat-row"><span>DEX</span> <span>${state.player.baseStats.dex}</span></div>
                            <div class="stat-row"><span>INT</span> <span>${state.player.baseStats.int}</span></div>
                            <div class="stat-row"><span>VIT</span> <span>${state.player.baseStats.vit}</span></div>
                            <div class="stat-divider"></div>
                            <div class="stat-row"><span>GOLD</span> <span>${state.player.gold} G</span></div>
                        </div>
                    </div>
                </div>

                <div id="menu-content-items" class="menu-content hidden">
                    <div class="inventory-list">
                        ${state.inventory.length === 0 ? '<p>なにも持っていない</p>' : 
                            state.inventory.map(item => `
                                <div class="inventory-item">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-count">x1</span>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>

                <div class="menu-footer">
                    <button id="close-menu" class="menu-btn">閉じる</button>
                </div>
            </div>
        `;

        // タブ切り替え
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            };
        });

        this.container.querySelector('#close-menu').onclick = () => {
            this.close();
        };
    }

    switchTab(tabName) {
        this.container.querySelectorAll('.menu-content').forEach(el => el.classList.add('hidden'));
        this.container.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        
        this.container.querySelector(`#menu-content-${tabName}`).classList.remove('hidden');
        this.container.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    }

    close() {
        this.isActive = false;
        this.container.classList.add('hidden');
    }
}

export const menuManager = new MenuManager();
