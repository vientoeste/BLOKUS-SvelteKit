import { participantStore } from "$lib/store";
import type { ParticipantInf, PlayerId, PlayerIdx } from "$types";
import { get } from "svelte/store";
import type { EventBus } from "../event";

// [TODO] refactor to use event bus
export class PlayerStateManager {
  constructor({ players, eventBus }: { players: (ParticipantInf | undefined)[], eventBus: EventBus }) {
    this.eventBus = eventBus;
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
      // [TODO] add payload type and replace 'as' statement
      const { id, username, playerIdx } = event.payload as {
        id: PlayerId,
        username: string,
        playerIdx: PlayerIdx,
      };
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

  private eventBus: EventBus;

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
    return players.filter(e => e !== undefined).length;
  }
}
