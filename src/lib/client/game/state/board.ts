import { getBlockMatrix, isBlockPlaceableAt } from "$lib/game/core";
import { boardStoreWriter, getBoardFromStore } from "$lib/store";
import type { Block, BoardMatrix, SlotIdx } from "$types";

export class BoardStateManager {
  getBoard(): BoardMatrix | undefined {
    return getBoardFromStore()?.map(e => [...e]);
  }

  initializeBoard(board?: BoardMatrix) {
    if (!board) {
      boardStoreWriter.set(
        Array(20).fill(null).map(() => Array(20).fill(false))
      )
      return;
    }
    boardStoreWriter.set(board);
  }

  destroyBoard() {
    boardStoreWriter.set([]);
    // re-render
  }

  checkBlockPleaceability({
    blockInfo, position, turn, slotIdx
  }: {
    blockInfo: Block,
    position: [number, number],
    turn: number,
    slotIdx: SlotIdx,
  }): {
    result: true;
    reason?: undefined;
  } | {
    result: false;
    reason: string;
  } {
    const board = this.getBoard();
    if (board === undefined) return { result: false, reason: 'Board Is Not Initialized' };
    return isBlockPlaceableAt({
      block: getBlockMatrix(blockInfo),
      position,
      board,
      slotIdx,
      turn,
    });
  }

  placeBlock({ blockInfo, position, slotIdx }: {
    blockInfo: Block;
    position: [number, number];
    slotIdx: SlotIdx;
  }) {
    const [row, col] = position;
    const block = getBlockMatrix(blockInfo);
    /**
     * @description stable reference of board to avoid dup null-check
     */
    const board = this.getBoard();
    if (!board || board === undefined) {
      throw new Error('Board Is Not Initialized');
    }
    block.forEach((blockLine, rowIdx) => {
      blockLine.forEach((blockCell, colIdx) => {
        if (blockCell) {
          board[row + rowIdx][col + colIdx] = slotIdx;
        }
      });
    });
  }
}
