import type { BlockType } from "./game";

export interface MoveDocumentInf {
  id: string;
  boardId: string;
  userId: string;
  blockType: BlockType;
  position: [number, number];
  turn: number;
  createdAt: Date;
}
