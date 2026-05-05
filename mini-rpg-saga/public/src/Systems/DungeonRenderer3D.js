/**
 * Mini RPG Saga - DungeonRenderer3D
 * mini-wizardの描画ロジックをベースにしたキャンバスベースの3Dレンダラー。
 */
export class DungeonRenderer3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    draw(playerPos, playerDir, map, sceneTitle = '') {
        this.currentSceneTitle = sceneTitle;
        // 背景（天井と床）
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#1a1a1a'; // 床
        this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
        this.ctx.fillStyle = '#0d0d0d'; // 天井
        this.ctx.fillRect(0, 0, this.width, this.height / 2);

        // 方向ベクトル
        // 北(0,-1), 東(1,0), 南(0,1), 西(-1,0)
        const dx = [0, 1, 0, -1];
        const dy = [-1, 0, 1, 0];

        // 現在の向きのインデックス
        let dirIdx = 0;
        if (playerDir.x === 1) dirIdx = 1;
        else if (playerDir.y === 1) dirIdx = 2;
        else if (playerDir.x === -1) dirIdx = 3;

        // 遠くから手前へ描画
        for (let dist = 4; dist >= 0; dist--) {
            this.drawWallsAtDistance(playerPos, dirIdx, map, dist, dx, dy);
        }
    }

    drawWallsAtDistance(playerPos, dirIdx, map, dist, dx, dy) {
        const rightDir = (dirIdx + 1) % 4;

        const getTile = (fwd, side) => {
            const x = playerPos.x + dx[dirIdx] * fwd + dx[rightDir] * side;
            const y = playerPos.y + dy[dirIdx] * fwd + dy[rightDir] * side;
            
            let tile = 0;
            if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                tile = map[y][x];
            }
            return tile;
        };

        const step = 0.4;
        const zNear = dist === 0 ? 0 : (0.5 + (dist - 1) * step);
        const zFar = 0.5 + dist * step;
        const zFront = 0.5 + (dist - 1) * step;

        // 正面の壁の描画
        if (dist >= 1) {
            for (let side of [-1, 1, 0]) {
                const tile = getTile(dist, side);
                if (tile === 1) { // 壁
                    // 手前が壁でない場合のみ正面を描画
                    if (dist === 1 || getTile(dist - 1, side) !== 1) {
                        this.drawFrontWall(zFront, side);
                    }
                } else if (side === 0 && tile > 1) {
                    this.drawObject(zFront, 0, tile);
                }
            }
        }

        // 横の壁の描画
        let centerBlocked = false;
        for (let d = 1; d < dist; d++) {
            if (getTile(d, 0) === 1) {
                centerBlocked = true;
                break;
            }
        }

        if (!centerBlocked && getTile(dist, 0) !== 1) {
            for (let side of [-1, 1]) {
                if (getTile(dist, side) === 1) {
                    this.drawSideWall(zNear, zFar, side === -1);
                }
            }
        }
    }

    getWallRect(z, side) {
        let scale = (z <= 0) ? 5.0 : 0.375 / z;
        const w = this.width * scale;
        const h = this.height * scale;
        const x = this.width / 2 + (side * w) - w / 2;
        const y = this.height / 2 - h / 2;
        return { x, y, w, h, scale };
    }

    drawFrontWall(z, side) {
        const r = this.getWallRect(z, side);
        const colorVal = Math.floor(Math.min(220, 200 * (0.5 / z)));
        this.ctx.fillStyle = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;
        this.ctx.fillRect(r.x, r.y, r.w, r.h);
        
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        this.ctx.strokeRect(r.x, r.y, r.w, r.h);
    }

    drawSideWall(zNear, zFar, isLeft) {
        const rNear = this.getWallRect(zNear, 0);
        const rFar = this.getWallRect(zFar, 0);

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

        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        this.ctx.stroke();
    }

    drawObject(z, side, tile) {
        const r = this.getWallRect(z, side);
        
        let emoji = '❓';
        if (tile === 2) {
            emoji = this.currentSceneTitle === '魔王城' ? '👿' : '💎';
        } else if (tile === 3) {
            emoji = '⛲';
        }

        const fontSize = Math.floor(60 * r.scale);
        this.ctx.font = `${fontSize}px serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.fillText(emoji, this.width / 2, this.height / 2);
    }

    /**
     * ミニマップを描画する
     * @param {HTMLCanvasElement} canvas 
     * @param {Object} playerPos 
     * @param {Object} playerDir 
     * @param {Array} map 
     */
    drawMiniMap(canvas, playerPos, playerDir, map) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const size = 6; // 1マスのサイズ
        canvas.width = map[0].length * size;
        canvas.height = map.length * size;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 1) {
                    ctx.fillStyle = '#444';
                    ctx.fillRect(x * size, y * size, size - 1, size - 1);
                }
            }
        }

        // プレイヤーの表示
        ctx.fillStyle = '#f00';
        ctx.fillRect(playerPos.x * size, playerPos.y * size, size, size);

        // 向きの表示
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo((playerPos.x + 0.5) * size, (playerPos.y + 0.5) * size);
        ctx.lineTo(
            (playerPos.x + 0.5 + playerDir.x * 0.8) * size,
            (playerPos.y + 0.5 + playerDir.y * 0.8) * size
        );
        ctx.stroke();
    }
}
