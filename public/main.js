/*
  Minimal Mini-Roguelike prototype (Vanilla JS)
  - Map: 40x25
  - Player enemy simple combat
  - Turn: player action -> all enemies act
  - Assets: emoji (replaceable by SVG)
*/

const COLS = 40, ROWS = 25;
const MAX_FLOOR = 10;

const gridEl = document.getElementById('grid');
const hpVal = document.getElementById('hpVal');
const floorVal = document.getElementById('floorVal');
const turnVal = document.getElementById('turnVal');
const logEl = document.getElementById('log');
const nextFloorBtn = document.getElementById('nextFloorBtn');

let map = [];
let player = null;
let enemies = [];
let turnCount = 0;
let currentFloor = 1;

// helpers
function rnd(n){ return Math.floor(Math.random()*n); }
function addLog(s){ const p=document.createElement('div'); p.textContent=s; logEl.prepend(p); }

// map gen: border walls + random sparse obstacles
function genMap(){
  map = Array.from({length:ROWS},(_,y)=>Array.from({length:COLS},(_,x)=>{
    if(x===0||y===0||x===COLS-1||y===ROWS-1) return {type:'wall'};
    return {type: Math.random()<0.06 ? 'wall' : 'floor'};
  }));
  // clear an open area near center for player start
  const cx = Math.floor(COLS/2), cy = Math.floor(ROWS/2);
  for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++) map[cy+dy][cx+dx]={type:'floor'};
  return map;
}

function placeEntityRandom(type){
  let x,y;
  do{
    x = rnd(COLS); y = rnd(ROWS);
  } while(map[y][x].type !== 'floor' || (player && x===player.x && y===player.y) || enemies.some(e=>e.x===x&&e.y===y));
  if(type==='player'){
    player = {x,y,hp:20,maxHp:20,atk:4,def:0,char:'🙂'};
  } else {
    enemies.push({x,y,hp:6,atk:2,char:'👾',ai:'basic'});
  }
}

function spawnFloor(floor){
  genMap();
  enemies = [];
  if(!player) placeEntityRandom('player');
  const enemyCount = Math.min(8, 2 + Math.floor(floor*1.2));
  for(let i=0;i<enemyCount;i++) placeEntityRandom('enemy');
  let sx,sy;
  do { sx = rnd(COLS); sy = rnd(ROWS); } while(map[sy][sx].type!=='floor' || (player&&player.x===sx&&player.y===sy));
  map[sy][sx].type='stairs';
  currentFloor = floor;
  turnCount = 0;
  updateHUD();
  render();
  addLog(`フロア ${floor} に突入。敵 ${enemies.length} 匹出現`);
}

// renderer
function render(){
  gridEl.innerHTML = '';
  for(let y=0;y<ROWS;y++){
    for(let x=0;x<COLS;x++){
      const cell = document.createElement('div');
      cell.className='cell';
      const t = map[y][x].type;
      if(t==='wall') cell.classList.add('wall');
      if(t==='stairs') cell.classList.add('stairs');
      cell.dataset.x = x; cell.dataset.y = y;
      const e = enemies.find(en=>en.x===x&&en.y===y);
      if(player && player.x===x && player.y===y){
        cell.textContent = player.char;
      } else if(e){
        cell.textContent = e.char;
      } else if(t==='stairs'){
        cell.textContent = '⬆️';
      } else {
        cell.textContent = '';
      }
      cell.addEventListener('click', ()=> onCellClick(x,y));
      gridEl.appendChild(cell);
    }
  }
}

function updateHUD(){
  hpVal.textContent = `${player.hp}/${player.maxHp}`;
  floorVal.textContent = `${currentFloor}`;
  turnVal.textContent = `${turnCount}`;
}

// movement and combat
function isWalkable(x,y){
  if(x<0||x>=COLS||y<0||y>=ROWS) return false;
  return map[y][x].type !== 'wall';
}

function getEnemyAt(x,y){ return enemies.find(e=>e.x===x&&e.y===y); }

