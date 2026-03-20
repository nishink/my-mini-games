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
    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
            if (selectedTowerType === btn.dataset.type) {
                selectedTowerType = null;
            } else {
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
        document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
        selectedTowerType = null;
    });

    document.querySelectorAll('.restart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ui.gameOverScreen.classList.add('hidden');
            game.reset();
        });
    });

    // 入力イベント
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    });

    canvas.addEventListener('mousedown', (e) => {
        if (selectedTowerType && mousePos) {
            const grid = game.map.pixelToGrid(mousePos.x, mousePos.y);
            if (game.buyTower(selectedTowerType, grid.x, grid.y)) {
                // 購入成功したら選択解除（連続設置したい場合は解除しない）
                // selectedTowerType = null;
                // document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
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
});
