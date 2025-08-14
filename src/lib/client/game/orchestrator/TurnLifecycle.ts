import type { OutboundMoveMessage, OutboundSkipTurnMessage, PlayerIdx } from "$types";
import type { BlockPlaceabilityCalculator } from "../domain/blockPlaceabilityCalculator";
import type { EventBus } from "../event";
import type { BlockStateManager } from "../state/block";
import type { BoardStateManager } from "../state/board";
import type { GameStateManager } from "../state/game";
import type { MoveStateManager } from "../state/move";
import type { PlayerStateManager } from "../state/player";
import type { SlotStateManager } from "../state/slot";


// [TODO] Refactor TurnLifecycleOrchestrator responsibilities:
/*
 * This class currently handles multiple responsibilities: applying received moves,
 * finalizing the turn, and processing exhaustion messages. This violates the
 * Single Responsibility Principle and increases coupling.
 * 
 * 1. Create a new `MoveApplicationOrchestrator`:
 *    - It should subscribe to `MessageReceived_Move` and `MessageReceived_SkipTurn`.
 *    - Its only responsibility is to validate the move and apply it to the state
 *      (Board, Block, MoveStateManager).
 *    - After applying the move, it should publish a new event, e.g., `TurnFinalized`.
 * 
 * 2. Redefine `TurnLifecycleOrchestrator`:
 *    - It should subscribe to the new `TurnFinalized` event instead of raw move messages.
 *    - Its responsibility will be narrowed down to post-turn logic:
 *      - Calling `gameStateManager.advanceTurn()`.
 *      - Calculating block placeability for the next turn.
 *      - Publishing the `TurnAdvanced` event.
 * 
 * 3. Delegate Exhaustion Message Handling:
 *    - Move the subscription and logic for `MessageReceived_Exhausted` to the
 *      `SlotExhaustionOrchestrator`, which is the more appropriate place for this concern.
 */
export class TurnLifecycleOrchestrator {
  private eventBus: EventBus;
  private boardStateManager: BoardStateManager;
  private blockStateManager: BlockStateManager;
  private blockPlaceabilityCalculator: BlockPlaceabilityCalculator;
  private playerStateManager: PlayerStateManager;
  private slotStateManager: SlotStateManager;
  private gameStateManager: GameStateManager;
  private moveStateManager: MoveStateManager;

  constructor({
    eventBus,
    boardStateManager,
    blockStateManager,
    blockPlaceabilityCalculator,
    playerStateManager,
    slotStateManager,
    gameStateManager,
    moveStateManager,
  }: {
    eventBus: EventBus;
    boardStateManager: BoardStateManager;
    blockStateManager: BlockStateManager;
    blockPlaceabilityCalculator: BlockPlaceabilityCalculator;
    playerStateManager: PlayerStateManager;
    slotStateManager: SlotStateManager;
    gameStateManager: GameStateManager;
    moveStateManager: MoveStateManager;
  }) {
    this.eventBus = eventBus;
    this.boardStateManager = boardStateManager;
    this.blockStateManager = blockStateManager;
    this.blockPlaceabilityCalculator = blockPlaceabilityCalculator;
    this.playerStateManager = playerStateManager;
    this.slotStateManager = slotStateManager;
    this.gameStateManager = gameStateManager;
    this.moveStateManager = moveStateManager;

    this.eventBus.subscribe('GameStateInitialized', () => {
      if (this.gameStateManager.getCurrentTurn() === 0) {
        this.eventBus.publish('TurnAdvanced', {
          turn: 0,
          activePlayerCount: this.gameStateManager.getActivePlayerCount(),
          playerIdx: this.playerStateManager.getClientPlayerIdx(),
        });
      }
    });

    this.eventBus.subscribe('MessageReceived_Move', (event) => {
      this.handleRegularMoveMessage(event.payload);
      this.finalizeTurn(event.payload);
    });

    this.eventBus.subscribe('MessageReceived_SkipTurn', (event) => {
      this.handleSkipMessage(event.payload);
      this.finalizeTurn(event.payload);
    });

    /**
     * Since searching for exhausted slots is initiated by turn,
     * here is the best location of handling exhausted messages at this moment.
     */
    this.eventBus.subscribe('MessageReceived_Exhausted', (event) => {
      const { slotIdx } = event.payload;
      this.slotStateManager.applyExhaustedState(slotIdx);
    });
  }

  private verifyMoveContext({ turn }: { turn: number }) {
    const result = this.gameStateManager.verifyMoveContext({ turn });
    if (!result.isValid) {
      switch (result.reason) {
        case 'game is not started':
          this.eventBus.publish('InvalidGameInitializedState', undefined)
          return;
        case 'invalid turn':
          this.eventBus.publish('InvalidTurn', undefined);
          return;
        case 'gameId is missing':
          this.eventBus.publish('InvalidGameId', undefined);
          return;
        default:
          return;
      }
    }
    return result.gameId;
  }

  private handleRegularMoveMessage(move: OutboundMoveMessage) {
    const gameId = this.verifyMoveContext(move);
    if (!gameId) {
      return;
    }
    const { result, reason } = this.boardStateManager.checkBlockPleaceability(move);
    if (!result) {
      // [TODO] add events for mediate / error report / ... using `reason`
      this.eventBus.publish('BlockNotPlaceable', { reason });
      return;
    }
    this.boardStateManager.placeBlock(move);
    // [TODO] createdAt should be replaced as server-sent timestamp
    this.moveStateManager.addMoveToHistory({ ...move, gameId, createdAt: new Date(), timeout: false, exhausted: false });
    this.blockStateManager.removeBlockFromStore({ blockType: move.blockInfo.type, slotIdx: move.slotIdx });
  }

  private handleSkipMessage(skipMove: OutboundSkipTurnMessage) {
    const gameId = this.verifyMoveContext(skipMove);
    if (!gameId) {
      return;
    }
    // [TODO] createdAt should be replaced as server-sent timestamp
    this.moveStateManager.addMoveToHistory({ ...skipMove, gameId, createdAt: new Date() });
  }

  private async finalizeTurn({ playerIdx }: { playerIdx: PlayerIdx }) {
    // 1. advance turn
    const nextTurn = this.gameStateManager.advanceTurn();
    if (nextTurn !== -1) {
      this.eventBus.publish('TurnAdvanced', {
        turn: nextTurn,
        activePlayerCount: this.gameStateManager.getActivePlayerCount(),
        playerIdx,
      });
    }

    // 2. calculate placeability of remaining blocks
    const unusedBlocks = this.blockStateManager.getUnusedBlocks();
    const board = this.boardStateManager.getBoard();
    if (board === undefined) return;
    const result = await this.blockPlaceabilityCalculator.calculate({
      unusedBlocks,
      board,
    });

    if (typeof result !== 'boolean' && result !== undefined) {
      // 3. apply [2]'s result to remaining blocks(available <-> unavailable)
      this.blockStateManager.updateAvailability(result.unavailable);

      // [TODO] reduce calculations
      // 4. check exhausted slots of the player
      const clientSlots = this.playerStateManager.getClientSlots();
      const unavailableSlots = clientSlots.filter(sIdx =>
        !result.available.some(block => block.slotIdx === sIdx)
      );
      unavailableSlots.forEach((slotIdx) => {
        this.eventBus.publish('SlotExhausted', { slotIdx, cause: 'CALCULATED' });
      });
    }
  }
}
