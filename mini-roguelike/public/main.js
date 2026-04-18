import { generateMap } from './src/game/MapGen.js';
import { Player } from './src/game/Player.js';
import { Enemy } from './src/game/Enemy.js';
import { TurnManager } from './src/game/TurnManager.js';
import { Input } from './src/ui/Input.js';
import { Renderer } from './src/ui/Renderer.js';

const COLS = 40, ROWS = 25;
const MAX_FLOOR = 7;

const gridEl = document.getElementById('grid');
const gameArea = document.getElementById('gameArea');
const hpVal = document.getElementById('hpVal');
const floorVal = document.getElementById('floorVal');
const turnVal = document.getElementById('turnVal');
const logEl = document.getElementById('log');
const logPanel = document.getElementById('logPanel');
const nextFloorBtn = document.getElementById('nextFloorBtn');

let map = [];
let player = null;
let enemies = [];
let items = [];
let turnCount = 0;
let currentFloor = 1;
let score = 0;
let floorClearedMessageShown = false;
let isPlayerTurn = true;

const tm = new TurnManager();

function rnd(n) { return Math.floor(Math.random() * n); }

function addLog(s) {
    const p = document.createElement('div');
    p.textContent = s;
    logEl.prepend(p);
}

function isWalkable(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return map[y][x].type !== 'wall';
}

function occupied(x, y) {
    if (player && player.x === x && player.y === y) return true;
    return enemies.some(en => en.x === x && en.y === y);
}

function placeEntityRandom(type) {
    let x, y;
    do {
        x = rnd(COLS); y = rnd(ROWS);
    } while (map[y][x].type !== 'floor' || (player && x === player.x && y === player.y) || enemies.some(e => e.x === x && e.y === y));
    if (type === 'player') player = new Player(x, y);
    else enemies.push(new Enemy(x, y));
}

function spawnFloor(floor) {
    map = generateMap(COLS, ROWS);
    enemies = [];
    items = [];
    floorClearedMessageShown = false;

    if (!player) {
        const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
        let x, y;
        do {
            x = cx + Math.floor((Math.random() - 0.5) * 6);
            y = cy + Math.floor((Math.random() - 0.5) * 6);
        } while (!isWalkable(x, y) || (x >= COLS - 1 || x <= 0 || y >= ROWS - 1 || y <= 0));
        player = new Player(x, y);
    }

    const enemyCount = Math.min(7, 2 + Math.floor(floor * 0.8));
    for (let i = 0; i < enemyCount; i++) placeEntityRandom('enemy');

    let sx, sy;
    do {
        sx = rnd(COLS);
        sy = rnd(ROWS);
    } while (map[sy][sx].type !== 'floor' || (player && player.x === sx && player.y === sy));
    map[sy][sx].type = 'stairs';

    currentFloor = floor;
    updateHUD();
    render();
    addLog(`フロア ${floor} に突入。敵 ${enemies.length} 匹出現`);
    handleResize();
}

function updateHUD() {
    if (player) hpVal.textContent = `${player.hp}/${player.maxHp}`;
    floorVal.textContent = `${currentFloor}`;
    turnVal.textContent = `${turnCount}`;
}

function render() {
    Renderer.renderGrid(gridEl, map, null, null);

    items.forEach(item => {
        const cell = document.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
        if (cell) cell.textContent = item.char;
    });

    enemies.forEach(e => {
        const cell = document.querySelector(`[data-x="${e.x}"][data-y="${e.y}"]`);
        if (cell) {
            cell.textContent = e.char;
            cell.classList.add('enemy');
        }
    });

    if (player) {
        const cell = document.querySelector(`[data-x="${player.x}"][data-y="${player.y}"]`);
        if (cell) {
            cell.textContent = player.char;
            cell.classList.add('player');
        }
    }

    gridEl.querySelectorAll('.cell').forEach(cell => {
        const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
        cell.onclick = () => onCellClick(x, y);
    });
}

function attack(attacker, defender) {
    const dmg = Math.max(1, attacker.atk - (defender.def || 0));
    defender.takeDamage(dmg);
    addLog(`${attacker === player ? 'あなた' : '敵'} の攻撃: ${dmg} ダメージ`);
}

