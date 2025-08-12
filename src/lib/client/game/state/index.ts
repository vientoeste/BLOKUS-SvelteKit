import type { BlockStateManager } from "./block";
import type { BoardStateManager } from "./board";
import type { GameStateManager } from "./game";
import type { MoveStateManager } from "./move";
import type { PlayerStateManager } from "./player";
import type { SlotStateManager } from "./slot";

export class GameStateLayer {
  constructor({
    blockStateManager,
    boardStateManager,
    gameStateManager,
    moveStateManager,
    playerStateManager,
    slotStateManager,
  }: {
    blockStateManager: BlockStateManager;
    boardStateManager: BoardStateManager;
    gameStateManager: GameStateManager;
    moveStateManager: MoveStateManager;
    slotStateManager: SlotStateManager;
    playerStateManager: PlayerStateManager;
  }) {
    this.blockStateManager = blockStateManager;
    this.boardStateManager = boardStateManager;
    this.gameStateManager = gameStateManager;
    this.moveStateManager = moveStateManager;
    this.playerStateManager = playerStateManager;
    this.slotStateManager = slotStateManager;
  }

  private blockStateManager: BlockStateManager;
  private boardStateManager: BoardStateManager;
  private gameStateManager: GameStateManager;
  private moveStateManager: MoveStateManager;
  private playerStateManager: PlayerStateManager;
  private slotStateManager: SlotStateManager;
}
