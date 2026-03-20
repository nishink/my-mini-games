export class Bullet {
    constructor(x, y, target, damage) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = 400;
        this.active = true;
    }

    update(deltaTime) {
        if (!this.target || !this.target.active) {
            this.active = false;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const moveDist = this.speed * deltaTime;
        
        if (distance <= moveDist) {
            this.x = this.target.x;
            this.y = this.target.y;
            this.target.takeDamage(this.damage);
            this.active = false;
        } else {
            this.x += (dx / distance) * moveDist;
            this.y += (dy / distance) * moveDist;
        }
    }
}
