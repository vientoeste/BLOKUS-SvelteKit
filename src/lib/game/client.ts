import type {
  BlockMatrix,
  BlockType,
  BoardMatrix,
  CancelReadyMessage,
  ConnectedMessage,
  ErrorMessage,
  LeaveMessage,
  MoveDTO,
  MoveMessage,
  ReadyMessage,
  StartMessage,
  SubmitMoveDTO,
  ParticipantInf,
  WebSocketMessage,
} from "$lib/types";
import { gameStore, modalStore } from "../../Store";
import { createNewBoard, preset, putBlockOnBoard } from "./core";
import type {
  WebSocketMessageDispatcher,
  WebSocketMessageReceiver,
} from "$lib/websocket/client";
import Alert from "$lib/components/Alert.svelte";

// [TODO] room state?
// [TODO] message validations
export class GameManager {
  constructor({
    board, playerIdx, turn, users, messageDispatcher, messageReceiver,
  }: {
    board: BoardMatrix, playerIdx: 0 | 1 | 2 | 3, turn?: number,
    users: (ParticipantInf | undefined)[],
    messageDispatcher: WebSocketMessageDispatcher,
    messageReceiver: WebSocketMessageReceiver
  }) {
    this.board = board;
    this.turn = turn ?? -1;
    this.playerIdx = playerIdx;
    this.users.push(...users);
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

  private users: (ParticipantInf | undefined)[] = [undefined, undefined, undefined, undefined];

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
        this.handleStartMessage();
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
    const { id, playerIdx, username } = message;
    // [TODO] integrate field username-name
    this.users[playerIdx] = {
      id,
      username,
      ready: false,
    };
  }

  removeUser(message: LeaveMessage) {
    const { playerIdx } = message;
    this.users[playerIdx] = undefined;
  }

  updateReadyState(message: ReadyMessage | CancelReadyMessage) {
    const { type, playerIdx } = message;
    if (this.users[playerIdx]) {
      this.users[playerIdx].ready = type === 'READY';
    }
  }

  handleError(message: ErrorMessage) {
    // when does this method be called?
  }

  initiateNextTurn(): Promise<void> | void {
    gameStore.update(({ turn, ...rest }) => ({
      ...rest,
      turn: turn + 1,
    }));
    this.turn += 1;
    if (this.isMyTurn()) {
      return this.processMyTurn();
    }
  }

  async processMyTurn() {
    // using duck typing, let runtime determine this type:
    // in-browser - number
    // nodejs - Timeout
    let timeoutId: Parameters<typeof clearTimeout>[0];
    let timeoutRejecter: (() => void) | undefined = undefined;
    await Promise.race([
      this.waitTurnResolution(),
      new Promise<false>((res, rej) => {
        timeoutRejecter = rej;
        timeoutId = setTimeout(() => {
          res(false);
        }, 60000);
      }),
    ]).then((move: MoveDTO | false) => {
      if (!move) {
        // [TODO] dispatch turn-skip message
        return;
      }
      clearTimeout(timeoutId);
      if (timeoutRejecter) timeoutRejecter();
      const moveMessage: MoveMessage = {
        type: 'MOVE',
        blockInfo: move.blockInfo,
        playerIdx: this.playerIdx,
        position: move.position,
        turn: this.turn,
      };
      this.messageDispatcher.dispatch(moveMessage);
    });
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
      this.initiateNextTurn();
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
    position,
  }: SubmitMoveDTO) {
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
      playerIdx: this.playerIdx,
      position,
      turn: this.turn,
    });
    if (reason) {
      this.turnPromiseRejecter(reason);
      return;
    }
    this.turnPromiseResolver({
      blockInfo, playerIdx: this.playerIdx, position, turn: this.turn,
    });
    return;
  }

  async waitTurnResolution(): Promise<MoveDTO> {
    this.turnPromise = new Promise<MoveDTO>((res, rej) => {
      this.turnPromiseResolver = res;
      this.turnPromiseRejecter = rej;
    });
    const move = await this.turnPromise;

    this.initializeTurnPromise();
    if (!move) {
      modalStore.open(Alert, {
        title: 'invalid move',
        content: 'please do your move again',
      });
      return this.waitTurnResolution();
    }
    const failedReason = putBlockOnBoard({
      board: this.board,
      blockInfo: move.blockInfo,
      playerIdx: this.playerIdx,
      position: move.position,
      turn: this.turn,
    });
    if (!failedReason) {
      return move;
    }
    modalStore.open(Alert, {
      title: 'try other move',
      content: failedReason,
    });
    return this.waitTurnResolution();
  }

  initiateGameStatus() {
    this.turn = 0;
    this.board = createNewBoard();
    gameStore.update((gameInfo) => ({
      ...gameInfo,
      turn: 0,
      isStarted: true,
      unusedBlocks: new Map(Object.entries(preset) as [BlockType, BlockMatrix][]),
    }));
  }

  handleStartMessage() {
    this.initiateGameStatus();
  }

  async startGame() {
    if (this.playerIdx === 0) {
      this.initiateGameStatus();
      const startMessage: StartMessage = {
        type: 'START',
      };
      this.messageDispatcher.dispatch(startMessage);

      this.processMyTurn();
    }
  }
}
