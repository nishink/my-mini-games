import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { cards, rewardPool } from '../Core/CardMaster.js';

export class RewardScene {
    constructor() {
        this.container = null;
        this.options = [];
    }

    async enter(container) {
        this.container = container;
        
        // 報酬カードをランダムに3枚選出
        this.options = [];
        const pool = [...rewardPool];
        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            this.options.push(pool.splice(idx, 1)[0]);
        }

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="reward-ui">
                <h2 class="reward-title">新しいカードを手に入れよう</h2>
                <div class="reward-options">
                    ${this.options.map((cardId, i) => {
                        const card = cards[cardId];
                        return `
                            <div class="card" data-idx="${i}" style="border-color: ${card.color}">
                                <div class="card-cost">${card.cost}</div>
                                <div class="card-name">${card.name}</div>
                                <div class="card-type">${card.type.toUpperCase()}</div>
                                <div class="card-desc">${card.desc}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <button id="skip-btn" class="end-turn-btn" style="position: static; margin-top: 20px; background: #475569;">スキップ</button>
            </div>
        `;

        this.container.querySelectorAll('.card').forEach(el => {
            el.onclick = () => {
                const cardId = this.options[parseInt(el.dataset.idx)];
                state.addCardToDeck(cardId);
                sceneManager.switchScene('Battle');
            };
        });

        this.container.querySelector('#skip-btn').onclick = () => {
            sceneManager.switchScene('Battle');
        };
    }

    async exit() {
        this.container.innerHTML = '';
    }
}
