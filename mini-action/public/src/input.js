export class Input {
    constructor() {
        this.keys = {};
        this.keysPressed = {}; // for one-time presses
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            this.keysPressed[e.code] = true;
        });
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    }

    poll() {
        // clear pressed flags
        this.keysPressed = {};
    }

    isDown(code) {
        return !!this.keys[code];
    }

    isPressed(code) {
        return !!this.keysPressed[code];
    }
}
