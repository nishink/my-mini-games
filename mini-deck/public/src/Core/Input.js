/**
 * Mini RPG Saga - Input
 * キーボードとタッチ操作の入力を管理する。
 */
export class Input {
    constructor() {
        this.keys = {};
        this.virtualButtons = {};

        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = false;
        });
    }

    setVirtualButton(btn, active) {
        this.virtualButtons[btn] = active;
    }

    get direction() {
        const dir = { x: 0, y: 0 };
        if (this.keys['ArrowUp'] || this.keys['w'] || this.virtualButtons.up) dir.y = -1;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.virtualButtons.down) dir.y = 1;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.virtualButtons.left) dir.x = -1;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.virtualButtons.right) dir.x = 1;
        
        if (dir.x !== 0) dir.y = 0;
        return dir;
    }

    isPressed(key) {
        if (key === ' ' || key === 'Enter' || key === 'action') {
            return !!this.keys[' '] || !!this.keys['Enter'] || !!this.virtualButtons.action;
        }
        return !!this.keys[key] || !!this.virtualButtons[key];
    }

    reset() {
        this.keys = {};
        // 仮想ボタンの状態をクリア
        for (let key in this.virtualButtons) {
            this.virtualButtons[key] = false;
        }
    }
}

export const input = new Input();
