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
        element.setAttribute('data-value', this.value);
        element.textContent = this.value;
    }

    updatePosition() {
        // グリッドコンテナの実際のサイズから、1マスの移動距離を計算する
        const container = document.getElementById('grid-container');
        if (!container) return;

        const gridWidth = container.clientWidth;
        // style.css の計算式: (gridWidth - (gap * 5)) / 4 
        // 簡略化すると offset = gridWidth / 4
        const offset = gridWidth / 4;
        
        this.element.style.transform = `translate(${this.x * offset}px, ${this.y * offset}px)`;
    }

    remove() {
        this.element.remove();
    }
}
