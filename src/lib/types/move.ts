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
  exhausted: false;
}

export type InsertRegularMoveDto = MoveBase & {
  blockInfo: Block;
  position: [number, number];
}

export type InsertExhaustedMoveDto = MoveBase & {
  timeout: false;
  exhausted: true;
}

export type MoveDocumentInf = MoveBase & {
  _id: string;
} & ({
  timeout: true;
  exhausted: false;
} | {
  timeout: false;
  exhausted: true;
} | {
  blockInfo: string;
  position: [number, number];
  timeout: false;
  exhausted: false;
});

export type Move = RegularMove | TimeoutMove | ExhaustedMove;

export type TimeoutMove = MoveBase & {
  timeout: true;
  exhausted: false;
}

export type RegularMove = MoveBase & {
  blockInfo: Block;
  position: [number, number];
  timeout: false;
  exhausted: false;
}

export type ExhaustedMove = MoveBase & {
  exhausted: true;
  timeout: false;
}
