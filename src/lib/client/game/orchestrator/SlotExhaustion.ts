import type { InboundExhaustedMessage } from "$types";
import type { EventBus } from "../event";
import type { SlotStateManager } from "../state/slot";

export class SlotExhaustionOrchestrator {
  private eventBus: EventBus;
  private slotStateManager: SlotStateManager;

  constructor({
    eventBus,
    slotStateManager,
  }: {
    eventBus: EventBus;
    slotStateManager: SlotStateManager;
  }) {
    this.eventBus = eventBus;
    this.slotStateManager = slotStateManager;

    // [TODO] update block after the slot exhausted
    this.eventBus.subscribe('SlotExhausted', (event) => {
      const { slotIdx, cause } = event.payload;
      if (cause === 'CALCULATED') {
        const { result } = this.slotStateManager.markAsExhausted(slotIdx);
        if (result === 'NEWLY_EXHAUSTED') {
          const exhaustedMessage: InboundExhaustedMessage = {
            type: 'EXHAUSTED',
            slotIdx,
          };
          this.eventBus.publish('DispatchMessage', exhaustedMessage);
        }
        return;
      }
      this.slotStateManager.applyExhaustedState(slotIdx);
    });
  }
}
