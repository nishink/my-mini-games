export class Renderer {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.width = 400;
        this.height = 600;
        canvas.width = this.width;
        canvas.height = this.height;
    }

    draw(player, platformManager, cameraY) {
        // 背景の描画（カメラ位置に応じてグラデーションのオフセットを調整）
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a2a6c');
        gradient.addColorStop(0.5, '#b21f1f');
        gradient.addColorStop(1, '#fdbb2d');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.save();
        this.ctx.translate(0, -cameraY);

        // 足場の描画
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        for (const p of platformManager.platforms) {
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
        }

        // プレイヤーの描画
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#e74c3c';
        this.ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // プレイヤーの目（おまけ）
        this.ctx.fillStyle = 'white';
        const eyeSize = 6;
        const eyeOffset = player.vx > 0 ? 5 : (player.vx < 0 ? -5 : 0);
        this.ctx.fillRect(player.x + player.width/2 - eyeSize/2 + eyeOffset - 8, player.y + 10, eyeSize, eyeSize);
        this.ctx.fillRect(player.x + player.width/2 - eyeSize/2 + eyeOffset + 8, player.y + 10, eyeSize, eyeSize);

        this.ctx.restore();
    }
}
