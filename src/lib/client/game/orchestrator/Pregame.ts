import type { IParticipantManager } from "../application/ports";
import { EventBus } from "../event";

/**
 * Orchestrates the participants' join, leave, ready, ...etc before starting the game. 
 */
export class PregameOrchestrator {
  private eventBus: EventBus;
  private participantManager: IParticipantManager;

  constructor({
    eventBus,
    participantManager,
  }: {
    eventBus: EventBus;
    participantManager: IParticipantManager;
  }) {
    this.eventBus = eventBus;
    this.participantManager = participantManager;

    this.eventBus.subscribe('MessageReceived_CancelReady', (event) => {
      const { playerIdx } = event.payload;
      this.participantManager.updateReadyState({
        playerIdx,
        ready: false,
      });
    });

    this.eventBus.subscribe('MessageReceived_Connected', (event) => {
      const { id, username, playerIdx } = event.payload;
      this.participantManager.addPlayer({
        id,
        username,
        playerIdx,
        ready: false,
      });
    });

    this.eventBus.subscribe('MessageReceived_Ready', (event) => {
      const { playerIdx } = event.payload;
      this.participantManager.updateReadyState({
        playerIdx,
        ready: true,
      });
    });

    this.eventBus.subscribe('MessageReceived_Leave', (event) => {
      const { playerIdx } = event.payload;
      this.participantManager.removePlayerByIdx(playerIdx);
    });
  }
}
