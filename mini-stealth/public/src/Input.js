export class Input {
    constructor() {
        this.keys = {};
        this.joystickActive = false;
        this.joystickX = 0;
        this.joystickY = 0;
        this.maxDistance = 40; // スティックの最大移動距離

        // Keyboard events
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // Virtual Joystick
        const joystickBase = document.getElementById('joystick-base');
        const joystickStick = document.getElementById('joystick-stick');

        if (joystickBase && joystickStick) {
            let startX = 0;
            let startY = 0;

            const updateJoystick = (clientX, clientY) => {
                const rect = joystickBase.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                let dx = clientX - centerX;
                let dy = clientY - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > this.maxDistance) {
                    dx = (dx / distance) * this.maxDistance;
                    dy = (dy / distance) * this.maxDistance;
                }

                joystickStick.style.transform = `translate(${dx - 20}px, ${dy - 20}px)`;

                this.joystickX = dx / this.maxDistance;
                this.joystickY = dy / this.maxDistance;
            };

            joystickBase.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                this.joystickActive = true;
                startX = e.clientX;
                startY = e.clientY;
                updateJoystick(e.clientX, e.clientY);
            });

            window.addEventListener('pointermove', (e) => {
                if (!this.joystickActive) return;
                e.preventDefault();
                updateJoystick(e.clientX, e.clientY);
            });

            window.addEventListener('pointerup', (e) => {
                if (!this.joystickActive) return;
                this.joystickActive = false;
                joystickStick.style.transform = 'translate(-50%, -50%)';
                this.joystickX = 0;
                this.joystickY = 0;
            });
        }
    }

    isPressed(code) {
        return !!this.keys[code];
    }

    getJoystick() {
        return { x: this.joystickX, y: this.joystickY };
    }
}
