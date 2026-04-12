import { PuyoPair, COLORS } from './Puyo.js';
import { Board } from './Board.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';

export class Game {
    constructor() {
        this.board = new Board(6, 12);
        this.input = new Input();
        this.renderer = new Renderer(
            document.getElementById('game-canvas'),
            document.getElementById('next-canvas'),
            40
        );

        this.scoreElement = document.getElementById('score');
        this.chainElement = document.getElementById('chain');
        this.maxChainElement = document.getElementById('max-chain');
        this.gameOverOverlay = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');

        this.restartBtn.onclick = () => this.reset();
        this.input.onKeyPress = (code) => this.handleKeyPress(code);

        this.reset();
        this.gameLoop();
    }

    reset() {
        this.board.reset?.() || (this.board.grid = this.board.createEmptyGrid());
        this.score = 0;
        this.maxChain = 0;
        this.isGameOver = false;
        this.isProcessing = false; // 連鎖中などの操作不能状態
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.currentPair = this.generateRandomPair();
        this.nextPair = this.generateRandomPair();
        this.spawnCurrentPair();

        this.updateUI();
        this.gameOverOverlay.classList.add('hidden');
    }

    generateRandomPair() {
        const colors = Object.values(COLORS);
        const c1 = colors[Math.floor(Math.random() * colors.length)];
        const c2 = colors[Math.floor(Math.random() * colors.length)];
        return new PuyoPair(c1, c2);
    }

    spawnCurrentPair() {
        this.currentPair.puyo1.x = 2;
        this.currentPair.puyo1.y = 0;
        this.currentPair.updatePuyo2Position();

        if (!this.board.isValidMove(this.currentPair.puyo1, this.currentPair.puyo2)) {
            this.isGameOver = true;
            this.finalScoreElement.innerText = this.score;
            this.gameOverOverlay.classList.remove('hidden');
        }
    }

    handleKeyPress(code) {
        if (this.isGameOver || this.isProcessing) return;

        if (code === 'ArrowLeft') this.move(-1, 0);
        if (code === 'ArrowRight') this.move(1, 0);
        if (code === 'ArrowDown') this.drop();
        if (code === 'ArrowUp' || code === 'KeyX') this.rotate(true);
        if (code === 'KeyZ') this.rotate(false);
    }

    move(dx, dy) {
        const p1 = { x: this.currentPair.puyo1.x + dx, y: this.currentPair.puyo1.y + dy };
        const p2 = { x: this.currentPair.puyo2.x + dx, y: this.currentPair.puyo2.y + dy };

        if (this.board.isValidMove(p1, p2)) {
            this.currentPair.move(dx, dy);
            return true;
        }
        return false;
    }

    rotate(clockwise) {
        const originalRotation = this.currentPair.rotation;
        this.currentPair.rotate(clockwise);
        if (!this.board.isValidMove(this.currentPair.puyo1, this.currentPair.puyo2)) {
            this.currentPair.rotation = originalRotation;
            this.currentPair.updatePuyo2Position();
        }
    }

    async drop() {
        if (!this.move(0, 1)) {
            await this.lockPuyo();
        }
        this.dropCounter = 0;
    }

    async lockPuyo() {
        this.isProcessing = true;
        const p1 = this.currentPair.puyo1;
        const p2 = this.currentPair.puyo2;
        this.board.placePuyo(p1.x, p1.y, p1.color);
        this.board.placePuyo(p2.x, p2.y, p2.color);
        this.currentPair = null;

        let currentChain = 0;
        let chainCleared = true;

        while (chainCleared) {
            // 1. 自由落下
            while (this.board.applyGravity()) {
                this.renderer.draw(this.board, null);
                await this.wait(100);
            }

            // 2. 消去判定
            const clearedCount = this.board.findAndClearGroups();
            if (clearedCount > 0) {
                currentChain++;
                this.score += clearedCount * 10 * Math.pow(2, currentChain - 1);
                this.updateUI(currentChain);
                this.renderer.draw(this.board, null);
                await this.wait(400); // 消えるアニメーションの代わり
            } else {
                chainCleared = false;
            }
        }

        if (currentChain > this.maxChain) {
            this.maxChain = currentChain;
            this.updateUI(0);
        }

        this.currentPair = this.nextPair;
        this.nextPair = this.generateRandomPair();
        this.spawnCurrentPair();
        this.isProcessing = false;
        this.updateUI(0);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateUI(chain = 0) {
        this.scoreElement.innerText = this.score;
        this.chainElement.innerText = chain;
        this.maxChainElement.innerText = this.maxChain;
        this.renderer.drawNext(this.nextPair);
    }

    gameLoop(time = 0) {
        if (!this.isGameOver) {
            const deltaTime = time - this.lastTime;
            this.lastTime = time;

            if (!this.isProcessing) {
                this.dropCounter += deltaTime;
                if (this.dropCounter > this.dropInterval) {
                    this.drop();
                }
            }

            this.renderer.draw(this.board, this.currentPair);
        }
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}
