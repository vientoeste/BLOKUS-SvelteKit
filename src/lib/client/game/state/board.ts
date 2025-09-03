import { getBlockMatrix, isBlockPlaceableAt } from "$lib/game/core";
import { boardStoreWriter, getBoardFromStore } from "$lib/store";
import type { Block, BoardMatrix, SlotIdx } from "$types";

export class BoardStateManager {
  constructor() {
    this._resetBoard();
  }

  private _resetBoard() {
    boardStoreWriter.set(
      Array(20).fill(null).map(() => Array(20).fill(false))
    )
  }

  getBoard(): BoardMatrix {
    return getBoardFromStore()?.map(e => [...e]);
  }

  initializeBoard(board?: BoardMatrix) {
    if (!board) {
      this._resetBoard();
      return;
    }
    boardStoreWriter.set(board);
  }

  destroyBoard() {
    this._resetBoard();
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
    boardStoreWriter.update((board) => {
      block.forEach((blockLine, rowIdx) => {
        blockLine.forEach((blockCell, colIdx) => {
          if (blockCell) {
            board[row + rowIdx][col + colIdx] = slotIdx;
          }
        });
      });
      return board;
    });
  }
}
