export class Map {
    constructor() {
        const outerWalls = [
            { x: -100, y: -100, width: 1000, height: 100 }, // Top
            { x: -100, y: 600, width: 1000, height: 100 },  // Bottom
            { x: -100, y: -100, width: 100, height: 800 },  // Left
            { x: 800, y: -100, width: 100, height: 800 },   // Right
            { x: 0, y: 0, width: 800, height: 10 },
            { x: 0, y: 590, width: 800, height: 10 },
            { x: 0, y: 0, width: 10, height: 600 },
            { x: 790, y: 0, width: 10, height: 600 }
        ];

        this.stages = [
            {
                start: { x: 100, y: 300 },
                cup: { x: 700, y: 300, radius: 15 },
                walls: [...outerWalls]
            },
            {
                start: { x: 100, y: 100 },
                cup: { x: 700, y: 500, radius: 15 },
                walls: [
                    ...outerWalls,
                    { x: 300, y: 0, width: 40, height: 400 },
                    { x: 500, y: 200, width: 40, height: 400 }
                ]
            },
            {
                start: { x: 400, y: 500 },
                cup: { x: 400, y: 100, radius: 15 },
                walls: [
                    ...outerWalls,
                    { x: 200, y: 200, width: 400, height: 20 },
                    { x: 200, y: 380, width: 400, height: 20 }
                ]
            }
        ];
    }

    getStage(index) {
        return this.stages[index % this.stages.length];
    }
}
