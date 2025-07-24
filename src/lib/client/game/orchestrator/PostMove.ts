import type { BlockType, SlotIdx } from "$types";
import type { EventBus } from "../event";

export class PostMoveOrchestrator {
  private eventBus: EventBus;

  constructor({
    eventBus,
  }: {
    eventBus: EventBus;
  }) {
    this.eventBus = eventBus;

    this.eventBus.subscribe('MoveApplied', async (event) => {
      const { slotIdx, blockInfo: { type } } = event.payload;
      await this.handleMoveApplied({ slotIdx, blockType: type });
    });
  }

  private async handleMoveApplied({ slotIdx, blockType }: { slotIdx: SlotIdx, blockType: BlockType }) {
    throw new Error('not implemented');
  }
}
