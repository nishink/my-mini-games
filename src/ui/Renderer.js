// Minimal renderer helpers for SVG/DOM; public/main.js currently handles DOM rendering.
export const Renderer = {
  // placeholder: when integrating, call renderMap and renderEntities
  renderMap(containerEl, map){
    containerEl.innerHTML = '';
    const rows = map.length, cols = map[0].length;
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const cell = document.createElement('div');
        cell.className = 'cell';
        const t = map[y][x].type;
        if(t==='wall') cell.classList.add('wall');
        if(t==='stairs') cell.classList.add('stairs');
        cell.dataset.x = x; cell.dataset.y = y;
        containerEl.appendChild(cell);
      }
    }
  }
}

// Add convenience renderer used by public/main.js
Renderer.renderGrid = function(container, map, player, enemies){
  container.innerHTML = '';
  const rows = map.length, cols = map[0].length;
  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      const t = map[y][x].type;
      if(t==='wall') cell.classList.add('wall');
      if(t==='stairs') cell.classList.add('stairs');
      cell.dataset.x = x; cell.dataset.y = y;
      const e = (enemies||[]).find(en=>en.x===x&&en.y===y);
      if(player && player.x===x && player.y===y){
        cell.textContent = player.char;
      } else if(e){
        cell.textContent = e.char;
      } else if(t==='stairs'){
        cell.textContent = '⬆️';
      } else {
        cell.textContent = '';
      }
      container.appendChild(cell);
    }
  }
};
