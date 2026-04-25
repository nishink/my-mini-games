import { ExperienceSystem } from './ExperienceSystem.js';

export class UI {
    constructor(hero) {
        this.hero = hero;
        
        // Elements
        this.levelVal = document.getElementById('level-val');
        this.expText = document.getElementById('exp-text');
        this.expFill = document.getElementById('exp-fill');
        this.pointsContainer = document.getElementById('points-container');
        this.pointsVal = document.getElementById('points-val');
        
        this.baseStats = {
            str: document.getElementById('base-str'),
            dex: document.getElementById('base-dex'),
            int: document.getElementById('base-int'),
            vit: document.getElementById('base-vit')
        };
        
        this.derivedStats = {
            atk: document.getElementById('derived-atk'),
            def: document.getElementById('derived-def'),
            hp: document.getElementById('derived-hp'),
            mp: document.getElementById('derived-mp')
        };
        
        this.addBtns = document.querySelectorAll('.add-btn');
        this.notifyArea = document.getElementById('notification-area');
    }

    update() {
        // Basic Info
        this.levelVal.textContent = this.hero.level;
        const nextExp = ExperienceSystem.getExpForNextLevel(this.hero.level);
        this.expText.textContent = `${Math.floor(this.hero.exp)} / ${nextExp}`;
        this.expFill.style.width = `${this.hero.expPercent}%`;
        
        // Stat Points
        if (this.hero.statPoints > 0) {
            this.pointsContainer.classList.remove('hidden');
            this.pointsVal.textContent = this.hero.statPoints;
            this.addBtns.forEach(btn => btn.classList.remove('hidden'));
        } else {
            this.pointsContainer.classList.add('hidden');
            this.addBtns.forEach(btn => btn.classList.add('hidden'));
        }
        
        // Base Stats
        for (const [key, el] of Object.entries(this.baseStats)) {
            el.textContent = this.hero.baseStats[key];
        }
        
        // Derived Stats
        const derived = this.hero.derivedStats;
        for (const [key, el] of Object.entries(this.derivedStats)) {
            el.textContent = derived[key];
        }
    }

    notify(message) {
        const div = document.createElement('div');
        div.className = 'notify';
        div.textContent = message;
        this.notifyArea.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}
