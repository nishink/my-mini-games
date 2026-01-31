// ターン管理クラス：エンティティのキューを速度でソートし、順番に行動を実行
// メソッドは同期的で、メインループに統合される想定
export class TurnManager {
  constructor() {
    this.queue = []; // エンティティの配列
    this.phase = 'idle'; // 'idle' または 'processing'
    this.onTurnStart = null; // ターン開始コールバック
    this.onTurnEnd = null; // ターン終了コールバック
    this.onRoundEnd = null; // ラウンド終了コールバック
  }

  // エンティティをキューに追加（重複防止）
  enqueue(entity) {
    if (!this.queue.includes(entity)) this.queue.push(entity);
  }

  // キューをクリア
  clear() {
    this.queue = [];
  }

  // エンティティをソート（速度が高いほど先に行動）
  buildQueue(entities) {
    this.queue = [...entities].sort((a,b) => (b.speed||0) - (a.speed||0));
  }

  // 1ラウンド実行：キュー内の各エンティティが順番に act(context) を呼ぶ
  // context（プレイヤー、マップ、ユーティリティ関数）を敵のAIに渡す
  processRound(context){
    this.phase = 'processing';
    for (const ent of this.queue) {
      if (this.onTurnStart) this.onTurnStart(ent);
      if (typeof ent.act === 'function') ent.act(context);
      if (this.onTurnEnd) this.onTurnEnd(ent);
    }
    this.phase = 'idle';
    if (this.onRoundEnd) this.onRoundEnd();
  }
}
