import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class GameScene {
    constructor() {
        this.container = document.getElementById('scene-container');
        this.suits = ['H', 'D', 'S', 'C']; // Hearts, Diamonds, Spades, Clubs
        this.suitSymbols = { 'H': '♥', 'D': '♦', 'S': '♠', 'C': '♣' };
        this.suitColors = { 'H': 'red', 'D': 'red', 'S': 'black', 'C': 'black' };
    }

    async enter() {
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []]; // [H, D, S, C]
        this.tableau = [[], [], [], [], [], [], []]; // 7 columns
        this.selected = null; // { type: 'waste' | 'tableau', colIndex, cardIndex }
        this.moves = 0;
        this.elapsedTime = 0;
        this.timerId = null;
        this.status = 'playing'; // ゲームステータスを追加

        // オートプレイ用の状態
        this.isAutoPlay = false;
        this.autoPlayTimeoutId = null;
        this.consecutivePasses = 0; // 手詰まり判定用カウンター

        this.initDeck();
        this.renderLayout();
        this.startTimer();
        this.drawAll();
    }

    initDeck() {
        const deck = [];
        for (const suit of this.suits) {
            for (let value = 1; value <= 13; value++) {
                deck.push({ suit, value, isFaceUp: false });
            }
        }

        // シャッフル
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // 場札の分配
        let deckIndex = 0;
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                const card = deck[deckIndex++];
                if (j === i) {
                    card.isFaceUp = true; // 一番上は表向き
                }
                this.tableau[i].push(card);
            }
        }

        // 残りは山札
        this.stock = deck.slice(deckIndex);
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="scene game-scene">
                <header class="game-header">
                    <button id="game-back-btn" class="icon-btn">◀</button>
                    <div class="header-counters">
                        <div class="counter-box">
                            <span class="emoji">⏱️</span>
                            <span id="timer-counter">000</span>
                        </div>
                        <div class="counter-box">
                            <span class="emoji">🔄</span>
                            <span id="move-counter">0</span>
                        </div>
                    </div>
                    <div class="header-buttons" style="display: flex; gap: 8px;">
                        <button id="auto-play-btn" class="icon-btn" title="オートプレイ">🤖</button>
                        <button id="game-reset-btn" class="icon-btn">🔄</button>
                    </div>
                </header>

                <div class="solitaire-board">
                    <!-- 上部エリア (山札、捨て札、組札) -->
                    <div class="top-row">
                        <div class="stock-waste-area">
                            <div id="stock-pile" class="card-slot empty"></div>
                            <div id="waste-pile" class="card-slot empty"></div>
                        </div>
                        <div class="foundation-area">
                            <div class="foundation-slot empty" data-index="0" data-suit="H">♥</div>
                            <div class="foundation-slot empty" data-index="1" data-suit="D">♦</div>
                            <div class="foundation-slot empty" data-index="2" data-suit="S">♠</div>
                            <div class="foundation-slot empty" data-index="3" data-suit="C">♣</div>
                        </div>
                    </div>

                    <!-- 下部エリア (場札 7列) -->
                    <div class="tableau-area">
                        <div class="tableau-column" data-index="0"></div>
                        <div class="tableau-column" data-index="1"></div>
                        <div class="tableau-column" data-index="2"></div>
                        <div class="tableau-column" data-index="3"></div>
                        <div class="tableau-column" data-index="4"></div>
                        <div class="tableau-column" data-index="5"></div>
                        <div class="tableau-column" data-index="6"></div>
                    </div>
                </div>

                <div class="game-help-footer">
                    <div class="help-title">💡 クロンダイクの遊び方</div>
                    <p>1. <b>移動したいカード</b>をクリック ➔ <b>移動先</b>をクリック</p>
                    <p>2. 場札（下）: <b>赤黒交互</b> ＆ <b>数字が1小さい</b>カードを重ねる</p>
                    <p>3. 組札（右上）: 各マーク <b>A ➔ K の順</b> に重ねて片付ける</p>
                    <p>4. 空の場札スペース: <b>K</b> のみ置くことができる</p>
                </div>
            </div>
        `;

        document.getElementById('game-back-btn').onclick = () => {
            soundManager.playCancel();
            this.stopTimer();
            this.stopAutoPlay();
            sceneManager.switchScene('Title');
        };

        document.getElementById('game-reset-btn').onclick = () => {
            soundManager.playShuffle();
            this.stopTimer();
            this.stopAutoPlay();
            this.enter();
        };

        document.getElementById('auto-play-btn').onclick = () => {
            soundManager.playOk();
            this.toggleAutoPlay();
        };

        // イベント設定
        document.getElementById('stock-pile').onclick = () => this.handleStockClick();
        
        const wastePile = document.getElementById('waste-pile');
        wastePile.onclick = (e) => {
            e.stopPropagation();
            this.handleWasteClick();
        };

        // 組札スロット
        document.querySelectorAll('.foundation-slot').forEach(slot => {
            slot.onclick = () => {
                const index = parseInt(slot.dataset.index);
                this.handleFoundationClick(index);
            };
        });

        // 場札カラムの土台自体へのクリックイベント（空のスペースに移動させるため）
        document.querySelectorAll('.tableau-column').forEach(col => {
            col.onclick = (e) => {
                if (e.target === col) {
                    const colIndex = parseInt(col.dataset.index);
                    this.handleTableauColumnClick(colIndex);
                }
            };
        });
    }

    drawAll() {
        this.drawStock();
        this.drawWaste();
        this.drawFoundations();
        this.drawTableau();
        this.updateMoveCounter();
    }

    drawStock() {
        const pile = document.getElementById('stock-pile');
        pile.innerHTML = '';
        if (this.stock.length > 0) {
            pile.classList.remove('empty');
            const cardEl = this.createCardElement(null, false, true); // 背面のみ
            pile.appendChild(cardEl);
        } else {
            pile.classList.add('empty');
            pile.innerHTML = '🔄'; // リセット可能な記号
        }
    }

    drawWaste() {
        const pile = document.getElementById('waste-pile');
        pile.innerHTML = '';
        if (this.waste.length > 0) {
            pile.classList.remove('empty');
            const topCard = this.waste[this.waste.length - 1];
            const isSelected = this.selected && this.selected.type === 'waste';
            const cardEl = this.createCardElement(topCard, isSelected);
            pile.appendChild(cardEl);
        } else {
            pile.classList.add('empty');
        }
    }

    drawFoundations() {
        this.foundations.forEach((found, idx) => {
            const slot = document.querySelector(`.foundation-slot[data-index="${idx}"]`);
            slot.innerHTML = '';
            
            if (found.length > 0) {
                slot.classList.remove('empty');
                const card = found[found.length - 1];
                const cardEl = this.createCardElement(card, false);
                slot.appendChild(cardEl);
            } else {
                slot.classList.add('empty');
                slot.textContent = this.suitSymbols[this.suits[idx]];
            }
        });
    }

    drawTableau() {
        this.tableau.forEach((col, colIdx) => {
            const colElement = document.querySelector(`.tableau-column[data-index="${colIdx}"]`);
            colElement.innerHTML = '';

            col.forEach((card, cardIdx) => {
                const isSelected = this.selected && 
                                   this.selected.type === 'tableau' && 
                                   this.selected.colIndex === colIdx && 
                                   this.selected.cardIndex <= cardIdx;

                const cardEl = this.createCardElement(card, isSelected);
                
                cardEl.style.position = 'absolute';
                cardEl.style.top = `${cardIdx * 20}px`;

                cardEl.onclick = (e) => {
                    e.stopPropagation();
                    this.handleTableauCardClick(colIdx, cardIdx);
                };

                colElement.appendChild(cardEl);
            });

            colElement.style.minHeight = `${120 + col.length * 20}px`;
        });
    }

    createCardElement(card, isSelected = false, isBackOnly = false) {
        const el = document.createElement('div');
        el.className = 'card';
        if (isSelected) el.classList.add('selected');

        if (isBackOnly || (card && !card.isFaceUp)) {
            el.classList.add('back');
            return el;
        }

        el.classList.add(this.suitColors[card.suit]);
        
        const valueStr = this.getCardValueString(card.value);
        const symbol = this.suitSymbols[card.suit];

        el.innerHTML = `
            <div class="card-top">
                <span>${valueStr}</span>
                <span>${symbol}</span>
            </div>
            <div class="card-mid">${symbol}</div>
            <div class="card-bot">
                <span>${symbol}</span>
                <span>${valueStr}</span>
            </div>
        `;
        return el;
    }

    getCardValueString(val) {
        if (val === 1) return 'A';
        if (val === 11) return 'J';
        if (val === 12) return 'Q';
        if (val === 13) return 'K';
        return String(val);
    }

    // ==================== INTERACTION LOGIC ====================

    handleStockClick() {
        this.stopAutoPlay(); // 手動操作時にオートプレイを解除
        this.selected = null;

        if (this.stock.length > 0) {
            soundManager.playFlipCard();
            const card = this.stock.pop();
            card.isFaceUp = true;
            this.waste.push(card);
        } else {
            if (this.waste.length === 0) return;
            soundManager.playShuffle();
            this.stock = this.waste.reverse().map(c => {
                c.isFaceUp = false;
                return c;
            });
            this.waste = [];
        }
        this.drawAll();
    }

    handleWasteClick() {
        this.stopAutoPlay();
        if (this.waste.length === 0) return;

        soundManager.playSelect();
        this.selected = { type: 'waste' };
        this.drawAll();
    }

    handleTableauCardClick(colIndex, cardIndex) {
        this.stopAutoPlay();
        const card = this.tableau[colIndex][cardIndex];

        if (!card.isFaceUp) {
            if (cardIndex === this.tableau[colIndex].length - 1) {
                soundManager.playFlipCard();
                card.isFaceUp = true;
                this.moves++;
                this.drawAll();
            }
            return;
        }

        if (this.selected) {
            const moved = this.tryMoveToTableau(colIndex);
            if (moved) return;
        }

        soundManager.playSelect();
        this.selected = { type: 'tableau', colIndex, cardIndex };
        this.drawAll();
    }

    handleTableauColumnClick(colIndex) {
        this.stopAutoPlay();
        if (this.selected) {
            this.tryMoveToTableau(colIndex);
        }
    }

    handleFoundationClick(foundIndex) {
        this.stopAutoPlay();
        if (this.selected) {
            this.tryMoveToFoundation(foundIndex);
        }
    }

    // ==================== AUTO PLAY (AI) LOGIC ====================

    toggleAutoPlay() {
        if (this.isAutoPlay) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.isAutoPlay = true;
        this.consecutivePasses = 0;
        const btn = document.getElementById('auto-play-btn');
        if (btn) btn.classList.add('active');

        this.selected = null;
        this.drawAll();

        this.runAutoPlayStep();
    }

    stopAutoPlay() {
        this.isAutoPlay = false;
        if (this.autoPlayTimeoutId) {
            clearTimeout(this.autoPlayTimeoutId);
            this.autoPlayTimeoutId = null;
        }
        const btn = document.getElementById('auto-play-btn');
        if (btn) btn.classList.remove('active');
    }

    async runAutoPlayStep() {
        if (!this.isAutoPlay || this.status !== 'playing') return;

        const move = this.findBestAIMove();
        if (move) {
            this.executeAIMove(move);
            this.drawAll();
            this.checkWin();

            this.consecutivePasses = 0; // 手が動かせたのでカウンターをリセット

            if (this.isAutoPlay) {
                this.autoPlayTimeoutId = setTimeout(() => this.runAutoPlayStep(), 900);
            }
        } else {
            // 動かせる手がない場合、山札をめくるかリサイクルする
            if (this.stock.length > 0) {
                // 山札をめくる
                soundManager.playFlipCard();
                const card = this.stock.pop();
                card.isFaceUp = true;
                this.waste.push(card);
                this.drawAll();
                
                this.autoPlayTimeoutId = setTimeout(() => this.runAutoPlayStep(), 900);
            } else if (this.waste.length > 0) {
                // 山札のリサイクル
                soundManager.playShuffle();
                this.stock = this.waste.reverse().map(c => {
                    c.isFaceUp = false;
                    return c;
                });
                this.waste = [];
                this.drawAll();

                this.consecutivePasses++;
                
                // 山札を何周しても1手も動かせない場合、手詰まりと判定
                if (this.consecutivePasses > 3) {
                    this.stopAutoPlay();
                    alert("手詰まりになりました。これ以上進められません。");
                } else {
                    this.autoPlayTimeoutId = setTimeout(() => this.runAutoPlayStep(), 900);
                }
            } else {
                // 山札も捨て札も空で手がない ➔ 手詰まり
                this.stopAutoPlay();
                alert("手詰まりになりました。これ以上進められません。");
            }
        }
    }

    findBestAIMove() {
        // 優先度1: 組札に置けるカード（捨て札トップ ➔ 場札トップ）
        if (this.waste.length > 0) {
            const card = this.waste[this.waste.length - 1];
            for (let i = 0; i < 4; i++) {
                if (this.isValidFoundationMove(card, i)) {
                    return { type: 'wasteToFoundation', foundIdx: i };
                }
            }
        }
        for (let colIdx = 0; colIdx < 7; colIdx++) {
            const col = this.tableau[colIdx];
            if (col.length > 0) {
                const card = col[col.length - 1];
                for (let i = 0; i < 4; i++) {
                    if (this.isValidFoundationMove(card, i)) {
                        return { type: 'tableauToFoundation', colIdx, foundIdx: i };
                    }
                }
            }
        }

        // 優先度2: 場札から場札へ、裏向きカードをめくるための移動
        for (let srcIdx = 0; srcIdx < 7; srcIdx++) {
            const srcCol = this.tableau[srcIdx];
            if (srcCol.length === 0) continue;

            let firstFaceUpIdx = -1;
            for (let i = 0; i < srcCol.length; i++) {
                if (srcCol[i].isFaceUp) {
                    firstFaceUpIdx = i;
                    break;
                }
            }
            if (firstFaceUpIdx <= 0) continue; // 下に裏向きカードがない場合は除外

            const bottomCard = srcCol[firstFaceUpIdx];

            for (let destIdx = 0; destIdx < 7; destIdx++) {
                if (srcIdx === destIdx) continue;
                if (this.isValidTableauMove(bottomCard, destIdx)) {
                    return { type: 'tableauToTableau', srcIdx, cardIdx: firstFaceUpIdx, destIdx };
                }
            }
        }

        // 優先度3: 空の場札スペースにK（キング）を移動する（移動元に裏カードがある場合優先）
        for (let srcIdx = 0; srcIdx < 7; srcIdx++) {
            const srcCol = this.tableau[srcIdx];
            if (srcCol.length === 0) continue;

            let firstFaceUpIdx = -1;
            for (let i = 0; i < srcCol.length; i++) {
                if (srcCol[i].isFaceUp) {
                    firstFaceUpIdx = i;
                    break;
                }
            }
            if (firstFaceUpIdx === -1) continue;

            const bottomCard = srcCol[firstFaceUpIdx];
            if (bottomCard.value === 13 && firstFaceUpIdx > 0) {
                for (let destIdx = 0; destIdx < 7; destIdx++) {
                    if (this.tableau[destIdx].length === 0) {
                        return { type: 'tableauToTableau', srcIdx, cardIdx: firstFaceUpIdx, destIdx };
                    }
                }
            }
        }

        // 優先度4: 捨て札から場札への移動
        if (this.waste.length > 0) {
            const card = this.waste[this.waste.length - 1];
            for (let destIdx = 0; destIdx < 7; destIdx++) {
                if (this.isValidTableauMove(card, destIdx)) {
                    return { type: 'wasteToTableau', destIdx };
                }
            }
        }

        // 優先度5: その他の場札から場札への移動（整理用）
        for (let srcIdx = 0; srcIdx < 7; srcIdx++) {
            const srcCol = this.tableau[srcIdx];
            if (srcCol.length === 0) continue;

            let firstFaceUpIdx = -1;
            for (let i = 0; i < srcCol.length; i++) {
                if (srcCol[i].isFaceUp) {
                    firstFaceUpIdx = i;
                    break;
                }
            }
            if (firstFaceUpIdx === -1) continue;

            const bottomCard = srcCol[firstFaceUpIdx];
            if (bottomCard.value === 13 && firstFaceUpIdx === 0) continue; // すでに一番下がKの列は動かさない

            for (let destIdx = 0; destIdx < 7; destIdx++) {
                if (srcIdx === destIdx) continue;
                if (this.isValidTableauMove(bottomCard, destIdx)) {
                    // 空スペースへの移動で、単にKを別の空スペースへ動かすだけの無駄な手は除外
                    if (this.tableau[destIdx].length === 0 && bottomCard.value === 13) continue;

                    return { type: 'tableauToTableau', srcIdx, cardIdx: firstFaceUpIdx, destIdx };
                }
            }
        }

        return null;
    }

    isValidFoundationMove(card, foundIdx) {
        const destFound = this.foundations[foundIdx];
        const requiredSuit = this.suits[foundIdx];

        if (card.suit !== requiredSuit) return false;

        if (destFound.length === 0) {
            return card.value === 1; // Aのみ
        } else {
            const topCard = destFound[destFound.length - 1];
            return card.value === topCard.value + 1;
        }
    }

    isValidTableauMove(card, destColIdx) {
        const destCol = this.tableau[destColIdx];

        if (destCol.length === 0) {
            return card.value === 13; // Kのみ
        } else {
            const destTopCard = destCol[destCol.length - 1];
            const isDifferentColor = this.suitColors[card.suit] !== this.suitColors[destTopCard.suit];
            const isSequential = card.value === destTopCard.value - 1;
            return isDifferentColor && isSequential;
        }
    }

    executeAIMove(move) {
        soundManager.playPlaceCard();
        this.moves++;

        if (move.type === 'wasteToFoundation') {
            const card = this.waste.pop();
            this.foundations[move.foundIdx].push(card);
        } else if (move.type === 'tableauToFoundation') {
            const card = this.tableau[move.colIdx].pop();
            this.foundations[move.foundIdx].push(card);
        } else if (move.type === 'tableauToTableau') {
            const cards = this.tableau[move.srcIdx].slice(move.cardIdx);
            this.tableau[move.srcIdx].splice(move.cardIdx);
            this.tableau[move.destIdx] = this.tableau[move.destIdx].concat(cards);
        } else if (move.type === 'wasteToTableau') {
            const card = this.waste.pop();
            this.tableau[move.destIdx].push(card);
        }

        this.autoOpenTableauTops();
    }

    // ==================== CARD MOVEMENT RULES (MANUAL) ====================

    tryMoveToTableau(destColIdx) {
        const destCol = this.tableau[destColIdx];
        const cardsToMove = this.getCardsToMove();

        if (cardsToMove.length === 0) return false;

        const bottomCard = cardsToMove[0];
        let isValid = false;

        if (destCol.length === 0) {
            if (bottomCard.value === 13) isValid = true;
        } else {
            const destTopCard = destCol[destCol.length - 1];
            const isDifferentColor = this.suitColors[bottomCard.suit] !== this.suitColors[destTopCard.suit];
            const isSequential = bottomCard.value === destTopCard.value - 1;

            if (isDifferentColor && isSequential) {
                isValid = true;
            }
        }

        if (isValid) {
            soundManager.playPlaceCard();
            this.executeMoveToTableau(destColIdx, cardsToMove);
            this.moves++;
            this.selected = null;
            this.autoOpenTableauTops();
            this.drawAll();
            this.checkWin();
            return true;
        } else {
            soundManager.playCancel();
            this.selected = null;
            this.drawAll();
            return false;
        }
    }

    tryMoveToFoundation(foundIdx) {
        const cardsToMove = this.getCardsToMove();

        if (cardsToMove.length !== 1) {
            soundManager.playCancel();
            this.selected = null;
            this.drawAll();
            return false;
        }

        const card = cardsToMove[0];
        const destFound = this.foundations[foundIdx];
        const requiredSuit = this.suits[foundIdx];
        let isValid = false;

        if (card.suit === requiredSuit) {
            if (destFound.length === 0) {
                if (card.value === 1) isValid = true;
            } else {
                const topCard = destFound[destFound.length - 1];
                if (card.value === topCard.value + 1) isValid = true;
            }
        }

        if (isValid) {
            soundManager.playPlaceCard();
            this.executeMoveToFoundation(foundIdx, card);
            this.moves++;
            this.selected = null;
            this.autoOpenTableauTops();
            this.drawAll();
            this.checkWin();
            return true;
        } else {
            soundManager.playCancel();
            this.selected = null;
            this.drawAll();
            return false;
        }
    }

    getCardsToMove() {
        if (!this.selected) return [];

        if (this.selected.type === 'waste') {
            return [this.waste[this.waste.length - 1]];
        } else if (this.selected.type === 'tableau') {
            const col = this.tableau[this.selected.colIndex];
            return col.slice(this.selected.cardIndex);
        }
        return [];
    }

    executeMoveToTableau(destColIdx, cards) {
        if (this.selected.type === 'waste') {
            this.waste.pop();
        } else if (this.selected.type === 'tableau') {
            const col = this.tableau[this.selected.colIndex];
            col.splice(this.selected.cardIndex);
        }
        this.tableau[destColIdx] = this.tableau[destColIdx].concat(cards);
    }

    executeMoveToFoundation(foundIdx, card) {
        if (this.selected.type === 'waste') {
            this.waste.pop();
        } else if (this.selected.type === 'tableau') {
            const col = this.tableau[this.selected.colIndex];
            col.pop();
        }
        this.foundations[foundIdx].push(card);
    }

    autoOpenTableauTops() {
        this.tableau.forEach(col => {
            if (col.length > 0) {
                const topCard = col[col.length - 1];
                if (!topCard.isFaceUp) {
                    topCard.isFaceUp = true;
                }
            }
        });
    }

    checkWin() {
        let totalFound = 0;
        this.foundations.forEach(f => {
            totalFound += f.length;
        });

        if (totalFound === 52) {
            this.status = 'win';
            this.stopTimer();
            this.stopAutoPlay();
            setTimeout(() => {
                sceneManager.switchScene('Result', {
                    status: 'win',
                    time: this.elapsedTime,
                    moves: this.moves
                });
            }, 1000);
        }
    }

    // ==================== SYSTEM ====================

    startTimer() {
        this.elapsedTime = 0;
        const timerCounter = document.getElementById('timer-counter');
        this.timerId = setInterval(() => {
            this.elapsedTime++;
            if (this.elapsedTime > 999) {
                this.elapsedTime = 999;
                this.stopTimer();
            }
            timerCounter.textContent = String(this.elapsedTime).padStart(3, '0');
        }, 1000);
    }

    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    updateMoveCounter() {
        const moveCounter = document.getElementById('move-counter');
        if (moveCounter) {
            moveCounter.textContent = this.moves;
        }
    }

    update(dt) {}
    exit() {
        this.stopTimer();
        this.stopAutoPlay();
    }
}
