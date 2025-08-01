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

    this.eventBus.subscribe('MessageReceived_CancelReady', (event) => {
      // [TODO] add payload type and replace 'as' statement
      const { playerIdx } = event.payload as { playerIdx: PlayerIdx };
      if (playerIdx === undefined) return;
      this.updateReadyState({
        playerIdx,
        ready: false,
      });
    });
    this.eventBus.subscribe('MessageReceived_Connected', (event) => {
      const { id, username, playerIdx } = event.payload;
      if (!playerIdx) return;
      this.addPlayer({
        id,
        username,
        playerIdx,
        ready: false,
      });
    });
    this.eventBus.subscribe('MessageReceived_Ready', (event) => {
      // [TODO] add payload type and replace 'as' statement
      const { playerIdx } = event.payload as {
        playerIdx: PlayerIdx,
      };
      if (playerIdx === undefined) return;
      this.updateReadyState({
        playerIdx,
        ready: true,
      });
    });
    this.eventBus.subscribe('MessageReceived_Leave', (event) => {
      // [TODO] add payload type and replace 'as' statement
      const { playerIdx } = event.payload as {
        playerIdx: PlayerIdx,
      };
      if (!playerIdx) return;
      this.removePlayerByIdx(playerIdx);
    });
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
