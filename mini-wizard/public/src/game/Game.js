import { Dungeon } from './Dungeon.js';
import { Player } from './Player.js';
import { Renderer3D } from './Renderer3D.js';
import { MiniMap } from '../ui/MiniMap.js';

export class Game {
    constructor(canvas, miniMapCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dungeon = new Dungeon();
        this.player = new Player(1, 1, 1);
        this.renderer = new Renderer3D(canvas, this.ctx);
        this.miniMap = new MiniMap(miniMapCanvas);
        
        this.inputs = {
            up: false,
            down: false,
            left: false,
            right: false,
            action: false
        };
        this.lastActionState = false;
        this.gameCleared = false;
        
        this.messageBox = document.getElementById('messageBox');
        this.messageText = document.getElementById('messageText');
    }

    start() {
        this.loop();
    }

    reset() {
        this.player = new Player(1, 1, 1);
        this.gameCleared = false;
        this.hideMessage();
        this.updateHUD("宝箱を探そう");
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
        if (this.gameCleared) {
            if (this.inputs.action && !this.lastActionState) {
                this.reset();
            }
            this.lastActionState = this.inputs.action;
            return;
        }

        // Action to move
        if (this.inputs.up && !this.lastUpState) {
            this.player.move(true, this.dungeon);
        } else if (this.inputs.down && !this.lastDownState) {
            this.player.move(false, this.dungeon);
        }

        if (this.inputs.left && !this.lastLeftState) {
            this.player.turn(false);
        } else if (this.inputs.right && !this.lastRightState) {
            this.player.turn(true);
        }

        this.lastUpState = this.inputs.up;
        this.lastDownState = this.inputs.down;
        this.lastLeftState = this.inputs.left;
        this.lastRightState = this.inputs.right;
        
        // Check Goal
        if (this.dungeon.isGoal(this.player.x, this.player.y)) {
            this.gameCleared = true;
            this.showMessage("お宝を見つけた！ クエストクリア！");
            this.updateHUD("クエスト完了！");
        }

        this.lastActionState = this.inputs.action;
    }

    draw() {
        this.renderer.draw(this.player, this.dungeon);
        this.miniMap.draw(this.player, this.dungeon);
    }

    showMessage(text) {
        this.messageText.innerText = text;
        this.messageBox.style.display = 'block';
    }

    hideMessage() {
        this.messageBox.style.display = 'none';
    }
}
