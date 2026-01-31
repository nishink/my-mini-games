import { Entity } from './Entity.js';

// プレイヤークラス（HP 20、攻撃力 4、デフォルト絵文字：🙂）
export class Player extends Entity{
  constructor(x,y,opts={}){
    super(x,y, Object.assign({char:'🙂',hp:20,maxHp:20,atk:4,def:0,speed:10}, opts));
    this.inventory = [];
    this.level = 1; this.exp = 0;
  }

  // プレイヤーの行動は入力で駆動（ここは未使用）
  act(){ }
}
