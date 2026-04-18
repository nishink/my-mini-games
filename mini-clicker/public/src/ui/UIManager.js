import { UPGRADES } from '../game/ClickerGame.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        
        // DOM Elements
        this.pointDisplay = document.getElementById('point-display');
        this.cpsDisplay = document.getElementById('cps-display');
        this.upgradeList = document.getElementById('upgrade-list');
        this.mainBtn = document.getElementById('main-click-btn');
        this.effectsLayer = document.getElementById('effects-layer');
        this.resetBtn = document.getElementById('reset-game-btn');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        this.init();
    }

    init() {
        this.renderShop();
        
        // Keyboard/Mouse Click
        this.mainBtn.addEventListener('mousedown', (e) => {
            if (e.pointerType === 'touch') return; // Touch is handled by touchstart
            this.handlePlayerClick(e.clientX, e.clientY);
        });

        // Multi-touch Support for mobile
        this.mainBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Handle each new touch point independently
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                this.handlePlayerClick(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        // Tab Switching for mobile
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });

        this.resetBtn.addEventListener('click', () => {
            if (confirm("Reset all progress?")) {
                this.game.reset();
                this.renderShop();
                this.updateDisplay();
            }
        });
    }

    handlePlayerClick(x, y) {
        const amount = this.game.click();
        this.createClickEffect(x, y, amount);
        this.updateDisplay();
        
        // Visual feedback
        this.mainBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.mainBtn.style.transform = '';
        }, 50);
    }

    switchTab(tabId) {
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id.includes(tabId));
        });
    }

    renderShop() {
        this.upgradeList.innerHTML = '';
        UPGRADES.forEach(u => {
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.id = `upgrade-${u.id}`;
            const cost = this.game.getUpgradeCost(u.id);
            item.innerHTML = `
                <div class="upgrade-info">
                    <h4>${u.name}</h4>
                    <p>${u.desc}</p>
                    <span class="upgrade-cost">Cost: ${cost.toLocaleString()}</span>
                </div>
                <div class="upgrade-count">${this.game.inventory[u.id]}</div>
            `;
            item.addEventListener('click', () => {
                if (this.game.buyUpgrade(u.id)) {
                    this.renderShop();
                    this.updateDisplay();
                }
            });
            this.upgradeList.appendChild(item);
        });
    }

    updateDisplay() {
        this.pointDisplay.innerText = `${Math.floor(this.game.points).toLocaleString()} Points`;
        this.cpsDisplay.innerText = `per second: ${this.game.getPointsPerSecond().toFixed(1)}`;

        UPGRADES.forEach(u => {
            const item = document.getElementById(`upgrade-${u.id}`);
            if (!item) return;
            const cost = this.game.getUpgradeCost(u.id);
            if (this.game.points >= cost) {
                item.classList.remove('disabled');
            } else {
                item.classList.add('disabled');
            }
        });
    }

    createClickEffect(x, y, amount) {
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.innerText = `+${amount}`;
        
        // Adjust for viewport scrolling/absolute positioning
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        
        const offset = (Math.random() - 0.5) * 60;
        el.style.marginLeft = `${offset}px`;

        this.effectsLayer.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }
}
