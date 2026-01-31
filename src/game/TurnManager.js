// Simple TurnManager class for managing turn phases.
// Methods are synchronous and intended to be integrated with the main loop.
export class TurnManager {
  constructor() {
    this.queue = []; // array of entities
    this.phase = 'idle';
    this.onTurnStart = null; // callbacks
    this.onTurnEnd = null;
    this.onRoundEnd = null;
  }

  enqueue(entity) {
    if (!this.queue.includes(entity)) this.queue.push(entity);
  }

  clear() {
    this.queue = [];
  }

  // Sort by speed descending (higher speed acts first)
  buildQueue(entities) {
    this.queue = [...entities].sort((a,b) => (b.speed||0) - (a.speed||0));
  }

  // Process one full round: call act() on each entity in queue
  processRound() {
    this.phase = 'processing';
    for (const ent of this.queue) {
      if (this.onTurnStart) this.onTurnStart(ent);
      if (typeof ent.act === 'function') ent.act();
      if (this.onTurnEnd) this.onTurnEnd(ent);
    }
    this.phase = 'idle';
    if (this.onRoundEnd) this.onRoundEnd();
  }
}
