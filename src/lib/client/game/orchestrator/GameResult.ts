import type { EventBus } from "../event";

export class GameResultOrchestrator {
  private eventBus: EventBus;

  constructor({
    eventBus,
  }: {
    eventBus: EventBus;
  }) {
    this.eventBus = eventBus;

    this.eventBus.subscribe('MessageReceived_ScoreConfirmation', (event) => {
      // [TODO] mark game as ended
      // [TODO] calculate score
      // [TODO] dispatch score confirm
    });
  }
}
