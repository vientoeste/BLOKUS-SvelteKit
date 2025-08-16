import type { Block } from "$types";
import type { EventBus } from "./event";
import type { NetworkLayer } from "./network";
import type { GameSequenceLayer } from "./sequence";
import type { GameStateLayer } from "./state";
import type { UILayer } from "./ui";

export class GameManager {
  constructor({
    eventBus,
    uiLayer,
    sequenceLayer,
    networkLayer,
    stateLayer,
  }: {
    eventBus: EventBus;
    uiLayer: UILayer;
    sequenceLayer: GameSequenceLayer;
    networkLayer: NetworkLayer;
    stateLayer: GameStateLayer;
  }) {
    this.eventBus = eventBus;
    this.uiLayer = uiLayer;
    this.sequenceLayer = sequenceLayer;
    this.networkLayer = networkLayer;
    this.stateLayer = stateLayer;
  }

  private eventBus: EventBus;
  private uiLayer: UILayer;
  private sequenceLayer: GameSequenceLayer;
  private networkLayer: NetworkLayer;
  private stateLayer: GameStateLayer;

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
