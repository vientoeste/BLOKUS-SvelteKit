import { CustomError } from "$lib/error";
import type { CreateRoomDTO, UpdateRoomDTO, RoomDocumentInf, RoomId, RoomCacheInf, RoomPreviewInf, UserInfo, CreateRoomCacheDTO, SlotIdx, PlayerIdx, GameId } from "$types";
import { handleMongoError, Rooms } from "./mongo";
import { gameEndSequenceRepository, roomCacheRepository } from "./redis";
import type { Score } from "$lib/domain/score";

export const getRooms = async ({
  limit, lastDocId,
}: {
  limit: number;
  lastDocId: string | null;
}): Promise<RoomPreviewInf[]> => {
  const query = lastDocId ? { _id: { $lt: lastDocId }, isDeleted: false } : { isDeleted: false };
  const rooms = await Rooms
    .find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .toArray()
    .catch(handleMongoError);

  return rooms.map(({ _id, ...rest }) => ({
    id: _id,
    ...rest,
  })) as RoomPreviewInf[];
};

export const getRoomInfo = async (roomId: string): Promise<RoomDocumentInf> => {
  const room = await Rooms.findOne({
    _id: roomId,
    isDeleted: false,
  }).catch(handleMongoError);

  if (!room) {
    throw new CustomError('not found', 404);
  }

  return room;
};

export const updateRoomInfo = async (
  roomId: string,
  updateRoomDTO: UpdateRoomDTO
): Promise<RoomDocumentInf> => {
  const result = await Rooms.findOneAndUpdate({
    _id: roomId,
    isDeleted: false
  }, {
    $set: {
      ...updateRoomDTO,
      updatedAt: new Date(),
    },
  }, {
    returnDocument: 'after'
  }).catch(handleMongoError);

  if (!result.value) {
    throw new CustomError('not found', 404);
  }

  return result.value;
};

export const updateRoomStartedState = async ({ isStarted, roomId }: { roomId: RoomId, isStarted: boolean }): Promise<void> => {
  const result = await Rooms.findOneAndUpdate({
    _id: roomId,
    isDeleted: false,
  }, {
    $set: {
      isStarted,
      updatedAt: new Date(),
    },
  }).catch(handleMongoError);

  if (!result.value) {
    throw new CustomError('not found', 404);
  }
};

export const deleteRoomInfo = async (roomId: string): Promise<void> => {
  const result = await Rooms.findOneAndUpdate({
    _id: roomId,
    isDeleted: false
  }, {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    },
  }).catch(handleMongoError);

  if (!result.value) {
    throw new CustomError('not found', 404);
  }
};

export const insertRoom = async (
  roomId: RoomId,
  createRoomDTO: CreateRoomDTO
): Promise<RoomId> => {
  const { name, user } = createRoomDTO;
  const { insertedId, acknowledged } = await Rooms.insertOne({
    _id: roomId,
    name,
    isStarted: false,
    isDeleted: false,
    players: [{
      ...user,
      playerIdx: 0,
    }],
    createdAt: new Date(),
    updatedAt: new Date(),
  }).catch(handleMongoError);

  if (!acknowledged || !insertedId) {
    throw new CustomError('insert failed', 500);
  }

  return insertedId.toString();
};

export const insertRoomCache = async (
  roomId: RoomId,
  createRoomCacheDTO: CreateRoomCacheDTO,
) => {
  const { name, user } = createRoomCacheDTO;
  const result = await roomCacheRepository.save(roomId, {
    name,
    turn: -1,
    started: false,
    p0_id: user.id,
    p0_username: user.username,
    p0_ready: false,
    slot0_exhausted: false,
    slot1_exhausted: false,
    slot2_exhausted: false,
    slot3_exhausted: false,
  });
  if (result.name === undefined) {
    throw new Error('insert room cache failed');
  }
};

export const getRoomCache = async (roomId: RoomId): Promise<RoomCacheInf> => {
  const room = await roomCacheRepository.fetch(roomId);
  if (!room || Object.keys(room).length === 0) {
    throw new CustomError('room cache not found', 404);
  }

  const {
    name, turn, started, gameId,
    slot0_exhausted, slot1_exhausted, slot2_exhausted, slot3_exhausted,
    p0_id, p0_ready, p0_username,
    p1_id, p1_ready, p1_username,
    p2_id, p2_ready, p2_username,
    p3_id, p3_ready, p3_username,
  } = room;
  if (
    !name || started === undefined || turn === undefined || p0_id === undefined || p0_ready === undefined || p0_username === undefined
    || slot0_exhausted === undefined || slot1_exhausted === undefined || slot2_exhausted === undefined || slot3_exhausted === undefined
  ) {
    throw new Error('invalid room cache type');
  }
  if (p1_id !== undefined && (p1_ready === undefined || p1_username === undefined)) {
    throw new Error('invalid p1 info at room cache');
  }
  if (p2_id !== undefined && (p2_ready === undefined || p2_username === undefined)) {
    throw new Error('invalid p2 info at room cache');
  }
  if (p3_id !== undefined && (p3_ready === undefined || p3_username === undefined)) {
    throw new Error('invalid p3 info at room cache');
  }

  return {
    id: roomId,
    name,
    gameId: gameId,
    // [TODO] currently lastMove is not used
    lastMove: '',
    turn,
    started,
    exhausted: [slot0_exhausted, slot1_exhausted, slot2_exhausted, slot3_exhausted],
    p0: {
      id: p0_id,
      ready: p0_ready,
      username: p0_username,
    },
    p1: p1_id !== undefined ? {
      id: p1_id,
      ready: p1_ready as boolean,
      username: p1_username as string,
    } : undefined,
    p2: p2_id !== undefined ? {
      id: p2_id,
      ready: p2_ready as boolean,
      username: p2_username as string,
    } : undefined,
    p3: p3_id !== undefined ? {
      id: p3_id,
      ready: p3_ready as boolean,
      username: p3_username as string,
    } : undefined,
  };
};

