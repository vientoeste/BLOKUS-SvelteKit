import type { Phase } from "$lib/client/game/state/game";
import type { Block, SlotIdx } from "$types/game";
import type { Move } from "$types/move";
import type { GameId } from "$types/room";

export type TurnProgressionTriggeredPayload = {
  turn: number;
  activePlayerCount: 2 | 3 | 4;
  // This field is only for reconnected
  lastMoveTimestamp?: Date;
}

export type SlotExhaustedPayload = {
  slotIdx: SlotIdx;
  cause: 'CALCULATED' | 'RECEIVED';
}

export type TimeoutOccuredPayload = {
  slotIdx: SlotIdx;
  turn: number;
}

export type BlockNotPlaceablePayload = {
  reason: string;
}

export type PlayerMoveSubmittedPayload = {
  position: [number, number];
  blockInfo: Block;
  slotIdx: SlotIdx;
}

export type PlayerTurnStartedPayload = {
  slotIdx: SlotIdx;
  lastMoveTimestamp?: Date;
}

export type GameRestoreRequestedPayload = {
  moves: Move[];
  exhaustedSlots: SlotIdx[];
  turn: number;
  gameId: GameId;
  phase: Phase;
}
