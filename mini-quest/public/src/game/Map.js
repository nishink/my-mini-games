export const TILE_SIZE = 40;

export const TILE_TYPES = {
    FLOOR: 0,
    WALL: 1,
    NPC: 2,
    DOOR: 3,
    GOAL: 4
};

export class Map {
    constructor() {
        this.width = 10;
        this.height = 10;
        this.data = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 4, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 3, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 2, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
    }

    draw(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.data[y][x];
                this.drawTile(ctx, x, y, tile);
            }
        }
    }

    drawTile(ctx, x, y, tile) {
        let color;
        switch (tile) {
            case TILE_TYPES.FLOOR: color = '#333'; break;
            case TILE_TYPES.WALL: color = '#666'; break;
            case TILE_TYPES.NPC: color = '#333'; break; // NPC layer is separate, but background is floor
            case TILE_TYPES.DOOR: color = '#8b4513'; break;
            case TILE_TYPES.GOAL: color = '#ffd700'; break;
            default: color = '#000';
        }

        ctx.fillStyle = color;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Draw borders for tiles
        ctx.strokeStyle = '#222';
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Special icon for door
        if (tile === TILE_TYPES.DOOR) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(x * TILE_SIZE + 15, y * TILE_SIZE + 15, 10, 10);
        }
    }

    isPassable(x, y, flags) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        const tile = this.data[y][x];
        
        if (tile === TILE_TYPES.WALL) return false;
        if (tile === TILE_TYPES.NPC) return false;
        if (tile === TILE_TYPES.DOOR && !flags.doorOpened) return false;
        
        return true;
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return TILE_TYPES.WALL;
        return this.data[y][x];
    }

    openDoor(x, y) {
        if (this.data[y][x] === TILE_TYPES.DOOR) {
            // We don't actually change the data, just the collision logic via flags
            // but we could change it to floor if we want
        }
    }
}
