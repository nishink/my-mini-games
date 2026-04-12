export class Tile {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.element = this.createDOM();
        this.updatePosition();
    }

    createDOM() {
        const div = document.createElement('div');
        div.classList.add('tile');
        this.updateStyle(div);
        return div;
    }

    updateStyle(element = this.element) {
        element.className = 'tile';
        const valClass = this.value <= 2048 ? `tile-${this.value}` : 'tile-super';
        element.classList.add(valClass);
        element.textContent = this.value;
    }

    updatePosition() {
        // マスサイズ 87.5px + 隙間 10px = 97.5px
        const offset = 97.5;
        this.element.style.transform = `translate(${this.x * offset}px, ${this.y * offset}px)`;
    }

    remove() {
        this.element.remove();
    }
}
