import type { Block, BlockType, BoardMatrix, GameId, Move, OutboundMoveMessage, OutboundSkipTurnMessage, ParticipantInf, PlayerIdx, SlotIdx } from '$types';
import type { IGameLifecycleManager } from './ports/game-lifecycle.ports';
import type { IParticipantManager } from './ports/pregame.ports';
import type { ICalculationDataProvider, ICalculationResultApplier, ITurnManager } from './ports/turn-cycle.ports';
import type { IMoveApplier } from './ports/move-processing.ports';
import type { ISlotManager } from './ports/slot-state.ports';
import type { IClientInfoReader } from './ports/player-info.ports';
import type { BlockStateManager } from '../state/block';
import type { BoardStateManager } from '../state/board';
import type { GameStateManager, Phase } from '../state/game';
import type { MoveStateManager } from '../state/move';
import type { PlayerStateManager } from '../state/player';
import type { SlotStateManager } from '../state/slot';
import { createNewBoard, getBlockMatrix, placeBlock } from '$lib/game/core';
import type { IGameResultManager } from './ports/game-result.ports';
import type { Score } from '$lib/domain/score';
import type { IGameResultReader } from './ports/game-result-reader.ports';
import type { IBoardReader } from './ports/board-reader.ports';
import type { BoardPresentationManager, BlockPresentationManager } from '../ui/presentation';
import type { BlockFilterStateManager } from '../state/filter';
import type { IMoveConfirmationPresenter } from './ports/move-confirmation-presenter';

