export class Renderer3D {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    draw(player, dungeon) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Floor and Ceiling
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
        this.ctx.fillStyle = '#0d0d0d';
        this.ctx.fillRect(0, 0, this.width, this.height / 2);

        // Directions for checking tiles
        const dx = [0, 1, 0, -1];
        const dy = [-1, 0, 1, 0];

        // Draw from far to near (Painter's Algorithm)
        for (let dist = 4; dist >= 0; dist--) {
            this.drawWallsAtDistance(player, dungeon, dist, dx, dy);
        }
    }

    drawWallsAtDistance(player, dungeon, dist, dx, dy) {
        const viewDir = player.dir;
        const rightDir = (viewDir + 1) % 4;
        const leftDir = (viewDir + 3) % 4;

        const getTile = (fwd, side) => {
            const x = player.x + dx[viewDir] * fwd + dx[rightDir] * side;
            const y = player.y + dy[viewDir] * fwd + dy[rightDir] * side;
            return { x, y, isWall: dungeon.isWall(x, y), isGoal: dungeon.isGoal(x, y) };
        };

        const center = getTile(dist, 0);
        
        // Camera is at the center (0.5) of the current tile.
        // Radically compress depth to 0.4 for a very tight view.
        const step = 0.4; 
        const eyePos = 0.5;
        const zNear = dist === 0 ? 0 : (0.5 + (dist - 1) * step);
        const zFar = 0.5 + dist * step;
        const zFront = 0.5 + (dist - 1) * step; // Surface of the wall at 'dist'

        // 1. Draw front faces for this distance
        if (dist >= 1) {
            for (let side of [-1, 1, 0]) {
                const tile = getTile(dist, side);
                if (tile.isWall) {
                    if (dist === 1 || !getTile(dist - 1, side).isWall) {
                        this.drawFrontWall(zFront, side);
                    }
                } else if (side === 0 && tile.isGoal) {
                    this.drawGoal(zFront, 0);
                }
            }
        }

        // 2. Draw side faces
        let centerBlocked = false;
        for (let d = 1; d < dist; d++) {
            if (getTile(d, 0).isWall) {
                centerBlocked = true;
                break;
            }
        }

        if (!centerBlocked && !center.isWall) {
            for (let side of [-1, 1]) {
                const tile = getTile(dist, side);
                if (tile.isWall) {
                    this.drawSideWall(zNear, zFar, side === -1);
                }
            }
        }
    }

    getWallRect(z, side) {
        // Perspective: scale = K / z
        // First front wall (at z=0.5) takes 75% height.
        // 0.75 = K / 0.5 => K = 0.375
        let scale;
        if (z <= 0) {
            scale = 5.0;
        } else {
            scale = 0.375 / z;
        }

        const w = this.width * scale;
        const h = this.height * scale;
        const x = this.width / 2 + (side * w) - w / 2;
        const y = this.height / 2 - h / 2;

        return { x, y, w, h, scale };
    }

    drawFrontWall(z, side) {
        const r = this.getWallRect(z, side);
        
        // Darken based on distance (normalize by the first front wall at 0.5)
        const colorVal = Math.floor(Math.min(220, 200 * (0.5 / z)));
        this.ctx.fillStyle = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;
        this.ctx.fillRect(r.x, r.y, r.w, r.h);
    }

    drawSideWall(zNear, zFar, isLeft) {
        const rNear = this.getWallRect(zNear, 0);
        const rFar = this.getWallRect(zFar, 0);

        // Slightly darker than front walls
        const colorVal = Math.floor(Math.min(180, 150 * (0.5 / zFar)));
        this.ctx.fillStyle = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;

        this.ctx.beginPath();
        if (isLeft) {
            this.ctx.moveTo(rNear.x, rNear.y);
            this.ctx.lineTo(rFar.x, rFar.y);
            this.ctx.lineTo(rFar.x, rFar.y + rFar.h);
            this.ctx.lineTo(rNear.x, rNear.y + rNear.h);
        } else {
            this.ctx.moveTo(rNear.x + rNear.w, rNear.y);
            this.ctx.lineTo(rFar.x + rFar.w, rFar.y);
            this.ctx.lineTo(rFar.x + rFar.w, rFar.y + rFar.h);
            this.ctx.lineTo(rNear.x + rNear.w, rNear.y + rNear.h);
        }
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.stroke();
    }

    drawGoal(z, side) {
        const r = this.getWallRect(z, side);
        const gw = r.w * 0.4;
        const gh = r.h * 0.3;
        const gx = r.x + (r.w - gw) / 2;
        const gy = r.y + r.h - gh - (10 * r.scale / 0.75);

        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(gx, gy, gw, gh);
        this.ctx.strokeStyle = '#d35400';
        this.ctx.strokeRect(gx, gy, gw, gh);
    }
}
