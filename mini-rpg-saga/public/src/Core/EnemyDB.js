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
    },
    skeleton: {
        id: 'skeleton',
        name: 'スケルトン',
        emoji: '💀',
        hp: 120,
        maxHp: 120,
        atk: 25,
        def: 10,
        exp: 80,
        gold: 40,
        drops: [{ id: 'ether', chance: 0.2 }]
    },
    dragon: {
        id: 'dragon',
        name: 'ドラゴン',
        emoji: '🐉',
        hp: 300,
        maxHp: 300,
        atk: 45,
        def: 20,
        exp: 250,
        gold: 200,
        drops: [{ id: 'elixir', chance: 0.1 }]
    },
    demon_king: {
        id: 'demon_king',
        name: '魔王',
        emoji: '👿',
        hp: 1000,
        maxHp: 1000,
        atk: 60,
        def: 30,
        exp: 0,
        gold: 0,
        isBoss: true
    }
};

// エリアごとの出現テーブル
export const encounterTables = {
    Dungeon: ['slime', 'goblin', 'bat'],
    DemonKingCastle: ['skeleton', 'dragon']
};
