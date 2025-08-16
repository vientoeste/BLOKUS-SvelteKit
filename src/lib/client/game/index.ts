import type { Block, SlotIdx } from "$types";
import { EventBus } from "./event";

export class GameManager {
  private eventBus: EventBus;

  constructor({
    eventBus,
  }: {
    eventBus: EventBus;
  }) {
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
    this.eventBus.publish('PlayerReadySubmitted', undefined);
  }

  submitCancelReady() {
    this.eventBus.publish('PlayerReadyCancelSubmitted', undefined);
  }

  startGame() {
    this.eventBus.publish('GameStartRequested', undefined);
  }
}
