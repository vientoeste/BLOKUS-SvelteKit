import type { PlayerIdx, SlotIdx } from "$types";
import { get, writable, type Readable, type Writable } from "svelte/store";

type SlotState = {
  exhausted: boolean;
  owners: PlayerIdx[];
}

type TypeSafeSlots = [SlotState, SlotState, SlotState, SlotState];

type Slots = TypeSafeSlots | [];

export class SlotStateManager {
  private _slots: Writable<Slots>;

  constructor() {
    this._slots = writable([]);
  }

  get slots(): Readable<Slots> {
    return { subscribe: this._slots.subscribe };
  }

  getSlots() {
    return get(this._slots);
  }

  getSlot(idx: SlotIdx) {
    return get(this._slots)[idx];
  }

  /**
   * @description initialize slot states based on number of participants
   * @param count number of participants
   */
  initialize(count: number) {
    switch (count) {
      case 2:
        this._slots.set([{
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
        }]);
        break;

      case 3:
        this._slots.set([{
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
        }]);
        break;

      case 4:
        this._slots.set([{
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
        }]);
        break;

      default:
        throw new Error('wrong participant count passed');
    }
  }

  /**
   * @description set slot state to exhausted directically
   * @param slotState slot state object, not index of slot to avoid dup null-check
   */
  private _setExhausted(slotIdx: SlotIdx) {
    this._slots.update(store => {
      const slots = [...store] as TypeSafeSlots;
      slots[slotIdx] = { ...slots[slotIdx], exhausted: true };
      return slots;
    });
  }

  /**
   * @description mark one of my slot as exhausted return whether the slot is newly exhausted or not.
   */
  markAsExhausted(slotIdx: SlotIdx): { result: 'ALREADY_EXHAUSTED' | 'NEWLY_EXHAUSTED' } {
    const slotState = this.getSlot(slotIdx);
    if (slotState === undefined) throw new Error('');

    if (slotState.exhausted) {
      return { result: 'ALREADY_EXHAUSTED' };
    }
    this._setExhausted(slotIdx);
    return { result: 'NEWLY_EXHAUSTED' };
  }

  /**
   * @description mark a slot as exhausted and **don't dispatch** it
   */
  applyExhaustedState(slotIdx: SlotIdx) {
    const slotState = this.getSlot(slotIdx);
    if (slotState === undefined) return;
    this._setExhausted(slotIdx);
  }

  getExhaustedSlots() {
    return this.getSlots().filter(slot => slot.exhausted === true).map((_, idx) => idx);
  }

  isSlotExhausted(slotIdx: SlotIdx) {
    const slot = this.getSlot(slotIdx);
    if (slot === undefined) throw new Error('slot is empty');
    return slot.exhausted;
  }

  reset() {
    this._slots.set([]);
  }
}
