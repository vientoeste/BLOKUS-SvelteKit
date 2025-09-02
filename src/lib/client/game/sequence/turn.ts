import type { PlayerIdx, SlotIdx } from "$types";

export class TurnSequencer {
  calculatePlayerAndSlotIdx({
    turn,
    activePlayerCount,
  }: {
    turn: number;
    activePlayerCount: 2 | 3 | 4;
  }): {
    nextPlayerIdx: PlayerIdx;
    nextSlotIdx: SlotIdx;
  } {
    if (activePlayerCount === 2) {
      return {
        nextPlayerIdx: turn % 2 as PlayerIdx,
        nextSlotIdx: turn % 4 as SlotIdx,
      };
    }
    /**
     * @description tmp variable to reduce duplicated calculation
     */
    const turnModular4 = turn % 4;
    if (activePlayerCount === 3) {
      return turnModular4 === 3 ?
        {
          nextPlayerIdx: (turn % 12 - 3) / 4 as PlayerIdx,
          nextSlotIdx: 3 as SlotIdx,
        } : {
          nextPlayerIdx: turnModular4 as PlayerIdx,
          nextSlotIdx: turnModular4 as SlotIdx,
        };
    }
    return {
      nextPlayerIdx: turnModular4 as PlayerIdx,
      nextSlotIdx: turnModular4 as SlotIdx,
    };
  }
}
