import type { BlockType, SlotIdx } from "$types";
import type { BlockPlaceabilityCalculator } from "../domain/blockPlaceabilityCalculator";
import type { EventBus } from "../event";
import type { BlockStateManager } from "../state/block";
import type { BoardStateManager } from "../state/board";
import type { PlayerStateManager } from "../state/player";
import type { SlotStateManager } from "../state/slot";

export class PostMoveOrchestrator {
  private eventBus: EventBus;
  private boardStateManager: BoardStateManager;
  private blockStateManager: BlockStateManager;
  private blockPlaceabilityCalculator: BlockPlaceabilityCalculator;
  private playerStateManager: PlayerStateManager;
  private slotStateManager: SlotStateManager;

  constructor({
    eventBus,
    boardStateManager,
    blockStateManager,
    blockPlaceabilityCalculator,
    playerStateManager,
    slotStateManager,
  }: {
    eventBus: EventBus;
    boardStateManager: BoardStateManager;
    blockStateManager: BlockStateManager;
    blockPlaceabilityCalculator: BlockPlaceabilityCalculator;
    playerStateManager: PlayerStateManager;
    slotStateManager: SlotStateManager;
  }) {
    this.eventBus = eventBus;
    this.boardStateManager = boardStateManager;
    this.blockStateManager = blockStateManager;
    this.blockPlaceabilityCalculator = blockPlaceabilityCalculator;
    this.playerStateManager = playerStateManager;
    this.slotStateManager = slotStateManager;

    this.eventBus.subscribe('MoveApplied', async (event) => {
      const { slotIdx, blockInfo: { type } } = event.payload;
      await this.handleMoveApplied({ slotIdx, blockType: type });
    });
  }

  private async handleMoveApplied({ slotIdx, blockType }: { slotIdx: SlotIdx, blockType: BlockType }) {
    // 1. remove the block
    this.blockStateManager.removeBlockFromStore({ blockType, slotIdx });

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
        this.slotStateManager.setExhausted(slotIdx);
      });
    }
  }
}
