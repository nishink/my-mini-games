export const TETROMINOS = {
    'I': {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00f0f0'
    },
    'J': {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000f0'
    },
    'L': {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#f0a000'
    },
    'O': {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#f0f000'
    },
    'S': {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00f000'
    },
    'T': {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#a000f0'
    },
    'Z': {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#f00000'
    }
};

export class Piece {
    constructor(type) {
        this.type = type;
        this.shape = TETROMINOS[type].shape;
        this.color = TETROMINOS[type].color;
        this.x = 0;
        this.y = 0;
    }

    rotate(clockwise = true) {
        const size = this.shape.length;
        const newShape = Array.from({ length: size }, () => Array(size).fill(0));

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (clockwise) {
                    newShape[x][size - 1 - y] = this.shape[y][x];
                } else {
                    newShape[size - 1 - x][y] = this.shape[y][x];
                }
            }
        }
        this.shape = newShape;
    }

    getDimensions() {
        return {
            width: this.shape[0].length,
            height: this.shape.length
        };
    }
}
