export class Input {
    constructor(callback) {
        this.callback = callback;
        
        // キーボード入力
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.callback('UP');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.callback('DOWN');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.callback('LEFT');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.callback('RIGHT');
                    break;
                case 'r':
                case 'R':
                    this.callback('RESET');
                    break;
            }
        });

        // タッチ/クリック入力（画面分割による簡易操作）
        window.addEventListener('mousedown', (e) => {
            const canvas = document.getElementById('game-canvas');
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 画面の中央からの相対位置で方向を判定
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const dx = x - centerX;
            const dy = y - centerY;

            if (Math.abs(dx) > Math.abs(dy)) {
                this.callback(dx > 0 ? 'RIGHT' : 'LEFT');
            } else {
                this.callback(dy > 0 ? 'DOWN' : 'UP');
            }
        });

        // タッチ操作のサポート（1本指のみ）
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const canvas = document.getElementById('game-canvas');
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const dx = x - centerX;
                const dy = y - centerY;

                if (Math.abs(dx) > Math.abs(dy)) {
                    this.callback(dx > 0 ? 'RIGHT' : 'LEFT');
                } else {
                    this.callback(dy > 0 ? 'DOWN' : 'UP');
                }
                e.preventDefault();
            }
        }, { passive: false });
    }
}
