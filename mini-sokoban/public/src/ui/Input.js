export class Input {
    constructor(callback) {
        this.callback = callback;
        
        // キーボード入力
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd', 'r'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.callback('UP');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.callback('DOWN');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.callback('LEFT');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.callback('RIGHT');
                    break;
                case 'r':
                case 'R':
                    this.callback('RESET');
                    break;
            }
        });

        // タッチ操作（ボタン）
        document.querySelectorAll('.ctrl-btn').forEach(btn => {
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.callback(action);
            });
        });

        // リセットボタン (HUD)
        const resetBtn = document.getElementById('reset-btn-ui');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.callback('RESET');
            });
        }
    }
}
