import type { Move } from "$types";
import type { EventBus } from "../event";

export class MoveStateManager {
  private eventBus: EventBus;
  private moveHistory: Move[] = [];

  constructor({ eventBus, moves }: { eventBus: EventBus, moves?: Move[] }) {
    this.eventBus = eventBus;
    if (moves !== undefined) {
      this.moveHistory.push(...moves);
    }

    this.eventBus.subscribe('MoveApplied', (event) => {
      this.addMoveToHistory({ ...event.payload, exhausted: false, timeout: false });
    });
  }

  addMoveToHistory(move: Move) {
    this.moveHistory.push(move);
  }
}
