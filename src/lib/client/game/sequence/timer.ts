import type { EventBus } from "../event";

export class PlayerTurnTimer {
  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;
  }

  private eventBus: EventBus;
}