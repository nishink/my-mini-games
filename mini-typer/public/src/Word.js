export class Word {
    constructor(text, x, y, speed) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.typedIndex = 0; // どこまで入力したか
        this.isComplete = false;
    }

    update() {
        this.y += this.speed;
    }

    // プレイヤーが打った文字と一致するかチェック
    tryType(char) {
        if (this.text[this.typedIndex].toLowerCase() === char.toLowerCase()) {
            this.typedIndex++;
            if (this.typedIndex >= this.text.length) {
                this.isComplete = true;
            }
            return true;
        }
        return false;
    }
}
