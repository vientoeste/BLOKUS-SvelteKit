import type { BlockType, BoardMatrix, GameId, SlotIdx } from '$types';

/**
 * Manages the game's turn flow.
 */
export interface ITurnManager {
  getCurrentTurn(): number;

  advanceTurn(): number;

  getActivePlayerCount(): 2 | 3 | 4;

  /**
   * Verifies the contextual validity of a received Move: turn order, gameId.
   */
  verifyMoveContext(payload: { turn: number; slotIdx: SlotIdx }): { isValid: boolean; reason?: string; gameId?: GameId };
}

/**
 * Provides the necessary data from the state for a calculation.
 * The Orchestrator musy use this to get data for the Calculator.
 */
export interface ICalculationDataProvider {
  getUnusedBlocks(): { blockType: BlockType; slotIdx: SlotIdx }[];

  getBoard(): BoardMatrix | undefined;
}

/**
 * Applies the result of a calculation back to the state.
 * The Orchestrator must use this after the Calculator finishes.
 */
export interface ICalculationResultApplier {
  updateBlockAvailability(unavailableBlocks: { slotIdx: SlotIdx; blockType: BlockType }[]): void;
}
