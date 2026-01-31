import { generateMap } from './src/MapGen.js';
import { Player } from './src/Player.js';
import { Enemy } from './src/Enemy.js';
import { TurnManager } from './src/TurnManager.js';
import { Input } from './src/Input.js';
import { Renderer } from './src/Renderer.js';

const COLS = 40, ROWS = 25;
const MAX_FLOOR = 7; // フロア数を7に調整

const gridEl = document.getElementById('grid');
const hpVal = document.getElementById('hpVal');
const floorVal = document.getElementById('floorVal');
const turnVal = document.getElementById('turnVal');
const logEl = document.getElementById('log');
const nextFloorBtn = document.getElementById('nextFloorBtn');

let map = [];
let player = null;
let enemies = [];
let items = []; // アイテム（ドロップ）を管理
let turnCount = 0;
let currentFloor = 1;
let score = 0; // ゲームスコア（敵撃破時に加算）
let floorClearedMessageShown = false; // 敵全滅メッセージが表示済みかフラグ

const tm = new TurnManager();

// 0〜n未満のランダムな整数を返す
function rnd(n) { return Math.floor(Math.random() * n); }

// ゲームログにメッセージを追加（最新のログが先頭に表示される）
function addLog(s) { const p = document.createElement('div'); p.textContent = s; logEl.prepend(p); }

// マスが歩行可能か判定（マップ境界外または壁以外）
function isWalkable(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return map[y][x].type !== 'wall';
}

// マスが敵またはプレイヤーで占拠されているか判定
function occupied(x, y) {
    if (player && player.x === x && player.y === y) return true;
    return enemies.some(en => en.x === x && en.y === y);
}

// プレイヤーまたは敵をランダムな床マスに配置
function placeEntityRandom(type) {
    let x, y; do { x = rnd(COLS); y = rnd(ROWS); } while (map[y][x].type !== 'floor' || (player && x === player.x && y === player.y) || enemies.some(e => e.x === x && e.y === y));
    if (type === 'player') player = new Player(x, y);
    else enemies.push(new Enemy(x, y));
}

// フロアを生成：マップ作成、敵配置、階段設置
function spawnFloor(floor) {
    map = generateMap(COLS, ROWS);
    enemies = [];
    items = []; // 各フロアの最初にアイテムをクリア
    floorClearedMessageShown = false; // 敵全滅メッセージフラグをリセット
    if (!player) placeEntityRandom('player');
    const enemyCount = Math.min(7, 2 + Math.floor(floor * 0.8)); // 敵数を最大7に調整
    for (let i = 0; i < enemyCount; i++) placeEntityRandom('enemy');
    let sx, sy; do { sx = rnd(COLS); sy = rnd(ROWS); } while (map[sy][sx].type !== 'floor' || (player && player.x === sx && player.y === sy));
    map[sy][sx].type = 'stairs';
    currentFloor = floor; turnCount = 0; updateHUD(); render(); addLog(`フロア ${floor} に突入。敵 ${enemies.length} 匹出現`);
}

// HUD（HP、フロア、ターン数）を更新
function updateHUD() { if (player) hpVal.textContent = `${player.hp}/${player.maxHp}`; floorVal.textContent = `${currentFloor}`; turnVal.textContent = `${turnCount}`; }

// マップとエンティティをレンダリング、クリックハンドラを再アタッチ
function render() {
    Renderer.renderGrid(gridEl, map, player, enemies);
    // アイテムを描画
    items.forEach(item => {
        const cell = document.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
        if (cell) cell.textContent = item.char;
    });
    // グリッドセルにクリックイベントハンドラを再度アタッチ
    gridEl.querySelectorAll('.cell').forEach(cell => {
        const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
        cell.onclick = () => onCellClick(x, y);
    });
}

