export const Event = {
  MessageReceived_CancelReady: 'MessageReceived_CancelReady',
  MessageReceived_Connected: 'MessageReceived_Connected',
  MessageReceived_Leave: 'MessageReceived_Leave',
  MessageReceived_Move: 'MessageReceived_Move',
  MessageReceived_Ready: 'MessageReceived_Ready',
  MessageReceived_Mediate: 'MessageReceived_Mediate',
  MessageReceived_Error: 'MessageReceived_Error',
  MessageReceived_Start: 'MessageReceived_Start',
  MessageReceived_BadReq: 'MessageReceived_BadReq',
  MessageReceived_Exhausted: 'MessageReceived_Exhausted',
  MessageReceived_SkipTurn: 'MessageReceived_SkipTurn',
  MessageReceived_ScoreConfirmation: 'MessageReceived_ScoreConfirmation',
  MessageReceived_GameEnd: 'MessageReceived_GameEnd',

  DispatchMessage: 'DispatchMessage',

  GameStateInitialized: 'GameStateInitialized',
  GameStateReset: 'GameStateReset',
  InvalidTurn: 'InvalidTurn',
  InvalidGameId: 'InvalidGameId',
  MoveContextVerified: 'MoveContextVerified',

  '*': '*',
} as const;

export type EventType = typeof Event;

// [TODO] define payload
export interface GameEvent {
  payload: unknown;
  timestamp: number;
}
