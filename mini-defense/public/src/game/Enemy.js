export class Enemy {
    constructor(path, level, map) {
        this.path = path;
        this.map = map;
        this.level = level;
        
        // パス上の現在の位置
        this.pathIndex = 0;
        const startPos = this.map.gridToPixel(path[0].x, path[0].y);
        this.x = startPos.x;
        this.y = startPos.y;
        
        // ステータス (レベルに応じて強化)
        this.maxHp = 20 + level * 10;
        this.hp = this.maxHp;
        this.speed = 50 + Math.min(level * 5, 50);
        this.goldValue = 10 + level * 2;
        
        this.active = true;
        this.reachedEnd = false;
        this.distanceTraveled = 0;
    }

    update(deltaTime) {
        if (!this.active) return;

        const targetNode = this.path[this.pathIndex + 1];
        if (!targetNode) {
            this.active = false;
            this.reachedEnd = true;
            return;
        }

        const targetPos = this.map.gridToPixel(targetNode.x, targetNode.y);
        const dx = targetPos.x - this.x;
        const dy = targetPos.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const moveDist = this.speed * deltaTime;
        
        if (distance <= moveDist) {
            this.x = targetPos.x;
            this.y = targetPos.y;
            this.pathIndex++;
        } else {
            this.x += (dx / distance) * moveDist;
            this.y += (dy / distance) * moveDist;
        }
        
        this.distanceTraveled += moveDist;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.active = false;
        }
    }
}
