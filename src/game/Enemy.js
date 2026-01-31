import { Entity } from './Entity.js';

export class Enemy extends Entity{
  constructor(x,y,opts={}){
    super(x,y, Object.assign({char:'👾',hp:6,atk:2,def:0,speed:5}, opts));
    this.ai = opts.ai || 'basic';
  }

  act(context){
    // basic AI: move towards player if not adjacent, else attack
    if(!context || !context.player) return;
    const p = context.player;
    const dx = p.x - this.x; const dy = p.y - this.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if(dist === 1){
      // attack: simple damage
      p.takeDamage(Math.max(1, this.atk - (p.def||0)));
    } else {
      const stepX = dx===0?0:(dx>0?1:-1);
      const stepY = dy===0?0:(dy>0?1:-1);
      // try horizontal then vertical
      if(context.isWalkable(this.x+stepX,this.y) && !context.occupied(this.x+stepX,this.y)){
        this.moveTo(this.x+stepX, this.y);
      } else if(context.isWalkable(this.x,this.y+stepY) && !context.occupied(this.x,this.y+stepY)){
        this.moveTo(this.x, this.y+stepY);
      }
    }
  }
}
