import type { EventBus } from "./event";
import type { NetworkLayer } from "./network";
import type { GameSequenceLayer } from "./sequence";
import type { GameStateLayer } from "./state";
import type { UILayer } from "./ui";

export class GameManager {
  constructor({
    eventBus,
    UILayer,
    sequenceLayer,
    networkLayer,
    stateLayer,
  }: {
    eventBus: EventBus;
    UILayer: UILayer;
    sequenceLayer: GameSequenceLayer;
    networkLayer: NetworkLayer;
    stateLayer: GameStateLayer;
  }) {
    this.eventBus = eventBus;
    this.UILayer = UILayer;
    this.sequenceLayer = sequenceLayer;
    this.networkLayer = networkLayer;
    this.stateLayer = stateLayer;
  }

  private eventBus: EventBus;
  private UILayer: UILayer;
  private sequenceLayer: GameSequenceLayer;
  private networkLayer: NetworkLayer;
  private stateLayer: GameStateLayer;
}
