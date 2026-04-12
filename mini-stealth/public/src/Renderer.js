export class Renderer {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        canvas.width = this.width;
        canvas.height = this.height;
    }

    draw(player, enemies, map, alertLevel) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 壁の描画
        this.ctx.fillStyle = '#222';
        for (const wall of map.walls) {
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }

        // ゴールの描画
        this.ctx.fillStyle = '#00ffcc';
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillRect(map.goal.x, map.goal.y, map.goal.width, map.goal.height);
        this.ctx.globalAlpha = 1.0;
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.strokeRect(map.goal.x, map.goal.y, map.goal.width, map.goal.height);

        // 敵の視界と本体
        for (const e of enemies) {
            this.drawEnemyVision(e, map.walls);
            
            // 敵本体
            this.ctx.fillStyle = '#ff3300';
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 向きを示すライン
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(e.x, e.y);
            this.ctx.lineTo(e.x + Math.cos(e.angle) * 10, e.y + Math.sin(e.angle) * 10);
            this.ctx.stroke();
        }

        // プレイヤーの描画
        this.ctx.fillStyle = '#00ffcc';
        this.ctx.shadowBlur = alertLevel > 50 ? 15 : 5;
        this.ctx.shadowColor = alertLevel > 50 ? '#ff3300' : '#00ffcc';
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawEnemyVision(e, walls) {
        const rays = 40; // 光の筋の数
        const step = e.viewAngle / rays;
        const startAngle = e.angle - e.viewAngle / 2;

        const points = [{ x: e.x, y: e.y }];

        for (let i = 0; i <= rays; i++) {
            const angle = startAngle + step * i;
            const dist = this.getCastDistance(e.x, e.y, angle, e.viewDistance, walls);
            points.push({
                x: e.x + Math.cos(angle) * dist,
                y: e.y + Math.sin(angle) * dist
            });
        }

        const gradient = this.ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.viewDistance);
        gradient.addColorStop(0, 'rgba(255, 51, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 51, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    getCastDistance(startX, startY, angle, maxDist, walls) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // 精度とパフォーマンスの兼ね合いで 5ピクセル刻みでチェック
        for (let d = 0; d < maxDist; d += 5) {
            const px = startX + dx * d;
            const py = startY + dy * d;
            
            for (const wall of walls) {
                if (px > wall.x && px < wall.x + wall.width &&
                    py > wall.y && py < wall.y + wall.height) {
                    return d;
                }
            }
        }
        return maxDist;
    }
}
