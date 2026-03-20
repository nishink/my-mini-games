export const TILE_SIZE = 32;

export class Map {
    constructor(cols = 80, rows = 15) {
        // dimensions in tiles
        this.cols = cols;
        this.rows = rows;
        this.width = cols * TILE_SIZE;
        this.height = rows * TILE_SIZE;
        this.generateRandom(1); // 初期レベル1でランダム生成
    }

    generateRandom(level = 1) {
        // create a 2D array filled with 0 (empty)
        this.tiles = [];
        for (let y = 0; y < this.rows; y++) {
            const row = new Array(this.cols).fill(0);
            this.tiles.push(row);
        }
        // add ground
        for (let x = 0; x < this.cols; x++) {
            this.tiles[this.rows - 1][x] = 1;
        }
        // add left wall to prevent falling off
        for (let y = 0; y < this.rows; y++) {
            this.tiles[y][0] = 1;
        }
        // add right wall near goal
        for (let y = 0; y < this.rows - 2; y++) {
            this.tiles[y][this.cols - 2] = 1;
        }

        // random platforms based on level
        const numPlatforms = Math.max(3, 8 - level); // レベルが高いほどプラットフォームが少ない
        const platYBase = this.rows - 4;
        for (let i = 0; i < numPlatforms; i++) {
            const platY = platYBase - Math.floor(Math.random() * 4); // ランダムな高さ
            const platXStart = Math.floor(Math.random() * (this.cols - 20)) + 5; // ランダムな開始位置
            const platLength = Math.floor(Math.random() * 10) + 5; // ランダムな長さ
            for (let x = platXStart; x < platXStart + platLength && x < this.cols - 5; x++) {
                this.tiles[platY][x] = 1;
            }
        }

        // add goal at the far right, inside the wall
        this.tiles[this.rows - 2][this.cols - 3] = 2; // goal tile
    }

    getTileAt(px, py) {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return 0;
        return this.tiles[ty][tx];
    }
}
