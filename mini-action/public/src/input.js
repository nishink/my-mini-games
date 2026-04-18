export class Input {
    constructor() {
        this.keys = {};
        this.keysPressed = {}; // for one-time presses
        
        // Keyboard events
        window.addEventListener('keydown', e => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyX', 'KeyZ'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
            this.keysPressed[e.code] = true;
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        // Touch/Pointer events
        const actionMap = {
            'left': 'ArrowLeft',
            'right': 'ArrowRight',
            'jump': 'ArrowUp',
            'shoot': 'Space'
        };

        document.querySelectorAll('.ctrl-btn').forEach(btn => {
            const action = btn.dataset.action;
            const keyCode = actionMap[action];

            const startAction = (e) => {
                e.preventDefault();
                this.keys[keyCode] = true;
                this.keysPressed[keyCode] = true;
            };

            const endAction = (e) => {
                e.preventDefault();
                this.keys[keyCode] = false;
            };

            btn.addEventListener('pointerdown', startAction);
            btn.addEventListener('pointerup', endAction);
            btn.addEventListener('pointerleave', endAction);
            btn.addEventListener('pointercancel', endAction);
        });
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
