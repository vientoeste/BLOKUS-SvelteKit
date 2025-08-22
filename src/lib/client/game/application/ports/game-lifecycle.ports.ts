import type { GameId, Move, SlotIdx } from '$types';

/**
 * Manages the core lifecycle of a game session, such as initialization, restoration, and reset.
 */
export interface IGameLifecycleManager {
  initializeNewGame(payload: { gameId: GameId; activePlayerCount: 2 | 3 | 4 }): void;

  resetAllGameStates(): void;

  /**
   * Restores game state upon reconnect.
   * It encapsulates all state restoration logic (board, blocks, slots, moveHistory) within the facade.
   */
  restoreGame(payload: { moves: Move[]; exhaustedSlots: SlotIdx[] }): void;
}
