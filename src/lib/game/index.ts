import { gameEndSequenceRepository, roomCacheRepository } from "$lib/database/redis";
import { createScoreValidationSequence } from "$lib/database/room";
import type { PlayerIdx, RoomId } from "$types";
import { compareScores, generateGameSummary } from "$lib/game/server";
import { Score } from "$lib/domain/score";

export const initiateGameEndSequence = async ({ playerIdx, roomId }: { roomId: RoomId, playerIdx: PlayerIdx }) => {
  const roomCache = await roomCacheRepository.fetch(roomId);
  if (!roomCache.gameId) {
    throw new Error('gameId is not set');
  }
  const score = await generateGameSummary(roomCache.gameId);
  const playerIndices: PlayerIdx[] = [0];
  if (roomCache.p1_id !== undefined) playerIndices.push(1);
  if (roomCache.p2_id !== undefined) playerIndices.push(2);
  if (roomCache.p3_id !== undefined) playerIndices.push(3);
  await createScoreValidationSequence({
    roomId,
    score,
    playerIdx,
    gameId: roomCache.gameId,
    playerIndices,
  });
  return score;
};

export const confirmScore = async ({ roomId, score, playerIdx }: { roomId: RoomId, score: Score, playerIdx: PlayerIdx }) => {
  const sequenceCache = await gameEndSequenceRepository.fetch(roomId);
  if (!sequenceCache.refScore) {
    throw new Error('sequence cache is not initailized');
  }
  const serverScore = new Score(sequenceCache.refScore);
  const result = compareScores(serverScore, score);
  if (!result) {
    return {
      success: false,
      reason: 'score is not equal',
    };
  }

  await gameEndSequenceRepository.updateField(roomId, `p${playerIdx}_confirm`, 1 as unknown as boolean);
  // [TODO] use lua to reduce cache fetch
  const { p0_confirm, p1_confirm, p2_confirm, p3_confirm } = await gameEndSequenceRepository.fetch(roomId);
  return {
    success: true,
    isDone: [p0_confirm, p1_confirm, p2_confirm, p3_confirm]
      .filter(e => e === false)
      .length === 0
  };
};
