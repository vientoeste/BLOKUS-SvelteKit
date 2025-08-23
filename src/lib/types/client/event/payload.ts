import type { Phase } from "$lib/client/game/state/game";
import type { Block, SlotIdx } from "$types/game";
import type { Move } from "$types/move";
import type { GameId, PlayerIdx } from "$types/room";

export type TurnProgressionTriggeredPayload = {
  turn: number;
  activePlayerCount: 2 | 3 | 4;
  // [CHECK] remove?
  playerIdx: PlayerIdx;
}

export type SlotExhaustedPayload = {
  slotIdx: SlotIdx;
  cause: 'CALCULATED' | 'RECEIVED';
}

export type TimeoutOccuredPayload = {
  slotIdx: SlotIdx;
}

export type BlockNotPlaceablePayload = {
  reason: string;
}

export type PlayerMoveSubmittedPayload = {
  previewUrl: string;
  position: [number, number];
  blockInfo: Block;
  slotIdx: SlotIdx;
}

export type PlayerTurnStartedPayload = {
  slotIdx: SlotIdx;
  playerIdx: PlayerIdx;
}

export type GameRestoreRequestedPayload = {
  moves: Move[];
  exhaustedSlots: SlotIdx[];
  turn: number;
  gameId: GameId;
  phase: Phase;
}
