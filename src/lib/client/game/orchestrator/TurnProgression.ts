import type { EventBus } from "../event";
import type { TurnSequencer } from "../sequence/turn";
import type { IClientInfoReader } from '../application/ports';

export class TurnProgressionOrchestrator {
  private eventBus: EventBus;
  private clientInfoReader: IClientInfoReader;
  private turnSequencer: TurnSequencer;

  constructor({
    eventBus,
    turnSequencer,
    clientInfoReader,
  }: {
    eventBus: EventBus;
    turnSequencer: TurnSequencer;
    clientInfoReader: IClientInfoReader
  }) {
    this.eventBus = eventBus;
    this.turnSequencer = turnSequencer;
    this.clientInfoReader = clientInfoReader;

    this.eventBus.subscribe('TurnProgressionTriggered', (event) => {
      const { turn, activePlayerCount } = event.payload;
      const playerIdx = this.clientInfoReader.getClientPlayerIdx();
      const { nextPlayerIdx, nextSlotIdx } = this.turnSequencer.calculatePlayerAndSlotIdx({
        turn,
        activePlayerCount,
      });
      if (playerIdx === nextPlayerIdx) {
        this.eventBus.publish('PlayerTurnStarted', {
          slotIdx: nextSlotIdx,
        });
      }
    });
  }
}
