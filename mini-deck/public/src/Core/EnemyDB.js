/**
 * mini-deck - EnemyDB
 * 敵キャラクターと行動パターンを定義する。
 */
export const enemies = {
    slime: {
        id: 'slime',
        name: 'スライム',
        emoji: '💧',
        hp: 30,
        maxHp: 30,
        pattern: [
            { type: 'attack', value: 6, intent: '⚔️' },
            { type: 'skill', value: 5, intent: '🛡️', desc: '防御' },
            { type: 'attack', value: 8, intent: '⚔️' }
        ]
    },
    jaw_worm: {
        id: 'jaw_worm',
        name: '顎ワーム',
        emoji: '🐛',
        hp: 45,
        maxHp: 45,
        pattern: [
            { type: 'attack', value: 7, intent: '⚔️' },
            { type: 'attack', value: 11, intent: '⚔️' },
            { type: 'skill', value: 3, intent: '💪', desc: '咆哮' }
        ]
    },
    cultist: {
        id: 'cultist',
        name: '狂信者',
        emoji: '🐦',
        hp: 50,
        maxHp: 50,
        pattern: [
            { type: 'skill', value: 3, intent: '✨', desc: '儀式' },
            { type: 'attack', value: 6, intent: '⚔️' },
            { type: 'attack', value: 6, intent: '⚔️' }
        ]
    }
};

export const encounterList = ['slime', 'jaw_worm', 'cultist'];