function playerMoveTo(x,y){
  if(!isWalkable(x,y)) return;
  const enemy = getEnemyAt(x,y);
  if(enemy){
    attack(player, enemy);
    if(enemy.hp<=0){
      addLog('敵を倒した！');
      enemies = enemies.filter(en=>en!==enemy);
      checkFloorClear();
    } else {
      attack(enemy, player);
      if(player.hp<=0){ gameOver(); return; }
    }
  } else {
    player.x = x; player.y = y;
    if(map[y][x].type === 'stairs' && enemies.length===0){
      nextFloorBtn.style.display='block';
    }
  }
  turnCount++;
  updateHUD();
  render();
  setTimeout(() => enemiesAct(), 120);
}

function attack(attacker, defender){
  const dmg = Math.max(1, attacker.atk - (defender.def||0));
  defender.hp -= dmg;
  addLog(`${attacker===player ? 'あなた' : '敵'} の攻撃: ${dmg} ダメージ`);
}

function enemiesAct(){
  for(const e of [...enemies]){
    if(e.hp<=0) continue;
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if((adx+ady)===1){
      attack(e, player);
      addLog('敵に攻撃された！');
      if(player.hp<=0){ gameOver(); return; }
    } else {
      const stepX = dx===0?0:(dx>0?1:-1);
      const stepY = dy===0?0:(dy>0?1:-1);
      let nx = e.x, ny = e.y;
      if(adx>=ady && isWalkable(e.x+stepX,e.y) && !occupied(e.x+stepX,e.y)){
        nx = e.x+stepX;
      } else if(isWalkable(e.x,e.y+stepY) && !occupied(e.x,e.y+stepY)){
        ny = e.y+stepY;
      } else {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        const r = dirs[rnd(dirs.length)];
        if(isWalkable(e.x+r[0], e.y+r[1]) && !occupied(e.x+r[0], e.y+r[1])){
          nx = e.x+r[0]; ny = e.y+r[1];
        }
      }
      e.x = nx; e.y = ny;
    }
  }
  turnCount++;
  updateHUD();
  render();
  checkFloorClear();
}

function occupied(x,y){
  if(player.x===x && player.y===y) return true;
  return enemies.some(en=>en.x===x&&en.y===y);
}

function onCellClick(x,y){
  const dist = Math.abs(player.x-x)+Math.abs(player.y-y);
  if(dist===1) playerMoveTo(x,y);
}

function onKey(e){
  const key = e.key;
  let dx=0, dy=0;
  if(key==='ArrowUp' || key==='w' || key==='W') dy=-1;
  if(key==='ArrowDown' || key==='s' || key==='S') dy=1;
  if(key==='ArrowLeft' || key==='a' || key==='A') dx=-1;
  if(key==='ArrowRight' || key==='d' || key==='D') dx=1;
  if(dx!==0||dy!==0){
    const nx = player.x+dx, ny = player.y+dy;
    playerMoveTo(nx,ny);
  }
}

function checkFloorClear(){
  if(enemies.length===0){
    addLog('この階の敵を全て倒した！ 階段が現れました。');
    nextFloorBtn.style.display='block';
  }
}

function nextFloor(){
  if(currentFloor>=MAX_FLOOR){
    addLog('ダンジョンを制覇しました！ スコア表示（ターン:' + turnCount + '）');
    nextFloorBtn.style.display='none';
    alert('クリア！ スコア: ターン ' + turnCount);
    location.reload();
    return;
  }
  spawnFloor(currentFloor+1);
  nextFloorBtn.style.display='none';
}

function gameOver(){
  addLog('あなたは倒れた。ゲームオーバー。');
  alert('ゲームオーバー。スコア: フロア ' + currentFloor + ' / ターン ' + turnCount);
  location.reload();
}

document.getElementById('touchControls').addEventListener('click', (ev)=>{
  const dir = ev.target.dataset.dir;
  if(!dir) return;
  const [dx,dy] = dir.split(',').map(Number);
  playerMoveTo(player.x+dx, player.y+dy);
});

nextFloorBtn.addEventListener('click', nextFloor);
window.addEventListener('keydown', onKey);

spawnFloor(1);
