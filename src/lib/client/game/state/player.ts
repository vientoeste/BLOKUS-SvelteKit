import type { ParticipantInf } from "$types";

export class PlayerStateManager {
  constructor(players: ParticipantInf[]) {
    this.players = players;
  }

  private players: ParticipantInf[];
}
