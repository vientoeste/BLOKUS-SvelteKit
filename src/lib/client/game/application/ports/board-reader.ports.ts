import type { BoardMatrix } from '$types';

/**
 * Provides read-only access to the current board state.
 */
export interface IBoardReader {
  getBoard(): BoardMatrix | undefined;
}
