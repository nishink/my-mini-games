export class Input {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyZ', 'KeyX'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
            if (this.onKeyPress) {
                this.onKeyPress(e.code);
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Touch controls
        document.querySelectorAll('.ctrl-btn').forEach(btn => {
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleTouchAction(action);
            });
        });
    }

    handleTouchAction(action) {
        if (!this.onKeyPress) return;

        switch (action) {
            case 'left': this.onKeyPress('ArrowLeft'); break;
            case 'right': this.onKeyPress('ArrowRight'); break;
            case 'down': this.onKeyPress('ArrowDown'); break;
            case 'rotate-r': this.onKeyPress('ArrowUp'); break;
            case 'rotate-l': this.onKeyPress('KeyZ'); break;
            case 'hard-drop': this.onKeyPress('Space'); break;
        }
    }

    isPressed(code) {
        return !!this.keys[code];
    }
}
