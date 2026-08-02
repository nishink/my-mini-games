import { sceneManager } from './src/Core/SceneManager.js';
import { TitleScene } from './src/Scenes/TitleScene.js';
import { DifficultySelectScene } from './src/Scenes/DifficultySelectScene.js';
import { GameScene } from './src/Scenes/GameScene.js';
import { ResultScene } from './src/Scenes/ResultScene.js';

class Game {
    constructor() {
        this.lastTime = 0;
        this.init();
    }

    async init() {
        sceneManager.register('Title', new TitleScene());
        sceneManager.register('DifficultySelect', new DifficultySelectScene());
        sceneManager.register('Game', new GameScene());
        sceneManager.register('Result', new ResultScene());

        sceneManager.onSceneChanged = () => {
            this.lastTime = performance.now();
        };

        await sceneManager.switchScene('Title');
        
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        const clampedDelta = Math.min(deltaTime, 100);

        sceneManager.update(clampedDelta);
        requestAnimationFrame((t) => this.loop(t));
    }
}

window.onload = () => {
    new Game();
};
