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
        this.handleStartMessage(message);
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
    const result = await Promise.race([
      new Promise<boolean>((res, rej) => {
        while (true as boolean) {
          this.waitTurnResolution().then((move) => {
            const reason = putBlockOnBoard({
              board: this.board,
              playerIdx: this.playerIdx,
              turn: this.turn,
              blockInfo: move.blockInfo,
              position: move.position,
            });
            if (!reason) {
              const moveMessage: MoveMessage = {
                type: 'MOVE',
                ...move,
              };
              this.messageDispatcher.dispatch(moveMessage);
              if (timeoutRejecter !== undefined) {
                timeoutRejecter?.();
                clearTimeout(timeoutId);
              }
              res(true);
            }
            modalStore.open(Alert, {
              title: 'invalid move',
              content: 'please try again',
            });
            return;
          });
        }
      }),
      new Promise<boolean>((res, rej) => {
        timeoutRejecter = rej;
        timeoutId = setTimeout(() => {
          res(false);
        }, 60000);
      }),
    ]);
    if (!result) {
      // [TODO] dispatch turn-skip message
    }
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

  handleStartMessage({ blockInfo, playerIdx, position, turn }: StartMessage) {
    this.initiateGameStatus();
    this.applyOpponentMove({ blockInfo, playerIdx, position, turn });
  }

  async startGame() {
    if (this.playerIdx === 0) {
      this.initiateGameStatus();
      const move = await this.waitTurnResolution();
      const startMessage: StartMessage = {
        type: 'START',
        ...move,
      };
      this.messageDispatcher.dispatch(startMessage);
    }
  }
}
