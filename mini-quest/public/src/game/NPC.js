import { TILE_SIZE } from './Map.js';

export class NPC {
    constructor(x, y, message, id) {
        this.x = x;
        this.y = y;
        this.message = message;
        this.id = id;
    }

    draw(ctx) {
        ctx.fillStyle = '#e74c3c';
        const padding = 5;
        ctx.fillRect(
            this.x * TILE_SIZE + padding,
            this.y * TILE_SIZE + padding,
            TILE_SIZE - padding * 2,
            TILE_SIZE - padding * 2
        );
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x * TILE_SIZE + 10, this.y * TILE_SIZE + 10, 5, 5);
        ctx.fillRect(this.x * TILE_SIZE + 25, this.y * TILE_SIZE + 10, 5, 5);
    }

    getMessage(flags) {
        if (typeof this.message === 'function') {
            return this.message(flags);
        }
        return this.message;
    }
}
