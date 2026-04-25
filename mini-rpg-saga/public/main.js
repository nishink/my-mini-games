import { sceneManager } from './src/Core/SceneManager.js';
import { TitleScene } from './src/Scenes/TitleScene.js';
import { TownScene } from './src/Scenes/TownScene.js';

class Game {
    constructor() {
        this.init();
    }

    async init() {
        // シーンの登録
        sceneManager.register('Title', new TitleScene());
        sceneManager.register('Town', new TownScene());

        // 最初のシーン（タイトル）を開始
        await sceneManager.switchScene('Title');
        
        console.log('Mini RPG Saga Initialized');
        
        // メインループの開始（必要に応じて）
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        sceneManager.update(deltaTime);

        requestAnimationFrame((t) => this.loop(t));
    }
}

// ゲームインスタンスの作成
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
