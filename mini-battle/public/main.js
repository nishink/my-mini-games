import { Unit } from './src/Unit.js';
import { Battle } from './src/Battle.js';
import { UI } from './src/UI.js';

class Game {
    constructor() {
        this.init();
    }

    init() {
        // インスタンス作成
        this.player = new Unit('Hero', 50, 20, 15, 10, true);
        this.enemy = new Unit('Slime', 100, 0, 12, 5);
        this.ui = new UI(this.player, this.enemy);
        this.battle = new Battle(this.player, this.enemy, this.ui);

        // 初期表示更新
        this.ui.updateStatus();

        // イベントリスナー登録
        this.setupEventListeners();
    }

    setupEventListeners() {
        // コマンドボタン
        document.querySelectorAll('.cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.battle.executeAction(action);
            });
        });

        // リスタートボタン
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });
    }
}

// ゲーム開始
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
