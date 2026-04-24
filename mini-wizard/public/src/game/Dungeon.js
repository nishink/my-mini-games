export const TILE_TYPES = {
    FLOOR: 0,
    WALL: 1,
    GOAL: 2
};

export class Dungeon {
    constructor() {
        this.width = 10;
        this.height = 10;
        this.data = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
    }

    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.data[y][x] === TILE_TYPES.WALL;
    }

    isGoal(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.data[y][x] === TILE_TYPES.GOAL;
    }
}
