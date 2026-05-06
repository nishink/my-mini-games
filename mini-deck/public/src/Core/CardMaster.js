/**
 * mini-deck - CardMaster
 * 全てのカードデータを定義する。
 */
export const cards = {
    // 初期カード
    strike: {
        id: 'strike',
        name: '打撃',
        cost: 1,
        type: 'attack',
        value: 6,
        desc: '敵に6ダメージを与える',
        color: '#ef4444'
    },
    defend: {
        id: 'defend',
        name: '防御',
        cost: 1,
        type: 'skill',
        value: 5,
        desc: 'ブロックを5得る',
        color: '#3b82f6'
    },
    bash: {
        id: 'bash',
        name: '強打',
        cost: 2,
        type: 'attack',
        value: 10,
        desc: '敵に10ダメージを与える',
        color: '#ef4444'
    },
    // 報酬カード
    cleave: {
        id: 'cleave',
        name: 'なぎ払い',
        cost: 1,
        type: 'attack',
        value: 8,
        desc: '敵に8ダメージを与える',
        color: '#ef4444'
    },
    shrug_it_off: {
        id: 'shrug_it_off',
        name: '受け流し',
        cost: 1,
        type: 'skill',
        value: 8,
        desc: 'ブロックを8得る',
        color: '#3b82f6'
    },
    pommel_strike: {
        id: 'pommel_strike',
        name: 'ポンメル',
        cost: 1,
        type: 'attack',
        value: 9,
        desc: '敵に9ダメージを与える',
        color: '#ef4444'
    },
    inflame: {
        id: 'inflame',
        name: '発火',
        cost: 1,
        type: 'power',
        value: 2,
        desc: 'この戦闘中、筋力が2上がる',
        color: '#f59e0b'
    }
};

export const rewardPool = ['strike', 'defend', 'bash', 'cleave', 'shrug_it_off', 'pommel_strike', 'inflame'];
