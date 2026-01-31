import { Entity } from '../src/game/Entity.js';

export async function runTests({assert}){
  const e = new Entity(2,3,{char:'X',hp:5,atk:2,def:1});
  assert.strictEqual(e.x,2);
  assert.strictEqual(e.y,3);
  assert.strictEqual(e.char,'X');
  assert.strictEqual(e.hp,5);
  e.moveTo(4,4);
  assert.strictEqual(e.x,4);
  assert.strictEqual(e.y,4);
  e.takeDamage(2);
  assert.strictEqual(e.hp,3);
  assert.ok(e.isAlive());
  e.takeDamage(10);
  assert.ok(!e.isAlive());
}
