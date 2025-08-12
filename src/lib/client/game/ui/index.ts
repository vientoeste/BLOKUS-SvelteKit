import type { AlertManager, ConfirmManager, InputManager } from "./handler/Dialog";
import type { PlayerActionHandler } from "./handler/PlayerAction";

export class UILayer {
  private confirmManager: ConfirmManager;
  private alertManager: AlertManager;
  private inputManager: InputManager;
  private playerActionHandler: PlayerActionHandler;

  constructor({
    confirmManager,
    alertManager,
    inputManager,
    playerActionHandler,
  }: {
    confirmManager: ConfirmManager;
    alertManager: AlertManager;
    inputManager: InputManager;
    playerActionHandler: PlayerActionHandler;
  }) {
    this.confirmManager = confirmManager;
    this.alertManager = alertManager;
    this.inputManager = inputManager;
    this.playerActionHandler = playerActionHandler;
  }
}
