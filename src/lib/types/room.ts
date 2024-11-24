import type { PlayerId } from '.';

export type RoomId = string;

export interface RoomDocumentInf {
  _id: RoomId,
  name: string,
  isStarted: boolean,
  startedAt?: Date,
  players: {
    id: PlayerId;
    userId: string;
    username: string;
    playerIdx: number;
  }[];
  boardId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRoomDTO = Omit<RoomDocumentInf, '_id'>;

export type UpdateRoomDTO = Partial<Omit<RoomDocumentInf, 'id'>>;

export interface RoomCacheInf {
  id: RoomId,
  name: string,
  turn: number,
  lastMove: string,
  p0: { id: string, name: string, ready: boolean },
  p1: { id: string, name: string, ready: boolean },
  p2: { id: string, name: string, ready: boolean },
  p3: { id: string, name: string, ready: boolean },
}
