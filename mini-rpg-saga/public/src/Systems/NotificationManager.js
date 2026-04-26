/**
 * Mini RPG Saga - NotificationManager
 * ゲーム内の通知メッセージ（Toast）を表示する。
 */
export class NotificationManager {
    constructor() {
        this.container = null;
        this.timeoutId = null;
    }

    init(parentContainer) {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'hidden';
        parentContainer.appendChild(this.container);
    }

    /**
     * メッセージを表示する
     * @param {string} message 
     * @param {number} duration 表示時間(ms)
     */
    show(message, duration = 2000) {
        if (!this.container) return;

        // すでに表示中の場合はタイマーをクリア
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.container.textContent = message;
        this.container.classList.remove('hidden');
        this.container.classList.add('show');

        this.timeoutId = setTimeout(() => {
            this.container.classList.remove('show');
            setTimeout(() => {
                this.container.classList.add('hidden');
            }, 300); // フェードアウト待ち
        }, duration);
    }
}

export const notificationManager = new NotificationManager();
