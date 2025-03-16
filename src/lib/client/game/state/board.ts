import type { BoardMatrix } from "$types";

export class BoardStateManager {
  constructor({ board }: {
    board?: BoardMatrix;
  }) {
    this.board = board;
  }

  private board?: BoardMatrix;
}
