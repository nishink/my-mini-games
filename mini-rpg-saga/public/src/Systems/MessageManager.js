/**
 * Mini RPG Saga - MessageManager
 * メッセージウィンドウの表示とテキスト送りを管理する。
 */
export class MessageManager {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.textQueue = [];
        this.currentFullText = "";
        this.isTyping = false;
        this.onComplete = null;
    }

    init(parentContainer) {
        // すでに存在すれば削除して再作成（シーン切り替え時の重複防止）
        const old = parentContainer.querySelector('#dialogue-window');
        if (old) old.remove();

        this.container = document.createElement('div');
        this.container.id = 'dialogue-window';
        this.container.className = 'hidden';
        this.container.innerHTML = `
            <div class="dialogue-box ui-panel">
                <div id="dialogue-name" class="name-tag"></div>
                <div id="dialogue-text" class="text-content"></div>
                <div class="next-indicator">▼</div>
            </div>
        `;
        parentContainer.appendChild(this.container);

        this.nameEl = this.container.querySelector('#dialogue-name');
        this.textEl = this.container.querySelector('#dialogue-text');

        this.container.onclick = (e) => {
            e.stopPropagation();
            if (this.isActive) this.next();
        };
    }

    /**
     * メッセージを表示し、終了するまで待機する
     */
    show(name, lines) {
        return new Promise((resolve) => {
            this.isActive = true;
            this.onComplete = resolve; // 終了時に呼び出す
            this.textQueue = [...lines];
            this.nameEl.textContent = name;
            this.nameEl.style.display = name ? 'block' : 'none';
            this.container.classList.remove('hidden');
            this.next();
        });
    }

    async next() {
        if (this.isTyping) {
            this.skipTyping();
            return;
        }

        if (this.textQueue.length === 0) {
            this.close();
            return;
        }

        const nextLine = this.textQueue.shift();
        await this.typeText(nextLine);
    }

    async typeText(text) {
        this.isTyping = true;
        this.currentFullText = text;
        this.textEl.textContent = "";
        
        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) break;
            this.textEl.textContent += text[i];
            await new Promise(r => setTimeout(r, 20));
        }
        
        this.textEl.textContent = text;
        this.isTyping = false;
    }

    skipTyping() {
        this.isTyping = false;
        this.textEl.textContent = this.currentFullText;
    }

    close() {
        this.isActive = false;
        this.container.classList.add('hidden');
        if (this.onComplete) {
            const resolve = this.onComplete;
            this.onComplete = null;
            resolve();
        }
    }
}

export const messageManager = new MessageManager();
