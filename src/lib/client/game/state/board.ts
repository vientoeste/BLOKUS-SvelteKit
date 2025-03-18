import { putBlockOnBoard, rollbackMove } from "$lib/game/core";
import type { Block, BoardMatrix, PlayerIdx, SlotIdx } from "$types";

export class BoardStateManager {
  constructor({ board }: {
    board?: BoardMatrix;
  }) {
    this.board = board;
  }

  private board?: BoardMatrix;

  initializeBoard(board?: BoardMatrix) {
    if (!board) {
      this.board = Array(20).fill(null).map(() => Array(20).fill(false));
      return;
    }
    this.board = board;
  }

  destroyBoard() {
    this.board = undefined;
    // re-render
  }

  applyNonTimeoutMove({
    blockInfo, playerIdx, position, turn, slotIdx
  }: {
    blockInfo: Block,
    playerIdx: PlayerIdx,
    position: [number, number],
    turn: number,
    slotIdx: SlotIdx,
  }) {
    if (!this.board) return;
    const reason = putBlockOnBoard({
      blockInfo,
      board: this.board,
      playerIdx,
      position,
      slotIdx,
      turn,
    });
    if (reason) {
      // emit event
      rollbackMove({
        blockInfo,
        board: this.board,
        position,
        slotIdx,
      });
      return;
    }
    // emit event
    // re-render here
  }
}
