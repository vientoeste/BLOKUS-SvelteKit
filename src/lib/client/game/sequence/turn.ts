import type { PlayerIdx } from "$types";
import type { EventBus } from "../event";

export class TurnSequencer {
  constructor({ eventBus }: { eventBus: EventBus }) {
    this.eventBus = eventBus;

    this.eventBus.subscribe('TurnAdvanced', (event) => {
      this.initiateNextTurn(event.payload);
    });
  }

  private eventBus: EventBus;

  initiateNextTurn({
    turn,
    activePlayerCount,
    playerIdx,
  }: {
    turn: number;
    activePlayerCount: 2 | 3 | 4;
    playerIdx: PlayerIdx;
  }) {
    const nextPlayerIdx = this.calculatePlayerIdx({
      turn,
      activePlayerCount,
    });
    if (playerIdx === nextPlayerIdx) {
      this.eventBus.publish('PlayerTurnStarted', undefined);
    }
  }

  private calculatePlayerIdx({
    turn,
    activePlayerCount,
  }: {
    turn: number;
    activePlayerCount: 2 | 3 | 4;
  }) {
    if (activePlayerCount === 2) {
      return turn % 2;
    }
    /**
     * @description tmp variable to reduce duplicated calculation
     */
    const turnModular4 = turn % 4;
    if (activePlayerCount === 3) {
      return turnModular4 === 3 ?
        (turn % 12 - 3) / 4 :
        turnModular4;
    }
    if (activePlayerCount === 4) {
      return turnModular4;
    }
  }
}
