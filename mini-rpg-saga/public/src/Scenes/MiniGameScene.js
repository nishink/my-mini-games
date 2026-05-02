import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { dialogueManager } from '../Systems/DialogueManager.js';

export class MiniGameScene {
    constructor() {
        this.type = 'timing';
        this.targetPos = 0.5;
        this.targetWidth = 0.15;
        this.currentPos = 0;
        this.speed = 0.002;
        this.direction = 1;
        this.isFinished = false;
        this.result = null;
        this.callbackScene = null;
        this.moveDelay = 0;
    }

    async enter(container, data) {
        this.container = container;
        this.callbackScene = data.callbackScene || 'Dungeon';
        this.onSuccess = data.onSuccess;
        this.onFailure = data.onFailure;
        this.message = data.message || 'タイミングよくボタンを押せ！';
        
        this.render();
        dialogueManager.init(this.container);
        this.isFinished = false;
        this.inputDelay = 500; // 入力の受付開始まで0.5秒待つ
    }

    render() {
        // ... (省略されるが全体を保持するように指示)
        this.container.innerHTML = `
            <div id="game-ui" class="minigame-ui">
                <div class="minigame-header">
                    <h2>ミニゲーム: ロックピック</h2>
                </div>
                <div class="minigame-content">
                    <p class="minigame-msg">${this.message}</p>
                    <div class="timing-bar-bg">
                        <div id="timing-target" class="timing-target"></div>
                        <div id="timing-cursor" class="timing-cursor"></div>
                    </div>
                    <div class="minigame-hint">決定ボタンまたはタップでストップ</div>
                </div>
                <div id="virtual-controller">
                    <div class="action-pad">
                        <button class="v-btn action-btn" id="v-action">決定</button>
                    </div>
                </div>
            </div>
        `;

        const targetEl = this.container.querySelector('#timing-target');
        this.targetPos = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
        targetEl.style.left = `${this.targetPos * 100}%`;
        targetEl.style.width = `${this.targetWidth * 100}%`;

        this.cursorEl = this.container.querySelector('#timing-cursor');
        
        this.container.querySelector('#v-action').onclick = (e) => {
            e.stopPropagation();
            this.stop();
        };
        this.container.onclick = (e) => {
            if (e.target.closest('#virtual-controller') || e.target.closest('.action-btn')) return;
            this.stop();
        };
    }

    update(deltaTime) {
        if (dialogueManager.isActive) {
            if (input.isPressed(' ') || input.isPressed('Enter')) {
                if (this.moveDelay <= 0) {
                    dialogueManager.next();
                    this.moveDelay = 300;
                }
            }
            if (this.moveDelay > 0) this.moveDelay -= deltaTime;
            return;
        }

        if (this.isFinished) return;

        this.currentPos += this.speed * deltaTime * this.direction;
        if (this.currentPos >= 1) {
            this.currentPos = 1;
            this.direction = -1;
        } else if (this.currentPos <= 0) {
            this.currentPos = 0;
            this.direction = 1;
        }

        if (this.cursorEl) {
            this.cursorEl.style.left = `${this.currentPos * 100}%`;
        }

        if (this.inputDelay > 0) {
            this.inputDelay -= deltaTime;
            return;
        }

        if (input.isPressed(' ') || input.isPressed('Enter')) {
            this.stop();
        }
    }

    async stop() {
        if (this.isFinished || this.inputDelay > 0) return;
        this.isFinished = true;

        const diff = Math.abs(this.currentPos - (this.targetPos + this.targetWidth / 2));
        const success = diff < this.targetWidth / 2;

        if (success) {
            this.cursorEl.style.backgroundColor = '#4ade80';
            if (this.onSuccess) await this.onSuccess();
        } else {
            this.cursorEl.style.backgroundColor = '#ef4444';
            if (this.onFailure) await this.onFailure();
        }

        setTimeout(() => {
            sceneManager.switchScene(this.callbackScene);
        }, 1000);
    }

    async exit() {
        console.log('Exiting MiniGame Scene');
    }
}
