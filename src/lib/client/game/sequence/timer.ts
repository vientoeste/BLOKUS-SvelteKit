import type { SlotIdx } from "$types";
import type { EventBus } from "../event";

export class PlayerTurnTimer {
  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;
  }

  private eventBus: EventBus;

  // [TODO] set timeout by game strategy
  setTurnTimeout({ time = 60000, slotIdx }: { time?: number, slotIdx: SlotIdx }) {
    setTimeout(() => {
      this.eventBus.publish('TimeoutOccured', { slotIdx });
    }, time);
  }
}
