import type { PlayerIdx } from "$types";
import type { EventBus } from "../event";

type SlotState = {
  exhausted: boolean;
  owners: PlayerIdx[];
}

export class SlotStateManager {
  private slots: [SlotState, SlotState, SlotState, SlotState] | [];
  private eventBus: EventBus;

  constructor({ eventBus }: { eventBus: EventBus }) {
    this.slots = [];
    this.eventBus = eventBus;
  }
}
