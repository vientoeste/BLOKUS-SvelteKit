import type { SlotIdx } from "$types";
import type { EventBus } from "../event";

export class PlayerTurnTimer {
  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;
  }

  private eventBus: EventBus;

  // [TODO] set timeout by game strategy
  setTurnTimeout({ time = 60000, slotIdx, turn }: { time?: number, slotIdx: SlotIdx, turn: number }) {
    setTimeout(() => {
      this.eventBus.publish('TimeoutOccured', { slotIdx, turn });
    }, time);
  }
}
