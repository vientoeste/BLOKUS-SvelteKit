import { blockStore } from "$lib/store";
import type { BlockType, SlotIdx } from "$types";
import type { EventBus } from "../event";

export class BlockStateManager {
  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;
  }

  private eventBus: EventBus;

  initialize(slots: SlotIdx[]) {
    blockStore.initialize(slots);
  }

  removeBlockFromStore({ blockType, slotIdx }: { blockType: BlockType, slotIdx: SlotIdx }) {
    blockStore.updateBlockPlacementStatus({ blockType, slotIdx });
  }

  /**
   * @description update block placeability by list of **unavailable** blocks
   */
  updateAvailability(unavailableBlocks: { slotIdx: SlotIdx, blockType: BlockType }[]) {
    blockStore.updateUnavailableBlocks(unavailableBlocks);
  }

  getUnusedBlocks() {
    return blockStore.getUnusedBlocks();
  }
}
