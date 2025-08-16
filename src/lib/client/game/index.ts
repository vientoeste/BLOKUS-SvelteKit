import type { Block, ParticipantInf, PlayerIdx, SlotIdx } from "$types";
import { BlockPlaceabilityCalculator } from "./domain/blockPlaceabilityCalculator";
import { EventBus } from "./event";
import { WebsocketNetworkLayer } from "./network";
import { WebSocketMessageDispatcher } from "./network/dispatcher";
import { WebSocketMessageReceiver } from "./network/receiver";
import { GameResultOrchestrator } from "./orchestrator/GameResult";
import { GameSetupTeardownOrchestrator } from "./orchestrator/GameSetupTeardown";
import { PlayerTurnOrchestrator } from "./orchestrator/PlayerTurn";
import { PregameOrchestrator } from "./orchestrator/Pregame";
import { SlotExhaustionOrchestrator } from "./orchestrator/SlotExhaustion";
import { TurnAdvancedOrchestrator } from "./orchestrator/TurnAdvanced";
import { TurnLifecycleOrchestrator } from "./orchestrator/TurnLifecycle";
import { PlayerTurnTimer } from "./sequence/timer";
import { TurnSequencer } from "./sequence/turn";
import { GameStateLayer } from "./state";
import { BlockStateManager } from "./state/block";
import { BoardStateManager } from "./state/board";
import { GameStateManager } from "./state/game";
import { MoveStateManager } from "./state/move";
import { PlayerStateManager } from "./state/player";
import { SlotStateManager } from "./state/slot";
import { AlertManager, ConfirmManager, InputManager } from "./ui/handler/Dialog";

export class GameManager {
  private eventBus: EventBus;

  constructor({
    eventBus,
  }: {
    eventBus: EventBus;
  }) {
    this.eventBus = eventBus;
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
}

export class GameClientFactory {
  static create({
    webWorker,
    webSocket,
    players,
    playerIdx,
    slots,
  }: {
    webWorker: Worker;
    webSocket: WebSocket;
    players: ParticipantInf[];
    playerIdx: PlayerIdx;
    slots: SlotIdx[];
  }) {
    const eventBus = new EventBus();

    const blockStateManager = new BlockStateManager();
    const boardStateManager = new BoardStateManager();
    const gameStateManager = new GameStateManager();
    const moveStateManager = new MoveStateManager();
    const playerStateManager = new PlayerStateManager({
      players,
      playerIdx,
      slots,
    });
    const slotStateManager = new SlotStateManager({ eventBus });
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
    new TurnAdvancedOrchestrator({
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
