import { getBlockMatrix, isBlockPlaceableAt } from "$lib/game/core";
import type { Block, BoardMatrix, SlotIdx } from "$types";
import { get, writable, type Readable, type Writable } from "svelte/store";

export class BoardStateManager {
  private _board: Writable<BoardMatrix>;

  constructor() {
    this._board = writable();
    this._resetBoard();
  }

  get matrix(): Readable<BoardMatrix> {
    return { subscribe: this._board.subscribe };
  }

  private _resetBoard() {
    this._board.set(
      Array(20).fill(null).map(() => Array(20).fill(false))
    );
  }

  getBoard(): BoardMatrix {
    return get(this._board).map(e => [...e]);
  }

  initializeBoard(board?: BoardMatrix) {
    if (!board) {
      this._resetBoard();
      return;
    }
    this._board.set(board);
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
    this._board.update((board) => {
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
