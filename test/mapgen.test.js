import { generateMap } from '../src/game/MapGen.js';

export async function runTests({assert}){
  // basic shape test
  const cols = 40, rows = 25;
  const map = generateMap(cols, rows);
  assert.ok(Array.isArray(map), 'map should be array');
  assert.strictEqual(map.length, rows, 'map rows');
  assert.strictEqual(map[0].length, cols, 'map cols');
  // border walls
  for(let x=0;x<cols;x++){
    assert.strictEqual(map[0][x].type, 'wall', 'top border wall');
    assert.strictEqual(map[rows-1][x].type, 'wall', 'bottom border wall');
  }
  for(let y=0;y<rows;y++){
    assert.strictEqual(map[y][0].type, 'wall', 'left border wall');
    assert.strictEqual(map[y][cols-1].type, 'wall', 'right border wall');
  }
}
