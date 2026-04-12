import { Ball } from './Ball.js';
import { Map } from './Map.js';
import { Physics } from './Physics.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.input = new Input(this.canvas);
        this.map = new Map();
        
        this.ball = new Ball(0, 0);
        this.currentStageIndex = 0;
        this.strokeCount = 0;
        this.totalStrokes = 0;
        this.isClear = false;

        this.stageElement = document.getElementById('current-stage');
        this.strokeElement = document.getElementById('stroke-count');
        this.totalStrokeElement = document.getElementById('total-strokes');
        this.clearOverlay = document.getElementById('game-clear');
        this.allClearOverlay = document.getElementById('all-clear');
        this.finalStrokesElement = document.getElementById('final-strokes');
        this.allFinalStrokesElement = document.getElementById('all-final-strokes');
        
        this.nextBtn = document.getElementById('next-btn');
        this.restartBtn = document.getElementById('restart-btn');

        this.nextBtn.onclick = () => this.nextStage();
        this.restartBtn.onclick = () => this.resetGame();

        this.input.onShot = (dx, dy) => this.handleShot(dx, dy);

        this.loadStage(0);
        this.gameLoop();
    }

    resetGame() {
        this.currentStageIndex = 0;
        this.totalStrokes = 0;
        this.allClearOverlay.classList.add('hidden');
        this.loadStage(0);
    }

    loadStage(index) {
        this.currentStageIndex = index;
        const stage = this.map.getStage(index);
        this.ball.reset(stage.start.x, stage.start.y);
        this.strokeCount = 0;
        this.isClear = false;
        this.clearOverlay.classList.add('hidden');
        this.updateUI();
    }

    nextStage() {
        if (this.currentStageIndex + 1 < this.map.stages.length) {
            this.loadStage(this.currentStageIndex + 1);
        } else {
            this.showAllClear();
        }
    }

    handleShot(dx, dy) {
        if (this.ball.isMoving || this.isClear) return;

        // パワーの計算と制限
        const powerScale = 0.15;
        let vx = dx * powerScale;
        let vy = dy * powerScale;
        const speed = Math.sqrt(vx * vx + vy * vy);
        const maxSpeed = 15;

        if (speed > maxSpeed) {
            const ratio = maxSpeed / speed;
            vx *= ratio;
            vy *= ratio;
        }

        this.ball.shoot(vx, vy);
        this.strokeCount++;
        this.totalStrokes++;
        this.updateUI();
    }

    update() {
        if (this.isClear) return;

        const stage = this.map.getStage(this.currentStageIndex);
        this.ball.update();
        
        // 物理判定
        Physics.checkWallCollision(this.ball, stage.walls);

        // カップイン判定
        if (Physics.checkCupIn(this.ball, stage.cup)) {
            this.showStageClear();
        }
    }

    showStageClear() {
        this.isClear = true;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.isMoving = false;
        this.finalStrokesElement.innerText = this.strokeCount;
        this.clearOverlay.classList.remove('hidden');
    }

    showAllClear() {
        this.allFinalStrokesElement.innerText = this.totalStrokes;
        this.allClearOverlay.classList.remove('hidden');
    }

    updateUI() {
        this.stageElement.innerText = this.currentStageIndex + 1;
        this.strokeElement.innerText = this.strokeCount;
        this.totalStrokeElement.innerText = this.totalStrokes;
    }

    gameLoop() {
        this.update();
        const stage = this.map.getStage(this.currentStageIndex);
        this.renderer.draw(this.ball, stage, this.input.dragStart, this.input.currentMouse);
        requestAnimationFrame(() => this.gameLoop());
    }
}
