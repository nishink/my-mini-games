import { generateMap } from '../public/src/game/MapGen.js';

export async function runTests({assert}){
  // マップ生成のテスト：基本的な形状とボーダー壁の検証
  const cols = 40, rows = 25;
  const map = generateMap(cols, rows);
  
  // マップが配列であり、指定のサイズで生成されているか確認
  assert.ok(Array.isArray(map), 'map should be array');
  assert.strictEqual(map.length, rows, 'map rows');
  assert.strictEqual(map[0].length, cols, 'map cols');
  
  // ボーダー壁が正しく配置されているか確認（上下）
  for(let x=0;x<cols;x++){
    assert.strictEqual(map[0][x].type, 'wall', 'top border wall');
    assert.strictEqual(map[rows-1][x].type, 'wall', 'bottom border wall');
  }
  
  // ボーダー壁が正しく配置されているか確認（左右）
  for(let y=0;y<rows;y++){
    assert.strictEqual(map[y][0].type, 'wall', 'left border wall');
    assert.strictEqual(map[y][cols-1].type, 'wall', 'right border wall');
  }
}
