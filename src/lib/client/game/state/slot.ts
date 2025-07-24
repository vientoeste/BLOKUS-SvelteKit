import type { PlayerIdx, SlotIdx } from "$types";
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

  /**
   * @description initialize slot states based on number of participants, especially at a game started
   * @param count number of participants
   */
  initialize(count: number) {
    switch (count) {
      case 2:
        this.slots = [{
          owners: [0],
          exhausted: false,
        }, {
          owners: [1],
          exhausted: false,
        }, {
          owners: [0],
          exhausted: false,
        }, {
          owners: [1],
          exhausted: false,
        }];
        break;

      case 3:
        this.slots = [{
          owners: [0],
          exhausted: false,
        }, {
          owners: [1],
          exhausted: false,
        }, {
          owners: [2],
          exhausted: false,
        }, {
          owners: [0, 1, 2],
          exhausted: false,
        }]
        break;

      case 4:
        this.slots = [{
          owners: [0],
          exhausted: false,
        }, {
          owners: [1],
          exhausted: false,
        }, {
          owners: [2],
          exhausted: false,
        }, {
          owners: [3],
          exhausted: false,
        }];
        break;

      default:
        throw new Error('wrong participant count passed');
    }
  }

  setExhausted(slotIdx: SlotIdx) {
    const slotState = this.slots[slotIdx];
    if (slotState === undefined) return;
    if (slotState.exhausted === false) {
      this.eventBus.publish('SlotExhausted', { slotIdx });
    }
    slotState.exhausted = true;
  }

  getExhaustedSlots() {
    return this.slots.filter(slot => slot.exhausted === true).map((_, idx) => idx);
  }
}
