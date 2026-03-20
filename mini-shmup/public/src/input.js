export class Input {
    constructor() {
        this.keys = {};
        this.touchX = 0;
        this.touchY = 0;
        this.isTouching = false;
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // マウス操作のサポート
        window.addEventListener('mousedown', (e) => {
            this.isTouching = true;
            this.updatePointerPos(e);
            this.keys[' '] = true; // クリック中はオートショット
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isTouching) {
                this.updatePointerPos(e);
            }
        });

        window.addEventListener('mouseup', () => {
            this.isTouching = false;
            this.keys[' '] = false;
        });

        // タッチ操作のサポート
        window.addEventListener('touchstart', (e) => {
            this.isTouching = true;
            this.updatePointerPos(e.touches[0]);
            this.keys[' '] = true; // タッチ中はオートショット
        });
        
        window.addEventListener('touchmove', (e) => {
            if (this.isTouching) {
                this.updatePointerPos(e.touches[0]);
                e.preventDefault(); // スクロール防止
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.isTouching = false;
            this.keys[' '] = false;
        });
    }

    updatePointerPos(event) {
        // Canvasのサイズと表示上のサイズから座標を計算
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        this.touchX = (event.clientX - rect.left) * scaleX;
        this.touchY = (event.clientY - rect.top) * scaleY;
    }
}
