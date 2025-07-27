import type { InboundWebSocketMessage, OutboundBadReqMessage, OutboundCancelReadyMessage, OutboundConnectedMessage, OutboundErrorMessage, OutboundExhaustedMessage, OutboundGameEndMessage, OutboundLeaveMessage, OutboundMediateMessage, OutboundMoveMessage, OutboundReadyMessage, OutboundScoreConfirmationMessage, OutboundSkipTurnMessage, OutboundStartMessage } from "$types/websocket";
import type { MoveAppliedPayload, MoveContextVerifiedPayload, SlotExhaustedPayload, TurnAdvancedPayload } from "./payload";

export interface EventPayloadMap {
  'MessageReceived_CancelReady': OutboundCancelReadyMessage,
  'MessageReceived_Connected': OutboundConnectedMessage,
  'MessageReceived_Leave': OutboundLeaveMessage,
  'MessageReceived_Move': OutboundMoveMessage,
  'MessageReceived_Ready': OutboundReadyMessage,
  'MessageReceived_Mediate': OutboundMediateMessage,
  'MessageReceived_Error': OutboundErrorMessage,
  'MessageReceived_Start': OutboundStartMessage,
  'MessageReceived_BadReq': OutboundBadReqMessage,
  'MessageReceived_Exhausted': OutboundExhaustedMessage,
  'MessageReceived_SkipTurn': OutboundSkipTurnMessage,
  'MessageReceived_ScoreConfirmation': OutboundScoreConfirmationMessage,
  'MessageReceived_GameEnd': OutboundGameEndMessage,

  // [TODO] separate?
  'DispatchMessage': InboundWebSocketMessage,

  'GameStateInitialized': void,
  'GameStateReset': void,
  'InvalidTurn': void,
  'InvalidGameId': void,
  'InvalidGameInitializedState': void,
  'MoveContextVerified': MoveContextVerifiedPayload,
  'TurnAdvanced': TurnAdvancedPayload,

  'BoardNotInitialized': void,
  'MoveApplied': MoveAppliedPayload,

  'PlayerTurnStarted': void,

  'SlotExhausted': SlotExhaustedPayload,

  'TimeoutOccured': void,

  '*': { type: string, payload: unknown },
}

export type AppEvent = keyof EventPayloadMap;

export interface GameEvent<T extends AppEvent> {
  payload: EventPayloadMap[T];
  timestamp: number;
}
/**
 * @description Define EventEmitter's type explicitly to AppEvent's type be infered properly
 */
export interface TypedEventEmitter {
  on<T extends AppEvent>(event: T, listener: (payload: GameEvent<T>) => void): this;
  once<T extends AppEvent>(event: T, listener: (payload: GameEvent<T>) => void): this;
  off<T extends AppEvent>(event: T, listener: (payload: GameEvent<T>) => void): this;
  emit<T extends AppEvent>(event: T, payload: GameEvent<T>): boolean;
  removeAllListeners(event?: AppEvent): this;
}
