import type { PlayerId } from '.';

export type RoomId = string;

export interface RoomDocumentInf {
  id: RoomId,
  name: string,
  isStarted: boolean,
  startedAt?: Date,
  players: {
    id: PlayerId;
    userId: string;
    username: string;
    playerIdx: number;
    score: number;
    isActive: boolean;
  }[];
  boardId: string;
}

export interface RoomCacheInf {
  id: RoomId,
  name: string,
  turn: number,
  lastMove: string,
}