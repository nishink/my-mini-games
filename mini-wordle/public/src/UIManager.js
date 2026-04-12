export class UIManager {
    constructor(onKeyClick) {
        this.board = document.getElementById('board');
        this.keyboard = document.getElementById('keyboard');
        this.messageContainer = document.getElementById('message-container');
        this.onKeyClick = onKeyClick;
        this.tiles = [];
        this.keyElements = {};

        this.initBoard();
        this.initKeyboard();
    }

    initBoard() {
        this.board.innerHTML = '';
        this.tiles = [];
        for (let i = 0; i < 30; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            this.board.appendChild(tile);
            this.tiles.push(tile);
        }
    }

    initKeyboard() {
        this.keyboard.innerHTML = '';
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];

        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');
            row.forEach(key => {
                const btn = document.createElement('button');
                btn.textContent = key === 'BACKSPACE' ? '⌫' : key;
                btn.classList.add('key');
                if (key === 'ENTER' || key === 'BACKSPACE') btn.classList.add('large');
                
                btn.onclick = () => this.onKeyClick(key);
                rowDiv.appendChild(btn);
                this.keyElements[key] = btn;
            });
            this.keyboard.appendChild(rowDiv);
        });
    }

    updateTile(row, col, letter) {
        const index = row * 5 + col;
        const tile = this.tiles[index];
        tile.textContent = letter;
        if (letter) {
            tile.classList.add('filled');
            tile.style.transform = 'scale(1.1)';
            setTimeout(() => tile.style.transform = 'scale(1)', 100);
        } else {
            tile.classList.remove('filled');
        }
    }

    revealRow(row, results) {
        // results: ['correct', 'present', 'absent', ...]
        results.forEach((res, i) => {
            const index = row * 5 + i;
            const tile = this.tiles[index];
            const letter = tile.textContent;

            // アニメーション付きで色を変える
            setTimeout(() => {
                tile.classList.add(res);
                tile.style.transform = 'rotateX(90deg)';
                setTimeout(() => {
                    tile.style.transform = 'rotateX(0deg)';
                }, 200);

                // キーボードの色も更新
                this.updateKeyColor(letter, res);
            }, i * 200);
        });
    }

    updateKeyColor(letter, result) {
        const key = this.keyElements[letter.toUpperCase()];
        if (!key) return;

        // すでに「正解」の色なら変えない。 「存在する」から「正解」へのアップグレードは可。
        if (key.classList.contains('correct')) return;
        if (key.classList.contains('present') && result === 'absent') return;

        key.classList.remove('present', 'absent');
        key.classList.add(result);
    }

    showMessage(msg) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = msg;
        this.messageContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}
