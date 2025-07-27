import type { EventBus } from "../event";

export class PlayerTurnTimer {
  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;
  }

  private eventBus: EventBus;

  // [TODO] set timeout by game strategy
  setTurnTimeout(time = 60) {
    setTimeout(() => {
      this.eventBus.publish('TimeoutOccured', undefined);
    }, time * 1000);
  }
}
