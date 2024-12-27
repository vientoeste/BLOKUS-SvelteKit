type BlockType = '50' | '51' | '52' | '53' | '54' | '55' | '56' | '57' | '58' | '59' | '5a' | '5b' | '40' | '41' | '42' | '43' | '44' | '30' | '31' | '20' | '10';

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
