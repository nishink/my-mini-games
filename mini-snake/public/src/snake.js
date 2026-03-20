export class Snake {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        // Initial snake: 3 segments long on the left side, facing right
        this.body = [
            { x: 5, y: 10 },
            { x: 4, y: 10 },
            { x: 3, y: 10 }
        ];
        this.growPending = false;
    }

    move(direction) {
        const head = { ...this.body[0] };
        head.x += direction.x;
        head.y += direction.y;

        this.body.unshift(head);
        
        if (this.growPending) {
            this.growPending = false;
        } else {
            this.body.pop();
        }
    }

    grow() {
        this.growPending = true;
    }

    checkCollision(width, height) {
        const head = this.body[0];

        // Wall collision
        if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
            return true;
        }

        // Self collision
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }

        return false;
    }

    isAt(x, y) {
        return this.body.some(segment => segment.x === x && segment.y === y);
    }
}
