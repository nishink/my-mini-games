import { TILE_SIZE } from './Map.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.direction = 'down';
        this.isMoving = false;
        this.moveSpeed = 0.1;
    }

    update() {
        if (this.x !== this.targetX || this.y !== this.targetY) {
            this.isMoving = true;
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;

            if (Math.abs(dx) < this.moveSpeed) this.x = this.targetX;
            else this.x += Math.sign(dx) * this.moveSpeed;

            if (Math.abs(dy) < this.moveSpeed) this.y = this.targetY;
            else this.y += Math.sign(dy) * this.moveSpeed;
        } else {
            this.isMoving = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#4a90e2';
        const padding = 5;
        ctx.beginPath();
        ctx.arc(
            this.x * TILE_SIZE + TILE_SIZE / 2,
            this.y * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE / 2 - padding,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Draw direction indicator
        ctx.fillStyle = '#fff';
        let ix = 0, iy = 0;
        switch(this.direction) {
            case 'up': iy = -10; break;
            case 'down': iy = 10; break;
            case 'left': ix = -10; break;
            case 'right': ix = 10; break;
        }
        ctx.beginPath();
        ctx.arc(
            this.x * TILE_SIZE + TILE_SIZE / 2 + ix,
            this.y * TILE_SIZE + TILE_SIZE / 2 + iy,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    move(dir, map, flags) {
        if (this.isMoving) return;

        let nextX = this.x;
        let nextY = this.y;
        this.direction = dir;

        switch (dir) {
            case 'up': nextY--; break;
            case 'down': nextY++; break;
            case 'left': nextX--; break;
            case 'right': nextX++; break;
        }

        if (map.isPassable(nextX, nextY, flags)) {
            this.targetX = nextX;
            this.targetY = nextY;
        }
    }

    getFrontPos() {
        let fx = Math.round(this.x);
        let fy = Math.round(this.y);
        switch (this.direction) {
            case 'up': fy--; break;
            case 'down': fy++; break;
            case 'left': fx--; break;
            case 'right': fx++; break;
        }
        return { x: fx, y: fy };
    }
}
