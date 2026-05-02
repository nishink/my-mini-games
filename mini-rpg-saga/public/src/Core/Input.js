/**
 * Mini RPG Saga - Input
 * キーボードとタッチ操作の入力を管理する。
 */
export class Input {
    constructor() {
        this.keys = {};
        this.virtualButtons = {
            up: false, down: false, left: false, right: false, action: false
        };

        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    setVirtualButton(btn, active) {
        if (this.virtualButtons.hasOwnProperty(btn)) {
            this.virtualButtons[btn] = active;
        }
    }

    get direction() {
        const dir = { x: 0, y: 0 };
        if (this.keys['ArrowUp'] || this.keys['w'] || this.virtualButtons.up) dir.y = -1;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.virtualButtons.down) dir.y = 1;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.virtualButtons.left) dir.x = -1;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.virtualButtons.right) dir.x = 1;
        
        // 斜め移動の抑制（4方向移動にする場合）
        if (dir.x !== 0) dir.y = 0;
        
        return dir;
    }

    isPressed(key) {
        if (key === ' ' || key === 'Enter') {
            return !!this.keys[key] || this.virtualButtons.action;
        }
        return !!this.keys[key];
    }

    reset() {
        this.keys = {};
        for (let btn in this.virtualButtons) {
            this.virtualButtons[btn] = false;
        }
    }
}

export const input = new Input();
