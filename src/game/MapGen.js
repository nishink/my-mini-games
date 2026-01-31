// Simple MapGen for prototype: border walls + random obstacles + stairs
export function generateMap(cols = 40, rows = 25, seed = null) {
  // seed currently unused; deterministic option can be added later
  const map = Array.from({length: rows}, (_, y) =>
    Array.from({length: cols}, (_, x) => {
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) return { type: 'wall' };
      return { type: Math.random() < 0.06 ? 'wall' : 'floor' };
    })
  );
  // clear center area
  const cx = Math.floor(cols/2), cy = Math.floor(rows/2);
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    if (map[cy+dy] && map[cy+dy][cx+dx]) map[cy+dy][cx+dx] = { type: 'floor' };
  }
  return map;
}
