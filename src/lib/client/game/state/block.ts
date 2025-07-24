import { blockStore } from "$lib/store";
import type { BlockType, SlotIdx } from "$types";
import type { EventBus } from "../event";

export class BlockStateManager {
  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;

    this.eventBus.subscribe('MoveApplied', (event) => {
      const { slotIdx, blockInfo: { type } } = event.payload;
      this.removeBlockFromStore({ blockType: type, slotIdx });
    });
  }

  private eventBus: EventBus;

  removeBlockFromStore({ blockType, slotIdx }: { blockType: BlockType, slotIdx: SlotIdx }) {
    blockStore.updateBlockPlacementStatus({ blockType, slotIdx });
  }

  /**
   * @description update block placeability by list of **unavailable** blocks
   */
  updateAvailability(unavailableBlocks: { slotIdx: SlotIdx, blockType: BlockType }[]) {
    blockStore.updateUnavailableBlocks(unavailableBlocks);
  }
}
