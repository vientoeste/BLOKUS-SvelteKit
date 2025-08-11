import { getBlockMatrix, isBlockPlaceableAt } from "$lib/game/core";
import type { InboundMoveMessage, InboundSkipTurnMessage, SubmitMoveDTO } from "$types";
import type { EventBus } from "../event";
import type { PlayerTurnTimer } from "../sequence/timer";
import type { BoardStateManager } from "../state/board";
import type { GameStateManager } from "../state/game";
import type { PlayerStateManager } from "../state/player";
import type { ConfirmManager } from "../ui/handler/Dialog";

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
  private playerStateManager: PlayerStateManager;
  private gameStateManager: GameStateManager;
  private boardStateManager: BoardStateManager;
  private confirmManager: ConfirmManager;

  private turnState: TurnState = 'NOT_PLAYER_TURN';

  constructor({
    eventBus,
    playerTurnTimer,
    playerStateManager,
    gameStateManager,
    boardStateManager,
    confirmManager,
  }: {
    eventBus: EventBus;
    playerTurnTimer: PlayerTurnTimer;
    playerStateManager: PlayerStateManager;
    gameStateManager: GameStateManager;
    boardStateManager: BoardStateManager;
    confirmManager: ConfirmManager;
  }) {
    this.eventBus = eventBus;
    this.playerTurnTimer = playerTurnTimer;
    this.playerStateManager = playerStateManager;
    this.gameStateManager = gameStateManager;
    this.boardStateManager = boardStateManager;
    this.confirmManager = confirmManager;

    this.eventBus.subscribe('PlayerTurnStarted', (event) => {
      const { slotIdx } = event.payload;
      this.setState('PLAYER_TURN');
      this.playerTurnTimer.setTurnTimeout({ slotIdx });
    });

    this.eventBus.subscribe('TimeoutOccured', (event) => {
      switch (this.turnState) {
        case 'PLAYER_TURN': {
          this.setState('TURN_ENDED');
          const turn = this.gameStateManager.getCurrentTurn();
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
      const playerIdx = this.playerStateManager.getClientPlayerIdx();
      const turn = this.gameStateManager.getCurrentTurn();
      const board = this.boardStateManager.getBoard();
      const block = getBlockMatrix(blockInfo);
      if (board === undefined) {
        this.eventBus.publish('BoardNotInitialized', undefined);
        return;
      }

      const { result, reason } = isBlockPlaceableAt({
        block, board, position, slotIdx, turn,
      });
      if (!result) {
        // [TODO] replace to modal
        this.eventBus.publish('BlockNotPlaceable', { reason });
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
