import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class GameScene {
    constructor() {
        this.container = document.getElementById('scene-container');
        this.size = 28; // ヘックスの半径(px)
        
        // ヘックスグリッドの隣接方向 (Axial coordinates)
        this.directions = [
            { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
            { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
        ];
    }

    async enter(data) {
        this.mode = data.mode || 'pva'; // 'pva' (Player vs AI) or 'pvp' (Player vs Player)
        this.board = new Map(); // key: "q,r", value: { owner: null/1/2 }
        this.turn = 1; // 1: Player 1 (Blue), 2: Player 2 / AI (Red)
        this.selectedPiece = null; // { q, r }
        this.validMoves = new Map(); // key: "q,r", value: 'split' / 'jump'
        this.isProcessing = false; // 操作中・AI思考中のロック

        this.initBoard();
        this.renderLayout();
        this.updateUI();

        // 最初のターンチェック
        this.checkTurn();
    }

    initBoard() {
        // 半径3のヘックスグリッドを作成 (中心含む全37マス)
        const radius = 3;
        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                this.board.set(`${q},${r}`, { owner: null });
            }
        }

        // 初期配置 (角の6箇所に交互に配置)
        // 青 (Player 1)
        this.board.set('-3,0', { owner: 1 });
        this.board.set('0,3', { owner: 1 });
        this.board.set('3,-3', { owner: 1 });

        // 赤 (Player 2 / AI)
        this.board.set('-3,3', { owner: 2 });
        this.board.set('3,0', { owner: 2 });
        this.board.set('0,-3', { owner: 2 });
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="scene game-scene">
                <header class="game-header">
                    <button id="game-back-btn" class="icon-btn">◀</button>
                    <div class="turn-indicator">
                        <span id="turn-text">プレイヤーのターン</span>
                        <div id="turn-color-bar" class="color-bar player-1"></div>
                    </div>
                    <button id="game-reset-btn" class="icon-btn">🔄</button>
                </header>

                <div class="score-panel">
                    <div class="score-box p1-score-box active">
                        <div class="score-label">${this.mode === 'pva' ? 'プレイヤー' : 'P1 (青)'}</div>
                        <div id="p1-count" class="score-num">3</div>
                    </div>
                    <div class="score-box p2-score-box">
                        <div class="score-label">${this.mode === 'pva' ? 'AI (赤)' : 'P2 (赤)'}</div>
                        <div id="p2-count" class="score-num">3</div>
                    </div>
                </div>

                <div class="board-container">
                    <svg id="hex-svg" viewBox="-180 -180 360 360" width="100%" height="100%">
                        <defs>
                            <!-- グラデーションとシャドウの定義 -->
                            <radialGradient id="blue-piece" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stop-color="#8ce8ff" />
                                <stop offset="50%" stop-color="#00a2ff" />
                                <stop offset="100%" stop-color="#0055b3" />
                            </radialGradient>
                            <radialGradient id="red-piece" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stop-color="#ff9999" />
                                <stop offset="50%" stop-color="#ff3b30" />
                                <stop offset="100%" stop-color="#b30f0f" />
                            </radialGradient>
                            <radialGradient id="empty-tile" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#2a2f3d" />
                                <stop offset="100%" stop-color="#181c26" />
                            </radialGradient>
                            <radialGradient id="split-highlight" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#2bd980" stop-opacity="0.6" />
                                <stop offset="100%" stop-color="#19824c" stop-opacity="0.3" />
                            </radialGradient>
                            <radialGradient id="jump-highlight" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#ffcc00" stop-opacity="0.6" />
                                <stop offset="100%" stop-color="#b38f00" stop-opacity="0.3" />
                            </radialGradient>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.5"/>
                            </filter>
                            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        <g id="grid-group"></g>
                        <g id="pieces-group"></g>
                    </svg>
                    <div id="toast-message" class="toast hidden"></div>
                </div>
            </div>
        `;

        document.getElementById('game-back-btn').onclick = () => {
            soundManager.playCancel();
            sceneManager.switchScene('Title');
        };

        document.getElementById('game-reset-btn').onclick = () => {
            soundManager.playOk();
            sceneManager.switchScene('Game', { mode: this.mode });
        };

        this.svg = document.getElementById('hex-svg');
        this.gridGroup = document.getElementById('grid-group');
        this.piecesGroup = document.getElementById('pieces-group');

        this.drawGrid();
    }

    // アキシャル座標からスクリーンピクセル座標へ変換
    axialToPixel(q, r) {
        const x = this.size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = this.size * (3.0 / 2.0 * r);
        return { x, y };
    }

    // 六角形のポイント文字列を生成 (ポイントトップ)
    getHexPoints(cx, cy) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angleRad = (Math.PI / 3) * i - Math.PI / 6;
            const px = cx + (this.size - 1.5) * Math.cos(angleRad); // 少し隙間を空ける
            const py = cy + (this.size - 1.5) * Math.sin(angleRad);
            points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
        return points.join(' ');
    }

    drawGrid() {
        this.gridGroup.innerHTML = '';
        this.piecesGroup.innerHTML = '';

        for (const [key, cell] of this.board.entries()) {
            const [q, r] = key.split(',').map(Number);
            const { x, y } = this.axialToPixel(q, r);
            const points = this.getHexPoints(x, y);

            // タイルのポリゴンを作成
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', points);
            polygon.setAttribute('class', 'hex-tile');
            polygon.setAttribute('data-coord', key);
            polygon.setAttribute('fill', 'url(#empty-tile)');
            polygon.style.cursor = 'pointer';

            polygon.onclick = () => this.handleTileClick(q, r);

            this.gridGroup.appendChild(polygon);

            // 駒があれば描画
            if (cell.owner !== null) {
                this.drawPiece(q, r, cell.owner);
            }
        }
    }

    drawPiece(q, r, owner) {
        const { x, y } = this.axialToPixel(q, r);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', this.size * 0.65);
        circle.setAttribute('class', `game-piece ${owner === 1 ? 'p1-piece' : 'p2-piece'}`);
        circle.setAttribute('fill', owner === 1 ? 'url(#blue-piece)' : 'url(#red-piece)');
        circle.setAttribute('filter', 'url(#shadow)');
        circle.setAttribute('data-coord', `${q},${r}`);
        circle.style.pointerEvents = 'none'; // タイルのクリックイベントを通す

        this.piecesGroup.appendChild(circle);
    }

    handleTileClick(q, r) {
        if (this.isProcessing) return;
        if (this.mode === 'pva' && this.turn === 2) return; // AIのターン

        const key = `${q},${r}`;
        const cell = this.board.get(key);

        // 1. 自分の駒を選択
        if (cell.owner === this.turn) {
            soundManager.playSelect();
            this.selectPiece(q, r);
            return;
        }

        // 2. 移動先を選択
        if (this.selectedPiece && this.validMoves.has(key)) {
            const moveType = this.validMoves.get(key);
            this.executeMove(this.selectedPiece.q, this.selectedPiece.r, q, r, moveType);
        } else {
            // 選択解除
            if (this.selectedPiece) {
                soundManager.playCancel();
                this.clearSelection();
            }
        }
    }

    selectPiece(q, r) {
        this.clearSelection();
        this.selectedPiece = { q, r };

        // 選択されたタイルのハイライト
        const selectedTile = this.gridGroup.querySelector(`polygon[data-coord="${q},${r}"]`);
        if (selectedTile) selectedTile.classList.add('selected');

        // 移動可能なマスの探索
        this.validMoves = this.calculateValidMoves(q, r);

        // 移動可能マスのハイライト
        for (const [moveKey, moveType] of this.validMoves.entries()) {
            const tile = this.gridGroup.querySelector(`polygon[data-coord="${moveKey}"]`);
            if (tile) {
                tile.classList.add(moveType === 'split' ? 'highlight-split' : 'highlight-jump');
                tile.setAttribute('fill', moveType === 'split' ? 'url(#split-highlight)' : 'url(#jump-highlight)');
            }
        }
    }

    clearSelection() {
        this.selectedPiece = null;
        this.validMoves.clear();

        this.gridGroup.querySelectorAll('polygon').forEach(tile => {
            tile.classList.remove('selected', 'highlight-split', 'highlight-jump');
            tile.setAttribute('fill', 'url(#empty-tile)');
        });
    }

    // 選択された駒から移動可能なマスを算出
    calculateValidMoves(q, r) {
        const moves = new Map();
        
        for (const [key, cell] of this.board.entries()) {
            if (cell.owner !== null) continue; // 空きマスのみ

            const [tq, tr] = key.split(',').map(Number);
            const dist = this.hexDistance(q, r, tq, tr);

            if (dist === 1) {
                moves.set(key, 'split');
            } else if (dist === 2) {
                moves.set(key, 'jump');
            }
        }
        return moves;
    }

    hexDistance(q1, r1, q2, r2) {
        return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
    }

    // 移動の実行
    async executeMove(fromQ, fromR, toQ, toR, type) {
        this.isProcessing = true;
        this.clearSelection();

        const fromKey = `${fromQ},${fromR}`;
        const toKey = `${toQ},${toR}`;

        // 1. 移動アニメーション/SE
        soundManager.playPlace();

        if (type === 'jump') {
            // ジャンプ: 元の駒を消す
            this.board.set(fromKey, { owner: null });
        }
        // 新しい場所に駒を配置
        this.board.set(toKey, { owner: this.turn });

        // 再描画
        this.drawGrid();

        // 隣接する敵の駒を捕獲
        const neighbors = this.getNeighbors(toQ, toR);
        let capturedAny = false;

        for (const nKey of neighbors) {
            if (this.board.has(nKey)) {
                const cell = this.board.get(nKey);
                if (cell.owner !== null && cell.owner !== this.turn) {
                    cell.owner = this.turn;
                    capturedAny = true;

                    // 捕獲された駒のひっくり返り演出用クラスを一時的に追加
                    const [nq, nr] = nKey.split(',').map(Number);
                    const tile = this.gridGroup.querySelector(`polygon[data-coord="${nKey}"]`);
                    if (tile) {
                        tile.classList.add('captured-effect');
                        setTimeout(() => tile.classList.remove('captured-effect'), 500);
                    }
                }
            }
        }

        if (capturedAny) {
            soundManager.playFlip();
            this.drawGrid();
            await this.sleep(400); // 演出用ウェイト
        } else {
            await this.sleep(200);
        }

        // ターン交代
        this.turn = this.turn === 1 ? 2 : 1;
        this.updateUI();
        this.isProcessing = false;

        this.checkTurn();
    }

    getNeighbors(q, r) {
        return this.directions.map(d => `${q + d.q},${r + d.r}`);
    }

    async checkTurn() {
        // 終了判定
        if (this.checkGameOver()) {
            this.endGame();
            return;
        }

        // パス判定
        if (!this.hasValidMoves(this.turn)) {
            soundManager.playCancel();
            const playerName = this.turn === 1 
                ? (this.mode === 'pva' ? 'プレイヤー' : 'プレイヤー 1')
                : (this.mode === 'pva' ? 'AI' : 'プレイヤー 2');
            
            this.showToast(`${playerName} は動ける場所がありません！パスします。`);
            await this.sleep(1500);

            this.turn = this.turn === 1 ? 2 : 1;
            this.updateUI();

            // 両者動けない場合の二重チェック
            if (!this.hasValidMoves(this.turn)) {
                this.endGame();
                return;
            }
        }

        // AIのターンならAIを実行
        if (this.mode === 'pva' && this.turn === 2) {
            this.runAI();
        }
    }

    hasValidMoves(player) {
        for (const [key, cell] of this.board.entries()) {
            if (cell.owner === player) {
                const [q, r] = key.split(',').map(Number);
                const moves = this.calculateValidMoves(q, r);
                if (moves.size > 0) return true;
            }
        }
        return false;
    }

    checkGameOver() {
        // 1. 盤面が全て埋まっているか
        let emptyCount = 0;
        let p1Count = 0;
        let p2Count = 0;

        for (const cell of this.board.values()) {
            if (cell.owner === null) emptyCount++;
            else if (cell.owner === 1) p1Count++;
            else if (cell.owner === 2) p2Count++;
        }

        // どちらかの駒が0になった場合も終了
        if (p1Count === 0 || p2Count === 0) return true;

        if (emptyCount === 0) return true;

        // 2. 両者ともに動ける手がない場合
        if (!this.hasValidMoves(1) && !this.hasValidMoves(2)) return true;

        return false;
    }

    endGame() {
        let p1Count = 0;
        let p2Count = 0;
        let emptyCount = 0;

        for (const cell of this.board.values()) {
            if (cell.owner === 1) p1Count++;
            else if (cell.owner === 2) p2Count++;
            else emptyCount++;
        }

        // 空きマスは、より多くの駒を持っているプレイヤーの得点に加算される（通常ルール）
        if (p1Count > p2Count) {
            p1Count += emptyCount;
        } else if (p2Count > p1Count) {
            p2Count += emptyCount;
        }

        let winner = 'Draw';
        if (p1Count > p2Count) {
            winner = this.mode === 'pva' ? 'Player' : 'Player 1';
        } else if (p2Count > p1Count) {
            winner = this.mode === 'pva' ? 'AI' : 'Player 2';
        }

        setTimeout(() => {
            sceneManager.switchScene('Result', {
                mode: this.mode,
                winner,
                p1Score: p1Count,
                p2Score: p2Count
            });
        }, 1000);
    }

    // AIの意思決定と実行
    async runAI() {
        this.isProcessing = true;
        
        // 思考中を演出するためのウェイト
        await this.sleep(800 + Math.random() * 500);

        const allMoves = []; // { fromQ, fromR, toQ, toR, type, score }

        // AIの全ての可能な手をリストアップ
        for (const [key, cell] of this.board.entries()) {
            if (cell.owner === 2) {
                const [q, r] = key.split(',').map(Number);
                const moves = this.calculateValidMoves(q, r);

                for (const [moveKey, type] of moves.entries()) {
                    const [tq, tr] = moveKey.split(',').map(Number);
                    
                    // この手で捕獲できる敵の数を計算
                    const neighbors = this.getNeighbors(tq, tr);
                    let captureCount = 0;
                    for (const nKey of neighbors) {
                        if (this.board.has(nKey) && this.board.get(nKey).owner === 1) {
                            captureCount++;
                        }
                    }

                    // 評価スコア = (複製なら1、ジャンプなら0) + 捕獲数 * 2
                    const score = (type === 'split' ? 1 : 0) + captureCount * 2;

                    allMoves.push({
                        fromQ: q,
                        fromR: r,
                        toQ: tq,
                        toR: tr,
                        type,
                        score
                    });
                }
            }
        }

        if (allMoves.length > 0) {
            // スコアの高い順にソート
            allMoves.sort((a, b) => b.score - a.score);

            // 最高スコアの手を抽出
            const maxScore = allMoves[0].score;
            const bestMoves = allMoves.filter(m => m.score === maxScore);

            // 同点がある場合はランダムに選択
            const chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

            this.isProcessing = false;
            this.executeMove(chosenMove.fromQ, chosenMove.fromR, chosenMove.toQ, chosenMove.toR, chosenMove.type);
        } else {
            this.isProcessing = false;
            // 動けないはずなのでパス処理へ流れる（通常は checkTurn で弾かれるが安全のため）
            this.turn = 1;
            this.updateUI();
            this.checkTurn();
        }
    }

    updateUI() {
        const turnText = document.getElementById('turn-text');
        const turnColorBar = document.getElementById('turn-color-bar');

        if (this.turn === 1) {
            turnText.textContent = this.mode === 'pva' ? 'あなたのターン' : 'プレイヤー 1 (青) のターン';
            turnColorBar.className = 'color-bar player-1';
            document.querySelector('.p1-score-box').classList.add('active');
            document.querySelector('.p2-score-box').classList.remove('active');
        } else {
            turnText.textContent = this.mode === 'pva' ? 'AIが考え中...' : 'プレイヤー 2 (赤) のターン';
            turnColorBar.className = 'color-bar player-2';
            document.querySelector('.p2-score-box').classList.add('active');
            document.querySelector('.p1-score-box').classList.remove('active');
        }

        // スコア更新
        let p1Count = 0;
        let p2Count = 0;
        for (const cell of this.board.values()) {
            if (cell.owner === 1) p1Count++;
            else if (cell.owner === 2) p2Count++;
        }

        document.getElementById('p1-count').textContent = p1Count;
        document.getElementById('p2-count').textContent = p2Count;
    }

    showToast(message) {
        const toast = document.getElementById('toast-message');
        toast.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 1500);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    update(dt) {}
    exit() {}
}
