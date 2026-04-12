import { Dictionary } from './Dictionary.js';
import { UIManager } from './UIManager.js';

export class Game {
    constructor() {
        this.ui = new UIManager((key) => this.handleInput(key));
        this.answer = '';
        this.currentRow = 0;
        this.currentCol = 0;
        this.currentGuess = '';
        this.isGameOver = false;

        this.overlay = document.getElementById('overlay');
        this.resultTitle = document.getElementById('result-title');
        this.answerDisplay = document.getElementById('answer-word');
        this.restartBtn = document.getElementById('restart-btn');

        this.restartBtn.onclick = () => this.reset();
        window.addEventListener('keydown', (e) => this.handlePhysicalKeyboard(e));

        this.reset();
    }

    reset() {
        this.answer = Dictionary.getRandomWord();
        this.currentRow = 0;
        this.currentCol = 0;
        this.currentGuess = '';
        this.isGameOver = false;
        
        this.overlay.classList.add('hidden');
        this.ui.initBoard();
        this.ui.initKeyboard();
    }

    handlePhysicalKeyboard(e) {
        if (this.isGameOver) return;

        if (e.key === 'Enter') {
            this.handleInput('ENTER');
        } else if (e.key === 'Backspace') {
            this.handleInput('BACKSPACE');
        } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
            this.handleInput(e.key.toUpperCase());
        }
    }

    handleInput(key) {
        if (this.isGameOver) return;

        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (this.currentGuess.length < 5 && key.length === 1) {
            this.addLetter(key);
        }
    }

    addLetter(letter) {
        this.currentGuess += letter;
        this.ui.updateTile(this.currentRow, this.currentCol, letter);
        this.currentCol++;
    }

    deleteLetter() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.currentCol--;
            this.ui.updateTile(this.currentRow, this.currentCol, '');
        }
    }

    submitGuess() {
        if (this.currentGuess.length < 5) {
            this.ui.showMessage('Too short');
            return;
        }

        // 辞書にあるかチェック（オプション）
        // if (!Dictionary.isValidWord(this.currentGuess)) {
        //     this.ui.showMessage('Not in word list');
        //     return;
        // }

        const results = this.checkGuess(this.currentGuess, this.answer);
        this.ui.revealRow(this.currentRow, results);

        if (this.currentGuess === this.answer) {
            setTimeout(() => this.endGame(true), 1500);
        } else if (this.currentRow >= 5) {
            setTimeout(() => this.endGame(false), 1500);
        } else {
            this.currentRow++;
            this.currentCol = 0;
            this.currentGuess = '';
        }
    }

    checkGuess(guess, answer) {
        const results = Array(5).fill('absent');
        const answerLetters = answer.split('');
        const guessLetters = guess.split('');

        // 1回目: 正解（Correct）の判定
        guessLetters.forEach((letter, i) => {
            if (letter === answerLetters[i]) {
                results[i] = 'correct';
                answerLetters[i] = null; // 使用済み
                guessLetters[i] = null;
            }
        });

        // 2回目: 含まれる（Present）の判定
        guessLetters.forEach((letter, i) => {
            if (letter !== null) {
                const index = answerLetters.indexOf(letter);
                if (index !== -1) {
                    results[i] = 'present';
                    answerLetters[index] = null;
                }
            }
        });

        return results;
    }

    endGame(success) {
        this.isGameOver = true;
        this.resultTitle.textContent = success ? 'GENIUS!' : 'NEXT TIME';
        this.answerDisplay.textContent = this.answer;
        this.overlay.classList.remove('hidden');
    }
}
