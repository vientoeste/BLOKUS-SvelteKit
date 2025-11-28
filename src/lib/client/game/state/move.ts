import type { Move } from "$types";
import { get, writable, type Readable, type Writable } from "svelte/store";

export class MoveStateManager {
  private _moveHistory: Writable<Move[]>;

  constructor() {
    this._moveHistory = writable([]);
  }

  get moveHistory(): Readable<Move[]> {
    return { subscribe: this._moveHistory.subscribe };
  }

  getMoveHistory() {
    return get(this._moveHistory);
  }

  addMoveToHistory(move: Move) {
    this._moveHistory.update(store => [...store, move]);
  }

  clearHistory() {
    this._moveHistory.set([]);
  }
}
