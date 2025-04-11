import { CustomError } from "$lib/error";
import type { CreateRoomDTO, UpdateRoomDTO, RoomDocumentInf, RoomId, RoomCacheInf, RoomPreviewInf, UserInfo, CreateRoomCacheDTO, RawParticipantInf, SlotIdx } from "$types";
import { parseJson } from "$lib/utils";
import { handleMongoError, Rooms } from "./mongo";
import { redis, roomCacheRepository } from "./redis";

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
    id: roomId,
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
    id: roomId,
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
    p0_exhausted: false,
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

  const { name, turn, lastMove, started, gameId, p0_exhausted, p0_id, p0_ready, p0_username, p1_exhausted, p1_id, p1_ready, p1_username, p2_exhausted, p2_id, p2_ready, p2_username, p3_exhausted, p3_id, p3_ready, p3_username } = room;
  if (!name || started === undefined || turn === undefined || p0_id === undefined || p0_ready === undefined || p0_username === undefined || p0_exhausted === undefined) {
    throw new Error('invalid room cache type');
  }
  if (p1_id !== undefined && (p1_ready === undefined || p1_username === undefined || p1_exhausted === undefined)) {
    throw new Error('invalid p1 info at room cache')
  }
  if (p2_id !== undefined && (p2_ready === undefined || p2_username === undefined || p2_exhausted === undefined)) {
    throw new Error('invalid p2 info at room cache')
  }
  if (p3_id !== undefined && (p3_ready === undefined || p3_username === undefined || p3_exhausted === undefined)) {
    throw new Error('invalid p3 info at room cache')
  }

  return {
    id: roomId,
    name,
    gameId: gameId,
    // [TODO] currently lastMove is not used
    lastMove: '',
    turn,
    started,
    p0: {
      id: p0_id,
      ready: p0_ready,
      username: p0_username,
      exhausted: p0_exhausted,
    },
    p1: p1_id !== undefined ? {
      id: p1_id,
      ready: p1_ready as boolean,
      username: p1_username as string,
      exhausted: p1_exhausted as boolean,
    } : undefined,
    p2: p2_id !== undefined ? {
      id: p2_id,
      ready: p2_ready as boolean,
      username: p2_username as string,
      exhausted: p2_exhausted as boolean,
    } : undefined,
    p3: p3_id !== undefined ? {
      id: p3_id,
      ready: p3_ready as boolean,
      username: p3_username as string,
      exhausted: p3_exhausted as boolean,
    } : undefined,
  };
};

export const addUserToRoomCache = async ({ roomId, userInfo: { id, username } }: { userInfo: UserInfo, roomId: RoomId }) => {
  const room = await getRoomCache(roomId);
  const { p0, p1, p2, p3 } = room;

  if (p0 && p0.id === id) {
    return 0;
  }
  if (p1 && p1.id === id) {
    return 1;
  }
  if (p2 && p2.id === id) {
    return 2;
  }
  if (p3 && p3.id === id) {
    return 3;
  }

  const participant: RawParticipantInf = {
    id, username, ready: 0,
  };
  if (p1 === undefined) {
    await redis.hSet(`room:${roomId}`, 'p1', JSON.stringify(participant));
    return 1;
  }
  if (p2 === undefined) {
    await redis.hSet(`room:${roomId}`, 'p2', JSON.stringify(participant));
    return 2;
  }
  if (p3 === undefined) {
    await redis.hSet(`room:${roomId}`, 'p3', JSON.stringify(participant));
    return 3;
  }
  throw new CustomError('room is full');
};

// [TODO] refactor this room structure with p0~3
export const markPlayerAsExhausted = async ({ roomId, slotIdx }: { roomId: RoomId, slotIdx: SlotIdx }): Promise<SlotIdx[]> => {
  const exhaustedUserSlots = await redis.hGet(`room:${roomId}`, `exhausted`);
  if (exhaustedUserSlots === undefined) {
    await redis.hSet(`room:${roomId}`, `exhausted`, slotIdx);
    return [slotIdx];
  }
  const updatedExhaustedUserSlots = `${exhaustedUserSlots}${slotIdx}`;
  await redis.hSet(`room:${roomId}`, `exhausted`, updatedExhaustedUserSlots);
  return updatedExhaustedUserSlots.split('').map(e => parseInt(e) as SlotIdx);
};
