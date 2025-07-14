import type { GameId, SlotIdx } from "$types";
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
      const { gameId } = event.payload as { gameId: GameId };
      this.handleGameStart(gameId);
    });
    this.eventBus.subscribe('MessageReceived_GameEnd', (event) => {
      this.handleGameEnd();
    });
  }

  handleGameStart(gameId: GameId) {
    this.turn = 0;
    this.gameId = gameId;
    this.isStarted = true;
    this.isEnded = false;
    this.exhaustedSlots = [];
    this.eventBus.publish('GameStateInitialized');
  }

  handleGameEnd() {
    this.turn = -1;
    this.gameId = null;
    this.isStarted = false;
    this.isEnded = true;
    this.eventBus.publish('GameStateReset');
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
