import type { PlayerIdx, SlotIdx } from '$types';

export interface IClientInfoReader {
  getClientPlayerIdx(): PlayerIdx;

  getClientSlots(): SlotIdx[];
}
