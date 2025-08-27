import { Score } from "$lib/domain/score";
import type { InboundScoreConfirmationMessage } from "$types";
import type { IGameResultManager } from "../application/ports";
import type { EventBus } from "../event";

export class GameResultOrchestrator {
  private eventBus: EventBus;
  private gameResultManager: IGameResultManager;

  constructor({
    eventBus,
    gameResultManager,
  }: {
    eventBus: EventBus;
    gameResultManager: IGameResultManager;
  }) {
    this.eventBus = eventBus;
    this.gameResultManager = gameResultManager;

    this.eventBus.subscribe('MessageReceived_ScoreConfirmation', () => {
      this.gameResultManager.initiateScoreConfirmation();
      const score = this.calculateScore();
      this.gameResultManager.setScore(score);
      const confirmMessage: InboundScoreConfirmationMessage = {
        type: 'SCORE_CONFIRM',
        score: score.toString(),
      };
      const successSubscription = this.eventBus.once('MessageReceived_GameEnd', () => {
        // [TODO] add modal
        failureSubscription.unsubscribe();
      });
      const failureSubscription = this.eventBus.once('MessageReceived_BadReq', () => {
        // [TODO] sync
        successSubscription.unsubscribe();
      });
      this.eventBus.publish('DispatchMessage', confirmMessage);
    });
  }

  calculateScore(): Score {
    const board = this.gameResultManager.getBoard();
    if (!board) {
      // [TODO] dispatch some event but it won't happen as well
      throw new Error('board is unavailable');
    }
    const score = Score.fromBoard(board);
    return score;
  }
}
