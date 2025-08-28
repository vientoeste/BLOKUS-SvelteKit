import { blockStore } from "$lib/store";
import type { BlockType, SlotIdx } from "$types";

export class BlockStateManager {
  constructor() {
    blockStore.set([]);
  }

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

  reset() {
    blockStore.set([]);
  }
}
