import { Bullet } from './bullet.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 32;
        this.height = 32;
        this.onGround = false;
        this.jumpCount = 0; // for double jump
    }

    update(input, map, delta, bullets) {
        const dt = delta / 1000; // convert delta (ms) to seconds-scale factor

        const speed = 200;    // pixels per second
        const gravity = 800;  // pixels per second^2
        const jumpSpeed = -400; // initial vy (pixels per second)

        if (input.isDown('ArrowLeft')) this.vx = -speed;
        else if (input.isDown('ArrowRight')) this.vx = speed;
        else this.vx = 0;

        if (input.isPressed('ArrowUp') && this.jumpCount < 2) {
            this.vy = jumpSpeed;
            this.jumpCount++;
            this.onGround = false;
        }

        // shoot
        if (input.isPressed('Space')) {
            const bulletX = this.x + this.width / 2 - 8;
            const bulletY = this.y + this.height / 2 - 8;
            bullets.push(new Bullet(bulletX, bulletY, 400, 0)); // rightward bullet
        }

        // physics update
        this.vy += gravity * dt;

        // horizontal movement with tile collision
        let newX = this.x + this.vx * dt;
        if (!this._collides(newX, this.y, map)) {
            this.x = newX;
        } else {
            this.vx = 0;
        }

        // vertical movement
        let newY = this.y + this.vy * dt;
        if (!this._collides(this.x, newY, map)) {
            this.y = newY;
            this.onGround = false;
        } else {
            if (this.vy > 0) {
                this.onGround = true;
                this.jumpCount = 0; // reset jump count on landing
            }
            this.vy = 0;
        }
    }

    _collides(x, y, map) {
        // check four corners of bounding box
        const points = [
            { x: x, y: y },
            { x: x + this.width, y: y },
            { x: x, y: y + this.height },
            { x: x + this.width, y: y + this.height }
        ];
        for (const p of points) {
            const tile = map.getTileAt(p.x, p.y);
            if (tile !== 0 && tile !== 2) return true; // goal tile (2) has no collision
        }
        return false;
    }
}
