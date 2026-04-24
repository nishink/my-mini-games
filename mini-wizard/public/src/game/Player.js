export class Player {
    constructor(x, y, dir = 0) {
        this.x = x;
        this.y = y;
        this.dir = dir; // 0: North, 1: East, 2: South, 3: West
    }

    move(forward, dungeon) {
        const dx = [0, 1, 0, -1];
        const dy = [-1, 0, 1, 0];
        const step = forward ? 1 : -1;

        const nextX = this.x + dx[this.dir] * step;
        const nextY = this.y + dy[this.dir] * step;

        if (!dungeon.isWall(nextX, nextY)) {
            this.x = nextX;
            this.y = nextY;
            return true;
        }
        return false;
    }

    turn(right) {
        if (right) {
            this.dir = (this.dir + 1) % 4;
        } else {
            this.dir = (this.dir + 3) % 4;
        }
    }
}
