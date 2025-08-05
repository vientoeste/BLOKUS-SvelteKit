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
  }
}
