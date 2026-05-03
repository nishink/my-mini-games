import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { SaveManager } from '../Core/SaveManager.js';

export class EndingScene {
    constructor() {
        this.credits = [
            '勇者 ${playerName} の物語は、ここに幕を閉じた。',
            '魔王の支配は終わり、世界に光が戻ったのだ。',
            '人々はあなたの名を永遠に忘れないだろう。',
            '',
            '--- Mini RPG Saga ---',
            'Programming & Design: Gemini CLI',
            'Visuals: CSS Art & Emojis',
            'Sound: Web Audio Synth',
            '',
            'ご視聴ありがとうございました！'
        ];
    }

    async enter(container) {
        this.container = container;
        const playerName = state.player.name;
        const processedCredits = this.credits.map(line => line.replace('${playerName}', playerName));

        this.container.innerHTML = `
            <div id="title-scene" class="ending-scene">
                <div class="title-content">
                    <h1 class="ending-title">THE END</h1>
                    <div id="credits-roll" class="credits-roll">
                        ${processedCredits.map(line => `<p class="credit-line">${line}</p>`).join('')}
                    </div>
                    <button id="return-title" class="menu-btn hidden">タイトルへ戻る</button>
                </div>
            </div>
        `;

        // セーブデータの消去（クリア記念として残しても良いが、今回はリセット）
        SaveManager.clear();

        // クレジットロールの演出
        const lines = this.container.querySelectorAll('.credit-line');
        for (let i = 0; i < lines.length; i++) {
            await new Promise(r => setTimeout(r, 1000));
            lines[i].classList.add('fade-in');
        }

        setTimeout(() => {
            this.container.querySelector('#return-title').classList.remove('hidden');
        }, 2000);

        this.container.querySelector('#return-title').onclick = () => {
            sceneManager.switchScene('Title');
        };
    }

    update(deltaTime) {}

    async exit() { console.log('Exiting Ending Scene'); }
}