export class GameStateLayer implements
  IGameLifecycleManager,
  IGameResultManager,
  IMoveApplier,
  IClientInfoReader,
  IParticipantManager,
  ISlotManager,
  ITurnManager,
  ICalculationDataProvider,
  ICalculationResultApplier,
  IGameResultReader,
  IBoardReader {
  private blockStateManager: BlockStateManager;
  private boardStateManager: BoardStateManager;
  private gameStateManager: GameStateManager;
  private moveStateManager: MoveStateManager;
  private playerStateManager: PlayerStateManager;
  private slotStateManager: SlotStateManager;
  private blockFilterStateManager: BlockFilterStateManager;

  constructor({
    blockStateManager,
    boardStateManager,
    gameStateManager,
    moveStateManager,
    playerStateManager,
    slotStateManager,
    blockFilterStateManager,
  }: {
    blockStateManager: BlockStateManager,
    boardStateManager: BoardStateManager,
    gameStateManager: GameStateManager,
    moveStateManager: MoveStateManager,
    playerStateManager: PlayerStateManager,
    slotStateManager: SlotStateManager,
    blockFilterStateManager: BlockFilterStateManager,
  }) {
    this.blockStateManager = blockStateManager;
    this.boardStateManager = boardStateManager;
    this.gameStateManager = gameStateManager;
    this.moveStateManager = moveStateManager;
    this.playerStateManager = playerStateManager;
    this.slotStateManager = slotStateManager;
    // [TODO] Decide whether expose this manager directly or make public methods
    this.blockFilterStateManager = blockFilterStateManager;
  }

  // ------------------------ Getters for Context API ------------------------
  get block() { return this.blockStateManager; }
  get board() { return this.boardStateManager; }
  get progress() { return this.gameStateManager; }
  get move() { return this.moveStateManager; }
  get player() { return this.playerStateManager; }
  get slot() { return this.slotStateManager; }
  get filter() { return this.blockFilterStateManager; }

  // -------------------------- GameLifecycleManager -------------------------
  initializeNewGame(payload: { gameId: GameId; activePlayerCount: 2 | 3 | 4; }): void {
    this.gameStateManager.initializeNewGame(payload);
    this.playerStateManager.initializeClientSlots();
    const slots = this.playerStateManager.getClientSlots();
    this.blockStateManager.initialize(slots);
    this.boardStateManager.initializeBoard();
    this.slotStateManager.initialize(payload.activePlayerCount);
    this.blockFilterStateManager.initialize(slots);
  }

  resetAllGameStates(): void {
    this.gameStateManager.reset();
    this.boardStateManager.initializeBoard();
    this.blockStateManager.reset();
    this.slotStateManager.reset();
    this.moveStateManager.clearHistory();
    this.blockFilterStateManager.reset();
  }

  restoreGame(payload: {
    moves: Move[];
    exhaustedSlots: SlotIdx[];
    turn: number;
    gameId: GameId;
    phase: Phase;
  }): { activePlayerCount: 2 | 3 | 4 } {
    this.playerStateManager.initializeClientSlots();
    const activePlayerCount = this.playerStateManager.getActivePlayerCount();
    if (activePlayerCount === 0) throw new Error('failed to initialize player state manager');
    this.slotStateManager.initialize(activePlayerCount);
    this.gameStateManager.restoreGameState({
      turn: payload.turn,
      activePlayerCount,
      gameId: payload.gameId,
      phase: payload.phase,
    });
    const slots = this.playerStateManager.getClientSlots();
    this.blockStateManager.initialize(slots);
    this.blockFilterStateManager.initialize(slots);

    payload.exhaustedSlots.forEach(slotIdx => {
      // [TODO] if one of the slot is players', disable remaining blocks
      this.slotStateManager.applyExhaustedState(slotIdx);
    });

    const restoredBoard = createNewBoard();
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
        this.blockStateManager.markAsPlaced({
          blockType: move.blockInfo.type,
          slotIdx: move.slotIdx,
        });
      }
    });
    this.boardStateManager.initializeBoard(restoredBoard);

    return { activePlayerCount };
  }
  // ------------------------------------------------------------------------


  // -------------------------- GameResultManager ---------------------------
  initiateScoreConfirmation(): void {
    this.gameStateManager.initiateScoreConfirmation();
  }

  getBoard(): BoardMatrix | undefined {
    return this.boardStateManager.getBoard();
  }

  setScore(score: Score): void {
    this.gameStateManager.setScore(score);
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
    reason?: undefined;
  } | {
    result: false;
    reason: string;
  } {
    const contextValidationResult = this.gameStateManager.verifyMoveContext(payload);
    if (!contextValidationResult.isValid) {
      return {
        result: false,
        reason: contextValidationResult.reason,
      };
    }
    return this.boardStateManager.checkBlockPleaceability(payload);
  }

  // [TODO] createdAt should be replaced as server-sent timestamp
  applyRegularMove(move: OutboundMoveMessage): void {
    const { blockInfo, slotIdx } = move;
    const result = this.gameStateManager.verifyMoveContext(move);
    if (!result.isValid) {
      throw new Error("applyRegularMove called with invalid context.");
    }
    const { gameId } = result;

    this.boardStateManager.placeBlock(move);
    this.blockStateManager.markAsPlaced({ blockType: blockInfo.type, slotIdx });
    this.moveStateManager.addMoveToHistory({ ...move, gameId, createdAt: new Date(), timeout: false, exhausted: false });
  }

  // [TODO] createdAt should be replaced as server-sent timestamp
  applySkipMove(skipMove: OutboundSkipTurnMessage): void {
    const result = this.gameStateManager.verifyMoveContext(skipMove);
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
  // getClientPlayerIdx is dup with ClientInfoReader
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
  verifyMoveContext(payload: { turn: number; slotIdx: SlotIdx }): { isValid: boolean; reason?: string; gameId?: GameId } {
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


  // ------------------------- GameResultReader------------------------------
  getScore(): Score | undefined {
    return this.gameStateManager.getScore();
  }
  // ------------------------------------------------------------------------
}

export class GamePresentationLayer implements IMoveConfirmationPresenter {
  private _block: BlockPresentationManager;
  private boardPresentationManager: BoardPresentationManager;

  constructor({
    block,
    boardPresentationManager,
  }: {
    block: BlockPresentationManager;
    boardPresentationManager: BoardPresentationManager;
  }) {
    this._block = block;
    this.boardPresentationManager = boardPresentationManager;
  }

  get block() { return this._block; }

  get board() {
    return this.boardPresentationManager;
  }

  // -----------------------MoveConfirmationPresenter------------------------
  getConfirmPreviewData(p: {
    board: BoardMatrix;
    block: Block;
    position: [number, number];
    slotIdx: SlotIdx;
  }): Promise<HTMLCanvasElement> {
    return this.boardPresentationManager.getPreview(p);
  }
  // ------------------------------------------------------------------------
}
