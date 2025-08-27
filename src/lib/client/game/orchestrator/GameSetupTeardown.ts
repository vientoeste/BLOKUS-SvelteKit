import type { InboundStartMessage } from "$types";
import type { IGameLifecycleManager, IParticipantManager } from "../application/ports";
import type { IGameResultReader } from "../application/ports/game-result-reader.ports";
import type { EventBus } from "../event";
import type { AlertManager } from "../ui";

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
  private alertManager: AlertManager;
  private gameResultReader: IGameResultReader;

  constructor({
    eventBus,
    gameLifecycleManager,
    participantManager,
    alertManager,
    gameResultReader,
  }: {
    eventBus: EventBus;
    gameLifecycleManager: IGameLifecycleManager;
    participantManager: IParticipantManager;
    alertManager: AlertManager;
    gameResultReader: IGameResultReader;
  }) {
    this.eventBus = eventBus;
    this.gameLifecycleManager = gameLifecycleManager;
    this.participantManager = participantManager;
    this.alertManager = alertManager;
    this.gameResultReader = gameResultReader;

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
    this.eventBus.subscribe('GameRestoreRequested', (event) => {
      const { activePlayerCount } = this.gameLifecycleManager.restoreGame(event.payload);
      this.eventBus.publish('TurnProgressionTriggered', {
        turn: event.payload.turn,
        activePlayerCount,
        lastMoveTimestamp: event.payload.moves[event.payload.moves.length - 1].createdAt,
      });
    });
  }
}
