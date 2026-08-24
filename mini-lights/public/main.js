// ============================================================
//  mini-lights — Lights Out Puzzle
//  パネルをクリックするとそのパネルと上下左右が反転する。
//  全てのパネルを消灯させればクリア。
// ============================================================

import { TitleScene }  from './src/TitleScene.js';
import { GameScene }   from './src/GameScene.js';
import { ClearScene }  from './src/ClearScene.js';

// ---------- Simple Scene Manager ----------
const sceneContainer = document.getElementById('scene-container');

export function changeScene(SceneClass, data = {}) {
    // 古いシーンを破棄
    sceneContainer.innerHTML = '';
    // 新しいシーンを生成
    new SceneClass(sceneContainer, data);
}

// 起動
changeScene(TitleScene);
