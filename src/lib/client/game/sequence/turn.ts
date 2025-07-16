import type { EventBus } from "../event";

export class TurnSequencer {
  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;
  }

  private eventBus: EventBus;
}