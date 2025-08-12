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
   * @description initialize slot states based on number of participants
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

  /**
   * @description set slot state to exhausted directically
   * @param slotState slot state object, not index of slot to avoid dup null-check
   */
  private _setExhausted(slotState: SlotState) {
    slotState.exhausted = true;
  }

  /**
   * @description mark one of my slot as exhausted return whether the slot is newly exhausted or not.
   */
  markAsExhausted(slotIdx: SlotIdx): { result: 'ALREADY_EXHAUSTED' | 'NEWLY_EXHAUSTED' } {
    const slotState = this.slots[slotIdx];
    if (slotState === undefined) throw new Error('');

    if (slotState.exhausted) {
      return { result: 'ALREADY_EXHAUSTED' };
    }
    this._setExhausted(slotState);
    return { result: 'NEWLY_EXHAUSTED' };
  }

  /**
   * @description mark a slot as exhausted and **don't dispatch** it
   */
  applyExhaustedState(slotIdx: SlotIdx) {
    const slotState = this.slots[slotIdx];
    if (slotState === undefined) return;
    this._setExhausted(slotState);
  }

  getExhaustedSlots() {
    return this.slots.filter(slot => slot.exhausted === true).map((_, idx) => idx);
  }

  isSlotExhausted(slotIdx: SlotIdx) {
    const slot = this.slots[slotIdx];
    if (slot === undefined) throw new Error('slot is empty');
    return slot.exhausted;
  }

  reset() {
    this.slots = [];
  }
}
