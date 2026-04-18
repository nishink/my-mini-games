export class Input {
    constructor() {
        this.onCharTyped = null;
        this.inputEl = document.getElementById('hidden-input');
        this.triggerBtn = document.getElementById('kb-trigger');
        
        // Physical keyboard support
        window.addEventListener('keydown', (e) => {
            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                this.emitChar(e.key.toLowerCase());
            }
        });

        // Software keyboard support (Hidden input)
        if (this.inputEl) {
            this.inputEl.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val.length > 0) {
                    const char = val.charAt(val.length - 1);
                    if (/[a-zA-Z]/.test(char)) {
                        this.emitChar(char.toLowerCase());
                    }
                    // 入力内容をクリアして、次の入力を待ち受ける
                    e.target.value = '';
                }
            });

            // Focus management
            const focusInput = () => this.inputEl.focus();
            
            if (this.triggerBtn) {
                this.triggerBtn.addEventListener('click', focusInput);
            }
            
            document.addEventListener('pointerdown', (e) => {
                // UIボタン以外を触ったらフォーカスを戻す
                if (e.target.tagName !== 'BUTTON') {
                    focusInput();
                }
            });
        }
    }

    emitChar(char) {
        if (this.onCharTyped) {
            this.onCharTyped(char);
        }
    }
}
