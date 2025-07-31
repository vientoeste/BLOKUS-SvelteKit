import { getBlockMatrix, isBlockPlaceableAt } from "$lib/game/core";
import type { InboundMoveMessage, InboundSkipTurnMessage, SubmitMoveDTO } from "$types";
import type { EventBus } from "../event";
import type { PlayerTurnTimer } from "../sequence/timer";
import type { BoardStateManager } from "../state/board";
import type { GameStateManager } from "../state/game";
import type { PlayerStateManager } from "../state/player";

/**
 * @description When player's turn comes, TurnState becomes PLAYER_TURN.
 * When player's move is submitted, TurnState becomes MOVE_PROCESSING (acting like a lock),
 * and TurnState becomes TURN_ENDED when player confirms the move.
 * After the move message that player submitted be received, TurnState goes NOT_PLAYER_TURN.
 * |     when...     |  Move Event Occured  |              Timeout Event Occured              |
 * |-----------------|----------------------|-------------------------------------------------|
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

  private turnState: TurnState = 'NOT_PLAYER_TURN';

  constructor({
    eventBus,
    playerTurnTimer,
    playerStateManager,
    gameStateManager,
    boardStateManager,
  }: {
    eventBus: EventBus;
    playerTurnTimer: PlayerTurnTimer;
    playerStateManager: PlayerStateManager;
    gameStateManager: GameStateManager;
    boardStateManager: BoardStateManager;
  }) {
    this.eventBus = eventBus;
    this.playerTurnTimer = playerTurnTimer;
    this.playerStateManager = playerStateManager;
    this.gameStateManager = gameStateManager;
    this.boardStateManager = boardStateManager;

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

    this.eventBus.subscribe('PlayerMoveSubmitted', (event) => {
      if (this.turnState === 'MOVE_PROCESSING' || this.turnState === 'TURN_ENDED') {
        console.warn('move is duplicated or delayed');
        return;
      }
      const { blockInfo, position, slotIdx } = event.payload;
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
        this.eventBus.publish('BlockNotPlaceable', { reason });
      }

      switch (this.turnState) {
        case 'NOT_PLAYER_TURN': {
          // [TODO] reserve move here
          break;
        }
        case 'PLAYER_TURN': {
          const moveMessage: InboundMoveMessage = {
            type: 'MOVE',
            blockInfo,
            playerIdx,
            position,
            slotIdx,
            turn,
          };
          this.eventBus.once('MessageReceived_Move', () => {
            this.setState('NOT_PLAYER_TURN');
          });
          this.eventBus.publish('DispatchMessage', moveMessage);
          break;
        }
      }
    });
  }

  setState(turnState: TurnState) {
    this.turnState = turnState;
  }
}
