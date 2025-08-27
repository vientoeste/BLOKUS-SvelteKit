import type { Block, OutboundMoveMessage, OutboundSkipTurnMessage, SlotIdx } from '$types';

/**
 * Applies a received Move to all relevant states: board, blocks, history, ...
 */
export interface IMoveApplier {
  /**
   * Verifies if a submitted Move is placeable on the current board state by game rule.
   */
  checkBlockPlaceability(payload: {
    blockInfo: Block;
    position: [number, number];
    turn: number;
    slotIdx: SlotIdx;
  }): {
    result: true;
    reason?: undefined;
  } | {
    result: false;
    reason: string;
  };

  /**
   * Atomically applies a **valid** regular Move to all states.
   * It internally handles board placement, marking the block as used, and recording history.
   */
  applyRegularMove(move: OutboundMoveMessage): void;

  applySkipMove(skipMove: OutboundSkipTurnMessage): void;
}
