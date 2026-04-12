import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Map } from './Map.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.input = new Input();
        this.map = new Map();
        
        this.player = new Player(this.map.playerStart.x, this.map.playerStart.y);
        this.enemies = [
            new Enemy([{x: 100, y: 100}, {x: 700, y: 100}]),
            new Enemy([{x: 700, y: 300}, {x: 100, y: 300}]),
            new Enemy([{x: 400, y: 500}, {x: 400, y: 100}, {x: 100, y: 100}]),
        ];

        this.alertLevel = 0;
        this.isGameOver = false;
        this.isClear = false;

        this.alertBar = document.getElementById('alert-bar');
        this.messageOverlay = document.getElementById('game-message');
        this.clearOverlay = document.getElementById('game-clear');
        this.restartBtn = document.getElementById('restart-btn');
        this.nextBtn = document.getElementById('next-btn');

        this.restartBtn.onclick = () => this.reset();
        this.nextBtn.onclick = () => this.reset();

        this.reset();
        this.gameLoop();
    }

    reset() {
        this.player.reset(this.map.playerStart.x, this.map.playerStart.y);
        this.alertLevel = 0;
        this.isGameOver = false;
        this.isClear = false;
        this.messageOverlay.classList.add('hidden');
        this.clearOverlay.classList.add('hidden');
        this.updateUI();
    }

    update() {
        if (this.isGameOver || this.isClear) return;

        this.player.update(this.input, this.map.walls);

        let beingSeen = false;
        for (const e of this.enemies) {
            e.update(this.map.walls);
            if (e.canSeePlayer(this.player, this.map.walls)) {
                beingSeen = true;
            }
        }

        if (beingSeen) {
            this.alertLevel += 1.5; // 検知スピード
        } else {
            this.alertLevel = Math.max(0, this.alertLevel - 0.5); // 徐々に下がる
        }

        if (this.alertLevel >= 100) {
            this.endGame(false);
        }

        // ゴール判定
        if (this.checkGoal()) {
            this.endGame(true);
        }

        this.updateUI();
    }

    checkGoal() {
        const g = this.map.goal;
        return (this.player.x > g.x && this.player.x < g.x + g.width &&
                this.player.y > g.y && this.player.y < g.y + g.height);
    }

    endGame(isClear) {
        if (isClear) {
            this.isClear = true;
            this.clearOverlay.classList.remove('hidden');
        } else {
            this.isGameOver = true;
            this.messageOverlay.classList.remove('hidden');
        }
    }

    updateUI() {
        this.alertBar.style.width = `${Math.min(100, this.alertLevel)}%`;
        if (this.alertLevel > 70) {
            this.alertBar.style.backgroundColor = '#ff0000';
        } else {
            this.alertBar.style.backgroundColor = '#ff3300';
        }
    }

    gameLoop() {
        this.update();
        this.renderer.draw(this.player, this.enemies, this.map, this.alertLevel);
        requestAnimationFrame(() => this.gameLoop());
    }
}
