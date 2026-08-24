// ============================================================
// mini-match3 — Main entry point
// ============================================================
import { GameScene } from './src/GameScene.js';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scene-container');
    const scene = new GameScene(container);
    scene.showTitle();
});
