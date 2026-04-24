import { BLOCK_TYPES } from './World.js';

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tileWidth = 40;
        this.tileHeight = 20;
        this.rotation = 0; 
        this.updateOffset();
    }

    updateOffset() {
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2 + 100;
    }

    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }

    // Convert grid to rotated grid coordinates
    getRotatedCoords(gx, gy, worldSize) {
        let rx = gx, ry = gy;
        if (this.rotation === 1) { [rx, ry] = [gy, worldSize - 1 - gx]; }
        else if (this.rotation === 2) { [rx, ry] = [worldSize - 1 - gx, worldSize - 1 - gy]; }
        else if (this.rotation === 3) { [rx, ry] = [worldSize - 1 - gy, gx]; }
        return { x: rx, y: ry };
    }

    gridToScreen(gx, gy, gz, worldSize) {
        const rot = this.getRotatedCoords(gx, gy, worldSize);
        const screenX = (rot.x - rot.y) * (this.tileWidth / 2);
        const screenY = (rot.x + rot.y) * (this.tileHeight / 2) - (gz * this.tileHeight);
        
        return { 
            x: screenX + this.offsetX, 
            y: screenY + this.offsetY 
        };
    }

    draw(world) {
        this.updateOffset();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Painter's algorithm order depends on rotation
        // Determine start and step for X and Y loops
        const order = this.getLoopOrder(world.size);

        for (let z = 0; z < world.size; z++) {
            for (let i = 0; i < world.size; i++) {
                const gx = order.x[i];
                for (let j = 0; j < world.size; j++) {
                    const gy = order.y[j];
                    const blockTypeIndex = world.getBlock(gx, gy, z);
                    if (blockTypeIndex > 0) {
                        const pos = this.gridToScreen(gx, gy, z, world.size);
                        this.drawBlock(pos, BLOCK_TYPES[blockTypeIndex - 1]);
                    }
                }
            }
        }
    }

    // Helper to get drawing order (Back to Front)
    getLoopOrder(size) {
        const indices = Array.from({length: size}, (_, i) => i);
        // Default (rotation 0): 0,0 is back. Iterate 0 to size-1.
        let xOrder = [...indices];
        let yOrder = [...indices];

        if (this.rotation === 1) xOrder.reverse();
        else if (this.rotation === 2) { xOrder.reverse(); yOrder.reverse(); }
        else if (this.rotation === 3) yOrder.reverse();

        return { x: xOrder, y: yOrder };
    }

    drawBlock(pos, type) {
        const w = this.tileWidth;
        const h = this.tileHeight;

        // Sides first (Right, then Left)
        this.ctx.fillStyle = this.shadeColor(type.side, -20);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y + h);
        this.ctx.lineTo(pos.x + w / 2, pos.y + h / 2);
        this.ctx.lineTo(pos.x + w / 2, pos.y + h / 2 + h);
        this.ctx.lineTo(pos.x, pos.y + h + h);
        this.ctx.fill();

        this.ctx.fillStyle = this.shadeColor(type.side, -40);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y + h);
        this.ctx.lineTo(pos.x - w / 2, pos.y + h / 2);
        this.ctx.lineTo(pos.x - w / 2, pos.y + h / 2 + h);
        this.ctx.lineTo(pos.x, pos.y + h + h);
        this.ctx.fill();

        // Top face
        this.ctx.fillStyle = type.top;
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(pos.x + w / 2, pos.y + h / 2);
        this.ctx.lineTo(pos.x, pos.y + h);
        this.ctx.lineTo(pos.x - w / 2, pos.y + h / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);
        R = Math.floor(R * (100 + percent) / 100);
        G = Math.floor(G * (100 + percent) / 100);
        B = Math.floor(B * (100 + percent) / 100);
        R = Math.min(255, Math.max(0, R));
        G = Math.min(255, Math.max(0, G));
        B = Math.min(255, Math.max(0, B));
        return "#" + (R.toString(16).padStart(2, '0')) + (G.toString(16).padStart(2, '0')) + (B.toString(16).padStart(2, '0'));
    }
}
