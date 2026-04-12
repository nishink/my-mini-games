export class Store {
    constructor() {
        this.reset();
    }

    reset() {
        this.gold = 500;
        this.reputation = 10;
        this.day = 1;
        this.maxStock = 50;

        this.items = {
            red: {
                name: '赤のポーション',
                stock: 0,
                cost: 10,
                price: 25,
                demandRate: 0.8 // 80%の客が欲しがる
            },
            blue: {
                name: '青のポーション',
                stock: 0,
                cost: 40,
                price: 100,
                demandRate: 0.2 // 20%の客（魔導士）だけが欲しがる
            }
        };
    }

    buyItem(type, amount) {
        const item = this.items[type];
        const totalCost = amount * item.cost;
        const currentTotalStock = Object.values(this.items).reduce((sum, i) => sum + i.stock, 0);

        if (this.gold >= totalCost && currentTotalStock + amount <= this.maxStock) {
            this.gold -= totalCost;
            item.stock += amount;
            return true;
        }
        return false;
    }

    upgradeAd() {
        if (this.gold >= 50) {
            this.gold -= 50;
            this.reputation += 5;
            return true;
        }
        return false;
    }

    upgradeShelf() {
        if (this.gold >= 100) {
            this.gold -= 100;
            this.maxStock += 20;
            return true;
        }
        return false;
    }

    calculateDailyBusiness(event) {
        // 客数は評判に基づく
        let customers = Math.floor(this.reputation * (0.8 + Math.random() * 0.4));
        customers = Math.floor(customers * event.customerModifier);

        let totalRevenue = 0;
        let soldRed = 0;
        let soldBlue = 0;

        for (let i = 0; i < customers; i++) {
            // 赤ポーションの判定
            if (Math.random() < this.items.red.demandRate * event.redModifier) {
                if (this.items.red.stock > 0) {
                    this.items.red.stock--;
                    totalRevenue += this.items.red.price;
                    soldRed++;
                }
            }
            // 青ポーションの判定
            if (Math.random() < this.items.blue.demandRate * event.blueModifier) {
                if (this.items.blue.stock > 0) {
                    this.items.blue.stock--;
                    totalRevenue += this.items.blue.price;
                    soldBlue++;
                }
            }
        }

        this.gold += totalRevenue;
        this.day++;

        return {
            customers,
            soldRed,
            soldBlue,
            revenue: totalRevenue,
            profit: totalRevenue
        };
    }
}
