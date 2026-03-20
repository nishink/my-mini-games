export const UPGRADES = [
    { id: 'cursor', name: 'Cursor', baseCost: 10, cps: 0.1, desc: 'Autoclicks every 10 seconds.' },
    { id: 'grandma', name: 'Grandma', baseCost: 100, cps: 1, desc: 'A nice grandmother to bake more points.' },
    { id: 'farm', name: 'Farm', baseCost: 1100, cps: 8, desc: 'Grows points from point seeds.' },
    { id: 'mine', name: 'Mine', baseCost: 12000, cps: 47, desc: 'Extracts points from the earth.' },
    { id: 'factory', name: 'Factory', baseCost: 130000, cps: 260, desc: 'Mass produces points.' }
];

export class ClickerGame {
    constructor() {
        this.points = 0;
        this.clickPower = 1;
        this.totalPointsEarned = 0;
        
        // 各アップグレードの所持数
        this.inventory = {};
        UPGRADES.forEach(u => this.inventory[u.id] = 0);
        
        this.load();
    }

    click() {
        this.points += this.clickPower;
        this.totalPointsEarned += this.clickPower;
        return this.clickPower;
    }

    getPointsPerSecond() {
        let totalCPS = 0;
        UPGRADES.forEach(u => {
            totalCPS += u.cps * this.inventory[u.id];
        });
        return totalCPS;
    }

    getUpgradeCost(upgradeId) {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        const count = this.inventory[upgradeId];
        // 価格上昇式: baseCost * 1.15^count
        return Math.floor(upgrade.baseCost * Math.pow(1.15, count));
    }

    buyUpgrade(upgradeId) {
        const cost = this.getUpgradeCost(upgradeId);
        if (this.points >= cost) {
            this.points -= cost;
            this.inventory[upgradeId]++;
            this.save();
            return true;
        }
        return false;
    }

    update(deltaTime) {
        const cps = this.getPointsPerSecond();
        const earned = cps * deltaTime;
        this.points += earned;
        this.totalPointsEarned += earned;
    }

    save() {
        const data = {
            points: this.points,
            inventory: this.inventory,
            totalPointsEarned: this.totalPointsEarned
        };
        localStorage.setItem('mini-clicker-save', JSON.stringify(data));
    }

    load() {
        const saved = localStorage.getItem('mini-clicker-save');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.points = data.points || 0;
                this.inventory = data.inventory || this.inventory;
                this.totalPointsEarned = data.totalPointsEarned || 0;
            } catch (e) {
                console.error("Failed to load save:", e);
            }
        }
    }

    reset() {
        localStorage.removeItem('mini-clicker-save');
        this.points = 0;
        this.totalPointsEarned = 0;
        UPGRADES.forEach(u => this.inventory[u.id] = 0);
        this.save();
    }
}
