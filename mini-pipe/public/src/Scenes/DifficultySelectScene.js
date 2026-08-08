import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

const DIFFICULTIES = [
    {
        id: 'easy',
        label: 'かんたん',
        icon: '🌊',
        rows: 5,
        cols: 5,
        description: '5×5 グリッド\nパイプに慣れよう！',
        color: 'rgba(34, 197, 94, 0.1)',
    },
    {
        id: 'normal',
        label: 'ふつう',
        icon: '💧',
        rows: 7,
        cols: 7,
        description: '7×7 グリッド\n少し複雑になるぞ！',
        color: 'rgba(6, 182, 212, 0.1)',
    },
    {
        id: 'hard',
        label: 'むずかしい',
        icon: '🌀',
        rows: 9,
        cols: 9,
        description: '9×9 グリッド\n複雑な迷路を攻略せよ！',
        color: 'rgba(99, 102, 241, 0.1)',
    },
    {
        id: 'expert',
        label: 'エキスパート',
        icon: '⚡',
        rows: 11,
        cols: 11,
        description: '11×11 グリッド\n熟練者への挑戦！',
        color: 'rgba(245, 158, 11, 0.1)',
    },
];

export class DifficultySelectScene {
    async enter() {
        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="difficulty-scene glass-card">
                <div class="scene-header">
                    <button id="back-btn" class="btn btn-secondary btn-sm">← 戻る</button>
                    <h2>🎯 難易度を選択</h2>
                    <div style="width:60px;"></div>
                </div>
                <div class="difficulty-grid">
                    ${DIFFICULTIES.map(d => `
                        <div class="diff-card" data-id="${d.id}" style="--diff-color:${d.color}">
                            <span class="diff-icon">${d.icon}</span>
                            <div class="diff-info">
                                <div class="diff-title">${d.label}</div>
                                <div class="diff-desc">${d.description.replace('\n', '<br>')}</div>
                            </div>
                            <span class="diff-arrow">›</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('back-btn').addEventListener('click', () => {
            soundManager.playClick();
            sceneManager.switchScene('Title');
        });

        document.querySelectorAll('.diff-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const diff = DIFFICULTIES.find(d => d.id === id);
                soundManager.playOk();
                sceneManager.switchScene('Game', { difficulty: diff });
            });
        });
    }

    async exit() {}
    update() {}
}
