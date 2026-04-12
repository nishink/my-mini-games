import { Piece, TETROMINOS } from './Piece.js';
import { Board } from './Board.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';

export class Game {
    constructor() {
        this.board = new Board(10, 20);
        this.input = new Input();
        this.renderer = new Renderer(
            document.getElementById('game-canvas'),
            document.getElementById('next-canvas'),
            30
        );

        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.levelElement = document.getElementById('level');
        this.gameOverOverlay = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');

        this.restartBtn.onclick = () => this.reset();
        this.input.onKeyPress = (code) => this.handleKeyPress(code);

        this.reset();
        this.gameLoop();
    }

    reset() {
        this.board.reset();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.isGameOver = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.currentPiece = this.generateRandomPiece();
        this.nextPiece = this.generateRandomPiece();
        this.updateCurrentPiecePosition();

        this.updateUI();
        this.gameOverOverlay.classList.add('hidden');
    }

    generateRandomPiece() {
        const types = Object.keys(TETROMINOS);
        const type = types[Math.floor(Math.random() * types.length)];
        return new Piece(type);
    }

    updateCurrentPiecePosition() {
        this.currentPiece.x = Math.floor((this.board.cols - this.currentPiece.shape[0].length) / 2);
        this.currentPiece.y = 0;

        if (!this.board.isValidMove(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.isGameOver = true;
            this.finalScoreElement.innerText = this.score;
            this.gameOverOverlay.classList.remove('hidden');
        }
    }

    handleKeyPress(code) {
        if (this.isGameOver) return;

        if (code === 'ArrowLeft') this.movePiece(-1, 0);
        if (code === 'ArrowRight') this.movePiece(1, 0);
        if (code === 'ArrowDown') this.drop();
        if (code === 'ArrowUp' || code === 'KeyX') this.rotate(true);
        if (code === 'KeyZ') this.rotate(false);
        if (code === 'Space') this.hardDrop();
    }

    movePiece(dx, dy) {
        if (this.board.isValidMove(this.currentPiece, this.currentPiece.x + dx, this.currentPiece.y + dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }

    rotate(clockwise) {
        const originalShape = this.currentPiece.shape;
        this.currentPiece.rotate(clockwise);
        if (!this.board.isValidMove(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = originalShape; // 回転できない場合は戻す
        }
    }

    drop() {
        if (!this.movePiece(0, 1)) {
            this.lockPiece();
        }
        this.dropCounter = 0;
    }

    hardDrop() {
        while (this.movePiece(0, 1));
        this.lockPiece();
    }

    lockPiece() {
        this.board.placePiece(this.currentPiece);
        const linesCleared = this.board.clearLines();
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }

        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generateRandomPiece();
        this.updateCurrentPiecePosition();
        this.updateUI(); // 常にUI（Next表示含む）を更新
    }

    updateScore(lines) {
        const linePoints = [0, 100, 300, 500, 800];
        this.score += linePoints[lines] * this.level;
        this.lines += lines;
        
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
        this.updateUI();
    }

    updateUI() {
        this.scoreElement.innerText = this.score;
        this.linesElement.innerText = this.lines;
        this.levelElement.innerText = this.level;
        this.renderer.drawNext(this.nextPiece);
    }

    getGhostY() {
        let ghostY = this.currentPiece.y;
        while (this.board.isValidMove(this.currentPiece, this.currentPiece.x, ghostY + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    gameLoop(time = 0) {
        if (!this.isGameOver) {
            const deltaTime = time - this.lastTime;
            this.lastTime = time;

            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
            }

            this.renderer.draw(this.board, this.currentPiece, this.getGhostY());
        }
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}
