import type { PlayerTurnTimer } from "./timer";
import type { TurnSequencer } from "./turn";

// [TODO] sequence layer? play layer?
export class GameSequenceLayer {
  private turnSequencer: TurnSequencer;
  private turnTimer: PlayerTurnTimer;

  constructor({
    turnSequencer, turnTimer,
  }: {
    turnSequencer: TurnSequencer;
    turnTimer: PlayerTurnTimer;
  }) {
    this.turnSequencer = turnSequencer;
    this.turnTimer = turnTimer;
  }
}
