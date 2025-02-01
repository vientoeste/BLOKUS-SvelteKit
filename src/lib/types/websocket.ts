import type { WebSocket as WebSocket_ } from 'ws';
import type { MoveDTO, PlayerId, PlayerIdx, UserInfo } from '.';

interface WebSocketMessageBase {
  type: string;
}

export interface OutboundStartMessage extends WebSocketMessageBase {
  type: 'START';
}

export interface OutboundConnectedMessage extends WebSocketMessageBase {
  type: 'CONNECTED';
  playerIdx: PlayerIdx;
  id: PlayerId;
  username: string;
}

export interface OutboundLeaveMessage extends WebSocketMessageBase {
  type: 'LEAVE';
  playerIdx: PlayerIdx;
}

export interface OutboundReadyMessage extends WebSocketMessageBase {
  type: 'READY';
  playerIdx: PlayerIdx;
}

export interface OutboundCancelReadyMessage extends WebSocketMessageBase {
  type: 'CANCEL_READY';
  playerIdx: PlayerIdx;
}

export type OutboundMoveMessage = WebSocketMessageBase & { type: 'MOVE' } & ((MoveDTO & { timeout: false })
  | { timeout: true, playerIdx: PlayerIdx, turn: number });

export interface OutboundMediateMessage extends WebSocketMessageBase {
  type: 'MEDIATE';
  board?: string;
  currentTurn?: number;
}

export interface OutboundErrorMessage extends WebSocketMessageBase {
  type: 'ERROR';
  // [TODO] how to resolve error? chronobreak? or any other actions?
}

export interface OutboundBadReqMessage extends WebSocketMessageBase {
  type: 'BAD_REQ';
  message: string;
}

export interface InboundConnectedMessage extends WebSocketMessageBase, UserInfo {
  type: 'CONNECTED';
  playerIdx: PlayerIdx;
}

export interface InboundLeaveMessage extends WebSocketMessageBase {
  type: 'LEAVE';
}

export interface InboundReadyMessage extends WebSocketMessageBase {
  type: 'READY';
}

export interface InboundCancelReadyMessage extends WebSocketMessageBase {
  type: 'CANCEL_READY';
}

export type InboundMoveMessage = WebSocketMessageBase & { type: 'MOVE' } & ((MoveDTO & { timeout: false })
  | { timeout: true, turn: number });

export interface InboundReportMessage extends WebSocketMessageBase {
  type: 'REPORT';
  board: string;
  currentTurn: number;
}

export interface InboundStartMessage extends WebSocketMessageBase {
  type: 'START';
}

/**
 * client -> server
 */
export type InboundWebSocketMessage =
  InboundCancelReadyMessage | InboundConnectedMessage |
  InboundLeaveMessage | InboundMoveMessage |
  InboundReadyMessage | InboundReportMessage |
  InboundStartMessage;

/**
 * server -> clients
 */
export type OutboundWebSocketMessage =
  OutboundCancelReadyMessage | OutboundConnectedMessage |
  OutboundLeaveMessage | OutboundMoveMessage |
  OutboundReadyMessage | OutboundMediateMessage |
  OutboundErrorMessage | OutboundStartMessage |
  OutboundBadReqMessage;

export type WebSocketBrokerMessage = { payload: OutboundWebSocketMessage, roomId: string };

export interface WebSocket extends WebSocket_ {
  roomId?: string;
  userId?: string;
  playerIdx?: PlayerIdx;
}

interface ConnectionInfo {
  roomId: string;
  userId: string;
  playerIdx: PlayerIdx;
}

export type PendingWebSocket = WebSocket_ & Partial<ConnectionInfo>;

export type ActiveWebSocket = WebSocket_ & ConnectionInfo;
