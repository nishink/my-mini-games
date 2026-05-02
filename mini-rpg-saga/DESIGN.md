# Mini RPG Saga - 統合設計書

これまで作成した「RPGコンポーネント・シリーズ」を統合し、一つの冒険物語として構築するメインプロジェクト。

## プロジェクト方針
- **統合**: 独立していた「Hero」「Loot」「Battle」「Quest」を一つのデータ基盤で繋ぐ。
- **軽量**: 各コンポーネントの良さを活かしつつ、シンプルで遊びやすいRPGを目指す。
- **拡張性**: 後の段階で他のミニゲームをサブ要素として取り込める構造にする。

## 開発ロードマップ

### 第1段階：基盤の構築 (Foundation) ✅完了
- [x] **GlobalState**: プレイヤーの能力、所持品、フラグを管理する統合データクラス。
- [x] **SaveManager**: LocalStorageを使用したセーブ＆ロード機能。
- [x] **SceneManager**: タイトル、街、ダンジョン、バトルを切り替える基盤。
- [x] **Input System**: キーボードおよびモバイル用仮想コントローラーのサポート。

### 第2段階：冒険の始まり (Town & Story) ✅完了
- [x] **Town Scene**: プレイヤーが移動し、NPCと会話できる拠点。
- [x] **Dialogue System**: メッセージウィンドウとタイプライター演出、タップ/クリック送り。
- [x] **Mobile Optimization**: レスポンシブレイアウトと仮想パッドの実装。
- [x] **Shop System**: アイテムの売買。
- [x] **Menu System**: ステータス確認と装備変更。

### 第3段階：試練の迷宮 (Dungeon & Battle) ✅完了
- [x] **Dungeon Scene**: 敵と遭遇する探索エリア。
- [x] **Integrated Battle**: GlobalStateからステータスを読み込んで戦うバトルシーン。
- [x] **Reward Loop**: 勝利後の経験値獲得とルート取得の自動連携。

### 第4段階：仕上げと拡張 (Polishing & Extras) ✅完了
- [x] **World Map**: エリア選択。
- [x] **Visual Polish**: エフェクト、BGM、SE。
- [x] **Mini-game Integration**: 特定のイベントでのミニゲーム挿入。

## 技術スタック
- 言語: JavaScript (ES Modules)
- 基盤: オリジナル・シーン管理システム
- 描画: DOM / CSS / Canvas (シーンにより使い分け)

## データ構造イメージ (GlobalState)
```javascript
{
    player: {
        level: 1,
        stats: { str, dex, int, vit },
        exp: 0,
        hp: 100,
        mp: 50
    },
    inventory: [],
    equipment: { weapon, armor, accessory },
    flags: {
        metKing: false,
        defeatedBoss: false
    }
}
```
