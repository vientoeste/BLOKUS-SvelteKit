import { CustomError } from "$lib/error";
import type { CreateRoomDTO, UpdateRoomDTO, RoomDocumentInf, RoomId, RoomCacheInf, RoomPreviewInf } from "$lib/types";
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
  const { insertedId, acknowledged } = await Rooms.insertOne({
    _id: roomId,
    isStarted: false,
    isDeleted: false,
    ...createRoomDTO,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).catch(handleMongoError);

  if (!acknowledged || !insertedId) {
    throw new CustomError('insert failed', 500);
  }

  return insertedId.toString();
};

export const getRoomCache = async (roomId: RoomId): Promise<RoomCacheInf> => {
  const room = await redis.hGetAll(`room:${roomId}`);
  if (!room || room.keys.length === 0) {
    throw new CustomError('room cache not found', 404);
  }
  const { id, name, turn, lastMove, started } = room;
  return {
    id,
    name,
    turn: parseInt(turn),
    lastMove: lastMove,
    started: Boolean(started),
    p0: JSON.parse(room.p0) as { id: string, name: string, ready: boolean },
    p1: JSON.parse(room.p1) as { id: string, name: string, ready: boolean },
    p2: JSON.parse(room.p2) as { id: string, name: string, ready: boolean },
    p3: JSON.parse(room.p3) as { id: string, name: string, ready: boolean },
  };
};
