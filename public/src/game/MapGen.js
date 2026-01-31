// マップ生成：ボーダー壁 + ランダム障害物
export function generateMap(cols = 40, rows = 25, seed = null) {
  // seed は現在未使用; 決定的な生成が必要な場合は後で実装可能
  const map = Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => {
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) return { type: 'wall' };
      return { type: Math.random() < 0.06 ? 'wall' : 'floor' };
    })
  );
  // 中央エリアをクリア（プレイヤー初期配置用）
  const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    if (map[cy + dy] && map[cy + dy][cx + dx]) map[cy + dy][cx + dx] = { type: 'floor' };
  }
  return map;
}
