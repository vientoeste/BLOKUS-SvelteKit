import type { GameId, OutboundMoveMessage, SlotIdx } from "$types";
import type { EventBus } from "../event";

export class GameStateManager {
  public turn: number;
  private gameId: GameId | null;
  private isStarted: boolean;
  private isEnded: boolean;
  private exhaustedSlots: SlotIdx[];
  private eventBus: EventBus;

  constructor({ eventBus }: { eventBus: EventBus }) {
    this.turn = -1;
    this.gameId = null;
    this.isStarted = false;
    this.isEnded = false;
    this.exhaustedSlots = [];
    this.eventBus = eventBus;

    this.eventBus.subscribe('MessageReceived_Start', (event) => {
      const { gameId } = event.payload;
      this.handleGameStart(gameId);
    });
    this.eventBus.subscribe('MessageReceived_GameEnd', (event) => {
      this.handleGameEnd();
    });
    this.eventBus.subscribe('MessageReceived_Move', (event) => {
      this.verifyMoveContext(event.payload);
    });
  }

  handleGameStart(gameId: GameId) {
    this.turn = 0;
    this.gameId = gameId;
    this.isStarted = true;
    this.isEnded = false;
    this.exhaustedSlots = [];
    this.eventBus.publish('GameStateInitialized', undefined);
  }

  handleGameEnd() {
    this.turn = -1;
    this.gameId = null;
    this.isStarted = false;
    this.isEnded = true;
    this.eventBus.publish('GameStateReset', undefined);
  }

  verifyMoveContext(moveMessage: OutboundMoveMessage) {
    const { turn } = moveMessage;
    if (this.isEnded || !this.isStarted) {
      this.eventBus.publish('InvalidGameInitializedState', undefined)
      return;
    }
    if (turn !== this.turn + 1) {
      this.eventBus.publish('InvalidTurn', undefined);
      return;
    }
    if (!this.gameId) {
      this.eventBus.publish('InvalidGameId', undefined);
      return;
    }
    this.eventBus.publish('MoveContextVerified', { ...moveMessage, gameId: this.gameId });
  }

  restoreGameState({
    turn,
    gameId,
    isStarted,
    isEnded,
    exhaustedSlots,
  }: {
    turn: number,
    gameId: GameId,
    isStarted: boolean,
    isEnded: boolean,
    exhaustedSlots: SlotIdx[],
  }) {
    this.turn = turn;
    this.gameId = gameId;
    this.isStarted = isStarted;
    this.isEnded = isEnded;
    this.exhaustedSlots.push(...exhaustedSlots);
  }
}
