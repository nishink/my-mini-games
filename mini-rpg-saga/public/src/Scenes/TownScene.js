import { BaseMapScene } from './BaseMapScene.js';
import { dialogueManager } from '../Systems/DialogueManager.js';
import { shopManager } from '../Systems/ShopManager.js';

export class TownScene extends BaseMapScene {
    constructor() {
        super();
        this.playerPos = { x: 5, y: 7 };
        this.playerDir = { x: 0, y: -1 };
        this.sceneTitle = "はじまりの村";
        this.canSave = true;

        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,2,0,0,0,0,0,0,0,0,2,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,2,0,0,0,0,0,0,0,0,2,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,0,1,1,1,1,1,1,1],
        ];

        this.npcs = [
            { x: 2, y: 2, name: '村人', lines: ['ようこそ、はじまりの村へ！', '村の外は魔物がいっぱいだよ。気を付けてね。'], emoji: '👨‍🌾' },
            { x: 11, y: 2, name: '長老', lines: ['おお、若き勇者よ。', '北にある「試練の洞窟」へ向かうのじゃ。'], emoji: '👴' },
            { x: 2, y: 6, name: '看板', lines: ['【はじまりの村】', '南：冒険の世界へ'], emoji: '🪧' },
            { x: 11, y: 6, name: '商人', lines: ['いらっしゃい！', '旅の準備はできているかい？'], emoji: '👳' },
        ];
    }

    async handleInteraction(npc) {
        if (npc.name === '商人') {
            await dialogueManager.show(npc.name, ['いらっしゃい！', '旅の準備はできているかい？']);
            shopManager.open();
        } else {
            await super.handleInteraction(npc);
        }
    }
}
