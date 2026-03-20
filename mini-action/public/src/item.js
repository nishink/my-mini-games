export class Item {
    constructor(x, y, width = 16, height = 16, type = 'coin') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // アイテムの種類（例: 'coin'）
        this.active = true; // 収集済みかどうか
    }

    collidesWith(player) {
        if (!this.active) return false;
        return !(this.x + this.width < player.x ||
                 player.x + player.width < this.x ||
                 this.y + this.height < player.y ||
                 player.y + player.height < this.y);
    }

    collect() {
        this.active = false;
    }
}