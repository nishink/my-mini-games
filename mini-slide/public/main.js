// ============================================================
//  mini-slide — 15 Puzzle (スライドパズル)
// ============================================================

import { TitleScene } from './src/TitleScene.js';
import { GameScene  } from './src/GameScene.js';
import { ClearScene } from './src/ClearScene.js';

const sceneContainer = document.getElementById('scene-container');

export function changeScene(SceneClass, data = {}) {
    sceneContainer.innerHTML = '';
    new SceneClass(sceneContainer, data);
}

changeScene(TitleScene);
