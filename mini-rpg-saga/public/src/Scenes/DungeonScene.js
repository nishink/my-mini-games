import { state } from '../Core/GlobalState.js';
import { sceneManager } from '../Core/SceneManager.js';
import { dialogueManager } from '../Systems/DialogueManager.js';
import { BaseDungeonScene } from './BaseDungeonScene.js';
import { encounterTables } from '../Core/EnemyDB.js';

export class DungeonScene extends BaseDungeonScene {
    constructor() {
        super();
        this.sceneTitle = "試練の洞窟";
        this.sceneId = "Dungeon";
        this.encounterPool = encounterTables.Dungeon;
        this.stepsToEncounter = 8;

        this.map = [
            [1,1,1,1,1,1,1,2,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,1,1,0,1,0,1,1,1,1,1,0,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,0,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
        ];
    }

    async handleInteraction() {
        const targetX = this.playerPos.x + this.playerDir.x;
        const targetY = this.playerPos.y + this.playerDir.y;
        if (targetY >= 0 && targetY < this.map.length && targetX >= 0 && targetX < this.map[0].length) {
            if (this.map[targetY][targetX] === 2) {
                sceneManager.switchScene('MiniGame', {
                    message: '宝箱には鍵がかかっている！',
                    onSuccess: async () => {
                        await dialogueManager.show('宝箱', ['鍵を開けることに成功した！', '中には輝く宝石が入っていた！', '「試練の証」を手に入れた！']);
                        this.map[targetY][targetX] = 0;
                        state.flags.tutorialComplete = true;
                        this.updateView();
                    },
                    onFailure: async () => {
                        await dialogueManager.show('宝箱', ['鍵を開けるのに失敗した...']);
                    }
                });
            }
        }
    }
}
