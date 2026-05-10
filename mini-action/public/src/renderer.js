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

        // Ensure crisp pixel art
        this.ctx.imageSmoothingEnabled = false;

        // Load sprites
        this.sprites = {
            player: new Image(),
            enemy: new Image(),
            bullet: new Image(),
            tiles: new Image(),
            item: new Image()
        };
        this.sprites.player.src = 'assets/player.svg';
        this.sprites.enemy.src = 'assets/enemy.svg';
        this.sprites.bullet.src = 'assets/bullet.svg';
        this.sprites.tiles.src = 'assets/tiles.svg';
        this.sprites.item.src = 'assets/item.svg';
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
        // clear with a dark space-like background
        this.ctx.fillStyle = '#050510';
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
                    // Metallic Wall
                    this.ctx.drawImage(
                        this.sprites.tiles,
                        0, 0, 32, 32,
                        x * TILE_SIZE - this.offsetX,
                        y * TILE_SIZE - this.offsetY,
                        TILE_SIZE, TILE_SIZE
                    );
                } else if (tile === 2) {
                    // Warp Gate (Goal)
                    this.ctx.drawImage(
                        this.sprites.tiles,
                        32, 0, 32, 32,
                        x * TILE_SIZE - this.offsetX,
                        y * TILE_SIZE - this.offsetY,
                        TILE_SIZE, TILE_SIZE
                    );
                }
            }
        }

        // draw enemies (Drones)
        for (const enemy of this.enemies) {
            const ex = enemy.x - this.offsetX;
            const ey = enemy.y - this.offsetY;
            const frame = enemy.type === 'jumping' ? 1 : 0;
            
            this.ctx.save();
            if (enemy.dir === -1) {
                this.ctx.translate(ex + enemy.width, ey);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(
                    this.sprites.enemy,
                    frame * 32, 0, 32, 32,
                    0, 0, enemy.width, enemy.height
                );
            } else {
                this.ctx.drawImage(
                    this.sprites.enemy,
                    frame * 32, 0, 32, 32,
                    ex, ey, enemy.width, enemy.height
                );
            }
            this.ctx.restore();
        }

        // draw items (Power Gems)
        for (const item of this.items) {
            if (item.active) {
                this.ctx.drawImage(
                    this.sprites.item,
                    item.x - this.offsetX,
                    item.y - this.offsetY,
                    item.width,
                    item.height
                );
            }
        }

        // draw bullets (Energy Plasma)
        for (const bullet of this.bullets) {
            this.ctx.drawImage(
                this.sprites.bullet,
                bullet.x - this.offsetX,
                bullet.y - this.offsetY,
                bullet.width,
                bullet.height
            );
        }

        // draw player with sprite animation
        const px = this.player.x - this.offsetX;
        const py = this.player.y - this.offsetY;
        
        this.ctx.save();
        if (this.player.facing === -1) {
            this.ctx.translate(px + this.player.width, py);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                this.sprites.player,
                this.player.animationFrame * 32, 0, 32, 32, // Source rect
                0, 0, this.player.width, this.player.height // Destination rect (translated)
            );
        } else {
            this.ctx.drawImage(
                this.sprites.player,
                this.player.animationFrame * 32, 0, 32, 32, // Source rect
                px, py, this.player.width, this.player.height // Destination rect
            );
        }
        this.ctx.restore();
    }
}
