import { Entity } from './Entity.js';

// 敵クラス（HP 5、攻撃力 2、基本的なAIロジック搭載、デフォルト絵文字：👾）
export class Enemy extends Entity{
  constructor(x,y,opts={}){
    super(x,y, Object.assign({char:'👾',hp:5,atk:2,def:0,speed:5}, opts));
    this.ai = opts.ai || 'basic';
  }

  // 敵のAI行動：プレイヤーに追跡・隣接時は攻撃
  act(context){
    if(!context || !context.player) return;
    const p = context.player;
    const dx = p.x - this.x; const dy = p.y - this.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if(dist === 1){
      // プレイヤーに隣接：攻撃
      p.takeDamage(Math.max(1, this.atk - (p.def||0)));
    } else {
      // プレイヤーへ移動
      const stepX = dx===0?0:(dx>0?1:-1);
      const stepY = dy===0?0:(dy>0?1:-1);
      // 水平移動が優先、不可なら垂直移動
      if(context.isWalkable(this.x+stepX,this.y) && !context.occupied(this.x+stepX,this.y)){
        this.moveTo(this.x+stepX, this.y);
      } else if(context.isWalkable(this.x,this.y+stepY) && !context.occupied(this.x,this.y+stepY)){
        this.moveTo(this.x, this.y+stepY);
      } else {
        // 両方不可な場合は無作為に移動
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        const r = dirs[Math.floor(Math.random()*dirs.length)];
        if(context.isWalkable(this.x+r[0], this.y+r[1]) && !context.occupied(this.x+r[0], this.y+r[1])){
          this.moveTo(this.x+r[0], this.y+r[1]);
        }
      }
    }
  }
}
