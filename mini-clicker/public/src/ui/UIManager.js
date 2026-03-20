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

        this.init();
    }

    init() {
        this.renderShop();
        
        this.mainBtn.addEventListener('click', (e) => {
            const amount = this.game.click();
            this.createClickEffect(e.clientX, e.clientY, amount);
            this.updateDisplay();
        });

        this.resetBtn.addEventListener('click', () => {
            if (confirm("Reset all progress?")) {
                this.game.reset();
                this.renderShop();
                this.updateDisplay();
            }
        });
    }

    renderShop() {
        this.upgradeList.innerHTML = '';
        UPGRADES.forEach(u => {
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.id = `upgrade-${u.id}`;
            item.innerHTML = `
                <div class="upgrade-info">
                    <h4>${u.name}</h4>
                    <p>${u.desc}</p>
                    <span class="upgrade-cost">Cost: ${this.game.getUpgradeCost(u.id)}</span>
                </div>
                <div class="upgrade-count">${this.game.inventory[u.id]}</div>
            `;
            item.addEventListener('click', () => {
                if (this.game.buyUpgrade(u.id)) {
                    this.renderShop(); // リスト全体を再描画（コスト更新のため）
                    this.updateDisplay();
                }
            });
            this.upgradeList.appendChild(item);
        });
    }

    updateDisplay() {
        this.pointDisplay.innerText = `${Math.floor(this.game.points).toLocaleString()} Points`;
        this.cpsDisplay.innerText = `per second: ${this.game.getPointsPerSecond().toFixed(1)}`;

        // 購入可能かどうかのチェック
        UPGRADES.forEach(u => {
            const item = document.getElementById(`upgrade-${u.id}`);
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
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        
        // 少しランダムに散らす
        const offset = (Math.random() - 0.5) * 40;
        el.style.marginLeft = `${offset}px`;

        this.effectsLayer.appendChild(el);
        
        setTimeout(() => el.remove(), 1000);
    }
}
