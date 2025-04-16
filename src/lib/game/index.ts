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
  await createScoreValidationSequence({
    roomId,
    score,
    playerIdx,
    gameId: roomCache.gameId,
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

  sequenceCache[`p${playerIdx}_confirm`] = true;
  const { p0_confirm, p1_confirm, p2_confirm, p3_confirm, participantCount } = await gameEndSequenceRepository.save(sequenceCache);
  return {
    success: true,
    isDone: [p0_confirm, p1_confirm, p2_confirm, p3_confirm]
      .filter(e => e === true)
      .length === participantCount
  };
};
