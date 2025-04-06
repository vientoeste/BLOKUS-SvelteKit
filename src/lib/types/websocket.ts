/* eslint-disable @typescript-eslint/no-empty-interface */
import type { WebSocket as WebSocket_ } from 'ws';
import type { MoveDTO, PlayerId, PlayerIdx, SlotIdx } from '.';

interface WebSocketMessageBase {
  type: string;
}

export type DispatchConnectedMessageDto = {
  username: string;
};

export interface DispatchLeaveMessageDto { }

export interface DispatchReadyMessageDto { }

export interface DispatchCancelReadyMessageDto { }

export type DispatchNonTimeoutMoveMessageDto = MoveDTO;

export type DispatchTimeoutMoveMessageDto = {
  turn: number;
  slotIdx: SlotIdx;
}

export type DispatchMediateMessageDto = {
  board?: string;
  currentTurn?: number;
}

export interface DispatchReportMessageDto {
  board: string;
  currentTurn: number;
  missingMoves: number[];
}

export interface DispatchStartMessageDto { }

export interface InboundConnectedMessage extends WebSocketMessageBase, DispatchConnectedMessageDto {
  type: 'CONNECTED';
}

export interface InboundLeaveMessage extends WebSocketMessageBase, DispatchLeaveMessageDto {
  type: 'LEAVE';
}

export interface InboundReadyMessage extends WebSocketMessageBase, DispatchReadyMessageDto {
  type: 'READY';
}

export interface InboundCancelReadyMessage extends WebSocketMessageBase, DispatchCancelReadyMessageDto {
  type: 'CANCEL_READY';
}

export type InboundMoveMessage = WebSocketMessageBase & { type: 'MOVE' } & (
  (DispatchNonTimeoutMoveMessageDto & { timeout: false })
  | (DispatchTimeoutMoveMessageDto & { timeout: true })
);

export interface InboundReportMessage extends WebSocketMessageBase, DispatchReportMessageDto {
  type: 'REPORT';
}

export interface InboundStartMessage extends WebSocketMessageBase, DispatchStartMessageDto {
  type: 'START';
}

export interface OutboundStartMessage extends WebSocketMessageBase {
  type: 'START';
  gameId: string;
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
  | { timeout: true, playerIdx: PlayerIdx, turn: number, slotIdx: SlotIdx });

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
