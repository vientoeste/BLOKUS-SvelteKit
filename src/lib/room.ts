import { getRoomCache, getRoomInfo, getRooms, insertRoom, insertRoomCache, updateRoomCacheStartedState, updateRoomStartedState } from "./database/room";
import { CustomError } from "./error";
import type { CreateRoomDTO, RoomCacheInf, RoomDocumentInf, RoomId, RoomInf } from "./types";

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
