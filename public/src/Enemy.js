import { Entity } from './Entity.js';
export class Enemy extends Entity{
  constructor(x,y,opts={}){
    super(x,y, Object.assign({char:'👾',hp:6,atk:2,def:0,speed:5}, opts));
    this.ai = opts.ai || 'basic';
  }
  act(context){
    if(!context || !context.player) return;
    const p = context.player;
    const dx = p.x - this.x; const dy = p.y - this.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if(dist === 1){
      p.takeDamage(Math.max(1, this.atk - (p.def||0)));
    } else {
      const stepX = dx===0?0:(dx>0?1:-1);
      const stepY = dy===0?0:(dy>0?1:-1);
      if(context.isWalkable(this.x+stepX,this.y) && !context.occupied(this.x+stepX,this.y)){
        this.moveTo(this.x+stepX, this.y);
      } else if(context.isWalkable(this.x,this.y+stepY) && !context.occupied(this.x,this.y+stepY)){
        this.moveTo(this.x, this.y+stepY);
      } else {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        const r = dirs[Math.floor(Math.random()*dirs.length)];
        if(context.isWalkable(this.x+r[0], this.y+r[1]) && !context.occupied(this.x+r[0], this.y+r[1])){
          this.moveTo(this.x+r[0], this.y+r[1]);
        }
      }
    }
  }
}
