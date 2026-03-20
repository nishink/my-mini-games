export class Tower {
    constructor(gx, gy, type, map) {
        this.gx = gx;
        this.gy = gy;
        const pos = map.gridToPixel(gx, gy);
        this.x = pos.x;
        this.y = pos.y;
        this.type = type;
        
        // 種類ごとの設定
        const configs = {
            basic:  { range: 120, damage: 10,  cooldown: 0.8, color: '#4CAF50' },
            fast:   { range: 100, damage: 5,   cooldown: 0.3, color: '#2196F3' },
            sniper: { range: 250, damage: 40,  cooldown: 2.0, color: '#F44336' }
        };
        
        const config = configs[type];
        this.range = config.range;
        this.damage = config.damage;
        this.cooldown = config.cooldown;
        this.color = config.color;
        
        this.timer = 0;
    }

    update(deltaTime, enemies, addBullet) {
        if (this.timer > 0) {
            this.timer -= deltaTime;
        }

        if (this.timer <= 0) {
            const target = this.findTarget(enemies);
            if (target) {
                addBullet(this.x, this.y, target, this.damage);
                this.timer = this.cooldown;
            }
        }
    }

    findTarget(enemies) {
        // 射程内にいる敵の中で、最も進んでいる（distanceTraveledが最大）敵を狙う
        let bestTarget = null;
        let maxDist = -1;

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq <= this.range * this.range) {
                if (enemy.distanceTraveled > maxDist) {
                    maxDist = enemy.distanceTraveled;
                    bestTarget = enemy;
                }
            }
        }
        return bestTarget;
    }
}
