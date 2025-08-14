import type { BoardMatrix } from '$types';

/**
 * Manages the score confirmation phase of the game.
 */
export interface IGameResultManager {
  initiateScoreConfirmation(): void;

  getBoard(): BoardMatrix | undefined;
}
