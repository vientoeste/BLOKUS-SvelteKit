import type { BlockType, PlayerIdx, SlotIdx } from "$types";
import type { BlockPlaceabilityCalculator } from "../domain/blockPlaceabilityCalculator";
import type { EventBus } from "../event";
import type { BlockStateManager } from "../state/block";
import type { BoardStateManager } from "../state/board";
import type { GameStateManager } from "../state/game";
import type { MoveStateManager } from "../state/move";
import type { PlayerStateManager } from "../state/player";
import type { SlotStateManager } from "../state/slot";

export class PostMoveOrchestrator {
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

    this.eventBus.subscribe('MoveApplied', async (event) => {
      this.moveStateManager.addMoveToHistory({ ...event.payload, exhausted: false, timeout: false });
      const { slotIdx, blockInfo: { type }, playerIdx } = event.payload;
      await this.handleMoveApplied({ slotIdx, blockType: type, playerIdx });
    });
  }

  private async handleMoveApplied({ slotIdx, blockType, playerIdx }: { slotIdx: SlotIdx, blockType: BlockType, playerIdx: PlayerIdx }) {
    // 1. advance turn and remove block
    this.blockStateManager.removeBlockFromStore({ blockType, slotIdx });
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
        this.slotStateManager.markAsExhausted(slotIdx);
      });
    }
  }
}
