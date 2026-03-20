import { generateMap } from './src/game/MapGen.js';
import { Player } from './src/game/Player.js';
import { Enemy } from './src/game/Enemy.js';
import { TurnManager } from './src/game/TurnManager.js';
import { Input } from './src/ui/Input.js';
import { Renderer } from './src/ui/Renderer.js';

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
let isPlayerTurn = true; // プレイヤーのターンかどうかを管理するロック

const tm = new TurnManager();

// 0〜n未満のランダムな整数を返す
function rnd(n) {
    return Math.floor(Math.random() * n);
}

// ゲームログにメッセージを追加（最新のログが先頭に表示される）
function addLog(s) {
    const p = document.createElement('div');
    p.textContent = s;
    logEl.prepend(p);
}

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
    let x, y;
    do {
        x = rnd(COLS); y = rnd(ROWS);
    } while (map[y][x].type !== 'floor' || (player && x === player.x && y === player.y) || enemies.some(e => e.x === x && e.y === y));
    if (type === 'player') player = new Player(x, y);
    else enemies.push(new Enemy(x, y));
}

// フロアを生成：マップ作成、敵配置、階段設置
function spawnFloor(floor) {
    map = generateMap(COLS, ROWS);
    enemies = [];
    items = []; // 各フロアの最初にアイテムをクリア
    floorClearedMessageShown = false; // 敵全滅メッセージフラグをリセット

    // プレイヤーの初期配置
    if (!player) {
        // 中央エリアに優先的に配置
        const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
        let x, y;
        do {
            x = cx + Math.floor((Math.random() - 0.5) * 6);
            y = cy + Math.floor((Math.random() - 0.5) * 6);
        } while (!isWalkable(x, y) || (x >= COLS - 1 || x <= 0 || y >= ROWS - 1 || y <= 0));
        player = new Player(x, y);
    }

    // 敵を配置
    const enemyCount = Math.min(7, 2 + Math.floor(floor * 0.8));
    for (let i = 0; i < enemyCount; i++) placeEntityRandom('enemy');

    // 階段を配置
    let sx, sy;
    do {
        sx = rnd(COLS);
        sy = rnd(ROWS);
    } while (map[sy][sx].type !== 'floor' || (player && player.x === sx && player.y === sy));
    map[sy][sx].type = 'stairs';

    currentFloor = floor;
    turnCount = 0;
    updateHUD();
    render();
    addLog(`フロア ${floor} に突入。敵 ${enemies.length} 匹出現`);
}

// HUD（HP、フロア、ターン数）を更新
function updateHUD() {
    if (player) hpVal.textContent = `${player.hp}/${player.maxHp}`;
    floorVal.textContent = `${currentFloor}`;
    turnVal.textContent = `${turnCount}`;
}

// マップとエンティティをレンダリング、クリックハンドラを再アタッチ
function render() {
    // マップだけ先に描画
    Renderer.renderGrid(gridEl, map, null, null);

    // アイテムを描画（背景のように）
    items.forEach(item => {
        const cell = document.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
        if (cell) cell.textContent = item.char;
    });

    // 敵を描画
    enemies.forEach(e => {
        const cell = document.querySelector(`[data-x="${e.x}"][data-y="${e.y}"]`);
        if (cell) cell.textContent = e.char;
    });

    // プレイヤーを描画（最後なので最優先で表示される）
    if (player) {
        const cell = document.querySelector(`[data-x="${player.x}"][data-y="${player.y}"]`);
        if (cell) cell.textContent = player.char;
    }

    // グリッドセルにクリックイベントハンドラを再度アタッチ
    gridEl.querySelectorAll('.cell').forEach(cell => {
        const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
        cell.onclick = () => onCellClick(x, y);
    });
}

// 攻撃者がターゲットに攻撃（ダメージ計算＆ログ出力）
function attack(attacker, defender) {
    const dmg = Math.max(1, attacker.atk - (defender.def || 0));
    defender.takeDamage(dmg);
    addLog(`${attacker === player ? 'あなた' : '敵'} の攻撃: ${dmg} ダメージ`);
}

