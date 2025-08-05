import type { InboundExhaustedMessage, PlayerIdx, SlotIdx } from "$types";
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

  /**
   * @description set slot state to exhausted directically
   * @param slotState slot state object, not index of slot to avoid dup null-check
   */
  private _setExhausted(slotState: SlotState) {
    slotState.exhausted = true;
  }

  /**
   * @description mark one of my slot as exhausted and **dispatch** it to other clients
   */
  markAsExhausted(slotIdx: SlotIdx) {
    const slotState = this.slots[slotIdx];
    if (slotState === undefined) return;
    if (slotState.exhausted === false) {
      // [TODO] if needed, publish SlotExhausted too, or separate DispatchMessage to another direction
      // this.eventBus.publish('SlotExhausted', { slotIdx });
      const exhaustedMessage: InboundExhaustedMessage = {
        type: 'EXHAUSTED',
        slotIdx,
      };
      this.eventBus.publish('DispatchMessage', exhaustedMessage);
    }
    this._setExhausted(slotState);
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

  reset() {
    this.slots = [];
  }
}
