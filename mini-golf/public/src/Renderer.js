export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(window.innerWidth - 40, 800);
        const maxHeight = Math.min(window.innerHeight - 200, 600);
        
        // アスペクト比を維持してスケール
        const scaleX = maxWidth / 800;
        const scaleY = maxHeight / 600;
        this.scale = Math.min(scaleX, scaleY);
        
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = (800 * this.scale) + 'px';
        this.canvas.style.height = (600 * this.scale) + 'px';
    }

    draw(ball, stage, dragStart, currentMouse) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 壁の描画
        this.ctx.fillStyle = '#1e8449';
        for (const wall of stage.walls) {
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }

        // カップの描画
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(stage.cup.x, stage.cup.y, stage.cup.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // カップの縁
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // ボールの描画
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // ドラッグ中のガイド線
        if (dragStart && currentMouse && !ball.isMoving) {
            this.drawGuide(ball, dragStart, currentMouse);
        }
    }

    drawGuide(ball, start, end) {
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const power = Math.min(dist / 10, 20); // 最大パワー制限

        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(ball.x, ball.y);
        this.ctx.lineTo(ball.x + dx * 2, ball.y + dy * 2); // 予測方向（少し長めに表示）
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // パワーインジケーター
        this.ctx.fillStyle = `rgba(241, 196, 15, ${power / 20})`;
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius + power, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
