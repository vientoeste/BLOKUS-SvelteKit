import type {
  BoardMatrix,
  CancelReadyMessage,
  ConnectedMessage,
  ErrorMessage,
  LeaveMessage,
  MoveDTO,
  ReadyMessage,
  StartMessage,
  WebSocketMessage,
} from "$lib/types";
import { gameStore, modalStore } from "../../Store";
import { putBlockOnBoard } from "./core";
import type {
  WebSocketMessageDispatcher,
  WebSocketMessageReceiver,
} from "$lib/websocket/client";
import Alert from "$lib/components/Alert.svelte";

// [TODO] room state?
export class GameManager {
  constructor({
    board, playerIdx, turn, messageDispatcher, messageReceiver
  }: {
    board: BoardMatrix, playerIdx: 0 | 1 | 2 | 3, turn?: number,
    messageDispatcher: WebSocketMessageDispatcher,
    messageReceiver: WebSocketMessageReceiver
  }) {
    this.board = board;
    this.turn = turn ?? -1;
    this.playerIdx = playerIdx;
    gameStore.subscribe((store) => {
      this.turn = store.turn;
    });
    this.messageDispatcher = messageDispatcher;
    this.messageReceiver = messageReceiver;

    this.messageReceiver.onMessage(this.handleIncomingMessage);
  }
  private messageReceiver: WebSocketMessageReceiver;
  private messageDispatcher: WebSocketMessageDispatcher;

  private playerIdx: 0 | 1 | 2 | 3;
  private board: BoardMatrix;
  private turn: number;

  handleIncomingMessage(message: WebSocketMessage) {
    switch (message.type) {
      case "LEAVE":
        this.removeUser(message);
        break;
      case "CONNECTED":
        this.addUser(message);
        break;
      case "READY":
        this.updateReadyState(message);
        break;
      case "CANCEL_READY":
        this.updateReadyState(message);
        break;
      case "MOVE":
        this.applyOpponentMove(message);
        break;
      case "START":
        this.handleStart(message);
        break;
      case "REPORT":
        // client NEVER receive this event
        break;
      case "ERROR":
        this.handleError(message);
        break;
      default:
        modalStore.open(Alert, {
          title: "received unknown message",
          message,
        });
        break;
    }
  }

  addUser(message: ConnectedMessage) {
    throw new Error("not implemented");
  }

  removeUser(message: LeaveMessage) {
    throw new Error("not implemented");
  }

  updateReadyState(message: ReadyMessage | CancelReadyMessage) {
    throw new Error("not implemented");
  }

  handleError(message: ErrorMessage) {
    // when does this method be called?
  }

  isMyTurn() {
    return this.turn % 4 === this.playerIdx;
  }

  private turnPromise: Promise<MoveDTO> | null = null;
  private turnPromiseResolver: ((dto: MoveDTO) => void) | null = null;
  private turnPromiseRejecter: ((reason: string) => void) | null = null;

  applyOpponentMove({
    blockInfo,
    playerIdx,
    position,
    turn,
  }: MoveDTO) {
    const reason = putBlockOnBoard({
      board: this.board,
      blockInfo,
      playerIdx,
      position,
      turn,
    });
    if (!reason) {
      gameStore.update(({ turn, isStarted, playerIdx, players, unusedBlocks }) => ({
        turn: turn + 1,
        isStarted, playerIdx, players, unusedBlocks
      }));
      this.turn += 1;
      if (this.isMyTurn()) this.waitTurnResolution();
      return;
    }
    return reason;
  }

  initializeTurnPromise() {
    this.turnPromise = null;
    this.turnPromiseResolver = null;
    this.turnPromiseRejecter = null;
  }

  private reservedMove: MoveDTO | null = null;

  reserveMove(moveDTO: MoveDTO) {
    this.reservedMove = moveDTO;
  }

  submitMove({
    blockInfo,
    playerIdx = this.playerIdx,
    position,
    turn = this.turn,
  }: MoveDTO) {
    if (
      !this.isMyTurn()
      || this.turnPromise === null
      || this.turnPromiseResolver === null
      || this.turnPromiseRejecter === null
    ) {
      this.turnPromiseRejecter?.('invalid environment');
      return;
    }

    const reason = putBlockOnBoard({
      board: this.board,
      blockInfo,
      playerIdx,
      position,
      turn,
    });
    if (reason) {
      this.turnPromiseRejecter(reason);
      return;
    }
    this.turnPromiseResolver({
      blockInfo, playerIdx, position, turn,
    });
    return;
  }

  async waitTurnResolution() {
    if (this.reservedMove !== null) {
      // [TODO] confirm modal comes here
      // and if confirmed, dispatch reserved move
      // if not, wait for new move
    }
    this.turnPromise = new Promise<MoveDTO>((res, rej) => {
      this.turnPromiseResolver = res;
      this.turnPromiseRejecter = rej;
    });
    const result = await this.turnPromise;
    this.initializeTurnPromise();
    return result;
  }

  handleStart({ blockInfo, playerIdx, position, turn }: StartMessage) {
    this.turn = 0;
    gameStore.update(({ turn, ...rest }) => ({ turn: turn += 1, ...rest }));
    this.applyOpponentMove({ blockInfo, playerIdx, position, turn });
  }

  async startGame() {
    if (this.playerIdx === 0) {
      this.turn = 0;
      gameStore.update((gameInfo) => ({ ...gameInfo, turn: 0 }));
      const move = await this.waitTurnResolution();
      const startMessage: StartMessage = {
        type: 'START',
        ...move,
      };
      this.messageDispatcher.dispatch(startMessage);
    }
  }
}
