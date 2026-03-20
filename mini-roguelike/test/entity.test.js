import { Entity } from '../src/game/Entity.js';

export async function runTests({assert}){
  // エンティティの初期化と基本機能のテスト
  const e = new Entity(2,3,{char:'X',hp:5,atk:2,def:1});
  
  // コンストラクタで正しく初期化されているか確認
  assert.strictEqual(e.x,2);
  assert.strictEqual(e.y,3);
  assert.strictEqual(e.char,'X');
  assert.strictEqual(e.hp,5);
  
  // moveTo()で座標が正しく更新されるか確認
  e.moveTo(4,4);
  assert.strictEqual(e.x,4);
  assert.strictEqual(e.y,4);
  
  // takeDamage()でダメージが正しく計算されるか確認
  e.takeDamage(2);
  assert.strictEqual(e.hp,3);
  
  // isAlive()で生存判定が正しく機能するか確認
  assert.ok(e.isAlive());
  e.takeDamage(10);
  assert.ok(!e.isAlive());
}
