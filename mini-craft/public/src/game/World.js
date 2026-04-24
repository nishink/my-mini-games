export const BLOCK_TYPES = [
    { name: "Grass", top: "#2ecc71", side: "#27ae60" },
    { name: "Stone", top: "#95a5a6", side: "#7f8c8d" },
    { name: "Brick", top: "#e67e22", side: "#d35400" },
    { name: "Water", top: "#3498db", side: "#2980b9" },
    { name: "Wood", top: "#f1c40f", side: "#f39c12" },
];

export class World {
    constructor(size = 10) {
        this.size = size;
        this.data = this.createEmptyGrid();
        this.load();
    }

    createEmptyGrid() {
        const grid = [];
        for (let x = 0; x < this.size; x++) {
            grid[x] = [];
            for (let y = 0; y < this.size; y++) {
                grid[x][y] = [];
                for (let z = 0; z < this.size; z++) {
                    grid[x][y][z] = 0; // 0 means empty
                }
            }
        }
        // Initialize base floor
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                grid[x][y][0] = 1; // Grass base
            }
        }
        return grid;
    }

    setBlock(x, y, z, typeIndex) {
        if (this.isOutOfBounds(x, y, z)) return;
        this.data[x][y][z] = typeIndex;
        this.save();
    }

    getBlock(x, y, z) {
        if (this.isOutOfBounds(x, y, z)) return 0;
        return this.data[x][y][z];
    }

    removeBlock(x, y, z) {
        if (this.isOutOfBounds(x, y, z)) return;
        if (z === 0) return; // Prevent removing floor for simplicity
        this.data[x][y][z] = 0;
        this.save();
    }

    isOutOfBounds(x, y, z) {
        return x < 0 || x >= this.size || y < 0 || y >= this.size || z < 0 || z >= this.size;
    }

    reset() {
        this.data = this.createEmptyGrid();
        this.save();
    }

    save() {
        localStorage.setItem('mini-craft-world', JSON.stringify(this.data));
    }

    load() {
        const saved = localStorage.getItem('mini-craft-world');
        if (saved) {
            try {
                const loadedData = JSON.parse(saved);
                if (loadedData.length === this.size) {
                    this.data = loadedData;
                }
            } catch (e) {
                console.error("Failed to load saved world", e);
            }
        }
    }
}
