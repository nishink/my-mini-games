const games = [
    {
        id: "mini-rpg-saga",
        title: "Mini RPG Saga",
        phase: "main",
        description: "全てのコンポーネントを統合した大作RPG。冒険、戦闘、アイテム収集の集大成。",
        icon: "🌟",
        path: "mini-rpg-saga/public/index.html",
        featured: true
    },
    // 第1期
    {
        id: "mini-action",
        title: "Action",
        phase: "phase1",
        description: "ジャンプとショットで進む横スクロールアクションゲーム。",
        icon: "🏃",
        path: "mini-action/public/index.html"
    },
    {
        id: "mini-roguelike",
        title: "Roguelike",
        phase: "phase1",
        description: "ターン制で進行するグリッドベースのダンジョン探索RPG。",
        icon: "🗡️",
        path: "mini-roguelike/public/index.html"
    },
    {
        id: "mini-snake",
        title: "Snake",
        phase: "phase1",
        description: "エサを食べてヘビを長く成長させるクラシックアーケード。",
        icon: "🐍",
        path: "mini-snake/public/index.html"
    },
    {
        id: "mini-shmup",
        title: "SHMUP",
        phase: "phase1",
        description: "敵の弾幕を避けながら戦う縦スクロールシューティング。",
        icon: "🚀",
        path: "mini-shmup/public/index.html"
    },
    {
        id: "mini-sokoban",
        title: "Sokoban",
        phase: "phase1",
        description: "倉庫の荷物を指定の位置に押し運ぶ論理パズルゲーム。",
        icon: "📦",
        path: "mini-sokoban/public/index.html"
    },
    {
        id: "mini-clicker",
        title: "Clicker",
        phase: "phase1",
        description: "クリックと自動生産施設で数値を爆発的に増やす放置ゲーム。",
        icon: "🖱️",
        path: "mini-clicker/public/index.html"
    },
    {
        id: "mini-defense",
        title: "Defense",
        phase: "phase1",
        description: "防衛塔を配置して敵の侵攻を食い止めるタワーディフェンス。",
        icon: "🏰",
        path: "mini-defense/public/index.html"
    },
    // 第2期
    {
        id: "mini-tetris",
        title: "Tetris",
        phase: "phase2",
        description: "落ちてくるブロックを横一列に揃えて消していく定番パズル。",
        icon: "🧱",
        path: "mini-tetris/public/index.html"
    },
    {
        id: "mini-puyo",
        title: "Puyo",
        phase: "phase2",
        description: "同色のぷよを4つ繋げて消し、大連鎖を狙う落ち物パズル。",
        icon: "💧",
        path: "mini-puyo/public/index.html"
    },
    {
        id: "mini-jumper",
        title: "Jumper",
        phase: "phase2",
        description: "足場を乗り継いでどこまでも高く登り続ける無限ジャンプ。",
        icon: "🦘",
        path: "mini-jumper/public/index.html"
    },
    {
        id: "mini-racer",
        title: "Racer",
        phase: "phase2",
        description: "トップダウン視点のハイスピードレースゲーム。",
        icon: "🏎️",
        path: "mini-racer/public/index.html"
    },
    {
        id: "mini-2048",
        title: "2048",
        phase: "phase2",
        description: "数字タイルをスライドして合算し、「2048」を目指すパズル。",
        icon: "🔢",
        path: "mini-2048/public/index.html"
    },
    {
        id: "mini-typer",
        title: "Typer",
        phase: "phase2",
        description: "タイピングの速度と正確さで敵を倒すタイピングゲーム。",
        icon: "⌨️",
        path: "mini-typer/public/index.html"
    },
    {
        id: "mini-manager",
        title: "Manager",
        phase: "phase2",
        description: "素材を仕入れてポーションを作り販売する店舗経営シミュレーション。",
        icon: "🧪",
        path: "mini-manager/public/index.html"
    },
    {
        id: "mini-stealth",
        title: "Stealth",
        phase: "phase2",
        description: "敵の視野や巡回ルートを避けながらゴールを目指す潜入アクション。",
        icon: "🕵️",
        path: "mini-stealth/public/index.html"
    },
    {
        id: "mini-golf",
        title: "Golf",
        phase: "phase2",
        description: "物理演算を利用し、壁の反射を計算してカップインを狙うゴルフ。",
        icon: "⛳",
        path: "mini-golf/public/index.html"
    },
    {
        id: "mini-wordle",
        title: "Wordle",
        phase: "phase2",
        description: "ヒントを頼りに5文字の英単語を当てる言葉パズル。",
        icon: "🔤",
        path: "mini-wordle/public/index.html"
    },
    // 第3期
    {
        id: "mini-quest",
        title: "Quest",
        phase: "phase3",
        description: "広大な2Dフィールドを探索する、クラシックなRPGプロトタイプ。",
        icon: "🗺️",
        path: "mini-quest/public/index.html"
    },
    {
        id: "mini-wizard",
        title: "Wizard",
        phase: "phase3",
        description: "ワイヤーフレーム風の3D迷宮を探索する主観視点ダンジョンRPG。",
        icon: "🏰",
        path: "mini-wizard/public/index.html"
    },
    {
        id: "mini-story",
        title: "Story",
        phase: "phase3",
        description: "選択肢によって物語が変化する、ビジュアルノベルエンジン。",
        icon: "📖",
        path: "mini-story/public/index.html"
    },
    {
        id: "mini-craft",
        title: "Craft",
        phase: "phase3",
        description: "ブロックを配置・破壊して自由に世界を作るサンドボックス。",
        icon: "🧱",
        path: "mini-craft/public/index.html"
    },
    // RPGコンポーネント
    {
        id: "mini-battle",
        title: "Battle",
        phase: "rpg-comp",
        description: "戦闘シーンに特化したターン制コマンドバトルシステム。",
        icon: "⚔️",
        path: "mini-battle/public/index.html"
    },
    {
        id: "mini-loot",
        title: "Loot",
        phase: "rpg-comp",
        description: "ランダムな報酬獲得とインベントリを管理するアイテムシステム。",
        icon: "💎",
        path: "mini-loot/public/index.html"
    },
    {
        id: "mini-hero",
        title: "Hero",
        phase: "rpg-comp",
        description: "キャラクターの経験値、レベルアップ、ステータス成長システム。",
        icon: "🦸",
        path: "mini-hero/public/index.html"
    },
    // 第4期
    {
        id: "mini-deck",
        title: "Deck",
        phase: "phase4",
        description: "カードを選択・構築して敵と戦うデッキ構築型カードバトル。",
        icon: "🃏",
        path: "mini-deck/public/index.html"
    },
    {
        id: "mini-reversi",
        title: "Reversi",
        phase: "phase4",
        description: "AI対戦を搭載した定番のボードゲーム（オセロ）。",
        icon: "⚪",
        path: "mini-reversi/public/index.html"
    },
    {
        id: "mini-shogi",
        title: "Shogi",
        phase: "phase4",
        description: "5x5マスのミニ将棋（5五将棋）。AI対戦、駒の成りと持ち駒を再現。",
        icon: "☖",
        path: "mini-shogi/public/index.html"
    },
    {
        id: "mini-dice",
        title: "Dice RPG",
        phase: "phase4",
        description: "ダイスを振って進むすごろくRPG。戦闘、宿屋、トラップ、装備強化を搭載。",
        icon: "🎲",
        path: "mini-dice/public/index.html"
    },
    {
        id: "mini-hex",
        title: "Hex",
        phase: "phase4",
        description: "六角形グリッドを用いた領土拡大ボードゲーム。複製とジャンプを使いこなして盤面を支配しよう。",
        icon: "🛑",
        path: "mini-hex/public/index.html"
    },
    {
        id: "mini-mines",
        title: "Mines",
        phase: "phase4",
        description: "地雷を避けてすべての安全なマスを開ける定番パズル。クリックとフラグを切り替えて慎重に進もう。",
        icon: "💣",
        path: "mini-mines/public/index.html"
    },
    {
        id: "mini-solitaire",
        title: "Solitaire",
        phase: "phase4",
        description: "トランプの定番クロンダイク・ソリティア。AからKへ順番にカードを並べ替えよう。",
        icon: "🃏",
        path: "mini-solitaire/public/index.html"
    },
    // 第5期
    {
        id: "mini-logic",
        title: "Logic",
        phase: "phase5",
        description: "数字のヒントを解き明かしドット絵を完成させるお絵かきロジック（ピクロス）。",
        icon: "🧩",
        path: "mini-logic/public/index.html"
    },
    {
        id: "mini-sudoku",
        title: "Sudoku",
        phase: "phase5",
        description: "定番の9x9数独（ナンプレ）。候補数字を書き込めるメモ機能や関連ハイライトを搭載。",
        icon: "🔢",
        path: "mini-sudoku/public/index.html"
    }
];

