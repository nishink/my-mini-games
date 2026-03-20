export class Input {
    constructor() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // タッチ操作の簡易サポート
        window.addEventListener('touchstart', (e) => {
            this.keys[' '] = true; // タッチ中はオートショット
        });
        
        window.addEventListener('touchend', (e) => {
            this.keys[' '] = false;
        });
    }
}
