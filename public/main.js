import { generateMap } from './src/MapGen.js';
import { Player } from './src/Player.js';
import { Enemy } from './src/Enemy.js';
import { TurnManager } from './src/TurnManager.js';
import { Input } from './src/Input.js';
import { Renderer } from './src/Renderer.js';

const COLS = 40, ROWS = 25;
const MAX_FLOOR = 10;

const gridEl = document.getElementById('grid');
const hpVal = document.getElementById('hpVal');
const floorVal = document.getElementById('floorVal');
const turnVal = document.getElementById('turnVal');
const logEl = document.getElementById('log');
const nextFloorBtn = document.getElementById('nextFloorBtn');

let map = [];
let player = null;
let enemies = [];
let turnCount = 0;
let currentFloor = 1;

const tm = new TurnManager();

function rnd(n) { return Math.floor(Math.random() * n); }
function addLog(s) { const p = document.createElement('div'); p.textContent = s; logEl.prepend(p); }

function isWalkable(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return map[y][x].type !== 'wall';
}
function occupied(x, y) {
    if (player && player.x === x && player.y === y) return true;
    return enemies.some(en => en.x === x && en.y === y);
}

function placeEntityRandom(type) {
    let x, y; do { x = rnd(COLS); y = rnd(ROWS); } while (map[y][x].type !== 'floor' || (player && x === player.x && y === player.y) || enemies.some(e => e.x === x && e.y === y));
    if (type === 'player') player = new Player(x, y);
    else enemies.push(new Enemy(x, y));
}

function spawnFloor(floor) {
    map = generateMap(COLS, ROWS);
    enemies = [];
    if (!player) placeEntityRandom('player');
    const enemyCount = Math.min(8, 2 + Math.floor(floor * 1.2));
    for (let i = 0; i < enemyCount; i++) placeEntityRandom('enemy');
    let sx, sy; do { sx = rnd(COLS); sy = rnd(ROWS); } while (map[sy][sx].type !== 'floor' || (player && player.x === sx && player.y === sy));
    map[sy][sx].type = 'stairs';
    currentFloor = floor; turnCount = 0; updateHUD(); render(); addLog(`フロア ${floor} に突入。敵 ${enemies.length} 匹出現`);
}

function updateHUD() { if (player) hpVal.textContent = `${player.hp}/${player.maxHp}`; floorVal.textContent = `${currentFloor}`; turnVal.textContent = `${turnCount}`; }

function render() {
    Renderer.renderGrid(gridEl, map, player, enemies);
    // attach click handlers
    gridEl.querySelectorAll('.cell').forEach(cell => {
        const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
        cell.onclick = () => onCellClick(x, y);
    });
}

function attack(attacker, defender) { const dmg = Math.max(1, attacker.atk - (defender.def || 0)); defender.takeDamage(dmg); addLog(`${attacker === player ? 'あなた' : '敵'} の攻撃: ${dmg} ダメージ`); }

function playerMoveTo(x, y) {
    if (!isWalkable(x, y)) return; const enemy = enemies.find(e => e.x === x && e.y === y); if (enemy) { attack(player, enemy); if (!enemy.isAlive()) { addLog('敵を倒した！'); enemies = enemies.filter(en => en !== enemy); } else { attack(enemy, player); if (!player.isAlive()) { gameOver(); return; } } } else { player.moveTo(x, y); if (map[y][x].type === 'stairs') { nextFloorBtn.style.display = 'block'; addLog('階段を発見した！ 次のフロアへ進みますか？'); } } turnCount++; updateHUD(); render(); // enemies act via TurnManager
    setTimeout(() => {
        tm.buildQueue(enemies);
        tm.processRound({ player, map, isWalkable, occupied });
        turnCount++; updateHUD(); render(); checkFloorClear();
    }, 120);
}

function onCellClick(x, y) { const dist = Math.abs(player.x - x) + Math.abs(player.y - y); if (dist === 1) playerMoveTo(x, y); }

function checkFloorClear() { if (enemies.length === 0) { addLog('敵を全て倒した！'); } }

function nextFloor() { if (currentFloor >= MAX_FLOOR) { addLog('ダンジョンを制覇しました！ スコア表示（ターン:' + turnCount + '）'); nextFloorBtn.style.display = 'none'; alert('クリア！ スコア: ターン ' + turnCount); location.reload(); return; } spawnFloor(currentFloor + 1); nextFloorBtn.style.display = 'none'; }

function gameOver() { addLog('あなたは倒れた。ゲームオーバー。'); alert('ゲームオーバー。スコア: フロア ' + currentFloor + ' / ターン ' + turnCount); location.reload(); }

// input
Input.onMove = (dx, dy) => { if (player) playerMoveTo(player.x + dx, player.y + dy); };
Input.bindKeyboard();

document.getElementById('touchControls').addEventListener('click', (ev) => { const dir = ev.target.dataset.dir; if (!dir) return; const [dx, dy] = dir.split(',').map(Number); if (player) playerMoveTo(player.x + dx, player.y + dy); });
nextFloorBtn.addEventListener('click', nextFloor);

spawnFloor(1);
