import type { Move } from "$types";
import type { EventBus } from "../event";

export class MoveStateManager {
  constructor({ eventBus, moves }: { eventBus: EventBus, moves?: Move[] }) {
    this.eventBus = eventBus;
    if (moves !== undefined) {
      this.moveHistory.push(...moves);
    }

    this.eventBus.subscribe('MoveApplied', (event) => {
      this.moveHistory.push({ ...event.payload, exhausted: false, timeout: false });
    });
  }

  private eventBus: EventBus;
  private moveHistory: Move[] = [];
}
