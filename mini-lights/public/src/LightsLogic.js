// ============================================================
//  LightsLogic — ライツアウトのコアロジック
// ============================================================

export class LightsLogic {
    /**
     * @param {number} size - グリッドのサイズ (size × size)
     * @param {number[][]} grid - 0=消灯 / 1=点灯 の二次元配列
     */
    constructor(size, grid = null) {
        this.size = size;
        this.grid = grid ? grid.map(r => [...r]) : this._emptyGrid();
        this.moves = 0;
    }

    _emptyGrid() {
        return Array.from({ length: this.size }, () => new Array(this.size).fill(0));
    }

    /**
     * セル (r, c) をクリックする
     * → そのセル＋上下左右を反転させる
     * @returns {Array<{r:number, c:number}>} 反転したセルのリスト
     */
    click(r, c) {
        const toggled = [];
        const targets = [
            [r, c],
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1],
        ];
        for (const [tr, tc] of targets) {
            if (tr >= 0 && tr < this.size && tc >= 0 && tc < this.size) {
                this.grid[tr][tc] ^= 1;
                toggled.push({ r: tr, c: tc });
            }
        }
        this.moves++;
        return toggled;
    }

    /** 全セルが消灯しているか */
    isSolved() {
        return this.grid.every(row => row.every(v => v === 0));
    }

    /** 現在点灯しているセル数 */
    lightsOn() {
        return this.grid.flat().filter(v => v === 1).length;
    }

    /** 必ず解けるパズルを生成する
     *  解答状態（全消灯）からランダムに n 回クリックして初期配置を作る。
     *  これにより必ず解が存在する。
     */
    static generate(size, difficulty) {
        const clickCounts = {
            easy:   5 + Math.floor(Math.random() * 5),   // 5〜9
            normal: 8 + Math.floor(Math.random() * 8),   // 8〜15
            hard:   12 + Math.floor(Math.random() * 12), // 12〜23
        };
        const n = clickCounts[difficulty] ?? clickCounts.normal;

        const logic = new LightsLogic(size);
        const usedMoves = new Set();
        let attempts = 0;

        while (usedMoves.size < n && attempts < n * 10) {
            const r = Math.floor(Math.random() * size);
            const c = Math.floor(Math.random() * size);
            const key = r * size + c;
            // 同じセルの2度押しは効果が相殺されるので避ける
            if (!usedMoves.has(key)) {
                usedMoves.add(key);
                logic.click(r, c);
            }
            attempts++;
        }
        logic.moves = 0; // 生成時のクリックはカウントしない

        // 全消灯になってしまったら再生成
        if (logic.isSolved()) {
            return LightsLogic.generate(size, difficulty);
        }
        return logic;
    }

    /** グリッドのディープコピーを返す */
    clone() {
        return new LightsLogic(this.size, this.grid);
    }
}
