import type { ParticipantInf, PlayerIdx } from "$types";
import type { EventBus } from "../event";

// [TODO] refactor to use event bus
export class PlayerStateManager {
  constructor({ players, eventBus }: { players: (ParticipantInf | undefined)[], eventBus: EventBus }) {
    this.players = players;
    this.eventBus = eventBus;
  }

  private eventBus: EventBus;
  private players: (ParticipantInf | undefined)[] = [undefined, undefined, undefined, undefined];

  getPlayers() {
    return [...this.players];
  }

  addPlayer({ id, playerIdx, username }: ParticipantInf & { playerIdx: PlayerIdx }) {
    this.players[playerIdx] = {
      id,
      ready: false,
      username,
    };
  }

  removePlayer(playerIdx: PlayerIdx) {
    this.players[playerIdx] = undefined;
  }

  updateReadyState({ playerIdx, ready }: { playerIdx: PlayerIdx, ready: boolean }) {
    if (this.players[playerIdx]) {
      this.players[playerIdx].ready = ready;
    }
  }
}
