import { input } from './Input.js';

export class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
        this.container = document.getElementById('scene-container');
    }

    register(name, sceneInstance) {
        this.scenes.set(name, sceneInstance);
    }

    async switchScene(name, data = {}) {
        input.reset();
        this.isSwitching = true;

        if (this.currentScene) {
            if (this.currentScene.exit) {
                await this.currentScene.exit();
            }
            if (this.container) {
                this.container.innerHTML = '';
            }
        }

        const nextScene = this.scenes.get(name);
        if (!nextScene) {
            console.error(`Scene not found: ${name}`);
            this.isSwitching = false;
            return;
        }

        this.currentScene = nextScene;

        if (this.currentScene.enter) {
            await this.currentScene.enter(data);
        }

        this.isSwitching = false;
        if (this.onSceneChanged) this.onSceneChanged();
    }

    update(deltaTime) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }
}

export const sceneManager = new SceneManager();