// プレイヤーを指定座標に移動（敵との戦闘、階段判定を含む）
function playerMoveTo(x, y) {
    isPlayerTurn = false; // プレイヤーの行動が開始されたので、入力をロック
    if (!isWalkable(x, y)) {
        isPlayerTurn = true; // 壁なので即座にロック解除
        return;
    }

    const enemy = enemies.find(e => e.x === x && e.y === y);
    if (enemy) {
        attack(player, enemy);
        if (!enemy.isAlive()) {
            addLog('敵を倒した！');
            // スコアを加算（敵1体あたり10ポイント）
            score += 10;
            addLog(`スコア +10 (合計: ${score})`);
            // 敵撃破時に確実にポーションをドロップ
            items.push({ x: x, y: y, char: '🧪', type: 'potion', hp: 8 });
            addLog('ポーション をドロップした！');

            enemies = enemies.filter(en => en !== enemy);
        } else {
            attack(enemy, player);
            if (!player.isAlive()) {
                gameOver();
                return;
            }
        }
    } else {
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
    }
    turnCount++;
    updateHUD();
    render();

    // ターン経過後、敵がターンマネージャーで行動
    setTimeout(() => {
        // 敵の行動を実行
        tm.buildQueue(enemies);
        tm.processRound({ player, map, isWalkable, occupied });

        // 敵の行動後にプレイヤーが死亡したかチェック
        if (!player.isAlive()) {
            updateHUD(); // 最後のHP表示を更新
            render();
            gameOver(); // ゲームオーバー処理
            return; // ロックは解除しない
        }

        // プレイヤーが生きていれば、次のターンへ
        turnCount++;
        updateHUD();
        render();
        checkFloorClear();
        isPlayerTurn = true; // 敵のターンが完了したので、プレイヤーの入力を許可
    }, 120);
}

// グリッドセルクリック時の処理：隣接マスのみ移動可能
function onCellClick(x, y) {
    if (!isPlayerTurn) return; // プレイヤーのターンでなければ何もしない
    const dist = Math.abs(player.x - x) + Math.abs(player.y - y); 
    if (dist === 1) playerMoveTo(x, y);
}

// 敵がすべて倒されたかチェック（敵殲滅時のログを1回だけ表示）
function checkFloorClear() {
    if (enemies.length === 0 && !floorClearedMessageShown) {
        addLog('敵を全て倒した！');
        floorClearedMessageShown = true;
    }
}

// 次のフロアへ移動、または最後のフロアならゲームクリア
function nextFloor() {
    // 最終フロア到達時のゲームクリア処理
    if (currentFloor >= MAX_FLOOR) {
        isPlayerTurn = false; // 入力ロック
        addLog('ダンジョンを制覇しました！');

        const finalStatsEl = document.getElementById('clearStats');
        finalStatsEl.innerHTML = `
            <div>最終スコア: ${score}</div>
            <div>ターン: ${turnCount}</div>
        `;
        document.getElementById('gameClearScreen').style.display = 'flex';
        nextFloorBtn.style.display = 'none';
        return;
    }

    // 次のフロアを生成
    spawnFloor(currentFloor + 1);
    // 階段ボタンを隠す
    nextFloorBtn.style.display = 'none';
}

// ゲームオーバー処理（プレイヤー死亡時）
function gameOver() {
    isPlayerTurn = false; // 入力ロック
    addLog('あなたは倒れた。ゲームオーバー。');
    const finalStatsEl = document.getElementById('finalStats');
    finalStatsEl.innerHTML = `
        <div>最終スコア: ${score}</div>
        <div>ターン: ${turnCount}</div>
    `;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Retry ボタン：ゲームオーバー時に表示する
document.getElementById('retryBtn').addEventListener('click', () => {
    location.reload();
});

// New Game ボタン： ゲームクリア時に表示する
document.getElementById('newGameBtn').addEventListener('click', () => {
    location.reload();
});

// 入力ハンドラの設定
Input.onMove = (dx, dy) => { if (player) playerMoveTo(player.x + dx, player.y + dy); };
// キーボード入力をバインド
Input.bindKeyboard();

// タッチ操作ボタンのクリックハンドラ
document.getElementById('touchControls').addEventListener('click', (ev) => {
    const dir = ev.target.dataset.dir;
    if (!dir) return;
    const [dx, dy] = dir.split(',').map(Number);
    if (player) playerMoveTo(player.x + dx, player.y + dy);
});
// 階段ボタンのクリックハンドラ
nextFloorBtn.addEventListener('click', nextFloor);

// ゲーム開始
spawnFloor(1);
