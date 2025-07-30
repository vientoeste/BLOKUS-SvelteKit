import type { Block, SlotIdx } from "$types";
import type { EventBus } from "../../event";

export class PlayerActionHandler {
  private eventBus: EventBus;

  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;
  }

  submitMove({
    previewUrl,
    position,
    blockInfo,
    slotIdx,
  }: {
    previewUrl: string;
    position: [number, number];
    blockInfo: Block;
    slotIdx: SlotIdx;
  }) {
    this.eventBus.publish('PlayerMoveSubmitted', {
      previewUrl, position, blockInfo, slotIdx,
    });
  }
}