function playerMoveTo(x, y) {
    if (!isPlayerTurn) return;
    isPlayerTurn = false;

    // 境界チェック
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
        isPlayerTurn = true;
        return;
    }

    // 待機（0,0 の移動）の場合
    if (x === player.x && y === player.y) {
        // 何もしない（ターンだけ経過）
    } else if (!isWalkable(x, y)) {
        isPlayerTurn = true;
        return;
    }

    const enemy = enemies.find(e => e.x === x && e.y === y);
    if (enemy) {
        attack(player, enemy);
        if (!enemy.isAlive()) {
            addLog('敵を倒した！');
            score += 10;
            items.push({ x: x, y: y, char: '🧪', type: 'potion', hp: 8 });
            enemies = enemies.filter(en => en !== enemy);
        } else {
            // カウンター攻撃
            attack(enemy, player);
            if (!player.isAlive()) {
                gameOver();
                return;
            }
        }
    } else if (x !== player.x || y !== player.y) {
        const item = items.find(it => it.x === x && it.y === y);
        if (item) {
            const oldHp = player.hp;
            player.hp = Math.min(player.maxHp, player.hp + item.hp);
            addLog(`ポーションを使った！ HP: ${oldHp} → ${player.hp}`);
            items = items.filter(it => it !== item);
        }

        player.moveTo(x, y);
        if (map[y][x].type === 'stairs') {
            nextFloorBtn.style.display = 'block';
            addLog('階段を発見した！');
        } else {
            nextFloorBtn.style.display = 'none';
        }
    }

    updateHUD();
    render();

    setTimeout(() => {
        tm.buildQueue(enemies);
        tm.processRound({ player, map, isWalkable, occupied });

        if (!player.isAlive()) {
            updateHUD();
            render();
            gameOver();
            return;
        }

        turnCount++;
        updateHUD();
        render();
        checkFloorClear();
        isPlayerTurn = true;
    }, 120);
}

function onCellClick(x, y) {
    if (!isPlayerTurn) return;
    const dx = Math.abs(player.x - x);
    const dy = Math.abs(player.y - y);
    if (dx <= 1 && dy <= 1) playerMoveTo(x, y);
}

function checkFloorClear() {
    if (enemies.length === 0 && !floorClearedMessageShown) {
        addLog('敵を全て倒した！');
        floorClearedMessageShown = true;
    }
}

function nextFloor() {
    if (currentFloor >= MAX_FLOOR) {
        isPlayerTurn = false;
        addLog('ダンジョンを制覇しました！');
        const finalStatsEl = document.getElementById('clearStats');
        finalStatsEl.innerHTML = `<div>最終スコア: ${score}</div><div>ターン: ${turnCount}</div>`;
        document.getElementById('gameClearScreen').style.display = 'flex';
        nextFloorBtn.style.display = 'none';
        return;
    }
    spawnFloor(currentFloor + 1);
    nextFloorBtn.style.display = 'none';
}

function gameOver() {
    isPlayerTurn = false;
    addLog('あなたは倒れた。');
    const finalStatsEl = document.getElementById('finalStats');
    finalStatsEl.innerHTML = `<div>最終スコア: ${score}</div><div>ターン: ${turnCount}</div>`;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Resizing logic
function handleResize() {
    const wrapper = document.getElementById('gameAreaWrapper');
    const grid = document.getElementById('grid');
    if (!wrapper || !grid) return;

    const wrapperWidth = wrapper.clientWidth - 20;
    const wrapperHeight = wrapper.clientHeight - 20;
    const gridWidth = grid.offsetWidth;
    const gridHeight = grid.offsetHeight;

    const scaleX = wrapperWidth / gridWidth;
    const scaleY = wrapperHeight / gridHeight;
    const scale = Math.min(scaleX, scaleY, 1.0);

    gameArea.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', handleResize);

// UI Handlers
document.getElementById('logBtn').onclick = () => logPanel.classList.remove('hidden-mobile');
document.getElementById('closeLogBtn').onclick = () => logPanel.classList.add('hidden-mobile');
document.getElementById('retryBtn').onclick = () => location.reload();
document.getElementById('newGameBtn').onclick = () => location.reload();
document.getElementById('nextFloorBtn').onclick = nextFloor;
document.getElementById('examineBtn').onclick = () => {
    const tile = map[player.y][player.x];
    if (tile.type === 'stairs') addLog("ここは階段だ。次の階へ進める。");
    else addLog("足元には何もない。");
};

// Input
Input.onMove = (dx, dy) => { if (player) playerMoveTo(player.x + dx, player.y + dy); };
Input.bindKeyboard();

document.getElementById('touchControls').addEventListener('click', (ev) => {
    const btn = ev.target.closest('.ctrl-btn');
    if (!btn) return;
    const dir = btn.dataset.dir;
    if (!dir) return;
    const [dx, dy] = dir.split(',').map(Number);
    if (player) playerMoveTo(player.x + dx, player.y + dy);
});

// Start
spawnFloor(1);
