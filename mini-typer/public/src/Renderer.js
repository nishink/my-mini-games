export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 600;
        this.height = 800;
        canvas.width = this.width;
        canvas.height = this.height;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const availableWidth = rect.width - 20;
        const availableHeight = rect.height - 20;
        
        const aspect = this.width / this.height;
        const containerAspect = availableWidth / availableHeight;
        
        if (containerAspect > aspect) {
            this.canvas.style.height = `${availableHeight}px`;
            this.canvas.style.width = 'auto';
        } else {
            this.canvas.style.width = `${availableWidth}px`;
            this.canvas.style.height = 'auto';
        }
    }

    draw(wordManager) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // デッドライン
        this.ctx.strokeStyle = '#330000';
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height - 30);
        this.ctx.lineTo(this.width, this.height - 30);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // 単語の描画
        this.ctx.font = 'bold 24px "Courier New"';
        this.ctx.textBaseline = 'middle';

        for (const w of wordManager.words) {
            const isTarget = w === wordManager.targetWord;
            
            // 下線（ターゲット時）
            if (isTarget) {
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
                const textWidth = this.ctx.measureText(w.text).width;
                this.ctx.fillRect(w.x - 5, w.y - 15, textWidth + 10, 30);
            }

            // 入力済み部分
            const typedText = w.text.substring(0, w.typedIndex);
            const untypedText = w.text.substring(w.typedIndex);

            this.ctx.fillStyle = '#ffffff'; // 入力済みは白
            this.ctx.fillText(typedText, w.x, w.y);

            const typedWidth = this.ctx.measureText(typedText).width;
            this.ctx.fillStyle = isTarget ? '#00ff00' : '#444444'; // 未入力はターゲットなら緑、それ以外はグレー
            this.ctx.fillText(untypedText, w.x + typedWidth, w.y);
        }
    }
}
