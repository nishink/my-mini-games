export class Renderer {
    constructor(ctx, map) {
        this.ctx = ctx;
        this.map = map;
        this.tileSize = map.tileSize;
    }

    draw(game, mousePos, selectedType) {
        this.clear();
        this.drawMap();
        this.drawPath();
        this.drawTowers(game.towers);
        this.drawEnemies(game.enemies);
        this.drawBullets(game.bullets);
        
        if (selectedType && mousePos) {
            this.drawTowerGhost(mousePos, selectedType, game);
        }
    }

    clear() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawMap() {
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.ctx.canvas.width; x += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.ctx.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.ctx.canvas.height; y += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.ctx.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawPath() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = this.tileSize * 0.8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        
        const start = this.map.gridToPixel(this.map.path[0].x, this.map.path[0].y);
        this.ctx.moveTo(start.x, start.y);
        
        for (let i = 1; i < this.map.path.length; i++) {
            const pos = this.map.gridToPixel(this.map.path[i].x, this.map.path[i].y);
            this.ctx.lineTo(pos.x, pos.y);
        }
        this.ctx.stroke();
    }

    drawEnemies(enemies) {
        enemies.forEach(enemy => {
            const size = this.tileSize * 0.4;
            // HPバー
            this.ctx.fillStyle = '#555';
            this.ctx.fillRect(enemy.x - size, enemy.y - size - 10, size * 2, 4);
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(enemy.x - size, enemy.y - size - 10, (size * 2) * (enemy.hp / enemy.maxHp), 4);
            
            // 本体
            this.ctx.fillStyle = '#ff0';
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawTowers(towers) {
        towers.forEach(tower => {
            this.ctx.fillStyle = tower.color;
            const size = this.tileSize * 0.35;
            this.ctx.fillRect(tower.x - size, tower.y - size, size * 2, size * 2);
            
            // 射程範囲をうっすら表示 (オプション)
            // this.ctx.strokeStyle = tower.color + '22';
            // this.ctx.beginPath();
            // this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
            // this.ctx.stroke();
        });
    }

    drawBullets(bullets) {
        this.ctx.fillStyle = '#fff';
        bullets.forEach(bullet => {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawTowerGhost(mousePos, type, game) {
        const grid = this.map.pixelToGrid(mousePos.x, mousePos.y);
        const pos = this.map.gridToPixel(grid.x, grid.y);
        const buildable = this.map.isBuildable(grid.x, grid.y) && 
                          !game.towers.some(t => t.gx === grid.x && t.gy === grid.y);
        
        this.ctx.fillStyle = buildable ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(pos.x - this.tileSize/2, pos.y - this.tileSize/2, this.tileSize, this.tileSize);
        
        // 射程プレビュー
        const ranges = { basic: 120, fast: 100, sniper: 250 };
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, ranges[type], 0, Math.PI * 2);
        this.ctx.stroke();
    }
}
