export class TurnManager {
  constructor(){
    this.queue = [];
    this.phase = 'idle';
    this.onTurnStart = null; this.onTurnEnd = null; this.onRoundEnd = null;
  }
  enqueue(entity){ if(!this.queue.includes(entity)) this.queue.push(entity); }
  clear(){ this.queue = []; }
  buildQueue(entities){ this.queue = [...entities].sort((a,b) => (b.speed||0) - (a.speed||0)); }
  // process a full round; pass context for AI
  processRound(context){
    this.phase = 'processing';
    for(const ent of this.queue){
      if(this.onTurnStart) this.onTurnStart(ent);
      if(typeof ent.act === 'function') ent.act(context);
      if(this.onTurnEnd) this.onTurnEnd(ent);
    }
    this.phase = 'idle';
    if(this.onRoundEnd) this.onRoundEnd();
  }
}
