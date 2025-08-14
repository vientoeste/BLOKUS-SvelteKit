import type { ParticipantInf, PlayerIdx } from '$types';

/**
 * Manages the list of participants before a game starts (join, leave, ready status).
 */
export interface IParticipantManager {
  addPlayer(playerInfo: ParticipantInf & { playerIdx: PlayerIdx }): void;

  removePlayerByIdx(playerIdx: PlayerIdx): void;

  updateReadyState(payload: { playerIdx: PlayerIdx; ready: boolean }): void;

  getPlayers(): (ParticipantInf | undefined)[];
}
