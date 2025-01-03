import type { WebSocket as WebSocket_ } from "ws";

type BlockType = '50' | '51' | '52' | '53' | '54' | '55' | '56' | '57' | '58' | '59' | '5a' | '5b' | '40' | '41' | '42' | '43' | '44' | '30' | '31' | '20' | '10';

interface UserInfo {
  id: string;
  userId: string;
  username: string;
}

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

export interface ErrorMessage extends WebSocketMessageBase {
  type: 'ERROR';
  cause: string;
}

export type WebSocketMessage = ConnectedMessage | LeaveMessage | StartMessage | ReadyMessage | CancelReadyMessage | MoveMessage | ConnectedMessage | ReportMessage | ErrorMessage;

// since payload's type is defined as string, it must be WebSocketMessage after parsed
export type WebSocketBrokerMessage = { payload: string, roomId: string };

export interface WebSocket extends WebSocket_ {
  roomId?: string;
  userId?: string;
}
