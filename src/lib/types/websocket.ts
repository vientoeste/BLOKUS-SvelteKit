import type { BlockType } from ".";

interface WebSocketMessageBase {
  type: string;
}

export interface ConnectedMessage extends WebSocketMessageBase {
  type: 'CONNECTED';
}

export interface StartMessage extends WebSocketMessageBase {
  type: 'START';
}

export interface ReadyMessage extends WebSocketMessageBase {
  type: 'READY';
}

export interface MoveMessage extends WebSocketMessageBase {
  type: 'MOVE';
  block: BlockType;
  rotation: number;
  flip: boolean;
  position: [number, number];
  playerIdx: 0 | 1 | 2 | 3;
}

export type WebSocketMessage = StartMessage | ReadyMessage | MoveMessage;
