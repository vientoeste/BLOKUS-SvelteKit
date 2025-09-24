import { clientSlotStoreWriter, getClientSlots, participantStore } from "$lib/store";
import type { ParticipantInf, PlayerIdx, SlotIdx } from "$types";
import { get } from "svelte/store";
import { getPlayersSlot } from "$lib/utils";

export class PlayerStateManager {
  private clientPlayerIdx: PlayerIdx;

  constructor({
    players,
    playerIdx,
  }: {
    players: (ParticipantInf | undefined)[],
    playerIdx: PlayerIdx;
  }) {
    this.clientPlayerIdx = playerIdx;
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
    clientSlotStoreWriter.set(clientSlots);
  }

  getClientSlots(): SlotIdx[] {
    const slots = getClientSlots();
    return [...slots];
  }

  getClientPlayerIdx() {
    return this.clientPlayerIdx;
  }
}
