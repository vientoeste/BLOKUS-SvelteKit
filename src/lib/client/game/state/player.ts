import { participantStore } from "$lib/store";
import type { ParticipantInf, PlayerIdx, SlotIdx } from "$types";
import { get } from "svelte/store";
import type { EventBus } from "../event";
import { getPlayersSlot } from "$lib/utils";

export class PlayerStateManager {
  private eventBus: EventBus;
  private clientPlayerIdx: PlayerIdx;
  private clientSlotIndices: SlotIdx[];

  constructor({
    players,
    playerIdx,
    slotIdx,
    eventBus,
  }: {
    players: (ParticipantInf | undefined)[],
    playerIdx: PlayerIdx;
    slotIdx: SlotIdx[];
    eventBus: EventBus,
  }) {
    this.eventBus = eventBus;
    this.clientPlayerIdx = playerIdx;
    this.clientSlotIndices = slotIdx;
    participantStore.initialize(players);
  }

  getPlayers() {
    return get(participantStore);
  }

  addPlayer({ id, playerIdx, username }: ParticipantInf & { playerIdx: PlayerIdx }) {
    participantStore.addPlayer({
      id, playerIdx, username, ready: false,
    });
  }

  removePlayerByIdx(playerIdx: PlayerIdx) {
    participantStore.removePlayerByIdx(playerIdx);
  }

  updateReadyState({ playerIdx, ready }: { playerIdx: PlayerIdx, ready: boolean }) {
    participantStore.setPlayerReadyState({
      playerIdx,
      ready,
    });
  }

  getActivePlayerCount() {
    const players = this.getPlayers();
    if (players === undefined) return 0;
    return players.filter(e => e !== undefined).length as 2 | 3 | 4;
  }

  initializeClientSlots() {
    const players = this.getPlayers();
    const clientSlots = getPlayersSlot({
      players, playerIdx: this.clientPlayerIdx,
    });
    this.clientSlotIndices = clientSlots;
  }

  getClientSlots(): SlotIdx[] {
    return [...this.clientSlotIndices];
  }

  getClientPlayerIdx() {
    return this.clientPlayerIdx;
  }
}
