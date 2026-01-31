import { Entity } from './Entity.js';

export class Player extends Entity{
  constructor(x,y,opts={}){
    super(x,y, Object.assign({char:'🙂',hp:20,maxHp:20,atk:4,def:0,speed:10}, opts));
    this.inventory = [];
    this.level = 1; this.exp = 0;
  }

  act(){
    // Player act is driven by input; kept placeholder here
  }
}
