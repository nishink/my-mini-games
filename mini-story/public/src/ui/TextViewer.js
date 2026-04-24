export class TextViewer {
    constructor() {
        this.element = document.getElementById('msgText');
        this.msgBox = document.getElementById('msgBox');
        this.cursor = document.getElementById('nextCursor');
        this.text = "";
        this.currentIndex = 0;
        this.isTyping = false;
        this.timer = null;
        this.speed = 30; // ms per character
    }

    show(text) {
        this.text = text;
        this.currentIndex = 0;
        this.element.innerText = "";
        this.msgBox.scrollTop = 0;
        this.cursor.style.visibility = 'hidden';
        this.isTyping = true;
        this.startTyping();
    }

    startTyping() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.currentIndex < this.text.length) {
                this.element.innerText += this.text[this.currentIndex];
                this.currentIndex++;
                // Auto-scroll to bottom as text is added
                this.msgBox.scrollTop = this.msgBox.scrollHeight;
            } else {
                this.finish();
            }
        }, this.speed);
    }

    skip() {
        if (this.isTyping) {
            clearInterval(this.timer);
            this.element.innerText = this.text;
            this.currentIndex = this.text.length;
            this.msgBox.scrollTop = this.msgBox.scrollHeight;
            this.finish();
        }
    }

    finish() {
        this.isTyping = false;
        clearInterval(this.timer);
        this.cursor.style.visibility = 'visible';
    }
}
