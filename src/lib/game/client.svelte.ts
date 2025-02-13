import type {
  BlockMatrix,
  BlockType,
  BoardMatrix,
  MoveDTO,
  SubmitMoveDTO,
  ParticipantInf,
  OutboundWebSocketMessage,
  OutboundConnectedMessage,
  OutboundLeaveMessage,
  OutboundReadyMessage,
  OutboundCancelReadyMessage,
  OutboundMoveMessage,
  OutboundStartMessage,
  InboundMoveMessage,
  OutboundErrorMessage,
  OutboundMediateMessage,
  OutboundBadReqMessage,
  PlayerIdx,
  InboundReadyMessage,
  InboundCancelReadyMessage,
} from "$types";
import { gameStore, modalStore } from "../../Store";
import { createNewBoard, preset, putBlockOnBoard, rollbackMove } from "./core";
import type {
  WebSocketMessageDispatcher,
  WebSocketMessageReceiver,
} from "$lib/websocket/client";
import Alert from "$lib/components/Alert.svelte";
import Confirm from "$lib/components/Confirm.svelte";
import { isRightTurn } from "$lib/utils";

export class GameManager {
  constructor({
    board, playerIdx, turn, users, messageDispatcher, messageReceiver,
  }: {
    board: BoardMatrix, playerIdx: PlayerIdx, turn?: number,
    users: (ParticipantInf | undefined)[],
    messageDispatcher: WebSocketMessageDispatcher,
    messageReceiver: WebSocketMessageReceiver
  }) {
    this.board = board;
    this.turn = turn ?? -1;
    this.playerIdx = playerIdx;
    users.forEach((user, idx) => {
      this.users[idx] = user;
    });
    gameStore.subscribe((store) => {
      this.turn = store.turn;
    });
    this.messageDispatcher = messageDispatcher;
    this.messageReceiver = messageReceiver;

    this.messageReceiver.onMessage((m) => { this.handleIncomingMessage(m) });
  }
  private messageReceiver: WebSocketMessageReceiver;
  private messageDispatcher: WebSocketMessageDispatcher;

  private playerIdx: PlayerIdx;
  board: BoardMatrix = $state([]);
  private turn: number;

  users: (ParticipantInf | undefined)[] = $state([undefined, undefined, undefined, undefined]);

