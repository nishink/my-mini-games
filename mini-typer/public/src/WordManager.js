import { Word } from './Word.js';

const WORD_LIST = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'galaxy', 'hidden',
    'island', 'jungle', 'knight', 'lemon', 'mountain', 'nebula', 'ocean', 'planet',
    'quartz', 'river', 'spirit', 'tiger', 'unique', 'valley', 'winter', 'xenon',
    'yellow', 'zebra', 'active', 'brave', 'coding', 'danger', 'energy', 'future',
    'garden', 'header', 'inside', 'junior', 'killer', 'laptop', 'master', 'native',
    'online', 'player', 'quest', 'rocket', 'system', 'target', 'update', 'vector',
    'window', 'xray', 'youth', 'zone'
];

export class WordManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.words = [];
        this.targetWord = null; // 現在入力中の単語
        this.spawnTimer = 0;
        this.spawnRate = 120; // 2秒に1回
        this.baseSpeed = 0.5;
    }

    reset() {
        this.words = [];
        this.targetWord = null;
        this.spawnTimer = 0;
        this.spawnRate = 120;
        this.baseSpeed = 0.5;
    }

    update(score) {
        // レベルアップ（速度と頻度の調整）
        this.baseSpeed = 0.5 + (score / 1000) * 0.2;
        this.spawnRate = Math.max(40, 120 - (score / 1000) * 10);

        this.spawnTimer++;
        if (this.spawnTimer > this.spawnRate) {
            this.spawnTimer = 0;
            this.spawn();
        }

        this.words.forEach(w => w.update());
        
        // 地面に届いたかチェック
        return this.words.some(w => w.y > this.canvasHeight - 30);
    }

    spawn() {
        const text = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        const x = 50 + Math.random() * (this.canvasWidth - 150);
        const y = -20;
        const speed = this.baseSpeed + Math.random() * 0.3;
        this.words.push(new Word(text, x, y, speed));
    }

    handleInput(char) {
        if (this.targetWord) {
            // ターゲット中の単語を打つ
            if (this.targetWord.tryType(char)) {
                if (this.targetWord.isComplete) {
                    const score = this.targetWord.text.length * 10;
                    this.words = this.words.filter(w => w !== this.targetWord);
                    this.targetWord = null;
                    return score;
                }
                return 0;
            } else {
                // ミス入力（ターゲットをリセットしない。ぷよぷよ式や本格タイピングならミスの処理を入れる）
                return -5; // ミス減点
            }
        } else {
            // 新しいターゲットを探す（最も低い位置にある単語を優先）
            const candidates = this.words
                .filter(w => w.text[0].toLowerCase() === char.toLowerCase())
                .sort((a, b) => b.y - a.y);

            if (candidates.length > 0) {
                this.targetWord = candidates[0];
                this.targetWord.tryType(char);
                if (this.targetWord.isComplete) {
                    const score = this.targetWord.text.length * 10;
                    this.words = this.words.filter(w => w !== this.targetWord);
                    this.targetWord = null;
                    return score;
                }
            }
        }
        return 0;
    }
}
