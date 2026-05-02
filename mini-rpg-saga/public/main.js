import { sceneManager } from './src/Core/SceneManager.js';
import { TitleScene } from './src/Scenes/TitleScene.js';
import { TownScene } from './src/Scenes/TownScene.js';
import { DungeonScene } from './src/Scenes/DungeonScene.js';
import { BattleScene } from './src/Scenes/BattleScene.js';
import { WorldMapScene } from './src/Scenes/WorldMapScene.js';
import { MiniGameScene } from './src/Scenes/MiniGameScene.js';
import { CastleScene } from './src/Scenes/CastleScene.js';

class Game {
    constructor() {
        this.init();
    }

    async init() {
        // シーンの登録
        sceneManager.register('Title', new TitleScene());
        sceneManager.register('Town', new TownScene());
        sceneManager.register('Dungeon', new DungeonScene());
        sceneManager.register('Battle', new BattleScene());
        sceneManager.register('WorldMap', new WorldMapScene());
        sceneManager.register('MiniGame', new MiniGameScene());
        sceneManager.register('Castle', new CastleScene());

        // シーン切り替え直後にDeltaTimeが跳ね上がらないように時間をリセット
        sceneManager.onSceneChanged = () => {
            this.lastTime = performance.now();
        };

        // 最初のシーン（タイトル）を開始
        await sceneManager.switchScene('Title');
        
        console.log('Mini RPG Saga Initialized');
        
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
