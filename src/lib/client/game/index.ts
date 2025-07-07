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
}
