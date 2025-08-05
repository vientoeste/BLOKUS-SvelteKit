import { Score } from "$lib/domain/score";
import type { InboundScoreConfirmationMessage } from "$types";
import type { EventBus } from "../event";
import type { BoardStateManager } from "../state/board";
import type { GameStateManager } from "../state/game";

export class GameResultOrchestrator {
  private eventBus: EventBus;
  private gameStateManager: GameStateManager;
  private boardStateManager: BoardStateManager;

  constructor({
    eventBus,
    gameStateManager,
    boardStateManager,
  }: {
    eventBus: EventBus;
    gameStateManager: GameStateManager;
    boardStateManager: BoardStateManager;
  }) {
    this.eventBus = eventBus;
    this.gameStateManager = gameStateManager;
    this.boardStateManager = boardStateManager

    this.eventBus.subscribe('MessageReceived_ScoreConfirmation', (event) => {
      // [TODO] mark game as ended
      // [TODO] calculate score
      // [TODO] dispatch score confirm
    });
  }
}
