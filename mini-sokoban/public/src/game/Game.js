import { Map, LEVELS } from './Map.js';
import { Renderer } from '../ui/Renderer.js';
import { Input } from '../ui/Input.js';

export class Game {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ui = ui;
        this.currentLevelIndex = 0;
        this.map = new Map(this.currentLevelIndex);
        this.renderer = new Renderer(canvas);
        this.input = new Input(this.handleInput.bind(this));
        
        this.ui.stageTotal.innerText = LEVELS.length;
    }

    start() {
        this.loadLevel(0);
    }

    loadLevel(index) {
        this.currentLevelIndex = index;
        this.map.loadLevel(index);
        this.ui.stageVal.innerText = index + 1;
        this.draw();
    }

    nextLevel() {
        if (this.currentLevelIndex < LEVELS.length - 1) {
            this.loadLevel(this.currentLevelIndex + 1);
        } else {
            this.ui.gameComplete.classList.remove('hidden');
        }
    }

    restart() {
        this.loadLevel(0);
    }

    resetLevel() {
        this.loadLevel(this.currentLevelIndex);
    }

    handleInput(command) {
        let moved = false;
        if (command === 'UP') moved = this.map.movePlayer(0, -1);
        if (command === 'DOWN') moved = this.map.movePlayer(0, 1);
        if (command === 'LEFT') moved = this.map.movePlayer(-1, 0);
        if (command === 'RIGHT') moved = this.map.movePlayer(1, 0);
        if (command === 'RESET') {
            this.resetLevel();
            return;
        }

        if (moved) {
            this.draw();
            if (this.map.isCleared()) {
                if (this.currentLevelIndex < LEVELS.length - 1) {
                    this.ui.levelClear.classList.remove('hidden');
                } else {
                    this.ui.gameComplete.classList.remove('hidden');
                }
            }
        }
    }

    draw() {
        this.renderer.draw(this.map);
    }
}
