import type { Move } from "$types";

export class MoveStateManager {
  private moveHistory: Move[] = [];

  constructor({ moves }: { moves?: Move[] }) {
    if (moves !== undefined) {
      this.moveHistory.push(...moves);
    }
  }

  addMoveToHistory(move: Move) {
    this.moveHistory.push(move);
  }
}
