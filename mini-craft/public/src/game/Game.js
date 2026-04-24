import { World, BLOCK_TYPES } from './World.js';
import { Renderer } from './Renderer.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.world = new World(10);
        this.renderer = new Renderer(canvas, ctx);
        
        this.selectedBlockIndex = 0;
        this.mode = 'build'; 
        
        this.setupInventory();
        this.setupControls();
        this.bindEvents();
    }

    start() {
        this.loop();
    }

    loop() {
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    draw() {
        this.renderer.draw(this.world);
    }

    setupControls() {
        // Add rotate button
        const hud = document.getElementById('hud');
        const rotateBtn = document.createElement('button');
        rotateBtn.id = 'rotateBtn';
        rotateBtn.innerText = 'Rotate View (Q)';
        rotateBtn.style.marginLeft = '10px';
        rotateBtn.addEventListener('click', () => this.rotateView());
        hud.insertBefore(rotateBtn, document.getElementById('resetBtn'));
    }

    rotateView() {
        this.renderer.rotate();
    }

    setMode(mode) {
        this.mode = mode;
        document.getElementById('currentMode').innerText = mode === 'build' ? 'Build' : 'Delete';
        document.getElementById('buildModeBtn').classList.toggle('active', mode === 'build');
        document.getElementById('deleteModeBtn').classList.toggle('active', mode === 'delete');
    }

    selectBlock(index) {
        if (index >= 0 && index < BLOCK_TYPES.length) {
            this.selectedBlockIndex = index;
            this.updateInventoryUI();
        }
    }

    setupInventory() {
        const inv = document.getElementById('inventory');
        inv.innerHTML = '';
        BLOCK_TYPES.forEach((type, index) => {
            const slot = document.createElement('div');
            slot.className = `inv-slot ${index === this.selectedBlockIndex ? 'active' : ''}`;
            slot.innerHTML = `
                <div class="block-preview" style="background: ${type.top}; border: 1px solid ${type.side}"></div>
                <span style="font-size: 8px">${index + 1}</span>
            `;
            slot.addEventListener('click', () => this.selectBlock(index));
            inv.appendChild(slot);
        });
    }

    updateInventoryUI() {
        const slots = document.querySelectorAll('.inv-slot');
        slots.forEach((slot, index) => {
            slot.classList.toggle('active', index === this.selectedBlockIndex);
        });
    }

    reset() {
        this.world.reset();
    }

    bindEvents() {
        const getMousePos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        this.canvas.addEventListener('mousedown', (e) => {
            const pos = getMousePos(e);
            this.handleClick(pos.x, pos.y);
        });

        // Touch support
        let touchStartTime = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartTime = Date.now();
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.changedTouches[0];
            const pos = getMousePos(touch);
            
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration > 500) {
                const originalMode = this.mode;
                this.mode = 'delete';
                this.handleClick(pos.x, pos.y);
                this.mode = originalMode;
            } else {
                this.handleClick(pos.x, pos.y);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'q' || e.key === 'Q') this.rotateView();
            if (e.key === 'e' || e.key === 'E') {
                this.renderer.rotate();
                this.renderer.rotate();
                this.renderer.rotate();
            }
        });
    }

    handleClick(mouseX, mouseY) {
        const hit = this.getHitInfo(mouseX, mouseY);
        
        if (hit) {
            if (this.mode === 'delete') {
                this.world.removeBlock(hit.gx, hit.gy, hit.gz);
            } else {
                let nx = hit.gx, ny = hit.gy, nz = hit.gz;
                if (hit.face === 'top') {
                    nz++;
                } else {
                    const dir = this.getWorldDir(hit.face);
                    nx += dir.x;
                    ny += dir.y;
                }
                this.world.setBlock(nx, ny, nz, this.selectedBlockIndex + 1);
            }
        }
    }

    getWorldDir(face) {
        const rot = this.renderer.rotation;
        const dirs = [
            {right: {x:1, y:0}, left: {x:0, y:1}},   
            {right: {x:0, y:-1}, left: {x:1, y:0}},  
            {right: {x:-1, y:0}, left: {x:0, y:-1}}, 
            {right: {x:0, y:1}, left: {x:-1, y:0}}   
        ];
        return dirs[rot][face];
    }

    getHitInfo(px, py) {
        const order = this.renderer.getLoopOrder(this.world.size);
        const xOrder = [...order.x].reverse();
        const yOrder = [...order.y].reverse();

        for (let z = this.world.size - 1; z >= 0; z--) {
            for (let gx of xOrder) {
                for (let gy of yOrder) {
                    if (this.world.getBlock(gx, gy, z) > 0) {
                        const face = this.getHitFace(px, py, gx, gy, z);
                        if (face) return { gx, gy, gz: z, face };
                    }
                }
            }
        }
        return null;
    }

    getHitFace(px, py, gx, gy, gz) {
        const pos = this.renderer.gridToScreen(gx, gy, gz, this.world.size);
        const w = this.renderer.tileWidth;
        const h = this.renderer.tileHeight;

        if (this.isPointInDiamond(px, py, pos.x, pos.y + h/2, w, h)) return 'top';

        if (this.isPointInParallelogram(px, py, 
            pos.x, pos.y + h, 
            pos.x + w/2, pos.y + h/2, 
            pos.x + w/2, pos.y + 3*h/2, 
            pos.x, pos.y + 2*h)) return 'right';

        if (this.isPointInParallelogram(px, py, 
            pos.x, pos.y + h, 
            pos.x - w/2, pos.y + h/2, 
            pos.x - w/2, pos.y + 3*h/2, 
            pos.x, pos.y + 2*h)) return 'left';

        return null;
    }

    isPointInDiamond(px, py, cx, cy, w, h) {
        const dx = Math.abs(px - cx) / (w / 2);
        const dy = Math.abs(py - cy) / (h / 2);
        return dx + dy <= 1;
    }

    isPointInParallelogram(px, py, x1, y1, x2, y2, x3, y3, x4, y4) {
        const crossProduct = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        const c1 = crossProduct(x1, y1, x2, y2, px, py);
        const c2 = crossProduct(x2, y2, x3, y3, px, py);
        const c3 = crossProduct(x3, y3, x4, y4, px, py);
        const c4 = crossProduct(x4, y4, x1, y1, px, py);
        return (c1 >= 0 && c2 >= 0 && c3 >= 0 && c4 >= 0) || (c1 <= 0 && c2 <= 0 && c3 <= 0 && c4 <= 0);
    }
}
