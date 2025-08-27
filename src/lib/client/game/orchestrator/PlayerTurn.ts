import type { InboundMoveMessage, InboundSkipTurnMessage, SubmitMoveDTO } from "$types";
import type { IClientInfoReader, IMoveApplier, ISlotManager, ITurnManager } from "../application/ports";
import type { EventBus } from "../event";
import type { PlayerTurnTimer } from "../sequence/timer";
import type { AlertManager, ConfirmManager } from "../ui/handler/Dialog";

/**
 * @description When player's turn comes, TurnState becomes PLAYER_TURN.
 * When player's move is submitted, TurnState becomes MOVE_PROCESSING (acting like a lock),
 * and TurnState becomes TURN_ENDED when player confirms the move.
 * After the move message that player submitted be received, TurnState goes NOT_PLAYER_TURN.
 * |     when...     |  Move Event Occured  |              Timeout Event Occured              |
 * |:---------------:|:--------------------:|:-----------------------------------------------:|
 * | NOT_PLAYER_TURN |   reserve the move   | already move submitted, timeout isn't cancelled |
 * |    TURN_ENDED   | event dup or delayed |             equal to NOT_PLAYER_TURN            |
 * | MOVE_PROCESSING | event dup or delayed |    just submit the move (waiting for confirm)   |
 * |   PLAYER_TURN   |      accept move     |                  accept timeout                 |
 */
type TurnState = 'NOT_PLAYER_TURN' | 'PLAYER_TURN' | 'MOVE_PROCESSING' | 'TURN_ENDED';

export class PlayerTurnOrchestrator {
  private eventBus: EventBus;
  private reservedMove: SubmitMoveDTO | undefined;
  private playerTurnTimer: PlayerTurnTimer;
  private confirmManager: ConfirmManager;
  private alertManager: AlertManager;
  private slotManager: ISlotManager;
  private turnManager: ITurnManager;
  private moveApplier: IMoveApplier;
  private clientInfoReader: IClientInfoReader;

  private turnState: TurnState = 'NOT_PLAYER_TURN';

  constructor({
    eventBus,
    playerTurnTimer,
    confirmManager,
    alertManager,
    slotManager,
    turnManager,
    moveApplier,
    clientInfoReader,
  }: {
    eventBus: EventBus;
    playerTurnTimer: PlayerTurnTimer;
    confirmManager: ConfirmManager;
    alertManager: AlertManager;
    slotManager: ISlotManager;
    turnManager: ITurnManager;
    moveApplier: IMoveApplier;
    clientInfoReader: IClientInfoReader;

  }) {
    this.eventBus = eventBus;
    this.playerTurnTimer = playerTurnTimer;
    this.confirmManager = confirmManager;
    this.alertManager = alertManager;
    this.slotManager = slotManager;
    this.turnManager = turnManager;
    this.moveApplier = moveApplier;
    this.clientInfoReader = clientInfoReader;

    this.eventBus.subscribe('PlayerTurnStarted', (event) => {
      const { slotIdx, lastMoveTimestamp } = event.payload;
      this.setState('PLAYER_TURN');

      if (this.slotManager.isSlotExhausted(slotIdx)) {
        const skipTurnMessage: InboundSkipTurnMessage = {
          type: 'SKIP_TURN',
          slotIdx,
          exhausted: true,
          timeout: false,
          turn: this.turnManager.getCurrentTurn(),
        };
        const failureSubscription = this.eventBus.once('MessageReceived_BadReq', () => {
          successSubscription.unsubscribe();
          // [TODO] add handler
        });
        const successSubscription = this.eventBus.once('MessageReceived_SkipTurn', () => {
          failureSubscription.unsubscribe();
          this.setState('NOT_PLAYER_TURN');
        });
        this.eventBus.publish('DispatchMessage', skipTurnMessage);
        return;
      }

      const ellapsedTime = lastMoveTimestamp !== undefined
        ? new Date().getTime() - lastMoveTimestamp.getTime()
        : undefined;
      if (ellapsedTime && ellapsedTime > 60000) {
        this.eventBus.publish('TimeoutOccured', { slotIdx, turn: this.turnManager.getCurrentTurn() });
        return;
      }
      if (ellapsedTime === undefined || ellapsedTime < 60000) {
        this.alertManager.openTurnStartedModal();
        this.playerTurnTimer.setTurnTimeout({ slotIdx, time: ellapsedTime, turn: this.turnManager.getCurrentTurn() });
        return;
      }
      // [TODO] is modal needed?
    });

    this.eventBus.subscribe('TimeoutOccured', (event) => {
      // there is no logic for cancel timeout, so turn's timeout could affect another turn.
      // Therefore, check payload's turn and current turn and if they're different just skip timeout handler.
      if (event.payload.turn !== this.turnManager.getCurrentTurn()) {
        return;
      }
      switch (this.turnState) {
        case 'PLAYER_TURN': {
          this.alertManager.openTimeoutModal();
          this.setState('TURN_ENDED');
          const turn = this.turnManager.getCurrentTurn();
          const { slotIdx } = event.payload;
          const timeoutMessage: InboundSkipTurnMessage = {
            type: 'SKIP_TURN',
            exhausted: false,
            slotIdx,
            timeout: true,
            turn,
          };
          this.eventBus.once('MessageReceived_SkipTurn', () => {
            this.setState('NOT_PLAYER_TURN');
          });
          this.eventBus.publish('DispatchMessage', timeoutMessage);
          break;
        }
        case 'MOVE_PROCESSING': {
          // [TODO] just dispatch treating move if move is valid
          break;
        }
        case 'NOT_PLAYER_TURN':
        case 'TURN_ENDED':
          break;
      }
    });

    this.eventBus.subscribe('PlayerMoveSubmitted', async (event) => {
      if (this.turnState === 'MOVE_PROCESSING' || this.turnState === 'TURN_ENDED') {
        // [TODO] add modal
        console.warn('move is duplicated or delayed');
        return;
      }
      const { blockInfo, position, slotIdx, previewUrl } = event.payload;
      const playerIdx = this.clientInfoReader.getClientPlayerIdx();
      const turn = this.turnManager.getCurrentTurn();
      const { result, reason } = this.moveApplier.checkBlockPlaceability({
        blockInfo, position, slotIdx, turn,
      });
      if (!result) {
        this.alertManager.openInvalidMoveModal(reason);
        return;
      }

      switch (this.turnState) {
        case 'NOT_PLAYER_TURN': {
          // [TODO] reserve move here
          break;
        }
        case 'PLAYER_TURN': {
          this.setState('MOVE_PROCESSING');
          const result = await this.confirmManager.openMoveConfirmModal(previewUrl);
          if (result === 'CONFIRM') {
            const moveMessage: InboundMoveMessage = {
              type: 'MOVE',
              blockInfo,
              playerIdx,
              position,
              slotIdx,
              turn,
            };
            const failureSubscription = this.eventBus.once('MessageReceived_BadReq', (event) => {
              successSubscription.unsubscribe();
              const { message } = event.payload;
              // [TODO] add modal
              console.warn(message);
            });
            const successSubscription = this.eventBus.once('MessageReceived_Move', () => {
              failureSubscription.unsubscribe();
              this.setState('NOT_PLAYER_TURN');
            });
            this.eventBus.publish('DispatchMessage', moveMessage);
            break;
          }
          this.setState('PLAYER_TURN');
        }
      }
    });
  }

  setState(turnState: TurnState) {
    this.turnState = turnState;
  }
}
