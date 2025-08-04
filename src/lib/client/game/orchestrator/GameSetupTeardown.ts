import type { EventBus } from "../event";
import type { GameStateManager } from "../state/game";

/**
 * Orchestrates the setup and teardown phases of a game session.
 *
 * @description
 * This class manages the lifecycle boundaries of a game by handling its initial setup and final teardown.
 * It listens for events that mark the beginning and end of a game and updates the relevant state.
 * This orchestrator is specifically not responsible for game process logics, like turn or in-game action.
 */
export class GameSetupTeardownOrchestrator {
  private eventBus: EventBus;
  private gameStateManager: GameStateManager;

  constructor({
    eventBus,
    gameStateManager,
  }: {
    eventBus: EventBus;
    gameStateManager: GameStateManager;
  }) {
    this.eventBus = eventBus;
    this.gameStateManager = gameStateManager;

    this.eventBus.subscribe('MessageReceived_Start', (event) => {
      const { activePlayerCount, gameId } = event.payload;
      this.gameStateManager.initialize({ activePlayerCount, gameId });
    });

    this.eventBus.subscribe('MessageReceived_GameEnd', () => {
      this.gameStateManager.reset();
    });
  }
}
