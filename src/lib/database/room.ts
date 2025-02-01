import { CustomError } from "$lib/error";
import type { CreateRoomDTO, UpdateRoomDTO, RoomDocumentInf, RoomId, RoomCacheInf, RoomPreviewInf, UserInfo, CreateRoomCacheDTO } from "$types";
import { parseJson } from "$lib/utils";
import { handleMongoError, Rooms } from "./mongo";
import { redis } from "./redis";

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
  const result = await redis.hSet(`room:${roomId}`, {
    id: roomId,
    name,
    turn: -1,
    lastMove: '',
    started: 0,
    p0: JSON.stringify({ id: user.id, username: user.username, ready: 0 }),
    p1: '',
    p2: '',
    p3: '',
  });
  if (result === 0) {
    // [TODO] flush?
    throw new Error('room already existing');
  }
};

export const getRoomCache = async (roomId: RoomId): Promise<RoomCacheInf> => {
  const room = await redis.hGetAll(`room:${roomId}`);
  if (!room || Object.keys(room).length === 0) {
    throw new CustomError('room cache not found', 404);
  }
  const { id, name, turn, lastMove, started } = room;
  const { p0, p1, p2, p3 } = room;
  const p0_ = parseJson<{ id: string, username: string, ready: boolean }>(p0);
  const p1_ = p1 ? parseJson<{ id: string, username: string, ready: boolean }>(p1) : undefined;
  const p2_ = p2 ? parseJson<{ id: string, username: string, ready: boolean }>(p2) : undefined;
  const p3_ = p3 ? parseJson<{ id: string, username: string, ready: boolean }>(p3) : undefined;
  if (
    typeof p0_ === 'string' ||
    typeof p1_ === 'string' ||
    typeof p2_ === 'string' ||
    typeof p3_ === 'string'
  ) {
    // [CHECK] invalidate cache & DB?
    throw new CustomError('failed to parse players');
  }
  return {
    id,
    name,
    turn: parseInt(turn),
    lastMove: lastMove,
    started: Boolean(started),
    p0: p0_,
    p1: p1_,
    p2: p2_,
    p3: p3_,
  };
};

export const addUserToRoomCache = async ({ roomId, userInfo }: { userInfo: UserInfo, roomId: RoomId }) => {
  const room = await getRoomCache(roomId);
  const { p0, p1, p2, p3 } = room;

  if (p0 && p0.id === userInfo.id) {
    return 0;
  }
  if (p1 && p1.id === userInfo.id) {
    return 1;
  }
  if (p2 && p2.id === userInfo.id) {
    return 2;
  }
  if (p3 && p3.id === userInfo.id) {
    return 3;
  }

  if (p1 === undefined) {
    await redis.hSet(`room:${roomId}`, 'p1', JSON.stringify(userInfo));
    return 1;
  }
  if (p2 === undefined) {
    await redis.hSet(`room:${roomId}`, 'p2', JSON.stringify(userInfo));
    return 2;
  }
  if (p3 === undefined) {
    await redis.hSet(`room:${roomId}`, 'p3', JSON.stringify(userInfo));
    return 3;
  }
  throw new CustomError('room is full');
};
