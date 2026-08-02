export class Input {
    constructor() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            if (['1','2','3','4','5','6','7','8','9','Backspace','Delete','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','n','N','h','H','u','U'].includes(e.key)) {
                if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Backspace'].includes(e.key)) {
                    e.preventDefault();
                }
            }
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    isPressed(key) {
        return !!this.keys[key];
    }

    reset() {
        this.keys = {};
    }
}

export const input = new Input();
