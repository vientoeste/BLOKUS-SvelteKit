import type { BoardMatrix, CancelReadyMessage, ConnectedMessage, ErrorMessage, LeaveMessage, MoveMessage, ReadyMessage, StartMessage, WebSocketMessage } from "$lib/types";
import { get } from "svelte/store";
import { gameStore, modalStore } from "../../Store";
import { putBlockOnBoard } from "./core";
import type { WebSocketMessageDispatcher, WebSocketMessageReceiver } from "$lib/websocket/client";
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
        this.handleMove(message);
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

  handleMove({
    block,
    flip,
    playerIdx,
    position,
    rotation,
  }: MoveMessage) {
    const reason = putBlockOnBoard({
      board: this.board,
      blockInfo: {
        type: block,
        rotation: (rotation % 4) as 0 | 1 | 2 | 3,
        flip,
      },
      playerIdx,
      position,
      turn: get(gameStore).turn,
    });
    if (!reason) {
      gameStore.update(({ turn, isStarted, playerIdx, players, unusedBlocks }) => ({
        turn: turn + 1,
        isStarted, playerIdx, players, unusedBlocks
      }));
      return;
    }
    return reason;
  }

  startTurn() {
    throw new Error('not implemented');
  }

  handleStart(message: StartMessage) {
    if (this.playerIdx === 0) {
      this.startTurn();
    }
  }

  startGame() {
    if (this.playerIdx === 0) {
      this.startTurn();
    }
    // [TODO] dispatcher - send start message
  }
}