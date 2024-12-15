import type { PlayerId } from '.';

export type RoomId = string;

export interface RoomInf {
  id: RoomId,
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
}

export type RoomDocumentInf = Omit<RoomInf, 'id'> & {
  _id: RoomId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomRequestDTO {
  name: string;
}

export interface CreateRoomDTO {
  name: string;
  players: [{
    id: PlayerId;
    userId: string;
    username: string;
    playerIdx: number;
  }],
}

export type UpdateRoomDTO = Partial<Omit<RoomInf, '_id'>>;

export interface RoomCacheInf {
  id: RoomId;
  name: string;
  turn: number;
  lastMove: string;
  started: boolean;
  p0: { id: string, name: string, ready: boolean },
  p1: { id: string, name: string, ready: boolean },
  p2: { id: string, name: string, ready: boolean },
  p3: { id: string, name: string, ready: boolean },
}
