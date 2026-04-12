export class UIManager {
    constructor() {
        this.elements = {
            dayCount: document.getElementById('day-count'),
            gold: document.getElementById('gold'),
            stockRed: document.getElementById('stock-red'),
            stockBlue: document.getElementById('stock-blue'),
            totalStockText: document.getElementById('total-stock-text'),
            maxStockDisplay: document.getElementById('max-stock-display'),
            reputation: document.getElementById('reputation'),
            eventLog: document.getElementById('event-log'),
            resultOverlay: document.getElementById('result-overlay'),
            resultDay: document.getElementById('result-day'),
            resultCustomers: document.getElementById('result-customers'),
            resultSoldRed: document.getElementById('result-sold-red'),
            resultSoldBlue: document.getElementById('result-sold-blue'),
            resultProfit: document.getElementById('result-profit'),
            resultEvent: document.getElementById('result-event'),
            gameOver: document.getElementById('game-over'),
            finalDays: document.getElementById('final-days'),
            // プログレスバー
            shelfBarRed: document.getElementById('shelf-bar-red'),
            shelfBarBlue: document.getElementById('shelf-bar-blue'),
            itemBarRed: document.getElementById('item-bar-red'),
            itemBarBlue: document.getElementById('item-bar-blue')
        };
    }

    updateStatus(store) {
        this.elements.dayCount.innerText = store.day;
        this.elements.gold.innerText = store.gold;
        this.elements.reputation.innerText = store.reputation;

        const redStock = store.items.red.stock;
        const blueStock = store.items.blue.stock;
        const totalStock = redStock + blueStock;
        const max = store.maxStock;

        this.elements.stockRed.innerText = redStock;
        this.elements.stockBlue.innerText = blueStock;
        this.elements.totalStockText.innerText = totalStock;
        this.elements.maxStockDisplay.innerText = max;

        // プログレスバーの更新
        const redPercent = (redStock / max) * 100;
        const bluePercent = (blueStock / max) * 100;

        this.elements.shelfBarRed.style.width = `${redPercent}%`;
        this.elements.shelfBarBlue.style.width = `${bluePercent}%`;
        this.elements.itemBarRed.style.width = `${redPercent}%`;
        this.elements.itemBarBlue.style.width = `${bluePercent}%`;

        // ボタン制御
        document.getElementById('buy-red-1').disabled = store.gold < 10 || totalStock >= max;
        document.getElementById('buy-red-10').disabled = store.gold < 100 || totalStock + 10 > max;
        document.getElementById('buy-blue-1').disabled = store.gold < 40 || totalStock >= max;
        document.getElementById('buy-blue-5').disabled = store.gold < 200 || totalStock + 5 > max;
        document.getElementById('upgrade-ad').disabled = store.gold < 50;
        document.getElementById('upgrade-shelf').disabled = store.gold < 100;
    }

    addLog(message) {
        const p = document.createElement('p');
        p.className = 'log-entry';
        p.innerText = `[${this.elements.dayCount.innerText}日目] ${message}`;
        this.elements.eventLog.prepend(p);
    }

    showResult(day, result, eventText) {
        this.elements.resultDay.innerText = day;
        this.elements.resultCustomers.innerText = result.customers;
        this.elements.resultSoldRed.innerText = result.soldRed;
        this.elements.resultSoldBlue.innerText = result.soldBlue;
        this.elements.resultProfit.innerText = result.revenue;
        this.elements.resultEvent.innerText = eventText;
        this.elements.resultOverlay.classList.remove('hidden');
    }

    hideResult() {
        this.elements.resultOverlay.classList.add('hidden');
    }

    showGameOver(day) {
        this.elements.finalDays.innerText = day;
        this.elements.gameOver.classList.remove('hidden');
    }

    hideGameOver() {
        this.elements.gameOver.classList.add('hidden');
    }

    clearLog() {
        this.elements.eventLog.innerHTML = '';
    }
}
