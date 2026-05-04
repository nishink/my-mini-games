import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { messageManager } from '../Systems/MessageManager.js';
import { BaseDungeonScene } from './BaseDungeonScene.js';
import { encounterTables } from '../Core/EnemyDB.js';

export class DemonKingCastleScene extends BaseDungeonScene {
    constructor() {
        super();
        this.sceneTitle = "魔王城";
        this.sceneId = "DemonKingCastle";
        this.encounterPool = encounterTables.DemonKingCastle;
        this.stepsToEncounter = 5;

        this.map = [
            [1,1,1,1,1,1,1,2,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,3,1,1,1,0,1,0,1],
            [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
            [1,0,0,0,1,0,1,0,1,0,1,0,0,0,1],
            [1,0,1,0,0,0,1,0,1,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,1,1,1,1,1,1,1,0,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
        ];
    }

    async handleInteraction() {
        const targetX = this.playerPos.x + this.playerDir.x;
        const targetY = this.playerPos.y + this.playerDir.y;
        if (targetY >= 0 && targetY < this.map.length && targetX >= 0 && targetX < this.map[0].length) {
            const tile = this.map[targetY][targetX];
            if (tile === 2) {
                await messageManager.show('魔王', ['よくぞここまでたどり着いた、勇者よ。', 'だが、ここがお前の墓場となるのだ！']);
                sceneManager.switchScene('Battle', { enemyId: 'demon_king', isBoss: true, returnScene: this.sceneId });
            } else if (tile === 3) {
                state.rest();
                await messageManager.show('回復の泉', ['泉から清らかな水が湧き出ている...', '体力が全快した！']);
                this.updateView();
            }
        }
    }
}
