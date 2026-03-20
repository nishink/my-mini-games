export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.bgOffset = 0;
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawBackground() {
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        
        // グリッド背景のスクロール
        this.bgOffset = (this.bgOffset + 1) % 40;
        
        for (let x = 0; x <= this.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = this.bgOffset; y <= this.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    drawPlayer(player) {
        this.ctx.fillStyle = 'cyan';
        // 三角形の自機
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2, player.y);
        this.ctx.lineTo(player.x, player.y + player.height);
        this.ctx.lineTo(player.x + player.width, player.y + player.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // エンジンエフェクト（簡易）
        this.ctx.fillStyle = 'orange';
        this.ctx.fillRect(player.x + player.width / 2 - 5, player.y + player.height, 10, 5 + Math.random() * 5);
    }

    drawEnemies(enemies) {
        enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.type === 'fast' ? '#ff00ff' : '#ff4444';
            // 敵機（四角形またはひし形）
            this.ctx.save();
            this.ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            if (enemy.type === 'fast') {
                this.ctx.rotate(Math.PI / 4);
            }
            this.ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
            this.ctx.restore();
        });
    }

    drawBullets(bullets, color) {
        this.ctx.fillStyle = color;
        bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
}