// 攻撃者がターゲットに攻撃（ダメージ計算＆ログ出力）
function attack(attacker, defender) { const dmg = Math.max(1, attacker.atk - (defender.def || 0)); defender.takeDamage(dmg); addLog(`${attacker === player ? 'あなた' : '敵'} の攻撃: ${dmg} ダメージ`); }

// プレイヤーを指定座標に移動（敵との戦闘、階段判定を含む）
function playerMoveTo(x, y) {
    if (!isWalkable(x, y)) return; const enemy = enemies.find(e => e.x === x && e.y === y); if (enemy) { attack(player, enemy); if (!enemy.isAlive()) { addLog('敵を倒した！'); 
        // スコアを加算（敵1体あたり10ポイント）
        score += 10;
        addLog(`スコア +10 (合計: ${score})`);
        // 敵撃破時に確実にポーションをドロップ
        items.push({ x: x, y: y, char: '🧪', type: 'potion', hp: 8 });
        addLog('ポーション をドロップした！');
        
        enemies = enemies.filter(en => en !== enemy); 
    } else { attack(enemy, player); if (!player.isAlive()) { gameOver(); return; } } } else { 
        // アイテムに乗っていないかチェック
        const item = items.find(it => it.x === x && it.y === y);
        if (item) {
            const oldHp = player.hp;
            player.hp = Math.min(player.maxHp, player.hp + item.hp);
            addLog(`ポーションを使った！ HP: ${oldHp} → ${player.hp}`);
            items = items.filter(it => it !== item);
        }
        
        player.moveTo(x, y); 
        // 階段判定：乗ったらボタン表示
        if (map[y][x].type === 'stairs') { 
            nextFloorBtn.style.display = 'block'; 
            addLog('階段を発見した！ 次のフロアへ進みますか？'); 
        } else {
            // 階段から離れたらボタンを隠す
            nextFloorBtn.style.display = 'none';
        }
    } turnCount++; updateHUD(); render(); // ターン経過後、敵がターンマネージャーで行動
    setTimeout(() => {
        tm.buildQueue(enemies);
        tm.processRound({ player, map, isWalkable, occupied });
        turnCount++; updateHUD(); render(); checkFloorClear();
    }, 120);
}

// グリッドセルクリック時の処理：隣接マスのみ移動可能
function onCellClick(x, y) { const dist = Math.abs(player.x - x) + Math.abs(player.y - y); if (dist === 1) playerMoveTo(x, y); }

// 敵がすべて倒されたかチェック（敵殲滅時のログを1回だけ表示）
function checkFloorClear() { 
    if (enemies.length === 0 && !floorClearedMessageShown) { 
        addLog('敵を全て倒した！'); 
        floorClearedMessageShown = true;
    } 
}

// 次のフロアへ移動、または最後のフロアならゲームクリア
function nextFloor() { if (currentFloor >= MAX_FLOOR) { addLog('ダンジョンを制覇しました！ スコア表示（ターン:' + turnCount + ' スコア: ' + score + '）'); nextFloorBtn.style.display = 'none'; alert('クリア！\nスコア: ' + score + '\nターン数: ' + turnCount); location.reload(); return; } spawnFloor(currentFloor + 1); nextFloorBtn.style.display = 'none'; }

// ゲームオーバー処理（プレイヤー死亡時）
function gameOver() { addLog('あなたは倒れた。ゲームオーバー。'); alert('ゲームオーバー。スコア: フロア ' + currentFloor + ' / ターン ' + turnCount); location.reload(); }

// input
Input.onMove = (dx, dy) => { if (player) playerMoveTo(player.x + dx, player.y + dy); };
Input.bindKeyboard();

document.getElementById('touchControls').addEventListener('click', (ev) => { const dir = ev.target.dataset.dir; if (!dir) return; const [dx, dy] = dir.split(',').map(Number); if (player) playerMoveTo(player.x + dx, player.y + dy); });
nextFloorBtn.addEventListener('click', nextFloor);

spawnFloor(1);
