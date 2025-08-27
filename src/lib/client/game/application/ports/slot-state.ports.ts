import type { SlotIdx } from '$types';

/**
 * Reads and modifies the state of participants' slots.
 */
export interface ISlotManager {
  isSlotExhausted(slotIdx: SlotIdx): boolean;

  markAsExhausted(slotIdx: SlotIdx): { result: 'ALREADY_EXHAUSTED' | 'NEWLY_EXHAUSTED' };

  applyExhaustedState(slotIdx: SlotIdx): void;
}
