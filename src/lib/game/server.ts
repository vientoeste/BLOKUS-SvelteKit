import { getMovesByGameId } from "$lib/database/move";
import { Score } from "$lib/domain/score";
import type { GameId, RegularMove } from "$types";
import { createNewBoard, getBlockMatrix, placeBlock } from "./core";

export const generateGameSummary = async (gameId: GameId): Promise<Score> => {
  const moves = await getMovesByGameId(gameId, {
    onlyRegularMoves: true,
  }) as RegularMove[];
  const board = createNewBoard();
  moves.forEach((move) => {
    placeBlock({
      block: getBlockMatrix(move.blockInfo),
      board,
      position: move.position,
      slotIdx: move.slotIdx,
      turn: move.turn,
    });
  });
  // [TODO] add last-monomino-rule
  return Score.fromBoard(board);
};

export const compareScores = (score1: Score, score2: Score) => {
  return score1.toString() === score2.toString();
};
