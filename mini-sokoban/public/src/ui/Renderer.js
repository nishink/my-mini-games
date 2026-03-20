import { TILES } from '../game/Map.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 40;
    }

    draw(map) {
        this.canvas.width = map.width * this.tileSize;
        this.canvas.height = map.height * this.tileSize;

        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = map.getTile(x, y);
                this.drawTile(x, y, tile);
            }
        }
    }

    drawTile(x, y, tile) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        // 背景（床）を先に描画
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
        this.ctx.strokeStyle = '#555';
        this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);

        switch (tile) {
            case TILES.WALL:
                this.ctx.fillStyle = '#888';
                this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
                this.ctx.fillStyle = '#666';
                this.ctx.fillRect(px + 8, py + 8, this.tileSize - 16, this.tileSize - 16);
                break;
            case TILES.GOAL:
                this.ctx.fillStyle = '#f00';
                this.ctx.beginPath();
                this.ctx.arc(px + this.tileSize / 2, py + this.tileSize / 2, 5, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case TILES.BOX:
                this.ctx.fillStyle = '#d2691e'; // Chocolate brown
                this.ctx.fillRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);
                this.ctx.strokeStyle = '#000';
                this.ctx.strokeRect(px + 8, py + 8, this.tileSize - 16, this.tileSize - 16);
                break;
            case TILES.BOX_ON_GOAL:
                this.ctx.fillStyle = '#32cd32'; // Lime green
                this.ctx.fillRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);
                this.ctx.strokeStyle = '#fff';
                this.ctx.strokeRect(px + 8, py + 8, this.tileSize - 16, this.tileSize - 16);
                break;
            case TILES.PLAYER:
            case TILES.PLAYER_ON_GOAL:
                if (tile === TILES.PLAYER_ON_GOAL) {
                    this.ctx.fillStyle = '#f00';
                    this.ctx.beginPath();
                    this.ctx.arc(px + this.tileSize / 2, py + this.tileSize / 2, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.fillStyle = '#ff0'; // Yellow
                this.ctx.beginPath();
                this.ctx.arc(px + this.tileSize / 2, py + this.tileSize / 2, this.tileSize / 2 - 6, 0, Math.PI * 2);
                this.ctx.fill();
                // Eyes
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(px + this.tileSize / 2 - 8, py + this.tileSize / 2 - 8, 4, 4);
                this.ctx.fillRect(px + this.tileSize / 2 + 4, py + this.tileSize / 2 - 8, 4, 4);
                break;
        }
    }
}
