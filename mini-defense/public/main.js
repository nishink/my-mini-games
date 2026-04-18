import { Game } from './src/game/Game.js';
import { Renderer } from './src/ui/Renderer.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    const ui = {
        goldVal: document.getElementById('gold-val'),
        hpVal: document.getElementById('hp-val'),
        waveVal: document.getElementById('wave-val'),
        gameOverScreen: document.getElementById('game-over'),
        finalWave: document.getElementById('final-wave')
    };

    const game = new Game(canvas, ui);
    const renderer = new Renderer(canvas.getContext('2d'), game.map);

    let mousePos = null;
    let selectedTowerType = null;

    // UI初期化
    const towerBtns = document.querySelectorAll('.tower-btn');
    towerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (selectedTowerType === btn.dataset.type) {
                selectedTowerType = null;
                btn.classList.remove('selected');
            } else {
                towerBtns.forEach(b => b.classList.remove('selected'));
                selectedTowerType = btn.dataset.type;
                btn.classList.add('selected');
            }
        });
    });

    document.getElementById('next-wave-btn').addEventListener('click', () => {
        game.startWave();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        game.reset();
        towerBtns.forEach(b => b.classList.remove('selected'));
        selectedTowerType = null;
    });

    document.querySelectorAll('.restart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ui.gameOverScreen.classList.add('hidden');
            game.reset();
        });
    });

    // 座標計算の共通関数
    function updatePointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // 表示サイズと内部解像度の比率を計算
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        mousePos = {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    // 入力イベント (Pointer Events推奨)
    canvas.addEventListener('pointermove', (e) => {
        updatePointerPos(e);
    });

    canvas.addEventListener('pointerdown', (e) => {
        updatePointerPos(e);
        if (selectedTowerType && mousePos) {
            const grid = game.map.pixelToGrid(mousePos.x, mousePos.y);
            if (game.buyTower(selectedTowerType, grid.x, grid.y)) {
                // 購入成功時のフィードバック（必要ならここで選択解除）
            }
        }
    });

    // メインループ
    let lastTime = performance.now();
    function loop(now) {
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        game.update(deltaTime);
        renderer.draw(game, mousePos, selectedTowerType);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // リサイズ対応
    window.addEventListener('resize', () => {
        // CSSのリサイズに任せるが、必要ならここで再描画を促す
    });
});
