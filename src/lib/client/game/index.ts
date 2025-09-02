import type { Block, GameClientContext, GameId, Move, SlotIdx } from "$types";
import { BlockPlaceabilityCalculator } from "./domain";
import { EventBus } from "./event";
import {
  WebsocketNetworkLayer,
  WebSocketMessageDispatcher,
  WebSocketMessageReceiver,
} from "./network";
import { GameResultOrchestrator } from "./orchestrator/GameResult";
import { GameSetupTeardownOrchestrator } from "./orchestrator/GameSetupTeardown";
import { PlayerTurnOrchestrator } from "./orchestrator/PlayerTurn";
import { PregameOrchestrator } from "./orchestrator/Pregame";
import { SlotExhaustionOrchestrator } from "./orchestrator/SlotExhaustion";
import { TurnProgressionOrchestrator } from "./orchestrator/TurnProgression";
import { TurnLifecycleOrchestrator } from "./orchestrator/TurnLifecycle";
import { PlayerTurnTimer, TurnSequencer } from "./sequence";
import {
  GameStateLayer,
  BlockStateManager,
  BoardStateManager,
  GameStateManager,
  MoveStateManager,
  PlayerStateManager,
  SlotStateManager
} from "./state";
import type { Phase } from "./state/game";
import { AlertManager, ConfirmManager, InputManager } from "./ui";

export class GameManager {
  private eventBus: EventBus;

  constructor({
    eventBus,
  }: {
    eventBus: EventBus;
  }) {
    this.eventBus = eventBus;
  }

  // [TODO] 'phase' info should be depend on 'isStarted' and redis' score confirmation keys
  restoreGame(restoreGamePayload: {
    turn: number;
    gameId: GameId;
    phase: Phase;
    exhaustedSlots: SlotIdx[];
    moves: Move[];
  }) {
    this.eventBus.publish('GameRestoreRequested', restoreGamePayload);
  }

  submitMove({
    previewUrl,
    position,
    blockInfo,
    slotIdx,
  }: {
    previewUrl: string;
    position: [number, number];
    blockInfo: Block;
    slotIdx: SlotIdx;
  }) {
    this.eventBus.publish('PlayerMoveSubmitted', {
      previewUrl, position, blockInfo, slotIdx,
    });
  }

  submitReady() {
    this.eventBus.publish('PlayerReadySubmitted', undefined);
  }

  submitCancelReady() {
    this.eventBus.publish('PlayerReadyCancelSubmitted', undefined);
  }

  startGame() {
    this.eventBus.publish('GameStartRequested', undefined);
  }

  terminate() {
    this.eventBus.publish('TerminateRequested', undefined);
  }
}

export class GameClientFactory {
  static create({
    webWorker,
    webSocket,
    context: {
      playerIdx,
      players,
    },
  }: {
    webWorker: Worker;
    webSocket: WebSocket;
    context: GameClientContext;
  }) {
    const eventBus = new EventBus();

    const blockStateManager = new BlockStateManager();
    const boardStateManager = new BoardStateManager();
    const gameStateManager = new GameStateManager();
    const moveStateManager = new MoveStateManager();
    const playerStateManager = new PlayerStateManager({
      players,
      playerIdx,
    });
    const slotStateManager = new SlotStateManager();
    const stateLayer = new GameStateLayer({
      gameStateManager,
      playerStateManager,
      boardStateManager,
      blockStateManager,
      moveStateManager,
      slotStateManager,
    });

    const turnSequencer = new TurnSequencer();
    const turnTimer = new PlayerTurnTimer({ eventBus });

    const messageDispatcher = new WebSocketMessageDispatcher(webSocket);
    const messageReceiver = new WebSocketMessageReceiver({
      eventBus,
      webSocket,
    });
    new WebsocketNetworkLayer({
      eventBus,
      messageDispatcher,
      messageReceiver,
      webSocket,
    });

    const blockPlaceabilityCalculator = new BlockPlaceabilityCalculator({ webWorker });

    const alertManager = new AlertManager();
    const confirmManager = new ConfirmManager();
    const inputManager = new InputManager();

    new GameResultOrchestrator({
      eventBus,
      gameResultManager: stateLayer,
    });
    new GameSetupTeardownOrchestrator({
      eventBus,
      gameLifecycleManager: stateLayer,
      participantManager: stateLayer,
      gameResultReader: stateLayer,
      alertManager,
    });
    new PlayerTurnOrchestrator({
      eventBus,
      alertManager,
      confirmManager,
      playerTurnTimer: turnTimer,

      clientInfoReader: stateLayer,
      moveApplier: stateLayer,
      slotManager: stateLayer,
      turnManager: stateLayer,
    });
    new PregameOrchestrator({
      eventBus,
      participantManager: stateLayer,
    });
    new SlotExhaustionOrchestrator({
      eventBus,
      slotManager: stateLayer,
    });
    new TurnProgressionOrchestrator({
      eventBus,
      turnSequencer,
      clientInfoReader: stateLayer,
    });
    new TurnLifecycleOrchestrator({
      eventBus,
      blockPlaceabilityCalculator,

      calculationDataProvider: stateLayer,
      calculationResultApplier: stateLayer,
      clientInfoReader: stateLayer,
      moveApplier: stateLayer,
      slotManager: stateLayer,
      turnManager: stateLayer,
    });

    const gameManager = new GameManager({ eventBus });

    return { gameManager };
  }
}
