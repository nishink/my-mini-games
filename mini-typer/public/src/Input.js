export class Input {
    constructor() {
        this.onCharTyped = null;
        window.addEventListener('keydown', (e) => {
            // アルファベット一文字のみ判定
            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                if (this.onCharTyped) {
                    this.onCharTyped(e.key.toLowerCase());
                }
            }
        });
    }
}
