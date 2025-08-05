import type { EventBus } from "../event";
import type { BlockStateManager } from "../state/block";
import type { BoardStateManager } from "../state/board";
import type { GameStateManager } from "../state/game";
import type { PlayerStateManager } from "../state/player";
import type { SlotStateManager } from "../state/slot";

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
  private blockStateManager: BlockStateManager;
  private playerStateManager: PlayerStateManager;
  private boardStateManager: BoardStateManager;
  private slotStateManager: SlotStateManager;

  constructor({
    eventBus,
    gameStateManager,
    blockStateManager,
    playerStateManager,
    boardStateManager,
    slotStateManager,
  }: {
    eventBus: EventBus;
    gameStateManager: GameStateManager;
    blockStateManager: BlockStateManager;
    playerStateManager: PlayerStateManager;
    boardStateManager: BoardStateManager;
    slotStateManager: SlotStateManager;
  }) {
    this.eventBus = eventBus;
    this.gameStateManager = gameStateManager;
    this.blockStateManager = blockStateManager;
    this.playerStateManager = playerStateManager;
    this.boardStateManager = boardStateManager;
    this.slotStateManager = slotStateManager;

    this.eventBus.subscribe('MessageReceived_Start', (event) => {
      const { activePlayerCount, gameId } = event.payload;
      this.gameStateManager.initialize({ activePlayerCount, gameId });
      this.playerStateManager.initializeClientSlots();
      this.blockStateManager.initialize(this.playerStateManager.getClientSlots());
      this.boardStateManager.initializeBoard();
      this.eventBus.publish('GameStateInitialized', undefined);
    });

    this.eventBus.subscribe('MessageReceived_GameEnd', () => {
      // [TODO] teardown board, block, ...
      this.gameStateManager.reset();
      this.eventBus.publish('GameStateReset', undefined);
    });
  }
}