  handleIncomingMessage(message: OutboundWebSocketMessage) {
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
      case "BAD_REQ":
        this.handleBadRequestException(message);
        break;
      case "MEDIATE":
        break;
      case "ERROR":
        break;
      default:
        modalStore.open(Alert, {
          title: "received unknown message",
          message,
        });
        break;
    }
  }

  addUser(message: OutboundConnectedMessage) {
    const { id, playerIdx, username } = message;
    // [TODO] integrate field username-name
    this.users[playerIdx] = {
      id,
      username,
      ready: false,
    };
  }

  removeUser(message: OutboundLeaveMessage) {
    const { playerIdx } = message;
    this.users[playerIdx] = undefined;
  }

  ready() {
    const readyMessage: InboundReadyMessage = {
      type: 'READY',
    };
    this.messageDispatcher.dispatch(readyMessage);
  }

  unready() {
    const unreadyMessage: InboundCancelReadyMessage = {
      type: 'CANCEL_READY',
    };
    this.messageDispatcher.dispatch(unreadyMessage);
  }

  updateReadyState(message: OutboundReadyMessage | OutboundCancelReadyMessage) {
    const { type, playerIdx } = message;
    if (this.users[playerIdx]) {
      this.users[playerIdx].ready = type === 'READY';
    }
  }

  handleError(message: OutboundErrorMessage) {
    // 
  }

  handleMediate(message: OutboundMediateMessage) {
    // 
  }

  handleBadRequestException({ message }: OutboundBadReqMessage) {
    modalStore.open(Alert, {
      title: 'error occured',
      message,
    });
  }

  initiateNextTurn(): Promise<void> | void {
    gameStore.update(({ turn, ...rest }) => ({
      ...rest,
      turn: turn + 1,
    }));
    if (this.isMyTurn()) {
      this.processMyTurn();
    }
  }

  async processMyTurn() {
    // 1. timeout starts
    const timeoutId = setTimeout(() => {
      modalStore.open(Alert, {
        title: `time's up`,
        message: '',
      });
      const timeoutMessage: InboundMoveMessage = {
        type: 'MOVE',
        timeout: true,
        turn: this.turn,
      };
      this.messageDispatcher.dispatch(timeoutMessage);
      this.turnPromiseRejecter?.('timeout');
    }, 60000);
    let isSubmitted = false;
    // 2. wait
    while (!isSubmitted) {
      // 3. resolve move
      const move = await this.waitMoveResolution().catch(() => null);
      if (!move) {
        // if the move is empty, maybe that means the turnPromise was rejected
        break;
      }
      // 4. validation
      const reason = putBlockOnBoard({
        board: this.board,
        blockInfo: move.blockInfo,
        playerIdx: this.playerIdx,
        position: move.position,
        turn: move.turn,
      });
      if (reason) {
        // 5-1. if invalid, alert & wait(go to 2)
        modalStore.open(Alert, {
          title: 'invalid move: please try again',
          message: reason,
        });
        continue;
      }
      // 5. if valid, confirm
      await new Promise<void>((res, rej) => {
        modalStore.open(Confirm, {
          title: 'confirm your move',
          // [TODO] 
          message: '',
          confirmText: 'confirm',
          cancelText: '',
          onConfirm: () => {
            // 6. if confirmed, dispatch
            const moveMessage: InboundMoveMessage = {
              type: 'MOVE',
              blockInfo: move.blockInfo,
              playerIdx: this.playerIdx,
              position: move.position,
              timeout: false,
              turn: move.turn,
            };
            this.messageDispatcher.dispatch(moveMessage);
            isSubmitted = true;
            clearTimeout(timeoutId);
            res();
          },
          // 6-1. if rejected/closed,
          // just resolve this promise to...
          // - wait for the new one when canceled
          // - escape this loop when confirmed
          onClose: () => {
            // if user confirmed his/her move, this promise is already resolved
            // so handle 'reject' here(rollback)
            rollbackMove({
              board: this.board,
              blockInfo: move.blockInfo,
              position: move.position,
            });
            res();
          },
        });
      });
    }
  }

  isMyTurn() {
    return isRightTurn({
      turn: this.turn,
      activePlayerCount: this.users.filter(e => e !== undefined).length,
      playerIdx: this.playerIdx,
    });
  }

  private turnPromise: Promise<MoveDTO> | null = null;
  private turnPromiseResolver: ((dto: MoveDTO) => void) | null = null;
  private turnPromiseRejecter: ((reason: string) => void) | null = null;

  applyOpponentMove(message: OutboundMoveMessage) {
    const { timeout } = message;
    if (timeout) {
      this.initiateNextTurn();
      return;
    }
    const { blockInfo, playerIdx, position, turn } = message;
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

    this.turnPromiseResolver({
      blockInfo, playerIdx: this.playerIdx, position, turn: this.turn,
    });
    return;
  }

  async waitMoveResolution(): Promise<MoveDTO> {
    this.turnPromise = new Promise<MoveDTO>((res, rej) => {
      this.turnPromiseResolver = res;
      this.turnPromiseRejecter = rej;
    });
    const move = await this.turnPromise;
    this.initializeTurnPromise();
    return move;
  }

  initiateGameStatus() {
    this.board = createNewBoard();
    gameStore.update((gameInfo) => ({
      ...gameInfo,
      isStarted: true,
      unusedBlocks: new Map(Object.entries(preset) as [BlockType, BlockMatrix][]),
    }));
    this.initiateNextTurn();
  }

  handleStartMessage() {
    this.initiateGameStatus();
  }

  async startGame() {
    if (this.playerIdx !== 0) {
      return;
    }
    const startMessage: OutboundStartMessage = {
      type: 'START',
    };
    this.messageDispatcher.dispatch(startMessage);
  }
}
