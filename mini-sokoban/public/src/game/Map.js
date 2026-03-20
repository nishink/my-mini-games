export const TILES = {
    FLOOR: 0,
    WALL: 1,
    GOAL: 2,
    BOX: 3,
    PLAYER: 4,
    BOX_ON_GOAL: 5,
    PLAYER_ON_GOAL: 6
};

export const LEVELS = [
    // Level 1: Simple
    [
        [1, 1, 1, 1, 1],
        [1, 4, 0, 0, 1],
        [1, 0, 3, 2, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ],
    // Level 2: Two Boxes
    [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 3, 3, 0, 0, 1],
        [1, 0, 2, 2, 4, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
    ],
    // Level 3: Classic
    [
        [0, 0, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0, 0, 1, 0],
        [1, 2, 4, 3, 0, 0, 1, 0],
        [1, 1, 1, 0, 3, 2, 1, 0],
        [1, 2, 1, 1, 3, 0, 1, 0],
        [1, 0, 1, 0, 2, 0, 1, 1],
        [1, 3, 0, 5, 3, 3, 2, 1],
        [1, 0, 0, 0, 2, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

export class Map {
    constructor(levelIndex) {
        this.loadLevel(levelIndex);
    }

    loadLevel(index) {
        const rawLevel = LEVELS[index];
        this.grid = rawLevel.map(row => [...row]);
        this.height = this.grid.length;
        this.width = this.grid[0].length;
        this.playerPos = this.findPlayer();
    }

    findPlayer() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === TILES.PLAYER || this.grid[y][x] === TILES.PLAYER_ON_GOAL) {
                    return { x, y };
                }
            }
        }
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return TILES.WALL;
        return this.grid[y][x];
    }

    setTile(x, y, type) {
        this.grid[y][x] = type;
    }

    movePlayer(dx, dy) {
        const nx = this.playerPos.x + dx;
        const ny = this.playerPos.y + dy;
        const targetTile = this.getTile(nx, ny);

        // 壁は進めない
        if (targetTile === TILES.WALL) return false;

        // 荷物がある場合
        if (targetTile === TILES.BOX || targetTile === TILES.BOX_ON_GOAL) {
            const bx = nx + dx;
            const by = ny + dy;
            const behindBoxTile = this.getTile(bx, by);

            // 荷物の先が床または目的地なら押せる
            if (behindBoxTile === TILES.FLOOR || behindBoxTile === TILES.GOAL) {
                // 荷物を移動
                this.setTile(bx, by, behindBoxTile === TILES.GOAL ? TILES.BOX_ON_GOAL : TILES.BOX);
                // プレイヤーを移動
                this.updatePlayerPosition(nx, ny);
                return true;
            }
            return false;
        }

        // 床または目的地ならそのまま移動
        if (targetTile === TILES.FLOOR || targetTile === TILES.GOAL) {
            this.updatePlayerPosition(nx, ny);
            return true;
        }

        return false;
    }

    updatePlayerPosition(nx, ny) {
        // 元の場所を更新
        const currentTile = this.getTile(this.playerPos.x, this.playerPos.y);
        this.setTile(this.playerPos.x, this.playerPos.y, currentTile === TILES.PLAYER_ON_GOAL ? TILES.GOAL : TILES.FLOOR);
        
        // 新しい場所を更新
        const targetTile = this.getTile(nx, ny);
        // 移動先が GOAL または BOX_ON_GOAL なら PLAYER_ON_GOAL に、そうでなければ PLAYER にする
        const isGoal = (targetTile === TILES.GOAL || targetTile === TILES.BOX_ON_GOAL);
        this.setTile(nx, ny, isGoal ? TILES.PLAYER_ON_GOAL : TILES.PLAYER);
        
        this.playerPos = { x: nx, y: ny };
    }

    isCleared() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // 目的地に置かれていない荷物 (TILES.BOX) が残っていたらクリアではない
                if (this.grid[y][x] === TILES.BOX) return false;
                // また、目的地 (TILES.GOAL) が空のままでもいけない（全てのBOXがGOALに乗る必要がある）
                // ただし、プレイヤーがGOALに乗っている場合はOKなので、
                // 「BOXが1つもない」かつ「GOALというタイル自体が残っていない（BOX_ON_GOALかPLAYER_ON_GOALになっている）」
                // という判定、あるいは単純に「TILES.BOXが0個」で良い（BOXの数＝GOALの数のため）
            }
        }
        return true;
    }
}
