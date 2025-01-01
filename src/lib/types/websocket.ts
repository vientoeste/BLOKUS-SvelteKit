import type { BlockType, UserInfo } from ".";

interface WebSocketMessageBase {
  type: string;
}

export interface LeaveMessage extends WebSocketMessageBase {
  type: 'LEAVE';
  playerIdx: 0 | 1 | 2 | 3;
}

export interface ConnectedMessage extends WebSocketMessageBase, UserInfo {
  type: 'CONNECTED';
  playerIdx: 0 | 1 | 2 | 3;
}

export interface StartMessage extends WebSocketMessageBase {
  type: 'START';
}

export interface ReadyMessage extends WebSocketMessageBase {
  type: 'READY';
  playerIdx: 0 | 1 | 2 | 3;
}

export interface CancelReadyMessage extends WebSocketMessageBase {
  type: 'CANCEL_READY';
  playerIdx: 0 | 1 | 2 | 3;
}

export interface MoveMessage extends WebSocketMessageBase {
  type: 'MOVE';
  block: BlockType;
  rotation: number;
  flip: boolean;
  position: [number, number];
  playerIdx: 0 | 1 | 2 | 3;
}

export interface ReportMessage extends Omit<MoveMessage, 'type'> {
  type: 'REPORT';
  turn: number;
}

export type WebSocketMessage = ConnectedMessage | LeaveMessage | StartMessage | ReadyMessage | CancelReadyMessage | MoveMessage | ConnectedMessage | ReportMessage;
