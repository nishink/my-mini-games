export class Unit {
    constructor(name, hp, mp, atk, def, isPlayer = false) {
        this.name = name;
        this.maxHp = hp;
        this.hp = hp;
        this.maxMp = mp;
        this.mp = mp;
        this.atk = atk;
        this.def = def;
        this.isPlayer = isPlayer;
        this.isDefending = false;
    }

    takeDamage(damage) {
        if (this.isDefending) {
            damage = Math.floor(damage / 2);
            this.isDefending = false; // 防御解除
        }
        this.hp = Math.max(0, this.hp - damage);
        return damage;
    }

    heal(amount) {
        const actualHeal = Math.min(this.maxHp - this.hp, amount);
        this.hp += actualHeal;
        return actualHeal;
    }

    useMp(amount) {
        if (this.mp >= amount) {
            this.mp -= amount;
            return true;
        }
        return false;
    }

    isAlive() {
        return this.hp > 0;
    }
}
