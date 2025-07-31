import type { Block, InboundCancelReadyMessage, InboundReadyMessage, SlotIdx } from "$types";
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

  submitReady() {
    const readyMessage: InboundReadyMessage = {
      type: 'READY',
    };
    this.eventBus.publish('DispatchMessage', readyMessage);
  }

  submitCancelReady() {
    const cancelReadyMessage: InboundCancelReadyMessage = {
      type: 'CANCEL_READY',
    };
    this.eventBus.publish('DispatchMessage', cancelReadyMessage);
  }
}
