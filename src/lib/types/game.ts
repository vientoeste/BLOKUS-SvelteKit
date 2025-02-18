import type { PlayerIdx } from "./room";

export type BlockType = '50' | '51' | '52' | '53' | '54' | '55' | '56' | '57' | '58' | '59' | '5a' | '5b' | '40' | '41' | '42' | '43' | '44' | '30' | '31' | '20' | '10';

/**
 * 프리셋에 저장된 블록을 제어하는 정보
 * 블록은 preset에 저장된 배열 형태로 핸들
 * 블록 타입 네이밍은 블록 개수와 타입(hex)을 합
 * 연산 순서는 type > rotation > flip
 */
export type Block = {
  type: BlockType;
  rotation: Rotation;
  flip: boolean;
}

export type BoardMatrix = (number | false)[][];

export type BlockMatrix = boolean[][];

export interface PlaceBlockDTO {
  block: BlockMatrix;
  position: number[];
  board: BoardMatrix;
  slotIdx: SlotIdx;
  turn: number;
}

export interface SubmitMoveDTO {
  blockInfo: Block;
  position: [number, number];
  slotIdx: SlotIdx;
}

export type MoveDTO = SubmitMoveDTO & {
  playerIdx: PlayerIdx;
  turn: number;
}

export type PutBlockDTO = MoveDTO & {
  board: BoardMatrix;
}

export type Rotation = PlayerIdx;

export type SlotIdx = PlayerIdx;
