import type { BoardStateManager } from "./board";
import type { MoveStateManager } from "./move";
import type { PlayerStateManager } from "./player";

export class GameStateManager {
  constructor({ playerStateManager, boardStateManager, moveStateManager }: {
    playerStateManager: PlayerStateManager;
    boardStateManager: BoardStateManager;
    moveStateManager: MoveStateManager;
  }) {
    this.playerStateManager = playerStateManager;
    this.boardStateManager = boardStateManager;
    this.moveStateManager = moveStateManager;
  }

  private playerStateManager: PlayerStateManager;
  private boardStateManager: BoardStateManager;
  private moveStateManager: MoveStateManager;
}
