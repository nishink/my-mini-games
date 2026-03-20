export class Map {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        
        // 0: 建設可能, 1: 道 (建設不可)
        this.grid = Array(height).fill().map(() => Array(width).fill(0));
        
        // 敵の経路 (グリッド座標の配列)
        this.path = [
            {x: 0, y: 2}, {x: 5, y: 2}, {x: 5, y: 7}, {x: 10, y: 7}, {x: 10, y: 2}, {x: 14, y: 2}
        ];
        
        this.initGrid();
    }

    initGrid() {
        // 経路上のグリッドを「道」としてマーク
        for (let i = 0; i < this.path.length - 1; i++) {
            const start = this.path[i];
            const end = this.path[i+1];
            
            if (start.x === end.x) { // 垂直
                const y1 = Math.min(start.y, end.y);
                const y2 = Math.max(start.y, end.y);
                for (let y = y1; y <= y2; y++) this.grid[y][start.x] = 1;
            } else { // 水平
                const x1 = Math.min(start.x, end.x);
                const x2 = Math.max(start.x, end.x);
                for (let x = x1; x <= x2; x++) this.grid[start.y][x] = 1;
            }
        }
    }

    isBuildable(gx, gy) {
        if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return false;
        return this.grid[gy][gx] === 0;
    }

    // グリッド座標をピクセル座標に変換
    gridToPixel(gx, gy) {
        return {
            x: gx * this.tileSize + this.tileSize / 2,
            y: gy * this.tileSize + this.tileSize / 2
        };
    }

    // ピクセル座標をグリッド座標に変換
    pixelToGrid(px, py) {
        return {
            x: Math.floor(px / this.tileSize),
            y: Math.floor(py / this.tileSize)
        };
    }
}
