import { Store } from './Store.js';
import { UIManager } from './UIManager.js';

export class Game {
    constructor() {
        this.store = new Store();
        this.ui = new UIManager();
        this.initEventListeners();
        this.reset();
    }

    initEventListeners() {
        document.getElementById('buy-red-1').onclick = () => this.buyItem('red', 1);
        document.getElementById('buy-red-10').onclick = () => this.buyItem('red', 10);
        document.getElementById('buy-blue-1').onclick = () => this.buyItem('blue', 1);
        document.getElementById('buy-blue-5').onclick = () => this.buyItem('blue', 5);
        document.getElementById('upgrade-ad').onclick = () => this.upgradeAd();
        document.getElementById('upgrade-shelf').onclick = () => this.upgradeShelf();
        document.getElementById('next-day-btn').onclick = () => this.startNextDay();
        document.getElementById('close-result-btn').onclick = () => this.ui.hideResult();
        document.getElementById('restart-btn').onclick = () => this.reset();
    }

    reset() {
        this.store.reset();
        this.ui.clearLog();
        this.ui.hideGameOver();
        this.ui.hideResult();
        this.ui.updateStatus(this.store);
        this.ui.addLog('錬金工房を開店しました！ポーションを仕入れて、冒険者の来店を待ちましょう。');
    }

    buyItem(type, amount) {
        if (this.store.buyItem(type, amount)) {
            const name = this.store.items[type].name;
            this.ui.addLog(`${name}を ${amount} 個仕入れました。`);
            this.ui.updateStatus(this.store);
        }
    }

    upgradeAd() {
        if (this.store.upgradeAd()) {
            this.ui.addLog('看板を出しました！新しい冒険者に知れ渡るようになりました。');
            this.ui.updateStatus(this.store);
        }
    }

    upgradeShelf() {
        if (this.store.upgradeShelf()) {
            this.ui.addLog('陳列棚を強化しました！より多くの在庫を持てるようになりました。');
            this.ui.updateStatus(this.store);
        }
    }

    startNextDay() {
        const totalStock = Object.values(this.store.items).reduce((sum, i) => sum + i.stock, 0);
        if (totalStock === 0 && this.store.gold < 10) {
            this.ui.showGameOver(this.store.day);
            return;
        }

        const event = this.generateEvent();
        const currentDay = this.store.day;
        const result = this.store.calculateDailyBusiness(event);
        
        this.ui.showResult(currentDay, result, event.text);
        this.ui.addLog(`本日の結果: ${result.soldRed + result.soldBlue} 個販売。売上: ${result.revenue} G。`);
        if (event.text) this.ui.addLog(`【出来事】 ${event.text}`);
        
        this.ui.updateStatus(this.store);
    }

    generateEvent() {
        const rand = Math.random();
        // 1: 冒険者ギルドのキャンペーン（赤ポーション需要↑）
        if (rand < 0.1) {
            return { text: 'ギルドで大遠征が決定！赤ポーションの需要が急増しています！', customerModifier: 2.0, redModifier: 2.0, blueModifier: 1.0 };
        } 
        // 2: 魔法学会の集い（青ポーション需要↑）
        else if (rand < 0.2) {
            return { text: '街で魔法学会が開催中。魔導士たちの来店が増えそうです。', customerModifier: 1.5, redModifier: 1.0, blueModifier: 3.0 };
        }
        // 3: 嵐の日（全体的に客足↓）
        else if (rand < 0.3) {
            return { text: '激しい嵐が街を襲いました。冒険者は外に出られないようです…。', customerModifier: 0.3, redModifier: 1.0, blueModifier: 1.0 };
        }
        return { text: '', customerModifier: 1.0, redModifier: 1.0, blueModifier: 1.0 };
    }
}
