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
        
        // シーン切り替えフラグを立てる（必要に応じて）
        this.isSwitching = true;

        // 現在のシーンを終了
        if (this.currentScene) {
            if (this.currentScene.exit) {
                await this.currentScene.exit();
            }
            this.container.innerHTML = '';
        }

        const nextScene = this.scenes.get(name);
        if (!nextScene) {
            console.error(`Scene not found: ${name}`);
            this.isSwitching = false;
            return;
        }

        this.currentScene = nextScene;
        
        if (this.currentScene.enter) {
            await this.currentScene.enter(this.container, data);
        }

        this.isSwitching = false;
        // グローバルな時間をリセットするためのコールバックがあれば実行
        if (this.onSceneChanged) this.onSceneChanged();
    }

    update(deltaTime) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }
}

export const sceneManager = new SceneManager();
