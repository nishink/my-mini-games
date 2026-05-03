import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { input } from '../Core/Input.js';
import { notificationManager } from '../Systems/NotificationManager.js';
import { menuManager } from '../Systems/MenuManager.js';

export class WorldMapScene {
    constructor() {
        this.locations = [
            { id: 'Town', name: 'はじまりの村', desc: '平和な冒険者の拠点', icon: '🏡', unlocked: true },
            { id: 'Dungeon', name: '試練の洞窟', desc: '魔物が潜む古の洞窟', icon: '💀', unlocked: true },
            { id: 'Castle', name: '王都グランデ', desc: '国王が統治する大都市', icon: '🏰', unlocked: state.flags.tutorialComplete },
        ];
        this.selectedIndex = 0;
        this.moveDelay = 0;
    }

    async enter(container) {
        this.container = container;
        
        // 進行状況に合わせて場所のアンロック状態を更新
        this.locations.find(l => l.id === 'Castle').unlocked = state.flags.tutorialComplete;
        
        // 魔王城のアンロック判定を追加
        if (!this.locations.some(l => l.id === 'DemonKingCastle')) {
            this.locations.push({ 
                id: 'DemonKingCastle', 
                name: '魔王城', 
                desc: '全ての元凶が住まう不浄の城', 
                icon: '🏰', 
                unlocked: state.flags.acceptedQuest 
            });
        } else {
            this.locations.find(l => l.id === 'DemonKingCastle').unlocked = state.flags.acceptedQuest;
        }
        
        this.render();
        notificationManager.init(this.container);
        menuManager.init(this.container);
    }

    render() {
        this.container.innerHTML = `
            <div id="game-ui" class="world-map-ui">
                <div class="scene-header">
                    <h2>ワールドマップ</h2>
                    <div class="player-brief">${state.player.name} Lv.${state.player.level}</div>
                </div>
                
                <div class="map-locations">
                    ${this.locations.map((loc, index) => `
                        <div class="location-card ${index === this.selectedIndex ? 'selected' : ''} ${!loc.unlocked ? 'locked' : ''}" data-index="${index}">
                            <div class="location-icon">${loc.icon}</div>
                            <div class="location-name">${loc.name}</div>
                            <div class="location-desc">${loc.unlocked ? loc.desc : '？？？'}</div>
                        </div>
                    `).join('')}
                </div>

                <div id="virtual-controller">
                    <div class="d-pad">
                        <button class="v-btn" id="v-up">▲</button>
                        <button class="v-btn" id="v-down">▼</button>
                    </div>
                    <div class="action-pad">
                        <button class="v-btn action-btn" id="v-action">決定</button>
                    </div>
                </div>

                <div class="actions">
                    <button id="menu-btn" class="menu-btn">メニュー</button>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.location-card').forEach(card => {
            card.onclick = () => {
                const index = parseInt(card.dataset.index);
                if (this.locations[index].unlocked) {
                    this.selectedIndex = index;
                    this.selectLocation();
                }
            };
        });

        this.container.querySelector('#menu-btn').onclick = () => {
            menuManager.open();
        };

        this.setupVirtualController();
        this.updateSelection();
    }

    setupVirtualController() {
        const bindBtn = (id, key) => {
            const btn = this.container.querySelector(`#${id}`);
            if (!btn) return;
            btn.onmousedown = btn.ontouchstart = (e) => {
                e.preventDefault();
                input.setVirtualButton(key, true);
            };
            btn.onmouseup = btn.onmouseleave = btn.ontouchend = () => {
                input.setVirtualButton(key, false);
            };
        };
        ['up', 'down', 'action'].forEach(k => bindBtn(`v-${k}`, k));
    }

    updateSelection() {
        const cards = this.container.querySelectorAll('.location-card');
        cards.forEach((card, index) => {
            card.classList.toggle('selected', index === this.selectedIndex);
            if (index === this.selectedIndex) {
                card.style.borderColor = 'var(--primary)';
                card.style.boxShadow = '0 0 15px var(--primary)';
            } else {
                card.style.borderColor = '#334155';
                card.style.boxShadow = 'none';
            }
        });
    }

    update(deltaTime) {
        if (menuManager.isActive) return;

        if (this.moveDelay > 0) {
            this.moveDelay -= deltaTime;
            return;
        }

        const dir = input.direction;
        if (dir.y !== 0) {
            this.selectedIndex = (this.selectedIndex + (dir.y > 0 ? 1 : -1) + this.locations.length) % this.locations.length;
            this.updateSelection();
            this.moveDelay = 200;
        }

        if (input.isPressed(' ') || input.isPressed('Enter') || input.isPressed('action')) {
            this.selectLocation();
            this.moveDelay = 300;
        }
    }

    selectLocation() {
        const loc = this.locations[this.selectedIndex];
        if (loc.unlocked) {
            sceneManager.switchScene(loc.id);
        } else {
            notificationManager.show('まだ行くことができない');
        }
    }

    async exit() {
        console.log('Exiting World Map Scene');
    }
}
