import type { EventBus } from "../event";
import type { TurnSequencer } from "../sequence/turn";
import type { PlayerStateManager } from "../state/player";

export class TurnAdvancedOrchestrator {
  private eventBus: EventBus;
  private playerStateManager: PlayerStateManager;
  private turnSequencer: TurnSequencer;

  constructor({
    eventBus,
    playerStateManager,
    turnSequencer,
  }: {
    eventBus: EventBus;
    playerStateManager: PlayerStateManager;
    turnSequencer: TurnSequencer;
  }) {
    this.eventBus = eventBus;
    this.playerStateManager = playerStateManager;
    this.turnSequencer = turnSequencer;

    this.eventBus.subscribe('TurnAdvanced', (event) => {
      const { turn, activePlayerCount } = event.payload;
      const playerIdx = this.playerStateManager.getClientPlayerIdx();
      const { nextPlayerIdx, nextSlotIdx } = this.turnSequencer.calculatePlayerAndSlotIdx({
        turn,
        activePlayerCount,
      });
      if (playerIdx === nextPlayerIdx) {
        this.eventBus.publish('PlayerTurnStarted', {
          playerIdx: nextPlayerIdx,
          slotIdx: nextSlotIdx,
        });
      }
    });
  }
}
