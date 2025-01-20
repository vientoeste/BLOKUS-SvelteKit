import type { MoveDTO, UserInfo } from '.';

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

export interface StartMessage extends WebSocketMessageBase, Omit<MoveMessage, 'type'> {
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

export interface MoveMessage extends WebSocketMessageBase, MoveDTO {
  type: 'MOVE';
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
