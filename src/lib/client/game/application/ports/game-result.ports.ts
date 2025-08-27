import type { Score } from '$lib/domain/score';
import type { BoardMatrix } from '$types';

/**
 * Manages the score confirmation phase of the game.
 */
export interface IGameResultManager {
  initiateScoreConfirmation(): void;

  getBoard(): BoardMatrix | undefined;

  setScore(score: Score): void;
}
