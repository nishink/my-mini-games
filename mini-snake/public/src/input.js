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

        // Touch controls
        document.querySelectorAll('#touchControls button').forEach(button => {
            button.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                const action = button.dataset.action;
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
            });
        });
    }

    update() {
        this.direction = { ...this.nextDirection };
    }

    reset() {
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
    }
}
