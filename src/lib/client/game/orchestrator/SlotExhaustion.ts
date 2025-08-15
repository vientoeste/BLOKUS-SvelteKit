import type { InboundExhaustedMessage } from "$types";
import type { ISlotManager } from "../application/ports";
import type { EventBus } from "../event";

export class SlotExhaustionOrchestrator {
  private eventBus: EventBus;
  private slotManager: ISlotManager;

  constructor({
    eventBus,
    slotManager,
  }: {
    eventBus: EventBus;
    slotManager: ISlotManager;
  }) {
    this.eventBus = eventBus;
    this.slotManager = slotManager;

    // [TODO] update block after the slot exhausted
    this.eventBus.subscribe('SlotExhausted', (event) => {
      const { slotIdx, cause } = event.payload;
      if (cause === 'CALCULATED') {
        const { result } = this.slotManager.markAsExhausted(slotIdx);
        if (result === 'NEWLY_EXHAUSTED') {
          const exhaustedMessage: InboundExhaustedMessage = {
            type: 'EXHAUSTED',
            slotIdx,
          };
          this.eventBus.publish('DispatchMessage', exhaustedMessage);
        }
        return;
      }
      this.slotManager.applyExhaustedState(slotIdx);
    });
  }
}
