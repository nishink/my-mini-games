// Base entity class
export class Entity {
  constructor(x=0,y=0,opts={}){
    this.id = opts.id || Math.random().toString(36).slice(2,9);
    this.x = x; this.y = y;
    this.char = opts.char || '?';
    this.hp = opts.hp || 1;
    this.maxHp = opts.maxHp || this.hp;
    this.atk = opts.atk || 1;
    this.def = opts.def || 0;
    this.speed = opts.speed || 0;
    this.blocks = opts.blocks !== undefined ? opts.blocks : true;
  }

  moveTo(nx, ny){ this.x = nx; this.y = ny; }
  takeDamage(n){ this.hp -= n; }
  isAlive(){ return this.hp > 0; }
  // default act: do nothing
  act(){ }
}
