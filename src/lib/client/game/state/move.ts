import type { Move } from "$types";

export class MoveStateManager {
  private moveHistory: Move[] = [];

  addMoveToHistory(move: Move) {
    this.moveHistory.push(move);
  }

  clearHistory() {
    this.moveHistory.length = 0;
  }
}
