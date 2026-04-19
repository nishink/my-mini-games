export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.dragStart = null;
        this.currentMouse = null;
        this.isDragging = false;
        this.onShot = null;

        canvas.addEventListener('mousedown', (e) => this.handleDown(e));
        window.addEventListener('mousemove', (e) => this.handleMove(e));
        window.addEventListener('mouseup', (e) => this.handleUp(e));

        // タッチイベント対応
        canvas.addEventListener('touchstart', (e) => this.handleDown(e.touches[0]));
        window.addEventListener('touchmove', (e) => this.handleMove(e.touches[0]));
        window.addEventListener('touchend', (e) => this.handleUp(e));
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = 800 / rect.width;
        const scaleY = 600 / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    handleDown(e) {
        this.dragStart = this.getMousePos(e);
        this.currentMouse = this.dragStart;
        this.isDragging = true;
    }

    handleMove(e) {
        if (!this.isDragging) return;
        this.currentMouse = this.getMousePos(e);
    }

    handleUp(e) {
        if (!this.isDragging) return;
        
        if (this.onShot) {
            const dx = this.dragStart.x - this.currentMouse.x;
            const dy = this.dragStart.y - this.currentMouse.y;
            this.onShot(dx, dy);
        }

        this.isDragging = false;
        this.dragStart = null;
        this.currentMouse = null;
    }
}
