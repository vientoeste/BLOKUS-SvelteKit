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
  InboundMoveMessage,
  OutboundErrorMessage,
  OutboundMediateMessage,
  OutboundBadReqMessage,
  PlayerIdx,
  InboundReadyMessage,
  InboundCancelReadyMessage,
  SlotIdx,
  Move,
  InboundStartMessage,
} from "$types";
import { gameStore, modalStore, movePreviewStore } from "../../Store";
import { createNewBoard, preset, putBlockOnBoard, rollbackMove } from "./core";
import type {
  WebSocketMessageDispatcher,
  WebSocketMessageReceiver,
} from "$lib/websocket/client";
import Alert from "$lib/components/Alert.svelte";
import Confirm from "$lib/components/Confirm.svelte";
import { getPlayersSlot, isRightTurn } from "$lib/utils";
import { get } from "svelte/store";

export class GameManager {
  constructor({
    board, playerIdx, turn, users, gameId, messageDispatcher, messageReceiver,
  }: {
    board: BoardMatrix, playerIdx: PlayerIdx, turn?: number,
    users: (ParticipantInf | undefined)[],
    gameId?: string,
    messageDispatcher: WebSocketMessageDispatcher,
    messageReceiver: WebSocketMessageReceiver
  }) {
    this.board = board;
    this.turn = turn ?? -1;
    this.playerIdx = playerIdx;
    this.gameId = gameId;
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

  gameId: string | undefined;

  private playerIdx: PlayerIdx;
  board: BoardMatrix = $state([]);
  private turn: number;

  users: (ParticipantInf | undefined)[] = $state([undefined, undefined, undefined, undefined]);

  moves: Move[] = [];

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
        this.applyMove(message);
        break;
      case "START":
        this.handleStartMessage(message);
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

  async processMyTurn(leftTime?: number) {
    modalStore.open(Alert, {
      title: 'your turn',
      message: 'please make your move',
    });
    // 1. timeout starts
    const timeoutId = setTimeout(() => {
      modalStore.open(Alert, {
        title: `time's up`,
        message: '',
      });
      const timeoutMessage: InboundMoveMessage = {
        type: 'MOVE',
        timeout: true,
        slotIdx: this.turn % 4 as SlotIdx,
        turn: this.turn,
      };
      this.messageDispatcher.dispatch(timeoutMessage);
      this.turnPromiseRejecter?.('timeout');
    }, leftTime ?? 60000);
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
        slotIdx: move.slotIdx,
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
      const movePreview = get(movePreviewStore);
      // 5. if valid, confirm
      await new Promise<void>((res, rej) => {
        modalStore.open(Confirm, {
          title: 'confirm your move',
          message: `<img src="${movePreview}" alt="board preview" style="max-width: 100%;" />`,
          confirmText: 'confirm',
          cancelText: 'cancel',
          onConfirm: () => {
            // 6. if confirmed, dispatch
            const moveMessage: InboundMoveMessage = {
              type: 'MOVE',
              blockInfo: move.blockInfo,
              playerIdx: this.playerIdx,
              slotIdx: move.slotIdx,
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
              slotIdx: move.slotIdx,
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

  applyMove(message: OutboundMoveMessage) {
    if (!this.gameId) {
      throw new Error('gameId is not set');
    }
    const { timeout } = message;
    if (timeout) {
      this.moves.push({
        gameId: this.gameId,
        playerIdx: message.playerIdx,
        slotIdx: message.slotIdx,
        turn: message.turn,
        createdAt: new Date(),
        timeout: true,
      })
      this.initiateNextTurn();
      return;
    }
    const { blockInfo, playerIdx, position, turn, slotIdx } = message;
    const reason = putBlockOnBoard({
      board: this.board,
      blockInfo,
      playerIdx,
      position,
      turn,
      slotIdx,
    });
    if (!reason) {
      gameStore.update((store) => {
        const slots = [...store.availableBlocksBySlots];
        slots[slotIdx].delete(blockInfo.type);
        return {
          ...store,
          availableBlocksBySlots: slots,
        };
      });
      this.moves.push({
        gameId: this.gameId,
        blockInfo,
        playerIdx,
        position,
        slotIdx,
        turn,
        createdAt: new Date(),
        timeout: false,
      })
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
    slotIdx,
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
      blockInfo, playerIdx: this.playerIdx, slotIdx, position, turn: this.turn,
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

  initiateGameStatus(gameId: string) {
    this.gameId = gameId;
    this.board = createNewBoard();
    gameStore.update((gameInfo) => ({
      ...gameInfo,
      isStarted: true,
      mySlots: getPlayersSlot({
        players: this.users,
        playerIdx: this.playerIdx,
      }),
      availableBlocksBySlots: Array(4).fill(null).map(() => new Map(Object.entries(preset) as [BlockType, BlockMatrix][])),
    }));
    this.initiateNextTurn();
  }

  handleStartMessage(message: OutboundStartMessage) {
    this.initiateGameStatus(message.gameId);
  }

  async startGame() {
    if (this.playerIdx !== 0) {
      return;
    }
    const startMessage: InboundStartMessage = {
      type: 'START',
    };
    this.messageDispatcher.dispatch(startMessage);
  }

  restoreGameState(moves: Move[]) {
    gameStore.update((store) => {
      this.moves = moves.sort((a, b) => a.turn - b.turn);
      const availableBlocks = Array(4).fill(null).map(() => new Map(Object.entries(preset) as [BlockType, BlockMatrix][]));
      moves.forEach((move) => {
        if (!move.timeout) {
          availableBlocks[move.slotIdx].delete(move.blockInfo.type);
          putBlockOnBoard({
            board: this.board,
            blockInfo: move.blockInfo,
            playerIdx: move.playerIdx,
            position: move.position,
            slotIdx: move.slotIdx,
            turn: move.turn,
          });
        }
      });
      return {
        ...store, availableBlocksBySlots: availableBlocks,
      };
    });

    const leftTime = moves[moves.length - 1].createdAt.valueOf() - Date.now();
    if (!this.isMyTurn()) {
      return;
    }
    if (this.isMyTurn() && leftTime < 0) {
      const timeoutMessage: InboundMoveMessage = {
        type: 'MOVE',
        slotIdx: this.turn % 4 as SlotIdx,
        turn: this.turn,
        timeout: true,
      };
      this.messageDispatcher.dispatch(timeoutMessage);
      return;
    }
    this.processMyTurn(leftTime);
  }
}
