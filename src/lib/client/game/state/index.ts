import type { Block, BlockType, BoardMatrix, GameId, SlotIdx } from "$types";
import type { BlockStateManager } from "./block";
import type { BoardStateManager } from "./board";
import type { GameStateManager, MoveContextVerificationResult, Phase } from "./game";
import type { MoveStateManager } from "./move";
import type { PlayerStateManager } from "./player";
import type { SlotStateManager } from "./slot";

export class GameStateLayer {
  constructor({
    blockStateManager,
    boardStateManager,
    gameStateManager,
    moveStateManager,
    playerStateManager,
    slotStateManager,
  }: {
    blockStateManager: BlockStateManager;
    boardStateManager: BoardStateManager;
    gameStateManager: GameStateManager;
    moveStateManager: MoveStateManager;
    slotStateManager: SlotStateManager;
    playerStateManager: PlayerStateManager;
  }) {
    this.blockStateManager = blockStateManager;
    this.boardStateManager = boardStateManager;
    this.gameStateManager = gameStateManager;
    this.moveStateManager = moveStateManager;
    this.playerStateManager = playerStateManager;
    this.slotStateManager = slotStateManager;
  }

  private blockStateManager: BlockStateManager;
  private boardStateManager: BoardStateManager;
  private gameStateManager: GameStateManager;
  private moveStateManager: MoveStateManager;
  private playerStateManager: PlayerStateManager;
  private slotStateManager: SlotStateManager;

  // ----------------------block---------------------------------
  initializeBlocks(slots: SlotIdx[]) {
    this.blockStateManager.initialize(slots);
  }

  useBlock({ blockType, slotIdx }: { blockType: BlockType, slotIdx: SlotIdx }) {
    this.blockStateManager.removeBlockFromStore({ blockType, slotIdx });
  }

  /**
   * @description update block placeability by list of **unavailable** blocks
   */
  updateBlockAvailability(unavailableBlocks: { slotIdx: SlotIdx, blockType: BlockType }[]) {
    this.blockStateManager.updateAvailability(unavailableBlocks);
  }

  getAvailableBlocks() {
    return this.blockStateManager.getUnusedBlocks();
  }

  resetBlocks() {
    this.blockStateManager.reset();
  }
  // ------------------------------------------------------------


  // ----------------------board---------------------------------
  getBoard(): BoardMatrix | undefined {
    return this.boardStateManager.getBoard();
  }

  initializeBoard(board?: BoardMatrix) {
    this.boardStateManager.initializeBoard(board);
  }

  resetBoard() {
    this.boardStateManager.destroyBoard();
  }

  canPlaceBlock({
    blockInfo, position, turn, slotIdx
  }: {
    blockInfo: Block,
    position: [number, number],
    turn: number,
    slotIdx: SlotIdx,
  }) {
    return this.boardStateManager.checkBlockPleaceability({
      blockInfo, position, turn, slotIdx,
    });
  }

  placeBlock({ blockInfo, position, slotIdx }: {
    blockInfo: Block;
    position: [number, number];
    slotIdx: SlotIdx;
  }) {
    this.boardStateManager.placeBlock({ blockInfo, position, slotIdx });
  }
  // ------------------------------------------------------------


  // ----------------------game----------------------------------
  initializeGame({ gameId, activePlayerCount }: { gameId: GameId, activePlayerCount: 2 | 3 | 4 }) {
    this.gameStateManager.initialize({ gameId, activePlayerCount });
  }

  initiateScoreConfirmation() {
    this.gameStateManager.initiateScoreConfirmation();
  }

  resetGame() {
    this.gameStateManager.reset();
  }

  /**
   * Verifies the contextual validity of a Move.
   *
   * This method checks if the game has started, if it's the correct turn sequence,
   * and if the `gameId` is valid.
   * 
   * It returns a result object indicating success or failure.
   *
   * @returns {MoveContextVerificationResult} An object representing the validation result.
   * 
   * On success: `{ isValid: true, gameId: GameId }`,
   * 
   * On failure: `{ isValid: false, reason: string }`.
   */
  isMoveContextValid({ turn }: { turn: number }): MoveContextVerificationResult {
    return this.gameStateManager.verifyMoveContext({ turn });
  }

  restoreGameState({
    turn,
    gameId,
    phase,
  }: {
    turn: number,
    gameId: GameId,
    phase: Phase;
  }) {
    this.gameStateManager.restoreGameState({
      turn,
      gameId,
      phase,
    });
  }

  /**
   * @see TurnLifecycleOrchestrator
   */
  advanceTurn() {
    return this.gameStateManager.advanceTurn();
  }

  getCurrentTurn() {
    return this.gameStateManager.getCurrentTurn();
  }

  getActivePlayerCount() {
    return this.gameStateManager.getActivePlayerCount();
  }
  // ------------------------------------------------------------
}
