import { uuidv7 } from "uuidv7";
import { insertExhaustedMove, insertRegularMove, insertTimeoutMove } from "./database/move";
import { roomCacheRepository } from "./database/redis";
import { getRoomCache, getRoomInfo, getRooms, insertRoom, insertRoomCache, updateRoomCacheStartedState, updateRoomStartedState } from "./database/room";
import { CustomError } from "./error";
import type { CreateRoomDTO, MoveDTO, PlayerIdx, RoomCacheInf, RoomDocumentInf, RoomId, SlotIdx } from "./types";
import { compressMove, extractPlayerCountFromCache, isRightTurn } from "./utils";

export const createRoom = async (roomId: RoomId, createRoomDTO: CreateRoomDTO): Promise<RoomId> => {
  const id = await insertRoom(roomId, createRoomDTO);
  if (id !== roomId) {
    throw new CustomError('internal error', 500);
  }
  await insertRoomCache(roomId, createRoomDTO);
  return id;
};

export const getRoomsFromLastObj = async (lastDocId: string | null) => {
  const rooms = await getRooms({ lastDocId, limit: 10 });
  return rooms;
};

export const getRoomById = async (roomId: RoomId): Promise<{ room: RoomDocumentInf, roomCache: RoomCacheInf }> => {
  const room = await getRoomInfo(roomId);
  const roomCache = await getRoomCache(roomId);
  return {
    room, roomCache,
  };
};

export const updateStartedState = async ({ roomId, isStarted, gameId }: { roomId: RoomId, isStarted: boolean, gameId: RoomId }): Promise<void> => {
  await updateRoomStartedState({ roomId, isStarted });
  await updateRoomCacheStartedState({ roomId, isStarted, gameId });
};

export const applyMove = async ({
  roomId,
  move: {
    blockInfo,
    playerIdx,
    position,
    slotIdx,
    turn,
  },
}: {
  roomId: RoomId, move: MoveDTO,
}) => {
  const roomCache = await roomCacheRepository.fetch(roomId);
  if (!isRightTurn({
    turn: turn,
    activePlayerCount: extractPlayerCountFromCache(roomCache),
    playerIdx,
  }) || turn !== roomCache.turn) {
    return {
      success: false,
      reason: 'wrong turn',
    };
  }
  if (!roomCache.gameId) {
    // [TODO] invalidate cache & ...
    return {
      success: false,
      reason: 'invalid game id',
    };
  }

  const moveId = uuidv7();
  await insertRegularMove(moveId, {
    blockInfo,
    gameId: roomCache.gameId,
    playerIdx,
    position,
    slotIdx,
    turn,
    createdAt: new Date(),
  });
  const compressedMove = compressMove({
    playerIdx,
    flip: blockInfo.flip,
    position,
    rotation: blockInfo.rotation,
    type: blockInfo.type,
  });

  await roomCacheRepository.save({
    ...roomCache,
    lastMove: compressedMove,
    turn: turn + 1,
  });
  return {
    success: true,
  };
};

// [TODO] integrate validation with applyMove
export const applySkipTurn = async ({
  roomId,
  type,
  turn,
  playerIdx,
  slotIdx,
}: {
  roomId: RoomId
  type: 'timeout' | 'exhausted',
  turn: number,
  playerIdx: PlayerIdx,
  slotIdx: SlotIdx,
}) => {
  const roomCache = await roomCacheRepository.fetch(roomId);
  if (!isRightTurn({
    turn,
    activePlayerCount: extractPlayerCountFromCache(roomCache),
    playerIdx,
  }) || turn !== roomCache.turn) {
    return {
      success: false,
      reason: 'wrong turn',
    };
  }
  if (!roomCache.gameId) {
    // [TODO] invalidate cache & ...
    return {
      success: false,
      reason: 'invalid game id',
    };
  }
  const moveId = uuidv7();
  switch (type) {
    case 'timeout':
      await insertTimeoutMove(moveId, {
        turn,
        gameId: roomCache.gameId,
        exhausted: false,
        playerIdx,
        slotIdx,
        timeout: true,
        createdAt: new Date(),
      });
      break;
    case 'exhausted':
      await insertExhaustedMove(moveId, {
        createdAt: new Date(),
        exhausted: true,
        gameId: roomCache.gameId,
        playerIdx,
        slotIdx,
        timeout: false,
        turn,
      });
      break;
    default:
      // cause error
      break;
  }
  await roomCacheRepository.save({
    ...roomCache,
    turn: turn + 1,
  });
  return {
    success: true,
  };
};
