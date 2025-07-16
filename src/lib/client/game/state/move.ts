import type { Move } from "$types";
import type { EventBus } from "../event";

export class MoveStateManager {
  constructor({ eventBus, moves }: { eventBus: EventBus, moves?: Move[] }) {
    this.eventBus = eventBus;
    if (moves !== undefined) {
      this.moveHistory.push(...moves);
    }
  }

  private eventBus: EventBus;
  private moveHistory: Move[] = [];
}
