export class Input {
    constructor() {
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 's', 'a', 'd'].includes(e.key)) {
                e.preventDefault();
            }
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                    break;
            }
        });

        // Touch controls (Buttons)
        document.querySelectorAll('#touchControls button').forEach(button => {
            button.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                this.handleAction(button.dataset.action);
            });
        });

        // Swipe controls
        let touchStartX = 0;
        let touchStartY = 0;

        window.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) {
                    if (dx > 0) this.handleAction('right');
                    else this.handleAction('left');
                }
            } else {
                if (Math.abs(dy) > 30) {
                    if (dy > 0) this.handleAction('down');
                    else this.handleAction('up');
                }
            }
        }, { passive: false });
    }

    handleAction(action) {
        switch (action) {
            case 'up':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'down':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'left':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'right':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    update() {
        this.direction = { ...this.nextDirection };
    }

    reset() {
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
    }
}
