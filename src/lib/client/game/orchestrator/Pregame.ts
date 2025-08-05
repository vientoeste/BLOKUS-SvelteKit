import { EventBus } from "../event";
import type { PlayerStateManager } from "../state/player";

/**
 * Orchestrates the participants' join, leave, ready, ...etc before starting the game. 
 */
export class PregameOrchestrator {
  private eventBus: EventBus;
  private playerStateManager: PlayerStateManager;

  constructor({
    eventBus,
    playerStateManager,
  }: {
    eventBus: EventBus;
    playerStateManager: PlayerStateManager;
  }) {
    this.eventBus = eventBus;
    this.playerStateManager = playerStateManager;

    this.eventBus.subscribe('MessageReceived_CancelReady', (event) => {
      const { playerIdx } = event.payload;
      this.playerStateManager.updateReadyState({
        playerIdx,
        ready: false,
      });
    });

    this.eventBus.subscribe('MessageReceived_Connected', (event) => {
      const { id, username, playerIdx } = event.payload;
      this.playerStateManager.addPlayer({
        id,
        username,
        playerIdx,
        ready: false,
      });
    });

    this.eventBus.subscribe('MessageReceived_Ready', (event) => {
      const { playerIdx } = event.payload;
      this.playerStateManager.updateReadyState({
        playerIdx,
        ready: true,
      });
    });

    this.eventBus.subscribe('MessageReceived_Leave', (event) => {
      const { playerIdx } = event.payload;
      this.playerStateManager.removePlayerByIdx(playerIdx);
    });
  }
}
