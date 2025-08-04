import type { GameId } from "$types";
import type { EventBus } from "../event";

type MoveContextVerificationResult = {
  isValid: true;
  gameId: GameId;
} | {
  isValid: false;
  reason: string;
};

export class GameStateManager {
  private turn: number;
  private gameId: GameId | null;
  private isStarted: boolean;
  private isEnded: boolean;
  private activePlayerCount: 2 | 3 | 4 | undefined;
  private eventBus: EventBus;

  constructor({ eventBus }: { eventBus: EventBus }) {
    this.turn = -1;
    this.gameId = null;
    this.isStarted = false;
    this.isEnded = false;
    this.eventBus = eventBus;

    this.eventBus.subscribe('MessageReceived_Start', (event) => {
      const { gameId, activePlayerCount } = event.payload;
      this.handleGameStart({ gameId, activePlayerCount });
    });

    this.eventBus.subscribe('MessageReceived_GameEnd', (event) => {
      this.handleGameEnd();
    });
  }

  handleGameStart({ gameId, activePlayerCount }: { gameId: GameId, activePlayerCount: 2 | 3 | 4 }) {
    this.turn = 0;
    this.gameId = gameId;
    this.isStarted = true;
    this.isEnded = false;
    this.activePlayerCount = activePlayerCount;
    this.eventBus.publish('GameStateInitialized', undefined);
  }

  handleGameEnd() {
    this.turn = -1;
    this.gameId = null;
    this.isStarted = false;
    this.isEnded = true;
    this.eventBus.publish('GameStateReset', undefined);
  }

  /**
   * Verifies the contextual validity of a Move.
   *
   * This method checks if the game has started, if it's the correct turn sequence,
   * and if the `gameId` is valid.
   * 
   * It returns a result object indicating success or failure.
   *
   * @returns {MoveContextVerificationResult} An object representing the validation result.
   * 
   * On success: `{ isValid: true, gameId: GameId }`,
   * 
   * On failure: `{ isValid: false, reason: string }`.
   */
  verifyMoveContext({ turn }: { turn: number }): MoveContextVerificationResult {
    if (this.isEnded || !this.isStarted) {
      return { isValid: false, reason: 'game is not started' };
    }
    if (turn !== this.turn + 1) {
      return { isValid: false, reason: 'invalid turn' };
    }
    if (!this.gameId) {
      return { isValid: false, reason: 'gameId is missing' };
    }
    return { isValid: true, gameId: this.gameId };
  }

  restoreGameState({
    turn,
    gameId,
    isStarted,
    isEnded,
  }: {
    turn: number,
    gameId: GameId,
    isStarted: boolean,
    isEnded: boolean,
  }) {
    this.turn = turn;
    this.gameId = gameId;
    this.isStarted = isStarted;
    this.isEnded = isEnded;
  }

  advanceTurn() {
    if (this.isEnded) {
      return -1;
    }
    this.turn += 1;
    return this.turn;
  }

  getCurrentTurn() {
    return this.turn;
  }

  getActivePlayerCount() {
    if (this.activePlayerCount === undefined) {
      // [TODO] request to server for missing infos again
      throw new Error('GameStateManager.activePlayerCount is missing');
    }
    return this.activePlayerCount;
  }
}
