import type { RoomId } from '.';

export interface BoardInf {
  id: string;
  roomId: RoomId;
  board: string;
  isDone: boolean;
}
