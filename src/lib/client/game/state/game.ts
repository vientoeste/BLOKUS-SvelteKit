import type { GameId } from "$types";

export type MoveContextVerificationResult = {
  isValid: true;
  gameId: GameId;
} | {
  isValid: false;
  reason: string;
};

export type Phase = 'NOT_STARTED' | 'IN_PROGRESS' | 'CONFIRMING_SCORE';

export class GameStateManager {
  private turn: number;
  private gameId: GameId | null;
  private phase: Phase;
  private activePlayerCount: 2 | 3 | 4 | undefined;

  constructor() {
    this.turn = -1;
    this.gameId = null;
    this.phase = 'NOT_STARTED';
  }

  initialize({ gameId, activePlayerCount }: { gameId: GameId, activePlayerCount: 2 | 3 | 4 }) {
    this.turn = 0;
    this.gameId = gameId;
    this.phase = 'IN_PROGRESS';
    this.activePlayerCount = activePlayerCount;
  }

  initiateScoreConfirmation() {
    this.phase = 'CONFIRMING_SCORE';
  }

  reset() {
    this.turn = -1;
    this.gameId = null;
    this.phase = 'NOT_STARTED';
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
    if (this.phase !== 'IN_PROGRESS') {
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
    phase,
  }: {
    turn: number,
    gameId: GameId,
    phase: Phase;
  }) {
    this.turn = turn;
    this.gameId = gameId;
    this.phase = phase;
  }

  advanceTurn() {
    if (this.phase !== 'IN_PROGRESS') {
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
