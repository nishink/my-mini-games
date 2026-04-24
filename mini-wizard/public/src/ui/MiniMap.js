export class MiniMap {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = canvas.width / 10;
    }

    draw(player, dungeon) {
        // Draw overall background
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < dungeon.height; y++) {
            for (let x = 0; x < dungeon.width; x++) {
                if (dungeon.isWall(x, y)) {
                    this.ctx.fillStyle = '#444';
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (dungeon.isGoal(x, y)) {
                    this.ctx.fillStyle = '#f1c40f';
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
                
                // Draw grid lines
                this.ctx.strokeStyle = '#222';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }

        // Draw Player
        this.ctx.fillStyle = '#e74c3c';
        const px = (player.x + 0.5) * this.tileSize;
        const py = (player.y + 0.5) * this.tileSize;
        this.ctx.beginPath();
        this.ctx.arc(px, py, this.tileSize / 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Direction line
        const dx = [0, 1, 0, -1];
        const dy = [-1, 0, 1, 0];
        this.ctx.strokeStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        this.ctx.lineTo(px + dx[player.dir] * this.tileSize / 2, py + dy[player.dir] * this.tileSize / 2);
        this.ctx.stroke();
    }
}
