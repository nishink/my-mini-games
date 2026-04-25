/**
 * Mini RPG Saga - DialogueManager
 * メッセージウィンドウの表示とテキスト送りを管理する。
 */
export class DialogueManager {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.textQueue = [];
        this.currentText = "";
        this.isTyping = false;
        this.onComplete = null;
    }

    init(parentContainer) {
        this.container = document.createElement('div');
        this.container.id = 'dialogue-window';
        this.container.className = 'hidden';
        this.container.innerHTML = `
            <div class="dialogue-box">
                <div id="dialogue-name" class="name-tag"></div>
                <div id="dialogue-text" class="text-content"></div>
                <div class="next-indicator">▼</div>
            </div>
        `;
        parentContainer.appendChild(this.container);

        this.nameEl = document.getElementById('dialogue-name');
        this.textEl = document.getElementById('dialogue-text');

        // クリック/タップで次へ進む
        this.container.addEventListener('click', (e) => {
            e.stopPropagation(); // 下層のイベントを防止
            if (this.isActive) {
                this.next();
            }
        });
    }

    async show(name, lines, onComplete = null) {
        this.isActive = true;
        this.onComplete = onComplete;
        this.textQueue = [...lines];
        this.nameEl.textContent = name;
        this.container.classList.remove('hidden');
        await this.next();
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
            if (!this.isTyping) break; // スキップされた場合
            this.textEl.textContent += text[i];
            await new Promise(r => setTimeout(r, 30));
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
        if (this.onComplete) this.onComplete();
    }
}

export const dialogueManager = new DialogueManager();
