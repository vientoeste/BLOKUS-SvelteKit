import { createNewBoard, getBlockMatrix, placeBlock } from "$lib/game/core";
import type { InboundStartMessage } from "$types";
import type { EventBus } from "../event";
import type { BlockStateManager } from "../state/block";
import type { BoardStateManager } from "../state/board";
import type { GameStateManager } from "../state/game";
import type { MoveStateManager } from "../state/move";
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
  private moveStateManager: MoveStateManager;

  constructor({
    eventBus,
    gameStateManager,
    blockStateManager,
    playerStateManager,
    boardStateManager,
    slotStateManager,
    moveStateManager,
  }: {
    eventBus: EventBus;
    gameStateManager: GameStateManager;
    blockStateManager: BlockStateManager;
    playerStateManager: PlayerStateManager;
    boardStateManager: BoardStateManager;
    slotStateManager: SlotStateManager;
    moveStateManager: MoveStateManager;
  }) {
    this.eventBus = eventBus;
    this.gameStateManager = gameStateManager;
    this.blockStateManager = blockStateManager;
    this.playerStateManager = playerStateManager;
    this.boardStateManager = boardStateManager;
    this.slotStateManager = slotStateManager;
    this.moveStateManager = moveStateManager;

    this.eventBus.subscribe('MessageReceived_Start', (event) => {
      const { activePlayerCount, gameId } = event.payload;
      this.gameStateManager.initialize({ activePlayerCount, gameId });
      this.playerStateManager.initializeClientSlots();
      this.blockStateManager.initialize(this.playerStateManager.getClientSlots());
      this.boardStateManager.initializeBoard();
      this.eventBus.publish('GameStateInitialized', undefined);
    });

    this.eventBus.subscribe('MessageReceived_GameEnd', () => {
      this.gameStateManager.reset();
      this.boardStateManager.initializeBoard();
      this.blockStateManager.reset();
      this.slotStateManager.reset();
      this.eventBus.publish('GameStateReset', undefined);
    });

    this.eventBus.subscribe('GameStartRequested', () => {
      const playerIdx = this.playerStateManager.getClientPlayerIdx();
      if (playerIdx !== 0) {
        // [TODO] add modal
        return;
      }
      const players = this.playerStateManager.getPlayers();
      if (players.some(p => p !== undefined && !p.ready)) {
        // [TODO] add modal
        return;
      }
      const startMessage: InboundStartMessage = {
        type: 'START',
      };
      this.eventBus.publish('DispatchMessage', startMessage);
      // [TODO] check server's response
    });

    // [TODO] publish this event at onMount by GameManager's public method
    /**
     * @description The GameStateRestored event indicates that the 'static' state managers have been initialized,
     * especially those that depend on server-sent data (via $props).
     * Therefore, 'dynamic' data —such as move related states, like move history/blocks/board—
     * should be handled in this handler.
     */
    this.eventBus.subscribe('GameStateRestored', (event) => {
      const restoredBoard = createNewBoard();
      const { moves } = event.payload;
      moves.forEach((move) => {
        this.moveStateManager.addMoveToHistory(move);
        if (move.exhausted === false && move.timeout === false) {
          placeBlock({
            block: getBlockMatrix(move.blockInfo),
            board: restoredBoard,
            position: move.position,
            slotIdx: move.slotIdx,
            turn: move.turn,
          });
          this.blockStateManager.removeBlockFromStore({
            blockType: move.blockInfo.type,
            slotIdx: move.slotIdx,
          });
        }
      });
      this.boardStateManager.initializeBoard(restoredBoard);
    });
  }
}
