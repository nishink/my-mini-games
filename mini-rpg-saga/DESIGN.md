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

### 第5段階：王都の繁栄 (Royal Capital) ✅完了
- [x] **Castle Town**: 広大な王都のマップ実装（複数の施設）。
- [x] **Advanced Shop**: 強力な装備品と魔法アイテムの追加。
- [x] **Quest System**: 王様からの依頼（フラグ管理の深化）。
- [x] **Character Growth**: ステータスポイントによる自由な成長要素。

### 第6段階：決戦の刻 (Final Battle) ✅完了
- [x] **Demon King's Castle**: 最終ダンジョンの実装。
- [x] **Boss Mechanics**: 特殊な行動パターンを持つボスバトル。
- [x] **Ending**: 冒険の結末とスタッフロール。

### 第7段階：魔法と安らぎ (Magic & Recovery) ✅完了
- [x] **Recovery Facilities**: 宿屋（始まりの村）や回復の泉（魔王城）の実装。
- [x] **Magic System**: MPを消費して放つ強力な魔法（攻撃・回復）の導入。移動中の回復魔法使用にも対応。
- [x] **Skill Progression**: レベルアップに伴う新魔法の習得。

### 残っている不具合・改善点 ✅完了
- [x] 戦闘中に魔法を使うと、ヒールを唱えてしまう。使う魔法を選べるようにしたい。
- [x] 戦闘中に道具を使えるようにしたい。
- [x] 防御はできなくてよい。
- [x] 試練の洞窟で宝石を取ると、「試練の洞窟に入った」と表示されてしまう。
- [x] 魔王城の泉が表示されていない。泉があるとわかるように表示してほしい。
- [x] 魔王城で移動中、魔王のいる場所に宝石が表示される。魔王を表示してほしい。

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
