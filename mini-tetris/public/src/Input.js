export class Input {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.onKeyPress) {
                this.onKeyPress(e.code);
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isPressed(code) {
        return !!this.keys[code];
    }
}
