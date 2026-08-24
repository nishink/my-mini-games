// ============================================================
//  SlideLogic — スライドパズルのコアロジック
//
//  盤面は 1次元配列 (tiles[]) で管理する。
//  空きマスは 0 で表す。
//  size=4 → 15パズル、size=3 → 8パズル
// ============================================================

export class SlideLogic {
    /** @param {number} size - グリッドのサイズ (size × size) */
    constructor(size) {
        this.size  = size;
        this.total = size * size;
        // ゴール状態: [1,2,...,n-1, 0]
        this.tiles = [...Array(this.total - 1).keys()].map(i => i + 1);
        this.tiles.push(0);
        this.emptyIdx = this.total - 1;
        this.moves = 0;
    }

    /** ゴール状態かどうか */
    isSolved() {
        for (let i = 0; i < this.total - 1; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return true;
    }

    /** タイル番号がゴール位置にあるか */
    isCorrect(idx) {
        const val = this.tiles[idx];
        if (val === 0) return false;
        return val === idx + 1;
    }

    /** 正しい位置にあるタイルの数 */
    correctCount() {
        let n = 0;
        for (let i = 0; i < this.total; i++) {
            if (this.isCorrect(i)) n++;
        }
        return n;
    }

    /**
     * index で指定したタイルを空きマスに向かってスライドできるか判定し、
     * 可能なら実行する。
     * @param {number} idx - クリックされたタイルのインデックス
     * @returns {boolean} 移動できたか
     */
    slide(idx) {
        const emptyR = Math.floor(this.emptyIdx / this.size);
        const emptyC = this.emptyIdx % this.size;
        const tileR  = Math.floor(idx / this.size);
        const tileC  = idx % this.size;

        const dr = Math.abs(tileR - emptyR);
        const dc = Math.abs(tileC - emptyC);

        // 隣接（上下左右のいずれか1マス）であることを確認
        if (!((dr === 1 && dc === 0) || (dr === 0 && dc === 1))) return false;

        // swap
        this.tiles[this.emptyIdx] = this.tiles[idx];
        this.tiles[idx] = 0;
        this.emptyIdx = idx;
        this.moves++;
        return true;
    }

    /**
     * 解が存在することが保証されたシャッフルを行う
     * （解状態から逆操作を繰り返す方式）
     * @param {number} shuffleCount - シャッフル回数
     */
    shuffle(shuffleCount) {
        let lastEmpty = -1;

        for (let i = 0; i < shuffleCount; i++) {
            const emptyR = Math.floor(this.emptyIdx / this.size);
            const emptyC = this.emptyIdx % this.size;

            // 空きマスの隣接インデックスを取得
            const neighbors = [];
            if (emptyR > 0) neighbors.push(this.emptyIdx - this.size);
            if (emptyR < this.size - 1) neighbors.push(this.emptyIdx + this.size);
            if (emptyC > 0) neighbors.push(this.emptyIdx - 1);
            if (emptyC < this.size - 1) neighbors.push(this.emptyIdx + 1);

            // 直前に動かしたタイルに戻る移動は避ける（無意味なので）
            const valid = neighbors.filter(n => n !== lastEmpty);
            const chosen = valid[Math.floor(Math.random() * valid.length)];
            lastEmpty = this.emptyIdx;

            // swap
            this.tiles[this.emptyIdx] = this.tiles[chosen];
            this.tiles[chosen] = 0;
            this.emptyIdx = chosen;
        }

        this.moves = 0; // シャッフル時のカウントはリセット
    }

    /** ディープコピー */
    clone() {
        const c = new SlideLogic(this.size);
        c.tiles    = [...this.tiles];
        c.emptyIdx = this.emptyIdx;
        c.moves    = this.moves;
        return c;
    }
}
