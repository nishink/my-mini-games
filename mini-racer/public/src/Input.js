export class Input {
    constructor() {
        this.keys = {};
        
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // Touch controls
        document.querySelectorAll('.ctrl-btn').forEach(btn => {
            const action = btn.dataset.action;
            const code = action === 'left' ? 'ArrowLeft' : 'ArrowRight';

            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                this.keys[code] = true;
            });

            const endAction = (e) => {
                e.preventDefault();
                this.keys[code] = false;
            };

            btn.addEventListener('pointerup', endAction);
            btn.addEventListener('pointerleave', endAction);
            btn.addEventListener('pointercancel', endAction);
        });
    }

    isPressed(code) {
        return !!this.keys[code];
    }
}
