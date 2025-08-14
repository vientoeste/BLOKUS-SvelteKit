import type { InboundStartMessage } from "$types";
import type { IGameLifecycleManager, IParticipantManager } from "../application/ports";
import type { EventBus } from "../event";

/**
 * Orchestrates the setup and teardown phases of a game session.
 *
 * @description
 * This class manages the lifecycle boundaries of a game by handling its initial setup and final teardown.
 * It listens for events that mark the beginning and end of a game and updates the relevant state.
 * This orchestrator is specifically not responsible for game process logics, like turn or in-game action.
 */
export class GameSetupTeardownOrchestrator {
  private eventBus: EventBus;
  private gameLifecycleManager: IGameLifecycleManager;
  private participantManager: IParticipantManager;

  constructor({
    eventBus,
    gameLifecycleManager,
    participantManager,
  }: {
    eventBus: EventBus;
    gameLifecycleManager: IGameLifecycleManager;
    participantManager: IParticipantManager;
  }) {
    this.eventBus = eventBus;
    this.gameLifecycleManager = gameLifecycleManager;
    this.participantManager = participantManager;

    this.eventBus.subscribe('MessageReceived_Start', (event) => {
      const { activePlayerCount, gameId } = event.payload;
      this.gameLifecycleManager.initializeNewGame({ activePlayerCount, gameId });
      this.eventBus.publish('GameStateInitialized', undefined);
    });

    this.eventBus.subscribe('MessageReceived_GameEnd', () => {
      this.gameLifecycleManager.resetAllGameStates();
      this.eventBus.publish('GameStateReset', undefined);
    });

    this.eventBus.subscribe('GameStartRequested', () => {
      // [TODO] remove validation if needed(e.g. make "start game" button disable/enable w. ready state)
      const playerIdx = this.participantManager.getClientPlayerIdx();
      if (playerIdx !== 0) {
        // [TODO] add modal
        return;
      }
      const players = this.participantManager.getPlayers();
      if (players.some(p => p !== undefined && !p.ready)) {
        // [TODO] add modal
        return;
      }
      const startMessage: InboundStartMessage = {
        type: 'START',
      };
      this.eventBus.publish('DispatchMessage', startMessage);

      const successSubscription = this.eventBus.once('MessageReceived_Start', () => {
        failureSubscription.unsubscribe();
      });
      const failureSubscription = this.eventBus.once('MessageReceived_BadReq', () => {
        successSubscription.unsubscribe();
        // [TODO] add modal / sync here
      });
    });

    // [TODO] publish this event at onMount by GameManager's public method
    /**
     * @description The GameStateRestored event indicates that the 'static' state managers have been initialized,
     * especially those that depend on server-sent data (via $props).
     * Therefore, 'dynamic' data —such as move related states, like move history/blocks/board—
     * should be handled in this handler.
     */
    this.eventBus.subscribe('GameStateRestored', (event) => {
      const { moves, exhaustedSlots } = event.payload;
      this.gameLifecycleManager.restoreGameStateFromHistory({
        moves, exhaustedSlots,
      });
    });
  }
}
