import type { OutboundMoveMessage, OutboundSkipTurnMessage, PlayerIdx } from "$types";
import type { BlockPlaceabilityCalculator } from "../domain/blockPlaceabilityCalculator";
import type { EventBus } from "../event";
import type {
  ITurnManager,
  ICalculationDataProvider,
  ICalculationResultApplier,
  IMoveApplier,
  ISlotManager,
  IClientInfoReader
} from '../application/ports';

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
 *      - Publishing the `TurnProgressionTriggered` event.
 * 
 * 3. Delegate Exhaustion Message Handling:
 *    - Move the subscription and logic for `MessageReceived_Exhausted` to the
 *      `SlotExhaustionOrchestrator`, which is the more appropriate place for this concern.
 */
export class TurnLifecycleOrchestrator {
  private eventBus: EventBus;
  private blockPlaceabilityCalculator: BlockPlaceabilityCalculator;
  private turnManager: ITurnManager;
  private calculationDataProvider: ICalculationDataProvider;
  private calculationResultApplier: ICalculationResultApplier;
  private moveApplier: IMoveApplier;
  private slotManager: ISlotManager;
  private clientInfoReader: IClientInfoReader;

  constructor({
    eventBus,
    blockPlaceabilityCalculator,
    turnManager,
    calculationDataProvider,
    calculationResultApplier,
    moveApplier,
    slotManager,
    clientInfoReader,
  }: {
    eventBus: EventBus;
    blockPlaceabilityCalculator: BlockPlaceabilityCalculator;
    turnManager: ITurnManager;
    calculationDataProvider: ICalculationDataProvider;
    calculationResultApplier: ICalculationResultApplier;
    moveApplier: IMoveApplier;
    slotManager: ISlotManager;
    clientInfoReader: IClientInfoReader;
  }) {
    this.eventBus = eventBus;
    this.blockPlaceabilityCalculator = blockPlaceabilityCalculator;
    this.turnManager = turnManager
    this.calculationDataProvider = calculationDataProvider
    this.calculationResultApplier = calculationResultApplier
    this.moveApplier = moveApplier
    this.slotManager = slotManager
    this.clientInfoReader = clientInfoReader

    this.eventBus.subscribe('GameStateInitialized', () => {
      if (this.turnManager.getCurrentTurn() === 0) {
        this.eventBus.publish('TurnProgressionTriggered', {
          turn: 0,
          activePlayerCount: this.turnManager.getActivePlayerCount(),
          playerIdx: this.clientInfoReader.getClientPlayerIdx(),
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
      this.slotManager.applyExhaustedState(slotIdx);
    });
  }

  private verifyMoveContext({ turn }: { turn: number }) {
    const result = this.turnManager.verifyMoveContext({ turn });
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
    const { result, reason } = this.moveApplier.checkBlockPlaceability(move);
    if (!result) {
      // [TODO] add events for mediate / error report / ... using `reason`
      this.eventBus.publish('BlockNotPlaceable', { reason });
      return;
    }
    this.moveApplier.applyRegularMove(move);
  }

  private handleSkipMessage(skipMove: OutboundSkipTurnMessage) {
    const gameId = this.verifyMoveContext(skipMove);
    if (!gameId) {
      return;
    }
    this.moveApplier.applySkipMove(skipMove);
  }

  private async finalizeTurn({ playerIdx }: { playerIdx: PlayerIdx }) {
    // 1. advance turn
    const nextTurn = this.turnManager.advanceTurn();
    if (nextTurn !== -1) {
      this.eventBus.publish('TurnProgressionTriggered', {
        turn: nextTurn,
        activePlayerCount: this.turnManager.getActivePlayerCount(),
        playerIdx,
      });
    }

    // 2. calculate placeability of remaining blocks
    const unusedBlocks = this.calculationDataProvider.getUnusedBlocks();
    const board = this.calculationDataProvider.getBoard();
    if (board === undefined) return;
    const result = await this.blockPlaceabilityCalculator.calculate({
      unusedBlocks,
      board,
    });

    if (typeof result !== 'boolean' && result !== undefined) {
      // 3. apply [2]'s result to remaining blocks(available <-> unavailable)
      this.calculationResultApplier.updateBlockAvailability(result.unavailable);

      // [TODO] reduce calculations
      // 4. check exhausted slots of the player
      const clientSlots = this.clientInfoReader.getClientSlots();
      const unavailableSlots = clientSlots.filter(sIdx =>
        !result.available.some(block => block.slotIdx === sIdx)
      );
      unavailableSlots.forEach((slotIdx) => {
        this.eventBus.publish('SlotExhausted', { slotIdx, cause: 'CALCULATED' });
      });
    }
  }
}
