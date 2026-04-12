export const COLORS = {
    RED: '#e94560',
    BLUE: '#00d2ff',
    GREEN: '#2ecc71',
    YELLOW: '#f1c40f',
    PURPLE: '#9b59b6'
};

export class PuyoPair {
    constructor(color1, color2) {
        this.puyo1 = { color: color1, x: 0, y: 0 }; // 軸ぷよ
        this.puyo2 = { color: color2, x: 0, y: -1 }; // 子ぷよ（初期位置は上）
        this.rotation = 0; // 0: 上, 1: 右, 2: 下, 3: 左
    }

    rotate(clockwise = true) {
        if (clockwise) {
            this.rotation = (this.rotation + 1) % 4;
        } else {
            this.rotation = (this.rotation + 3) % 4;
        }
        this.updatePuyo2Position();
    }

    updatePuyo2Position() {
        switch (this.rotation) {
            case 0: // 上
                this.puyo2.x = this.puyo1.x;
                this.puyo2.y = this.puyo1.y - 1;
                break;
            case 1: // 右
                this.puyo2.x = this.puyo1.x + 1;
                this.puyo2.y = this.puyo1.y;
                break;
            case 2: // 下
                this.puyo2.x = this.puyo1.x;
                this.puyo2.y = this.puyo1.y + 1;
                break;
            case 3: // 左
                this.puyo2.x = this.puyo1.x - 1;
                this.puyo2.y = this.puyo1.y;
                break;
        }
    }

    move(dx, dy) {
        this.puyo1.x += dx;
        this.puyo1.y += dy;
        this.updatePuyo2Position();
    }
}
