/**
 * Mini RPG Saga - SceneManager
 * シーンの切り替えとライフサイクルを管理する。
 */
export class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
        this.container = document.getElementById('scene-container');
    }

    /**
     * シーンを登録する
     * @param {string} name 
     * @param {Object} sceneInstance - enter(), exit(), update() メソッドを持つオブジェクト
     */
    register(name, sceneInstance) {
        this.scenes.set(name, sceneInstance);
    }

    /**
     * シーンを切り替える
     * @param {string} name 
     * @param {Object} data - 次のシーンに渡す任意データ
     */
    async switchScene(name, data = {}) {
        console.log(`Switching to scene: ${name}`);
        
        // 現在のシーンを終了
        if (this.currentScene) {
            if (this.currentScene.exit) {
                await this.currentScene.exit();
            }
            this.container.innerHTML = '';
        }

        // 新しいシーンを取得
        const nextScene = this.scenes.get(name);
        if (!nextScene) {
            console.error(`Scene not found: ${name}`);
            return;
        }

        this.currentScene = nextScene;
        
        // 新しいシーンを開始
        if (this.currentScene.enter) {
            await this.currentScene.enter(this.container, data);
        }
    }

    update(deltaTime) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }
}

export const sceneManager = new SceneManager();
