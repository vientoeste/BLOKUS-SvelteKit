import { getRooms, insertRoom } from "./database/room";
import { CustomError } from "./error";
import type { CreateRoomDTO, RoomId } from "./types";

export const createRoom = async (roomId: RoomId, createRoomDTO: CreateRoomDTO): Promise<RoomId> => {
  const id = await insertRoom(roomId, createRoomDTO);
  if (id !== roomId) {
    throw new CustomError('internal error', 500);
  }
  return id;
};

export const getRoomsFromLastObj = async (lastDocId: string | null) => {
  const rooms = await getRooms({ lastDocId, limit: 2 });
  return rooms;
};
