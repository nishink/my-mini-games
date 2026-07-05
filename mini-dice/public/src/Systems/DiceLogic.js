export class DiceLogic {
    constructor() {
        this.map = this.createMap();
        this.reset();
    }

    reset() {
        this.player = {
            hp: 50,
            maxHp: 50,
            level: 1,
            exp: 0,
            nextExp: 10,
            atk: 10,
            def: 3,
            gold: 15,
            potions: 3,
            weapon: { name: "素手", atk: 0 },
            armor: { name: "旅人の服", def: 0 },
            position: 0
        };

        this.inBattle = false;
        this.activeEnemy = null;
        this.battleLogs = [];
        this.eventMessage = "";
        this.gameOver = false;
        this.gameClear = false;
    }

    createMap() {
        // 全15マスのすごろくマップ
        return [
            { type: 'start', name: '始まりの町', detail: 'ここから冒険が始まります。' },
            { type: 'normal', name: '旅立ち of 草原', detail: '風が心地よい平原です。' },
            { type: 'trap', name: '毒矢の罠', detail: 'カチッ…壁から毒矢が飛んできた！', value: 5 },
            { type: 'enemy', name: '野生のスライム', detail: 'スライムが飛び出してきた！', enemyType: 'slime' },
            { type: 'chest', name: '古びた宝箱', detail: '宝箱を見つけた。中身は何だろう？' },
            { type: 'normal', name: '静かな森', detail: '鳥のさえずりが聞こえます。' },
            { type: 'enemy', name: 'ゴブリンの通り道', detail: 'ゴブリンが襲いかかってきた！', enemyType: 'goblin' },
            { type: 'inn', name: '旅の宿屋', detail: 'おいしい食事と温かいベッドがあります。(10ゴールド必要)' },
            { type: 'trap', name: '崩れる落とし穴', detail: '足元が崩れ、深い穴に落ちてしまった！', value: 8 },
            { type: 'chest', name: '守護者の宝箱', detail: '頑丈そうな宝箱が置いてある。' },
            { type: 'enemy', name: '荒野のオーク', detail: '大柄なオークが道を塞いでいる！', enemyType: 'orc' },
            { type: 'inn', name: '最後の宿屋', detail: '決戦前の休息をとる宿屋です。(15ゴールド必要)' },
            { type: 'chest', name: '大戦士の宝箱', detail: 'まばゆく光る宝箱を見つけた！' },
            { type: 'trap', name: '落雷のエリア', detail: '激しい雷雨の中、雷がプレイヤーに直撃した！', value: 10 },
            { type: 'boss', name: '魔王の玉座', detail: '世界の平和を脅かすドラゴンが待ち受けている！', enemyType: 'dragon' }
        ];
    }

    // ダイスを振る
    rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    // プレイヤーを1歩前進させる (最大14)
    stepForward() {
        if (this.player.position < 14) {
            this.player.position++;
            return true;
        }
        return false;
    }

    // 現在マスのイベントを実行
    triggerEvent() {
        const cell = this.map[this.player.position];
        this.eventMessage = `${cell.name}に到着しました。\n${cell.detail}`;

        switch (cell.type) {
            case 'trap':
                const damage = cell.value;
                this.player.hp = Math.max(0, this.player.hp - damage);
                this.eventMessage += `\n⇒ ${damage} のダメージを受けた！ (残りHP: ${this.player.hp})`;
                if (this.player.hp <= 0) {
                    this.gameOver = true;
                }
                break;

            case 'chest':
                this.triggerChestEvent();
                break;

            case 'inn':
                // 自動で支払って回復するわけではなく、シーン側で選択肢を出せるようにメッセージだけ
                break;

            case 'enemy':
            case 'boss':
                this.startBattle(cell.enemyType);
                break;

            default:
                break;
        }
    }

    // 宝箱イベントの抽選
    triggerChestEvent() {
        const roll = Math.random();
        if (roll < 0.35) {
            // 武器の獲得・強化
            let newWeapon = null;
            if (this.player.weapon.atk < 4) {
                newWeapon = { name: "木の剣", atk: 4 };
            } else if (this.player.weapon.atk < 8) {
                newWeapon = { name: "鉄の剣", atk: 8 };
            } else if (this.player.weapon.atk < 14) {
                newWeapon = { name: "鋼鉄の聖剣", atk: 14 };
            }

            if (newWeapon) {
                this.player.weapon = newWeapon;
                this.eventMessage += `\n⇒ 宝箱から「${newWeapon.name}」(ATK +${newWeapon.atk}) を手に入れた！`;
            } else {
                const goldGained = 20;
                this.player.gold += goldGained;
                this.eventMessage += `\n⇒ すでに強力な武器を持っているため、代わりに ${goldGained} ゴールドを見つけた。`;
            }
        } else if (roll < 0.7) {
            // 防具の獲得・強化
            let newArmor = null;
            if (this.player.armor.def < 2) {
                newArmor = { name: "皮の鎧", def: 2 };
            } else if (this.player.armor.def < 5) {
                newArmor = { name: "鉄のプレート鎧", def: 5 };
            } else if (this.player.armor.def < 9) {
                newArmor = { name: "勇者の伝説鎧", def: 9 };
            }

            if (newArmor) {
                this.player.armor = newArmor;
                this.eventMessage += `\n⇒ 宝箱から「${newArmor.name}」(DEF +${newArmor.def}) を手に入れた！`;
            } else {
                const goldGained = 20;
                this.player.gold += goldGained;
                this.eventMessage += `\n⇒ すでに強力な防具を持っているため、代わりに ${goldGained} ゴールドを見つけた。`;
            }
        } else {
            // ゴールドまたはポーションの獲得
            const gold = Math.floor(Math.random() * 20) + 10;
            const potChance = Math.random() < 0.5;
            this.player.gold += gold;
            this.eventMessage += `\n⇒ ${gold} ゴールドを見つけた！`;
            if (potChance) {
                this.player.potions++;
                this.eventMessage += ` 「HP回復薬」も1個手に入れた！`;
            }
        }
    }

    // 宿屋の利用
    useInn(cost) {
        if (this.player.gold >= cost) {
            this.player.gold -= cost;
            this.player.hp = this.player.maxHp;
            this.eventMessage = `宿屋で一晩休みました。HPが全回復しました！ (残りゴールド: ${this.player.gold}G)`;
            return true;
        }
        return false;
    }

    // 戦闘開始
    startBattle(enemyType) {
        const enemies = {
            slime: { name: 'スライム', hp: 12, maxHp: 12, atk: 4, def: 1, exp: 4, gold: 5, icon: '🟢' },
            goblin: { name: 'ゴブリン', hp: 22, maxHp: 22, atk: 8, def: 2, exp: 8, gold: 12, icon: '👺' },
            orc: { name: 'オーク', hp: 35, maxHp: 35, atk: 12, def: 3, exp: 15, gold: 20, icon: '🐗' },
            dragon: { name: '魔王ドラゴン', hp: 70, maxHp: 70, atk: 16, def: 5, exp: 0, gold: 0, icon: '🐉' }
        };

        this.inBattle = true;
        this.activeEnemy = { ...enemies[enemyType] };
        this.battleLogs = [`野生の${this.activeEnemy.name}が現れた！`];
    }

    // バトル手番の処理
    executeBattleRound(action) {
        if (!this.inBattle) return;

        this.battleLogs = [];

        // 1. プレイヤーの行動
        if (action === 'attack') {
            const playerAtkTotal = this.player.atk + this.player.weapon.atk;
            const rawDmg = playerAtkTotal - this.activeEnemy.def;
            const dmg = Math.max(1, rawDmg + Math.floor(Math.random() * 5) - 2); // 乱数+-2
            this.activeEnemy.hp = Math.max(0, this.activeEnemy.hp - dmg);
            this.battleLogs.push(`プレイヤーの攻撃！${this.activeEnemy.name}に ${dmg} ダメージを与えた！`);
        } else if (action === 'heal') {
            if (this.player.potions > 0) {
                this.player.potions--;
                const healVal = 35;
                const oldHp = this.player.hp;
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healVal);
                this.battleLogs.push(`回復薬を使用した。HPが ${this.player.hp - oldHp} 回復した。`);
            } else {
                this.battleLogs.push(`回復薬がありません！無防備な状態で手番を終えた。`);
            }
        } else if (action === 'escape') {
            const roll = this.rollDice();
            this.battleLogs.push(`逃げ出そうとした！ (ダイスロール: ${roll})`);
            if (roll >= 4) {
                // 逃亡成功：戦闘終了し、1マス戻る
                this.battleLogs.push(`うまく逃げ切れた！安全のために1マス後退した。`);
                this.inBattle = false;
                this.activeEnemy = null;
                this.player.position = Math.max(0, this.player.position - 1);
                return { status: 'escaped' };
            } else {
                this.battleLogs.push(`逃げ出すのに失敗した！`);
            }
        }

        // 敵の死亡チェック
        if (this.activeEnemy.hp <= 0) {
            this.winBattle();
            return { status: 'win' };
        }

        // 2. 敵の行動
        const enemyDmgTotal = this.activeEnemy.atk;
        const playerDefTotal = this.player.def + this.player.armor.def;
        const rawEnemyDmg = enemyDmgTotal - playerDefTotal;
        const enemyDmg = Math.max(1, rawEnemyDmg + Math.floor(Math.random() * 3) - 1);
        this.player.hp = Math.max(0, this.player.hp - enemyDmg);
        this.battleLogs.push(`${this.activeEnemy.name}の攻撃！プレイヤーは ${enemyDmg} ダメージを受けた！`);

        // プレイヤーの死亡チェック
        if (this.player.hp <= 0) {
            this.inBattle = false;
            this.gameOver = true;
            return { status: 'gameover' };
        }

        return { status: 'ongoing' };
    }

    // 戦闘勝利
    winBattle() {
        this.inBattle = false;
        const expGained = this.activeEnemy.exp;
        const goldGained = this.activeEnemy.gold;
        const isBoss = this.map[this.player.position].type === 'boss';

        this.player.exp += expGained;
        this.player.gold += goldGained;

        this.battleLogs.push(`${this.activeEnemy.name}を倒した！`);
        if (expGained > 0) this.battleLogs.push(`${expGained} の経験値を獲得。`);
        if (goldGained > 0) this.battleLogs.push(`${goldGained} ゴールドを獲得。`);

        this.activeEnemy = null;

        // レベルアップチェック
        if (this.player.exp >= this.player.nextExp) {
            this.levelUp();
        }

        // ボス撃破でゲームクリア
        if (isBoss) {
            this.gameClear = true;
        }
    }

    // レベルアップ
    levelUp() {
        this.player.level++;
        this.player.exp -= this.player.nextExp;
        this.player.nextExp = Math.floor(this.player.nextExp * 1.5);
        this.player.maxHp += 12;
        this.player.hp = this.player.maxHp; // レベルアップで全回復
        this.player.atk += 3;
        this.player.def += 2;

        this.battleLogs.push(`✨ レベルアップ！ Lv.${this.player.level} になった！(HP全回復 / ATK+2 / DEF+1)`);
    }
}
