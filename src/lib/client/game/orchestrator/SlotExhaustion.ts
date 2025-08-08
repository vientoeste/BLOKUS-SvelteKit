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
  }
}
