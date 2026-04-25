export class UI {
    constructor(player, enemy) {
        this.player = player;
        this.enemy = enemy;

        this.playerHpBar = document.getElementById('player-hp-bar');
        this.playerHpText = document.getElementById('player-hp-text');
        this.playerMpText = document.getElementById('player-mp-text');
        
        this.enemyHpBar = document.getElementById('enemy-hp-bar');
        this.enemyHpText = document.getElementById('enemy-hp-text');
        
        this.logContent = document.getElementById('log-content');
        this.resultOverlay = document.getElementById('result-overlay');
        this.resultTitle = document.getElementById('result-title');
        this.resultMessage = document.getElementById('result-message');
        
        this.commandBtns = document.querySelectorAll('.cmd-btn');
    }

    updateStatus() {
        // Player
        const pPct = (this.player.hp / this.player.maxHp) * 100;
        this.playerHpBar.style.width = `${pPct}%`;
        this.playerHpText.textContent = `HP: ${this.player.hp} / ${this.player.maxHp}`;
        this.playerMpText.textContent = `MP: ${this.player.mp} / ${this.player.maxMp}`;

        // Enemy
        const ePct = (this.enemy.hp / this.enemy.maxHp) * 100;
        this.enemyHpBar.style.width = `${ePct}%`;
        this.enemyHpText.textContent = `HP: ${this.enemy.hp} / ${this.enemy.maxHp}`;
        
        // Color update
        this.playerHpBar.style.backgroundColor = pPct < 25 ? 'var(--accent-color)' : (pPct < 50 ? 'var(--warning-color)' : 'var(--success-color)');
        this.enemyHpBar.style.backgroundColor = ePct < 25 ? 'var(--accent-color)' : (ePct < 50 ? 'var(--warning-color)' : 'var(--success-color)');
    }

    log(message) {
        const div = document.createElement('div');
        div.textContent = message;
        this.logContent.appendChild(div);
        this.logContent.parentElement.scrollTop = this.logContent.parentElement.scrollHeight;
    }

    animateDamage(target, damage) {
        const targetEl = target === 'player' ? document.getElementById('player-area') : document.getElementById('enemy');
        
        // Shake
        targetEl.classList.add('shake');
        setTimeout(() => targetEl.classList.remove('shake'), 400);

        // Damage Pop
        const pop = document.createElement('div');
        pop.className = 'damage-pop';
        pop.textContent = damage;
        
        const rect = targetEl.getBoundingClientRect();
        pop.style.left = `${rect.left + rect.width / 2}px`;
        pop.style.top = `${rect.top}px`;
        
        document.body.appendChild(pop);
        setTimeout(() => pop.remove(), 800);
    }

    updateTurnIndicator(turn) {
        if (turn === 'player') {
            this.commandBtns.forEach(btn => btn.disabled = false);
        } else {
            this.commandBtns.forEach(btn => btn.disabled = true);
        }
    }

    showResult(result) {
        this.resultOverlay.classList.remove('hidden');
        if (result === 'win') {
            this.resultTitle.textContent = 'Victory!';
            this.resultTitle.style.color = 'var(--success-color)';
            this.resultMessage.textContent = `${this.enemy.name}を倒した！`;
        } else {
            this.resultTitle.textContent = 'Defeat...';
            this.resultTitle.style.color = 'var(--accent-color)';
            this.resultMessage.textContent = '目の前が真っ暗になった。';
        }
    }
}
