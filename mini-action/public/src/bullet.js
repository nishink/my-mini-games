export class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 16;
        this.height = 16;
        this.active = true;
    }

    update(delta, map) {
        const dt = delta / 1000;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // check collision with map
        if (this._collides(this.x, this.y, map)) {
            this.active = false;
        }

        // remove if out of bounds
        if (this.x < 0 || this.x > map.width || this.y < 0 || this.y > map.height) {
            this.active = false;
        }
    }

    _collides(x, y, map) {
        const points = [
            { x: x, y: y },
            { x: x + this.width, y: y },
            { x: x, y: y + this.height },
            { x: x + this.width, y: y + this.height }
        ];
        for (const p of points) {
            if (map.getTileAt(p.x, p.y) !== 0) return true;
        }
        return false;
    }

    collidesWith(entity) {
        return !(this.x + this.width < entity.x ||
                 entity.x + entity.width < this.x ||
                 this.y + this.height < entity.y ||
                 entity.y + entity.height < this.y);
    }
}