/**
 * Mini RPG Saga - EnemyDB
 * 出現する敵キャラクターのデータを定義する。
 */
export const enemies = {
    slime: {
        id: 'slime',
        name: 'スライム',
        emoji: '💧',
        hp: 30,
        maxHp: 30,
        atk: 5,
        def: 2,
        exp: 10,
        gold: 5,
        drops: [{ id: 'potion', chance: 0.3 }]
    },
    goblin: {
        id: 'goblin',
        name: 'ゴブリン',
        emoji: '👺',
        hp: 50,
        maxHp: 50,
        atk: 8,
        def: 4,
        exp: 25,
        gold: 15,
        drops: [{ id: 'herb', chance: 0.5 }]
    },
    bat: {
        id: 'bat',
        name: 'こうもり',
        emoji: '🦇',
        hp: 20,
        maxHp: 20,
        atk: 6,
        def: 1,
        exp: 12,
        gold: 8,
        drops: [{ id: 'potion', chance: 0.1 }]
    }
};
