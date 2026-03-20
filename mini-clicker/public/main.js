import { ClickerGame } from './src/game/ClickerGame.js';
import { UIManager } from './src/ui/UIManager.js';

window.addEventListener('load', () => {
    const game = new ClickerGame();
    const ui = new UIManager(game);

    let lastTime = performance.now();

    function gameLoop(now) {
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        game.update(deltaTime);
        ui.updateDisplay();

        // 3秒ごとにオートセーブ
        if (Math.floor(now / 3000) !== Math.floor((now - deltaTime * 1000) / 3000)) {
            game.save();
        }

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});
