import { Hero } from './src/Hero.js';
import { UI } from './src/UI.js';

class Game {
    constructor() {
        this.hero = new Hero();
        this.ui = new UI(this.hero);
        
        this.trainBtn = document.getElementById('train-btn');
        this.addBtns = document.querySelectorAll('.add-btn');
        
        this.init();
    }

    init() {
        this.trainBtn.addEventListener('click', () => this.handleTrain());
        
        this.addBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stat = e.target.dataset.stat;
                if (this.hero.allocateStat(stat)) {
                    this.ui.update();
                }
            });
        });
        
        this.ui.update();
        console.log('Mini Hero Initialized');
    }

    handleTrain() {
        // 1回につき 15~25 の経験値を獲得
        const amount = 15 + Math.random() * 10;
        const leveledUp = this.hero.gainExp(amount);
        
        if (leveledUp) {
            this.ui.notify(`Level Up! Current Level: ${this.hero.level}`);
        }
        
        this.ui.update();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
