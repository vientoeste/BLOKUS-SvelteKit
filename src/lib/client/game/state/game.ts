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
  private _phase: Writable<Phase>;
  private _turn: Writable<number>;
  private _currentSlotIdx: Readable<SlotIdx>;
  private _score: Writable<Score | undefined>;
  private _gameId: Writable<GameId | null>;
  private _activePlayerCount: Writable<2 | 3 | 4 | undefined>;

  constructor() {
    this._turn = writable(-1);
    this._phase = writable('NOT_STARTED');
    this._currentSlotIdx = derived(this._turn, (store) => {
      if (store === -1) return 0;
      return store % 4 as SlotIdx;
    });
    this._score = writable(undefined);
    this._gameId = writable(null);
    this._activePlayerCount = writable(undefined);
  }

  get turn(): Readable<number> {
    return { subscribe: this._turn.subscribe };
  }

  get currentSlotIdx() {
    return this._currentSlotIdx;
  }

  // Activate this getter if needed.
  // get score(): Readable<Score | undefined> {
  //   return { subscribe: this._score.subscribe };
  // }
  // get gameId(): Readable<GameId | null> {
  //   return { subscribe: this._gameId.subscribe };
  // }
  // get activePlayerCount(): Readable<2 | 3 | 4 | undefined> {
  //   return { subscribe: this._activePlayerCount.subscribe };
  // }

  initializeNewGame({ gameId, activePlayerCount }: { gameId: GameId, activePlayerCount: 2 | 3 | 4 }) {
    this._turn.set(0);
    this._gameId.set(gameId);
    this.setPhase('IN_PROGRESS');
    this._activePlayerCount.set(activePlayerCount);
  }

  initiateScoreConfirmation() {
    this.setPhase('CONFIRMING_SCORE');
  }

  reset() {
    this._turn.set(-1);
    this._gameId.set(null);
    this.setPhase('NOT_STARTED');
  }

  getGameId() {
    return get(this._gameId);
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
    const gameId = this.getGameId();
    if (!gameId) {
      return { isValid: false, reason: 'gameId is missing' };
    }
    if (slotIdx !== turn % 4) {
      return { isValid: false, reason: 'wrong turn: try make move of your other slot' };
    }
    return { isValid: true, gameId };
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
    this._gameId.set(gameId);
    this.setPhase(phase);
    this._activePlayerCount.set(activePlayerCount);
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
    const activePlayerCount = get(this._activePlayerCount);
    if (activePlayerCount === undefined) {
      // [TODO] request to server for missing infos again
      throw new Error('GameStateManager.activePlayerCount is missing');
    }
    return activePlayerCount;
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
    this._score.set(score);
  }

  getScore() {
    return get(this._score);
  }
}
