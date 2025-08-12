import type { Block, SlotIdx } from "$types/game";
import type { Move } from "$types/move";
import type { PlayerIdx } from "$types/room";

export type TurnAdvancedPayload = {
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

export type GameStateRestoredPayload = {
  playerIdx: PlayerIdx;
  moves: Move[];
  exhaustedSlots: SlotIdx[];
}
