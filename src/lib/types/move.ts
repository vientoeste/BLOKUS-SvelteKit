import type { Block, SlotIdx } from "./game";
import type { PlayerIdx } from "./room";

export interface SubmitMoveDTO {
  blockInfo: Block;
  position: [number, number];
  slotIdx: SlotIdx;
}

export type MoveDTO = SubmitMoveDTO & {
  playerIdx: PlayerIdx;
  turn: number;
}

export type MoveBase = {
  gameId: string;
  playerIdx: PlayerIdx;
  slotIdx: SlotIdx;
  turn: number;
  createdAt: Date;
}

export type InsertTimeoutMoveDto = MoveBase & {
  timeout: true;
}

export type InsertNonTimeoutMoveDto = MoveBase & {
  blockInfo: Block;
  position: [number, number];
  timeout: false;
}

export type MoveDocumentInf = MoveBase & {
  _id: string;
} & ({
  timeout: true;
} | {
  blockInfo: string;
  position: [number, number];
  timeout: false;
});

export type Move = TimeoutMove | NonTimeoutMove;

export type TimeoutMove = MoveBase & {
  timeout: true;
}

export type NonTimeoutMove = MoveBase & {
  blockInfo: Block;
  position: [number, number];
  timeout: false;
}
