import { TurnManager } from '../src/game/TurnManager.js';
import { Entity } from '../src/game/Entity.js';

export async function runTests({assert}){
  const tm = new TurnManager();
  const a = new Entity(0,0,{speed:5});
  const b = new Entity(1,1,{speed:10});
  const c = new Entity(2,2,{speed:3});
  tm.buildQueue([a,b,c]);
  // queue should be sorted by speed desc: b,a,c
  assert.strictEqual(tm.queue[0], b);
  assert.strictEqual(tm.queue[1], a);
  assert.strictEqual(tm.queue[2], c);
}
