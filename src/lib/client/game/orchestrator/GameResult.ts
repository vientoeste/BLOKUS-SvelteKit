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

    this.eventBus.subscribe('MessageReceived_ScoreConfirmation', () => {
      this.initiateScoreConfirmation();
      const score = this.calculateScore();
      const confirmMessage: InboundScoreConfirmationMessage = {
        type: 'SCORE_CONFIRM',
        score: score.toString(),
      };
      this.eventBus.publish('DispatchMessage', confirmMessage);
    });
  }

  initiateScoreConfirmation() {
    this.gameStateManager.initiateScoreConfirmation();
  }

  calculateScore(): Score {
    const board = this.boardStateManager.getBoard();
    if (!board) {
      // [TODO] dispatch some event but it won't happen as well
      throw new Error('board is unavailable');
    }
    const score = Score.fromBoard(board);
    return score;
  }
}
