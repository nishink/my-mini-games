/**
 * Mini RPG Saga - DialogManager
 * 「はい/いいえ」などの選択肢を持つダイアログを表示する。
 */
export class DialogManager {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.onResolve = null;
    }

    init(parentContainer) {
        this.container = document.createElement('div');
        this.container.id = 'dialog-overlay';
        this.container.className = 'hidden overlay';
        parentContainer.appendChild(this.container);
    }

    /**
     * 確認ダイアログを表示する
     * @param {string} message 
     * @returns {Promise<boolean>} 「はい」ならtrue
     */
    async confirm(message) {
        this.isActive = true;
        this.render(message);
        this.container.classList.remove('hidden');

        return new Promise((resolve) => {
            this.onResolve = (result) => {
                this.close();
                resolve(result);
            };
        });
    }

    render(message) {
        this.container.innerHTML = `
            <div class="dialog-box ui-panel">
                <div class="dialog-message">${message}</div>
                <div class="dialog-actions">
                    <button id="dialog-yes" class="menu-btn">はい</button>
                    <button id="dialog-no" class="menu-btn">いいえ</button>
                </div>
            </div>
        `;

        this.container.querySelector('#dialog-yes').onclick = () => this.onResolve(true);
        this.container.querySelector('#dialog-no').onclick = () => this.onResolve(false);
    }

    close() {
        this.isActive = false;
        this.container.classList.add('hidden');
    }
}

export const dialogManager = new DialogManager();
