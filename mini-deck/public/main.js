import { sceneManager } from './src/Core/SceneManager.js';
import { TitleScene } from './src/Scenes/TitleScene.js';
import { BattleScene } from './src/Scenes/BattleScene.js';
import { RewardScene } from './src/Scenes/RewardScene.js';

class Game {
    constructor() {
        this.lastTime = 0;
        this.init();
    }

    async init() {
        // シーンの登録 (インスタンスを渡す)
        sceneManager.register('Title', new TitleScene());
        sceneManager.register('Battle', new BattleScene());
        sceneManager.register('Reward', new RewardScene());

        // シーン切り替え直後のDeltaTimeリセット用
        sceneManager.onSceneChanged = () => {
            this.lastTime = performance.now();
        };

        // 最初のシーンを開始
        await sceneManager.switchScene('Title');
        
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // 60FPSを超えないように制限（必要なら）
        // 100ms以上のスキップはポーズ中とみなして調整
        const clampedDelta = Math.min(deltaTime, 100);

        sceneManager.update(clampedDelta);
        requestAnimationFrame((t) => this.loop(t));
    }
}

// ページのロード完了時にゲームを開始
window.onload = () => {
    new Game();
};
