import { roomCacheRepository } from "$lib/database/redis";
import { createScoreValidationSequence } from "$lib/database/room";
import type { PlayerIdx, RoomId } from "$types";
import { generateGameSummary } from "$lib/game/server";

export const initiateGameEndProcess = async ({ playerIdx, roomId }: { roomId: RoomId, playerIdx: PlayerIdx }) => {
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
