export class Map {
    constructor() {
        this.walls = [
            // 外壁
            { x: 0, y: 0, width: 800, height: 20 },
            { x: 0, y: 580, width: 800, height: 20 },
            { x: 0, y: 0, width: 20, height: 600 },
            { x: 780, y: 0, width: 20, height: 600 },
            
            // 障害物
            { x: 150, y: 150, width: 100, height: 100 },
            { x: 400, y: 100, width: 20, height: 300 },
            { x: 550, y: 350, width: 150, height: 100 },
            { x: 200, y: 400, width: 100, height: 20 },
        ];

        this.goal = { x: 720, y: 50, width: 40, height: 40 };
        this.playerStart = { x: 50, y: 550 };
    }
}
