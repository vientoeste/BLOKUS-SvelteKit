import type { ParticipantInf, PlayerIdx, SlotIdx } from "$types";
import { get, writable, type Readable, type Writable } from "svelte/store";
import { getPlayersSlot } from "$lib/utils";

export class PlayerStateManager {
  private _clientPlayerIdx: Writable<PlayerIdx>;
  private _participants: Writable<(ParticipantInf | undefined)[]>;
  private _clientSlots: Writable<SlotIdx[]>;

  constructor({
    players,
    playerIdx,
  }: {
    players: (ParticipantInf | undefined)[],
    playerIdx: PlayerIdx;
  }) {
    this._clientPlayerIdx = writable(playerIdx);
    this._participants = writable(players);
    this._clientSlots = writable([]);
  }

  get players(): Readable<(ParticipantInf | undefined)[]> {
    return { subscribe: this._participants.subscribe };
  }

  get clientPlayerIdx(): Readable<PlayerIdx> {
    return { subscribe: this._clientPlayerIdx.subscribe };
  }

  // Activate this getter if needed.
  // get clientSlots(): Readable<SlotIdx[]> {
  //   return { subscribe: this._clientSlots.subscribe };
  // }

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
    const clientSlots = getPlayersSlot({
      players: this.getPlayers(),
      playerIdx: this.getClientPlayerIdx(),
    });
    this._clientSlots.set(clientSlots);
  }

  getClientSlots(): SlotIdx[] {
    const slots = get(this._clientSlots);
    return [...slots];
  }

  getClientPlayerIdx() {
    return get(this._clientPlayerIdx);
  }
}