function createGameCard(game) {
    const card = document.createElement('a');
    card.href = game.path;
    
    if (game.featured) {
        card.className = 'game-card featured';
        card.innerHTML = `
            <div class="emoji">${game.icon}</div>
            <div class="card-info">
                <h3>${game.title}</h3>
                <p><strong>[MAIN PROJECT]</strong> ${game.description}</p>
            </div>
        `;
    } else {
        card.className = 'game-card';
        card.innerHTML = `
            <div class="emoji">${game.icon}</div>
            <h3>${game.title}</h3>
            <p>${game.description}</p>
        `;
    }
    
    return card;
}

function renderGames(filter = 'all') {
    const grid = document.getElementById('game-grid');
    const featuredContainer = document.getElementById('main-project-container');
    
    // 一旦クリア
    grid.innerHTML = '';
    featuredContainer.innerHTML = '';
    
    // メイン（Featured）は「all」の時のみ上部に表示
    const mainGame = games.find(g => g.featured);
    if (mainGame && (filter === 'all' || filter === 'main')) {
        featuredContainer.appendChild(createGameCard(mainGame));
        featuredContainer.style.display = 'flex';
    } else {
        featuredContainer.style.display = 'none';
    }
    
    // グリッド用ゲームのフィルタリングとレンダリング
    const filteredGames = games.filter(g => !g.featured && (filter === 'all' || g.phase === filter));
    
    filteredGames.forEach(game => {
        grid.appendChild(createGameCard(game));
    });
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // アクティブクラスの切り替え
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 描画
            const filterValue = btn.getAttribute('data-filter');
            renderGames(filterValue);
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    renderGames();
    setupFilters();
});
