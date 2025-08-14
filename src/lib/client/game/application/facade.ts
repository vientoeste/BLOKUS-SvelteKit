import type { Block, BlockType, BoardMatrix, GameId, Move, OutboundMoveMessage, OutboundSkipTurnMessage, ParticipantInf, PlayerIdx, SlotIdx } from '$types';
import type { IGameLifecycleManager } from './ports/game-lifecycle.ports';
import type { IParticipantManager } from './ports/pregame.ports';
import type { ICalculationDataProvider, ICalculationResultApplier, ITurnManager } from './ports/turn-cycle.ports';
import type { IMoveApplier } from './ports/move-processing.ports';
import type { ISlotManager } from './ports/slot-state.ports';
import type { IClientInfoReader } from './ports/player-info.ports';
import type { BlockStateManager } from '../state/block';
import type { BoardStateManager } from '../state/board';
import type { GameStateManager } from '../state/game';
import type { MoveStateManager } from '../state/move';
import type { PlayerStateManager } from '../state/player';
import type { SlotStateManager } from '../state/slot';
import { createNewBoard, getBlockMatrix, placeBlock } from '$lib/game/core';
import type { IGameResultManager } from './ports';

export class GameStateLayer implements
  IGameLifecycleManager,
  IGameResultManager,
  IMoveApplier,
  IClientInfoReader,
  IParticipantManager,
  ISlotManager,
  ITurnManager,
  ICalculationDataProvider,
  ICalculationResultApplier {
  private blockStateManager: BlockStateManager;
  private boardStateManager: BoardStateManager;
  private gameStateManager: GameStateManager;
  private moveStateManager: MoveStateManager;
  private playerStateManager: PlayerStateManager;
  private slotStateManager: SlotStateManager;

  constructor({
    blockStateManager,
    boardStateManager,
    gameStateManager,
    moveStateManager,
    playerStateManager,
    slotStateManager,
  }: {
    blockStateManager: BlockStateManager,
    boardStateManager: BoardStateManager,
    gameStateManager: GameStateManager,
    moveStateManager: MoveStateManager,
    playerStateManager: PlayerStateManager,
    slotStateManager: SlotStateManager,
  }) {
    this.blockStateManager = blockStateManager;
    this.boardStateManager = boardStateManager;
    this.gameStateManager = gameStateManager;
    this.moveStateManager = moveStateManager;
    this.playerStateManager = playerStateManager;
    this.slotStateManager = slotStateManager;
  }

  // -------------------------- GameLifecycleManager -------------------------
  initializeNewGame(payload: { gameId: GameId; activePlayerCount: 2 | 3 | 4; }): void {
    this.gameStateManager.initialize(payload);
    this.playerStateManager.initializeClientSlots();
    this.blockStateManager.initialize(this.playerStateManager.getClientSlots());
    this.boardStateManager.initializeBoard();
  }

  resetAllGameStates(): void {
    this.gameStateManager.reset();
    this.boardStateManager.initializeBoard();
    this.blockStateManager.reset();
    this.slotStateManager.reset();
    this.moveStateManager.clearHistory();
  }

  restoreGameStateFromHistory(payload: { moves: Move[]; exhaustedSlots: SlotIdx[]; }): void {
    const restoredBoard = createNewBoard();
    payload.exhaustedSlots.forEach(slotIdx => {
      this.slotStateManager.applyExhaustedState(slotIdx);
    });
    payload.moves.forEach(move => {
      this.moveStateManager.addMoveToHistory(move);
      if (move.exhausted === false && move.timeout === false) {
        placeBlock({
          board: restoredBoard,
          block: getBlockMatrix(move.blockInfo),
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
  }
  // ------------------------------------------------------------------------


  // -------------------------- GameResultManager ---------------------------
  initiateScoreConfirmation(): void {
    this.gameStateManager.initiateScoreConfirmation();
  }

  getBoard(): BoardMatrix | undefined {
    return this.boardStateManager.getBoard();
  }
  // ------------------------------------------------------------------------


  // ------------------------------ MoveApplier -----------------------------
  checkBlockPlaceability(payload: {
    blockInfo: Block;
    position: [number, number];
    turn: number;
    slotIdx: SlotIdx;
  }): {
    result: true;
  } | {
    result: false;
    reason: string;
  } {
    return this.boardStateManager.checkBlockPleaceability(payload);
  }

  applyRegularMove(move: OutboundMoveMessage): void {
    const { blockInfo, slotIdx } = move;
    const result = this.gameStateManager.verifyMoveContext(move)
    if (!result.isValid) {
      throw new Error("applyRegularMove called with invalid context.");
    }
    const { gameId } = result;

    this.boardStateManager.placeBlock(move);
    this.blockStateManager.removeBlockFromStore({ blockType: blockInfo.type, slotIdx });
    this.moveStateManager.addMoveToHistory({ ...move, gameId, createdAt: new Date(), timeout: false, exhausted: false });
  }

  applySkipMove(skipMove: OutboundSkipTurnMessage): void {
    const result = this.gameStateManager.verifyMoveContext(skipMove)
    if (!result.isValid) {
      throw new Error("applySkipMove called with invalid context.");
    }
    const { gameId } = result;

    this.moveStateManager.addMoveToHistory({ ...skipMove, gameId, createdAt: new Date() });
  }
  // ------------------------------------------------------------------------


  // --------------------------- ClientInfoReader ---------------------------
  getClientPlayerIdx(): PlayerIdx {
    return this.playerStateManager.getClientPlayerIdx();
  }

  getClientSlots(): SlotIdx[] {
    return this.playerStateManager.getClientSlots();
  }
  // ------------------------------------------------------------------------


  // -------------------------- ParticipantManager --------------------------
  addPlayer(playerInfo: ParticipantInf & { playerIdx: PlayerIdx; }): void {
    this.playerStateManager.addPlayer(playerInfo);
  }
  removePlayerByIdx(playerIdx: PlayerIdx): void {
    this.playerStateManager.removePlayerByIdx(playerIdx);
  }
  updateReadyState(payload: { playerIdx: PlayerIdx; ready: boolean; }): void {
    this.playerStateManager.updateReadyState(payload);
  }
  getPlayers(): (ParticipantInf | undefined)[] {
    return this.playerStateManager.getPlayers();
  }
  // ------------------------------------------------------------------------


  // ------------------------------ SlotManager -----------------------------
  isSlotExhausted(slotIdx: SlotIdx): boolean {
    return this.slotStateManager.isSlotExhausted(slotIdx);
  }

  markAsExhausted(slotIdx: SlotIdx): { result: "ALREADY_EXHAUSTED" | "NEWLY_EXHAUSTED"; } {
    return this.slotStateManager.markAsExhausted(slotIdx);
  }

  applyExhaustedState(slotIdx: SlotIdx): void {
    this.slotStateManager.applyExhaustedState(slotIdx);
  }
  // ------------------------------------------------------------------------


  // ------------------------------ TurnManager -----------------------------
  getCurrentTurn(): number {
    return this.gameStateManager.getCurrentTurn();
  }
  advanceTurn(): number {
    return this.gameStateManager.advanceTurn();
  }
  getActivePlayerCount(): 2 | 3 | 4 {
    return this.gameStateManager.getActivePlayerCount();
  }
  verifyMoveContext(payload: { turn: number; }): { isValid: boolean; reason?: string; gameId?: GameId } {
    return this.gameStateManager.verifyMoveContext(payload);
  }
  // ------------------------------------------------------------------------


  // ------------------------ CalculationDataProvider -----------------------
  getUnusedBlocks(): { blockType: BlockType; slotIdx: SlotIdx }[] {
    return this.blockStateManager.getUnusedBlocks();
  }
  // getBoard is dup with GameResultManager
  // ------------------------------------------------------------------------


  // ----------------------- CalculationResultApplier -----------------------
  updateBlockAvailability(unavailableBlocks: { slotIdx: SlotIdx; blockType: BlockType }[]): void {
    this.blockStateManager.updateAvailability(unavailableBlocks);
  }
  // ------------------------------------------------------------------------
}
