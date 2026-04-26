/**
 * Mini RPG Saga - GlobalState
 * ゲーム全体のステート（プレイヤーの状態、インベントリ、フラグなど）を管理するシングルトン。
 */
export class GlobalState {
    constructor() {
        if (GlobalState.instance) {
            return GlobalState.instance;
        }

        this.reset();
        GlobalState.instance = this;
    }

    reset() {
        this.player = {
            name: '勇者',
            level: 1,
            exp: 0,
            gold: 100,
            baseStats: {
                str: 5,
                dex: 5,
                int: 5,
                vit: 5
            },
            statPoints: 0,
            currentHp: 150,
            currentMp: 75
        };

        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };

        this.flags = {
            hasMetKing: false,
            tutorialComplete: false
        };

        this.currentScene = 'Title';
    }

    // データの取得用ヘルパー
    getDerivedStats() {
        const { baseStats } = this.player;
        const stats = {
            atk: baseStats.str * 2 + Math.floor(baseStats.dex * 0.5),
            def: Math.floor(baseStats.vit * 1.5),
            maxHp: 100 + baseStats.vit * 10,
            maxMp: 50 + baseStats.int * 5
        };

        // 装備補正をここに加算予定
        return stats;
    }

    // JSON形式でエクスポート（セーブ用）
    serialize() {
        return JSON.stringify({
            player: this.player,
            inventory: this.inventory,
            equipment: this.equipment,
            flags: this.flags
        });
    }

    // JSON形式からインポート（ロード用）
    deserialize(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.player = data.player;
            this.inventory = data.inventory;
            this.equipment = data.equipment;
            this.flags = data.flags;
            return true;
        } catch (e) {
            console.error('Failed to deserialize state:', e);
            return false;
        }
    }
}

export const state = new GlobalState();
