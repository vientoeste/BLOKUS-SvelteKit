import { isRightTurn } from "$lib/utils";
import type { EventBus } from "../event";
import type { PlayerStateManager } from "../state/player";

export class TurnAdvancedOrchestrator {
  private eventBus: EventBus;
  private playerStateManager: PlayerStateManager;

  constructor({
    eventBus,
    playerStateManager,
  }: {
    eventBus: EventBus;
    playerStateManager: PlayerStateManager;
  }) {
    this.eventBus = eventBus;
    this.playerStateManager = playerStateManager;

    this.eventBus.subscribe('TurnAdvanced', (event) => {
      const { turn } = event.payload;
      if (this.isPlayerTurn(turn)) {
        this.eventBus.publish('PlayerTurnStarted', undefined);
      }
    });
  }

  private isPlayerTurn(turn: number) {
    const playerIdx = this.playerStateManager.getClientPlayerIdx();
    const playerCount = this.playerStateManager.getActivePlayerCount();
    if (playerCount === 0) return false;
    return isRightTurn({ turn, playerIdx, activePlayerCount: playerCount });
  }
}
