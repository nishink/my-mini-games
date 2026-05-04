import { state } from '../Core/GlobalState.js';
import { BaseMapScene } from './BaseMapScene.js';
import { messageManager } from '../Systems/MessageManager.js';
import { shopManager } from '../Systems/ShopManager.js';
import { notificationManager } from '../Systems/NotificationManager.js';

export class CastleScene extends BaseMapScene {
    constructor() {
        super();
        this.playerPos = { x: 7, y: 7 };
        this.playerDir = { x: 0, y: -1 };
        this.sceneTitle = "王都グランデ";
        this.canSave = false;

        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,0,0,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,3,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],
        ];

        this.npcs = [
            { x: 7, y: 3, name: '王様', lines: ['勇者よ、よくぞ参った。', '北にある「魔王城」を攻略してほしい。', 'これが世界の命運を握る最後の戦いとなる。'], emoji: '👑' },
            { x: 2, y: 5, name: '近衛兵', lines: ['ここは王都グランデ。', '最高の装備を揃えてから出発するといい。'], emoji: '💂' },
            { x: 12, y: 5, name: '特級商人', lines: ['珍しい掘り出し物があるよ。', 'どれか持っていくかい？'], emoji: '🧐' },
        ];

        this.eliteCatalog = [
            { id: 'high_potion', name: 'ハイポーション', description: 'HPを150回復', price: 100, type: 'consumable' },
            { id: 'elixir', name: 'エリクサー', description: 'HPとMPを全回復', price: 500, type: 'consumable' },
            { id: 'hero_sword', name: '勇者の剣', description: '攻撃力 +40', price: 1200, type: 'weapon', atk: 40 },
            { id: 'knight_armor', name: '騎士の鎧', description: '防御力 +20', price: 800, type: 'armor', def: 20 }
        ];
    }

    async onEnter() {
        if (!state.flags.hasMetKing) {
            await messageManager.show('王国の兵士', ['止まれ！ここから先は王都グランデだ。', 'おお、それは「試練の証」！', 'これを持つ者こそ、我らが待ち望んだ勇者だ。', 'さあ、中へお入りください！']);
            state.flags.hasMetKing = true;
        }
    }

    async handleInteraction(npc) {
        if (npc.name === '特級商人') {
            await messageManager.show(npc.name, npc.lines);
            shopManager.open(this.eliteCatalog, '特級ショップ');
        } else if (npc.name === '王様') {
            await messageManager.show(npc.name, npc.lines);
            state.flags.acceptedQuest = true;
            notificationManager.show('クエスト：魔王討伐 を引き受けた');
        } else {
            await super.handleInteraction(npc);
        }
    }
}
