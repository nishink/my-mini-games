import { TILE_SIZE } from './map.js';

export class Renderer {
    constructor(canvas, ctx, map, player, enemies, bullets, items) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = map;
        this.player = player;
        this.enemies = enemies;
        this.bullets = bullets;
        this.items = items;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    updateEnemies(enemies) {
        this.enemies = enemies;
    }

    updateBullets(bullets) {
        this.bullets = bullets;
    }

    updateItems(items) {
        this.items = items;
    }

    render() {
        // clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // calculate camera to keep player near left-center
        this.offsetX = this.player.x - this.canvas.width * 0.3; // player at 30% from left
        if (this.offsetX < 0) this.offsetX = 0;
        if (this.offsetX + this.canvas.width > this.map.width) this.offsetX = this.map.width - this.canvas.width;

        // draw tiles
        for (let y = 0; y < this.map.rows; y++) {
            for (let x = 0; x < this.map.cols; x++) {
                const tile = this.map.tiles[y][x];
                if (tile === 1) {
                    this.ctx.fillStyle = '#444';
                    this.ctx.fillRect(
                        x * TILE_SIZE - this.offsetX,
                        y * TILE_SIZE - this.offsetY,
                        TILE_SIZE,
                        TILE_SIZE
                    );
                } else if (tile === 2) {
                    this.ctx.fillStyle = '#f00';
                    this.ctx.fillRect(
                        x * TILE_SIZE - this.offsetX,
                        y * TILE_SIZE - this.offsetY,
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        }

        // draw enemies
        for (const enemy of this.enemies) {
            if (enemy.type === 'jumping') {
                this.ctx.fillStyle = '#00f'; // 青色 for jumping enemy
            } else {
                this.ctx.fillStyle = '#f0f'; // ピンク for normal enemy
            }
            this.ctx.fillRect(
                enemy.x - this.offsetX,
                enemy.y - this.offsetY,
                enemy.width,
                enemy.height
            );
        }

        // draw items
        this.ctx.fillStyle = '#ff0'; // 黄色 for items
        for (const item of this.items) {
            if (item.active) {
                this.ctx.fillRect(
                    item.x - this.offsetX,
                    item.y - this.offsetY,
                    item.width,
                    item.height
                );
            }
        }

        // draw bullets
        this.ctx.fillStyle = '#ff0';
        for (const bullet of this.bullets) {
            this.ctx.fillRect(
                bullet.x - this.offsetX,
                bullet.y - this.offsetY,
                bullet.width,
                bullet.height
            );
        }

        // draw player
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(
            this.player.x - this.offsetX,
            this.player.y - this.offsetY,
            this.player.width,
            this.player.height
        );
    }
}
