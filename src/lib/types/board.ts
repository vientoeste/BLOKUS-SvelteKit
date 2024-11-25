import type { RoomId } from '.';

export interface BoardDocumentInf {
  id: string;
  roomId: RoomId;
  board: string;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateBoardDTO {
  board: string;
}
