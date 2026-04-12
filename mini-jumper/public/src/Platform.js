export class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 15;
    }
}

export class PlatformManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.platforms = [];
        this.reset();
    }

    reset() {
        this.platforms = [];
        this.lastY = this.canvasHeight;
        // 最初の足場（スタート地点）
        this.addPlatform(this.canvasWidth / 2 - 50, this.canvasHeight - 50, 100);
        
        // 初期足場の生成
        for (let i = 0; i < 10; i++) {
            this.generateNext();
        }
    }

    addPlatform(x, y, width) {
        this.platforms.push(new Platform(x, y, width));
    }

    generateNext() {
        // 次の足場の高さを決定（徐々に間隔を広げる）
        const distance = 80 + Math.random() * 50;
        this.lastY -= distance;
        
        const width = 60 + Math.random() * 40;
        const x = Math.random() * (this.canvasWidth - width);
        
        this.addPlatform(x, this.lastY, width);
    }

    update(cameraY) {
        // 画面外に消えた足場を削除
        this.platforms = this.platforms.filter(p => p.y < cameraY + this.canvasHeight + 100);
        
        // 足場が少なくなったら新しく生成
        while (this.platforms.length < 15) {
            this.generateNext();
        }
    }
}
