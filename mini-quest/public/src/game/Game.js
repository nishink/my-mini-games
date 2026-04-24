import { Map, TILE_TYPES } from './Map.js';
import { Player } from './Player.js';
import { NPC } from './NPC.js';
import { MessageWindow } from '../ui/MessageWindow.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = new Map();
        this.player = new Player(1, 1);
        this.messageWindow = new MessageWindow();
        
        this.flags = {
            hasKey: false,
            doorOpened: false,
            gameCleared: false
        };

        this.npcs = [
            new NPC(1, 8, (flags) => {
                if (flags.hasKey) {
                    return "カギはもう持っているようじゃな。金の扉へ向かうがよい！";
                }
                flags.hasKey = true;
                this.updateHUD("金の扉を開けよう");
                return "やあ 旅の人。このカギを持っていきなさい。金の扉を開けられるはずじゃ。";
            }, 'villager')
        ];

        this.inputs = {
            up: false,
            down: false,
            left: false,
            right: false,
            action: false
        };

        this.lastActionState = false;
    }

    start() {
        this.loop();
    }

    reset() {
        this.player = new Player(1, 1);
        this.flags = {
            hasKey: false,
            doorOpened: false,
            gameCleared: false
        };
        this.updateHUD("カギを探そう");
        this.messageWindow.hide();
    }

    updateHUD(text) {
        document.getElementById('questStatus').innerText = text;
    }

    handleInput(action, isPressed) {
        this.inputs[action] = isPressed;
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        if (this.messageWindow.isVisible) {
            if (this.inputs.action && !this.lastActionState) {
                this.messageWindow.hide();
            }
            this.lastActionState = this.inputs.action;
            return;
        }

        if (this.flags.gameCleared) return;

        // Player movement
        if (!this.player.isMoving) {
            if (this.inputs.up) this.player.move('up', this.map, this.flags);
            else if (this.inputs.down) this.player.move('down', this.map, this.flags);
            else if (this.inputs.left) this.player.move('left', this.map, this.flags);
            else if (this.inputs.right) this.player.move('right', this.map, this.flags);
        }

        this.player.update();

        // Action button
        if (this.inputs.action && !this.lastActionState) {
            this.interact();
        }
        this.lastActionState = this.inputs.action;

        // Check goal
        const currentTile = this.map.getTile(Math.round(this.player.x), Math.round(this.player.y));
        if (currentTile === TILE_TYPES.GOAL && !this.flags.gameCleared) {
            this.flags.gameCleared = true;
            this.messageWindow.show("おめでとう！ クエストクリアだ！");
            this.updateHUD("クエスト完了！");
        }
    }

    interact() {
        const front = this.player.getFrontPos();
        
        // Check NPCs
        const npc = this.npcs.find(n => n.x === front.x && n.y === front.y);
        if (npc) {
            this.messageWindow.show(npc.getMessage(this.flags));
            return;
        }

        // Check Door
        const tile = this.map.getTile(front.x, front.y);
        if (tile === TILE_TYPES.DOOR) {
            if (this.flags.hasKey) {
                this.flags.doorOpened = true;
                this.messageWindow.show("カギを使って扉を開けた！");
                this.updateHUD("ゴールを目指そう！");
            } else {
                this.messageWindow.show("扉にはカギがかかっている。");
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.map.draw(this.ctx);
        
        this.npcs.forEach(npc => npc.draw(this.ctx));
        
        this.player.draw(this.ctx);

        if (this.flags.gameCleared) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('クエストクリア！', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
}
