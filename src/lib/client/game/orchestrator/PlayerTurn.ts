import type { SubmitMoveDTO } from "$types";
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
  }

  setState(turnState: TurnState) {
    this.turnState = turnState;
  }
}
