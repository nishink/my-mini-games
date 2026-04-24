export class MessageWindow {
    constructor() {
        this.element = document.getElementById('messageBox');
        this.textElement = document.getElementById('messageText');
        this.isVisible = false;
        this.callback = null;
    }

    show(text, callback = null) {
        this.textElement.innerText = text;
        this.element.style.display = 'block';
        this.isVisible = true;
        this.callback = callback;
    }

    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
        if (this.callback) {
            this.callback();
            this.callback = null;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        }
    }
}