export const addUserToRoomCache = async ({ roomId, userInfo: { id, username } }: { userInfo: UserInfo, roomId: RoomId }) => {
  const room = await roomCacheRepository.fetch(roomId);
  const { p0_id, p1_id, p2_id, p3_id } = room;

  if (p0_id === id) {
    return 0;
  }
  if (p1_id === id) {
    return 1;
  }
  if (p2_id === id) {
    return 2;
  }
  if (p3_id === id) {
    return 3;
  }

  if (p1_id === undefined) {
    await roomCacheRepository.save(roomId, {
      ...room,
      p1_id: id,
      p1_username: username,
      p1_ready: false,
    });
    return 1;
  }
  if (p2_id === undefined) {
    await roomCacheRepository.save(roomId, {
      ...room,
      p2_id: id,
      p2_username: username,
      p2_ready: false,
    });
    return 2;
  }
  if (p3_id === undefined) {
    await roomCacheRepository.save(roomId, {
      ...room,
      p3_id: id,
      p3_username: username,
      p3_ready: false,
    });
    return 3;
  }
  throw new CustomError('room is full');
};

export const updatePlayerReadyState = async ({ roomId, playerIdx, ready }: { roomId: RoomId, playerIdx: PlayerIdx, ready: boolean }) => {
  const room = await roomCacheRepository.fetch(roomId);
  const { p0_ready, p1_ready, p2_ready, p3_ready } = room;
  const playerReadyState = {
    0: { p0_ready: ready, p1_ready, p2_ready, p3_ready },
    1: { p1_ready: ready, p0_ready, p2_ready, p3_ready },
    2: { p2_ready: ready, p0_ready, p1_ready, p3_ready },
    3: { p3_ready: ready, p0_ready, p1_ready, p2_ready },
  }[playerIdx];
  await roomCacheRepository.save(roomId, {
    ...room,
    ...playerReadyState
  });
};

export const markPlayerAsExhausted = async ({ roomId, slotIdx }: { roomId: RoomId, slotIdx: SlotIdx }) => {
  const room = await roomCacheRepository.fetch(roomId);
  const {
    slot0_exhausted: slot0_exhausted_,
    slot1_exhausted: slot1_exhausted_,
    slot2_exhausted: slot2_exhausted_,
    slot3_exhausted: slot3_exhausted_,
  } = room;
  const exhaustedSlot = {
    0: { slot0_exhausted: true, slot1_exhausted: slot1_exhausted_, slot2_exhausted: slot2_exhausted_, slot3_exhausted: slot3_exhausted_ },
    1: { slot1_exhausted: true, slot0_exhausted: slot0_exhausted_, slot2_exhausted: slot2_exhausted_, slot3_exhausted: slot3_exhausted_ },
    2: { slot2_exhausted: true, slot0_exhausted: slot0_exhausted_, slot1_exhausted: slot1_exhausted_, slot3_exhausted: slot3_exhausted_ },
    3: { slot3_exhausted: true, slot0_exhausted: slot0_exhausted_, slot1_exhausted: slot1_exhausted_, slot2_exhausted: slot2_exhausted_ },
  }[slotIdx];
  const {
    slot0_exhausted,
    slot1_exhausted,
    slot2_exhausted,
    slot3_exhausted,
  } = await roomCacheRepository.save(roomId, {
    ...room,
    ...exhaustedSlot,
  });
  if (slot0_exhausted && slot1_exhausted && slot2_exhausted && slot3_exhausted) {
    return { isGameEnd: true };
  }
  return { isGameEnd: false };
};

export const updateRoomCacheStartedState = async ({ roomId, isStarted, gameId }: { roomId: RoomId, isStarted: boolean, gameId: RoomId }) => {
  const room = await roomCacheRepository.fetch(roomId);
  await roomCacheRepository.save(roomId, {
    ...room,
    gameId,
    started: isStarted,
    turn: 0,
  });
};

export const createScoreValidationSequence = async ({
  roomId,
  gameId,
  playerIdx,
  score,
  playerIndices,
}: {
  roomId: RoomId;
  gameId: GameId;
  score: Score;
  playerIdx: PlayerIdx;
  playerIndices: PlayerIdx[];
}) => {
  const confirmFields = {
  };
  playerIndices.forEach((playerIdx) => {
    Object.defineProperty(confirmFields, `p${playerIdx}_confirm`, {
      value: false,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  });
  await gameEndSequenceRepository.save(roomId, {
    gameId,
    initiatedAt: new Date(),
    initiatedBy: playerIdx,
    refScore: score.toString(),
    ...confirmFields,
  });
};
