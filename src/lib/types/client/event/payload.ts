import type { Block, SlotIdx } from "$types/game";
import type { GameId, PlayerIdx } from "$types/room";
import type { OutboundMoveMessage } from "$types/websocket";

export type MoveAppliedPayload = {
  gameId: GameId;
  blockInfo: Block;
  playerIdx: PlayerIdx;
  position: [number, number];
  slotIdx: SlotIdx;
  turn: number;
  createdAt: Date;
}

export type MoveContextVerifiedPayload = Omit<OutboundMoveMessage, 'type'> & { gameId: GameId };

export type TurnAdvancedPayload = {
  turn: number;
  activePlayerCount: 2 | 3 | 4;
}
