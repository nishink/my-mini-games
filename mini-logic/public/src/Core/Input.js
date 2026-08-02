export class Input {
    constructor() {
        this.keys = {};
        this.listeners = [];

        window.addEventListener('keydown', (e) => {
            if ([' ', 'f', 'x', '1', '2', 'h', 'r', 'Escape'].includes(e.key)) {
                // Prevent scrolling on space
                if (e.key === ' ') e.preventDefault();
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
