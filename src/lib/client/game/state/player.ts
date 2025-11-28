import { clientSlotStoreWriter, getClientSlots } from "$lib/store";
import type { ParticipantInf, PlayerIdx, SlotIdx } from "$types";
import { get, writable, type Readable, type Writable } from "svelte/store";
import { getPlayersSlot } from "$lib/utils";

export class PlayerStateManager {
  private clientPlayerIdx: PlayerIdx;
  private _participants: Writable<(ParticipantInf | undefined)[]>;

  constructor({
    players,
    playerIdx,
  }: {
    players: (ParticipantInf | undefined)[],
    playerIdx: PlayerIdx;
  }) {
    this.clientPlayerIdx = playerIdx;
    this._participants = writable(players);
  }

  get players(): Readable<(ParticipantInf | undefined)[]> {
    return { subscribe: this._participants.subscribe };
  }

  getPlayers() {
    return get(this._participants);
  }

  addPlayer({ id, playerIdx, username }: ParticipantInf & { playerIdx: PlayerIdx }) {
    this._participants.update(store => {
      store[playerIdx] = {
        id, ready: false, username
      };
      return store;
    });
  }

  removePlayerByIdx(playerIdx: PlayerIdx) {
    this._participants.update(store => {
      store[playerIdx] = undefined;
      return store;
    });
  }

  updateReadyState({ playerIdx, ready }: { playerIdx: PlayerIdx, ready: boolean }) {
    this._participants.update(store => {
      if (store[playerIdx] !== undefined) store[playerIdx].ready = ready;
      return store;
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
