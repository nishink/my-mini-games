import { TurnManager } from '../public/src/game/TurnManager.js';
import { Entity } from '../public/src/game/Entity.js';

export async function runTests({assert}){
  // ターンマネージャーのキューソート機能をテスト
  const tm = new TurnManager();
  
  // 異なる速度を持つ3つのエンティティを作成
  const a = new Entity(0,0,{speed:5});
  const b = new Entity(1,1,{speed:10});
  const c = new Entity(2,2,{speed:3});
  
  // buildQueue() で速度の降順にソートされるか確認
  // 期待される順序：b(速度10) → a(速度5) → c(速度3)
  tm.buildQueue([a,b,c]);
  assert.strictEqual(tm.queue[0], b);
  assert.strictEqual(tm.queue[1], a);
  assert.strictEqual(tm.queue[2], c);
}
