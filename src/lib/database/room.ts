import { CustomError } from "$lib/error";
import type { CreateRoomDTO, UpdateRoomDTO, RoomDocumentInf } from "$lib/types";
import { handleMongoError, Rooms } from "./mongo";

export const getRooms = async ({
  page,
  offset
}: {
  page: number;
  offset: number;
}): Promise<RoomDocumentInf[]> => {
  const rooms = await Rooms.find({
    isDeleted: false
  }, {
    limit: offset,
    skip: page * offset,
  }).toArray().catch(handleMongoError);

  return rooms;
};

export const getRoomInfo = async (roomId: string): Promise<RoomDocumentInf> => {
  const room = await Rooms.findOne({
    id: roomId,
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
  const result = await Rooms.findOneAndUpdate(
    {
      id: roomId,
      isDeleted: false
    },
    { $set: updateRoomDTO },
    { returnDocument: 'after' }
  ).catch(handleMongoError);

  if (!result.value) {
    throw new CustomError('not found', 404);
  }

  return result.value;
};

export const deleteRoomInfo = async (roomId: string): Promise<void> => {
  const result = await Rooms.findOneAndUpdate(
    {
      id: roomId,
      isDeleted: false
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date()
      }
    }
  ).catch(handleMongoError);

  if (!result.value) {
    throw new CustomError('not found', 404);
  }
};

export const insertRoom = async (
  roomId: string,
  createRoomDTO: CreateRoomDTO
): Promise<string> => {
  const { insertedId, acknowledged } = await Rooms.insertOne({
    _id: roomId,
    ...createRoomDTO,
    createdAt: new Date(),
  }).catch(handleMongoError);

  if (!acknowledged || !insertedId) {
    throw new CustomError('insert failed', 500);
  }

  return insertedId.toString();
};