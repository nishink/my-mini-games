const games = [
    {
        title: "Mini Action",
        genre: "2D Action",
        description: "ジャンプとショットで進む横スクロールアクション。ランダム生成される地形を攻略しよう。",
        icon: "🏃‍♂️",
        path: "mini-action/public/index.html",
        color: "#4CAF50"
    },
    {
        title: "Mini Roguelike",
        genre: "Roguelike",
        description: "ターン制の探索型RPG。マップ生成と装備システムを備えた硬派な冒険。",
        icon: "⚔️",
        path: "mini-roguelike/public/index.html",
        color: "#FF5722"
    },
    {
        title: "Mini Snake",
        genre: "Classic Arcade",
        description: "エサを食べて伸びる古典的なスネークゲーム。自分の体にぶつからないように慎重に操作。",
        icon: "🐍",
        path: "mini-snake/public/index.html",
        color: "#8BC34A"
    },
    {
        title: "Mini SHMUP",
        genre: "Shooting",
        description: "迫り来る敵を撃ち落とす縦スクロールシューティング。マウスやタッチでも快適に操作可能。",
        icon: "🚀",
        path: "mini-shmup/public/index.html",
        color: "#2196F3"
    },
    {
        title: "Mini Sokoban",
        genre: "Puzzle",
        description: "荷物を指定の場所に運ぶパズルゲーム。限られたスペースで効率的な手順を見つけ出そう。",
        icon: "📦",
        path: "mini-sokoban/public/index.html",
        color: "#FFC107"
    },
    {
        title: "Mini Clicker",
        genre: "Idle Game",
        description: "クリックしてポイントを貯め、施設を買ってインフレを楽しむ放置ゲーム。目指せ億万長者。",
        icon: "💎",
        path: "mini-clicker/public/index.html",
        color: "#E91E63"
    },
    {
        title: "Mini Defense",
        genre: "Tower Defense",
        description: "攻めてくる敵を砲台で迎え撃つ戦略ゲーム。3種類のタワーを使い分けて拠点を守り抜こう。",
        icon: "🏰",
        path: "mini-defense/public/index.html",
        color: "#9C27B0"
    }
];

function createGameCard(game) {
    const card = document.createElement('a');
    card.href = game.path;
    card.className = 'game-card';
    
    card.innerHTML = `
        <div class="card-thumbnail" style="background: radial-gradient(circle at center, ${game.color}33 0%, #1a1a1a 100%)">
            <div class="icon-container">${game.icon}</div>
        </div>
        <div class="card-content">
            <span class="genre-tag">${game.genre}</span>
            <h2>${game.title}</h2>
            <p>${game.description}</p>
            <div class="card-footer">PLAY NOW</div>
        </div>
    `;
    
    return card;
}

window.addEventListener('load', () => {
    const grid = document.getElementById('game-grid');
    games.forEach(game => {
        grid.appendChild(createGameCard(game));
    });
});
