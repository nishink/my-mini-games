export class Battle {
    constructor(player, enemy, ui) {
        this.player = player;
        this.enemy = enemy;
        this.ui = ui;
        this.turn = 'player'; // 'player' or 'enemy'
        this.isProcessing = false;
    }

    async executeAction(actionType) {
        if (this.isProcessing || this.turn !== 'player') return;
        this.isProcessing = true;

        // プレイヤーターン
        await this.playerAction(actionType);

        // 勝利判定
        if (!this.enemy.isAlive()) {
            this.endBattle('win');
            return;
        }

        // 敵のターン
        this.turn = 'enemy';
        this.ui.updateTurnIndicator(this.turn);
        await this.wait(1000);
        await this.enemyAction();

        // 敗北判定
        if (!this.player.isAlive()) {
            this.endBattle('lose');
            return;
        }

        this.turn = 'player';
        this.ui.updateTurnIndicator(this.turn);
        this.isProcessing = false;
    }

    async playerAction(type) {
        let damage, heal;
        switch (type) {
            case 'attack':
                damage = this.calculateDamage(this.player, this.enemy);
                this.enemy.takeDamage(damage);
                this.ui.log(`${this.player.name}の攻撃！ ${this.enemy.name}に${damage}のダメージ！`);
                this.ui.animateDamage('enemy', damage);
                break;
            case 'magic':
                if (this.player.useMp(5)) {
                    damage = Math.floor(this.player.atk * 1.5 + 10);
                    this.enemy.takeDamage(damage);
                    this.ui.log(`${this.player.name}の魔法！ ${this.enemy.name}に${damage}のダメージ！`);
                    this.ui.animateDamage('enemy', damage);
                } else {
                    this.ui.log('MPが足りない！');
                }
                break;
            case 'defend':
                this.player.isDefending = true;
                this.ui.log(`${this.player.name}は身を固めた！`);
                break;
            case 'item':
                heal = this.player.heal(20);
                this.ui.log(`${this.player.name}は薬草を使った！ HPが${heal}回復した。`);
                break;
        }
        this.ui.updateStatus();
        await this.wait(800);
    }

    async enemyAction() {
        // シンプルなAI: 80%攻撃、20%特殊攻撃（強攻撃）
        let damage;
        const rand = Math.random();
        if (rand > 0.2) {
            damage = this.calculateDamage(this.enemy, this.player);
            this.player.takeDamage(damage);
            this.ui.log(`${this.enemy.name}の攻撃！ ${this.player.name}に${damage}のダメージ！`);
        } else {
            damage = Math.floor(this.enemy.atk * 1.3);
            this.player.takeDamage(damage);
            this.ui.log(`${this.enemy.name}の強攻撃！ ${this.player.name}に${damage}のダメージ！`);
        }
        
        this.ui.animateDamage('player', damage);
        this.ui.updateStatus();
        await this.wait(800);
    }

    calculateDamage(attacker, defender) {
        const base = attacker.atk - Math.floor(defender.def / 2);
        const varience = Math.floor(Math.random() * 5); // 0~4の乱数
        return Math.max(1, base + varience);
    }

    endBattle(result) {
        this.ui.showResult(result);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
