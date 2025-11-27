import type { Score } from "$lib/domain/score";
import type { GameId, SlotIdx } from "$types";
import { derived, get, writable, type Readable, type Writable } from "svelte/store";

export type MoveContextVerificationResult = {
  isValid: true;
  gameId: GameId;
} | {
  isValid: false;
  reason: string;
};

export type Phase = 'NOT_STARTED' | 'IN_PROGRESS' | 'CONFIRMING_SCORE';

export class GameStateManager {
  private gameId: GameId | null;
  private activePlayerCount: 2 | 3 | 4 | undefined;
  private score?: Score;

  private _phase: Writable<Phase>;
  private _turn: Writable<number>;
  private _currentSlotIdx: Readable<SlotIdx>;

  constructor() {
    this._turn = writable(-1);
    this.gameId = null;
    this._phase = writable('NOT_STARTED');
    this._currentSlotIdx = derived(this._turn, (store) => store % 4 as SlotIdx);
  }

  get turn(): Readable<number> {
    return { subscribe: this._turn.subscribe };
  }

  get currentSlotIdx() {
    return this._currentSlotIdx;
  }

  initializeNewGame({ gameId, activePlayerCount }: { gameId: GameId, activePlayerCount: 2 | 3 | 4 }) {
    this._turn.set(0);
    this.gameId = gameId;
    this.setPhase('IN_PROGRESS');
    this.activePlayerCount = activePlayerCount;
  }

  initiateScoreConfirmation() {
    this.setPhase('CONFIRMING_SCORE');
  }

  reset() {
    this._turn.set(-1);
    this.gameId = null;
    this.setPhase('NOT_STARTED');
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
  verifyMoveContext({ turn, slotIdx }: { turn: number, slotIdx: SlotIdx }): MoveContextVerificationResult {
    if (this.getPhase() !== 'IN_PROGRESS') {
      return { isValid: false, reason: 'game is not started' };
    }
    if (turn !== this.getCurrentTurn()) {
      return { isValid: false, reason: 'invalid turn' };
    }
    if (!this.gameId) {
      return { isValid: false, reason: 'gameId is missing' };
    }
    if (slotIdx !== turn % 4) {
      return { isValid: false, reason: 'wrong turn: try make move of your other slot' };
    }
    return { isValid: true, gameId: this.gameId };
  }

  restoreGameState({
    turn,
    gameId,
    phase,
    activePlayerCount,
  }: {
    turn: number,
    gameId: GameId,
    phase: Phase;
    activePlayerCount: 2 | 3 | 4;
  }) {
    this._turn.set(turn);
    this.gameId = gameId;
    this.setPhase(phase);
    this.activePlayerCount = activePlayerCount;
  }

  advanceTurn() {
    if (this.getPhase() !== 'IN_PROGRESS') {
      return -1;
    }
    this._turn.update(turn => turn += 1);
    return this.getCurrentTurn();
  }

  getCurrentTurn() {
    return get(this._turn);
  }

  getActivePlayerCount() {
    if (this.activePlayerCount === undefined) {
      // [TODO] request to server for missing infos again
      throw new Error('GameStateManager.activePlayerCount is missing');
    }
    return this.activePlayerCount;
  }

  get phase(): Readable<Phase> {
    return { subscribe: this._phase.subscribe };
  }

  getPhase() {
    return get(this._phase);
  }

  setPhase(phase: Phase) {
    this._phase.set(phase);
  }

  setScore(score: Score) {
    this.score = score;
  }

  getScore() {
    return this.score;
  }
}
