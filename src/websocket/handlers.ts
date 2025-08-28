import type { RedisClientType } from "redis";
import type {
  InboundConnectedMessage,
  InboundMoveMessage,
  InboundReportMessage,
  InboundWebSocketMessage,
  OutboundBadReqMessage,
  OutboundWebSocketMessage,
  ActiveWebSocket,
  WebSocketBrokerMessage,
  OutboundConnectedMessage,
  OutboundLeaveMessage,
  OutboundReadyMessage,
  OutboundCancelReadyMessage,
  OutboundMoveMessage,
  OutboundStartMessage,
  PlayerId,
  InboundExhaustedMessage,
  OutboundExhaustedMessage,
  OutboundSkipTurnMessage,
  InboundSkipTurnMessage,
  OutboundScoreConfirmationMessage,
  InboundScoreConfirmationMessage,
  OutboundGameEndMessage,
} from "$types";
import { parseJson } from "$lib/utils";
import { getRoomCache, markPlayerAsExhausted, updatePlayerReadyState } from "$lib/database/room";
import { uuidv7 } from "uuidv7";
import { applyMove, applySkipTurn, updateStartedState } from "$lib/room";
import { confirmScore, initiateGameEndSequence } from "$lib/game";
import { Score } from "$lib/domain/score";

interface MessageAction {
  action: 'broadcast' | 'reply';
  payload: OutboundWebSocketMessage;
}

interface MessageProcessResult {
  success: boolean;
  actions: MessageAction[];
}

export class WebSocketMessageHandler {
  constructor(redis: RedisClientType) {
    this.redis = redis;
  }

  private redis: RedisClientType;

  private handleUserConnected(client: ActiveWebSocket, { username }: InboundConnectedMessage): MessageProcessResult {
    if (!username) {
      const message: OutboundBadReqMessage = {
        type: 'BAD_REQ',
        message: 'username is missing',
      };
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: message,
        }],
      };
    }
    const connectedMessage: OutboundConnectedMessage = {
      type: 'CONNECTED',
      id: client.userId,
      username,
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      actions: [{
        action: 'broadcast',
        payload: connectedMessage,
      }]
    };
  }

  private handleUserLeave(client: ActiveWebSocket): MessageProcessResult {
    const leaveMessage: OutboundLeaveMessage = {
      type: 'LEAVE',
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      actions: [{
        action: 'broadcast',
        payload: leaveMessage,
      }],
    };
  }

  private async handleReady(client: ActiveWebSocket): Promise<MessageProcessResult> {
    await updatePlayerReadyState({ roomId: client.roomId, playerIdx: client.playerIdx, ready: true });

    const readyMessage: OutboundReadyMessage = {
      type: 'READY',
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      actions: [{
        action: 'broadcast',
        payload: readyMessage,
      }],
    };
  }

  private async handleCancelReady(client: ActiveWebSocket): Promise<MessageProcessResult> {
    await updatePlayerReadyState({ roomId: client.roomId, playerIdx: client.playerIdx, ready: false });

    const cancelReadyMessage: OutboundCancelReadyMessage = {
      type: 'CANCEL_READY',
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      actions: [{
        action: 'broadcast',
        payload: cancelReadyMessage,
      }],
    };
  }

  private async handleMove(client: ActiveWebSocket, message: InboundMoveMessage): Promise<MessageProcessResult> {
    const { blockInfo, playerIdx, position, slotIdx, turn } = message;
    const result = await applyMove({
      move: {
        blockInfo,
        playerIdx,
        position,
        slotIdx,
        turn,
      },
      roomId: client.roomId,
    });
    if (!result.success) {
      const badReqMessage: OutboundBadReqMessage = {
        type: 'BAD_REQ',
        message: result.reason ?? 'unknown error occured',
      };
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: badReqMessage,
        }],
      };
    }
    // [TODO] checksum - lastMove
    const moveMessage: OutboundMoveMessage = {
      type: 'MOVE',
      blockInfo,
      playerIdx: client.playerIdx,
      slotIdx,
      position,
      turn,
    };
    return {
      success: true,
      actions: [{
        action: 'broadcast',
        payload: moveMessage,
      }],
    };
  }

  private async handleSkipTurnMessage(client: ActiveWebSocket, message: InboundSkipTurnMessage): Promise<MessageProcessResult> {
    const { exhausted, slotIdx, timeout, turn } = message;
    if (exhausted === timeout) {
      const badReqMessage: OutboundBadReqMessage = {
        type: 'BAD_REQ',
        message: 'exhausted move cannot be timeout move',
      };
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: badReqMessage,
        }],
      };
    }
    const result = await applySkipTurn({
      playerIdx: client.playerIdx,
      roomId: client.roomId,
      slotIdx,
      turn,
      type: timeout ? 'timeout' : 'exhausted',
    });
    if (!result.success) {
      const badReqMessage: OutboundBadReqMessage = {
        type: 'BAD_REQ',
        message: result.reason ?? 'unknown error occured',
      };
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: badReqMessage,
        }],
      };
    }
    const skipTurnMessage = {
      type: 'SKIP_TURN',
      exhausted: exhausted === true,
      playerIdx: client.playerIdx,
      slotIdx,
      timeout: exhausted === false,
      turn,
    } as OutboundSkipTurnMessage;
    return {
      success: true,
      actions: [{
        action: 'broadcast',
        payload: skipTurnMessage,
      }],
    };
  }

  private async handleStart(client: ActiveWebSocket): Promise<MessageProcessResult> {
    if (client.playerIdx !== 0) {
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: { type: 'BAD_REQ', message: 'unauthorized' },
        }],
      };
    }

    const roomCache = await getRoomCache(client.roomId);
    if (roomCache.started) {
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: { type: 'BAD_REQ', message: 'game already started' },
        }],
      };
    }
    // [TODO] consider the case that number of user is lower than 4
    const players = [roomCache.p0, roomCache.p1, roomCache.p2, roomCache.p3].filter(e => e !== undefined);
    if (players.length < 2) {
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: { type: 'BAD_REQ', message: 'required at least 2 players' },
        }],
      };
    }
    if (!players.every(player => player.ready)) {
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: { type: 'BAD_REQ', message: 'not readied' },
        }],
      };
    }

    const gameId = uuidv7();
    await updateStartedState({ roomId: client.roomId, isStarted: true, gameId });

    const startMessage: OutboundStartMessage = {
      type: 'START',
      activePlayerCount: players.length as 2 | 3 | 4,
      gameId,
    };
    return {
      success: true,
      actions: [{
        action: 'broadcast',
        payload: startMessage,
      }],
    };
  }

  private handleReport(client: ActiveWebSocket, message: InboundReportMessage): MessageProcessResult {
    // [TODO] validate move here
    throw new Error("not implemented");
  }

  private async handleExhausted(client: ActiveWebSocket, message: InboundExhaustedMessage): Promise<MessageProcessResult> {
    const messages: MessageAction[] = [];

    const { isGameEnd } = await markPlayerAsExhausted({ roomId: client.roomId, slotIdx: message.slotIdx });
    if (isGameEnd) {
      await initiateGameEndSequence({
        roomId: client.roomId,
        playerIdx: client.playerIdx,
      });
      const scoreValidationMessage: OutboundScoreConfirmationMessage = {
        type: 'SCORE_CONFIRM',
      };
      messages.push({
        action: 'broadcast',
        payload: scoreValidationMessage,
      });
    }

    const exhaustedMessage: OutboundExhaustedMessage = {
      type: 'EXHAUSTED',
      slotIdx: message.slotIdx
    };
    messages.unshift({
      action: 'broadcast',
      payload: exhaustedMessage,
    });
    return {
      success: true,
      actions: messages,
    };
  }

  private async handleScoreConfirmationMessage(client: ActiveWebSocket, message: InboundScoreConfirmationMessage): Promise<MessageProcessResult> {
    const score = new Score(message.score);
    const result = await confirmScore({
      playerIdx: client.playerIdx,
      roomId: client.roomId,
      score,
    });
    if (!result.success) {
      const badReqMessage: OutboundBadReqMessage = {
        type: 'BAD_REQ',
        message: result.reason ?? 'unknown error occured',
      };
      return {
        success: true,
        actions: [{
          action: 'reply',
          payload: badReqMessage,
        }],
      };
    }
    if (result.isDone) {
      const gameEndMessage: OutboundGameEndMessage = {
        type: 'GAME_END',
      };
      return {
        success: true,
        actions: [{
          action: 'broadcast',
          payload: gameEndMessage,
        }],
      };
    }
    return {
      success: true,
      actions: [],
    };
  }

  async processMessage(client: ActiveWebSocket, message: InboundWebSocketMessage): Promise<MessageProcessResult> {
    switch (message.type) {
      case 'START':
        return this.handleStart(client);
      case "CONNECTED":
        return this.handleUserConnected(client, message);
      case "LEAVE":
        return this.handleUserLeave(client);
      case "READY":
        return this.handleReady(client);
      case "CANCEL_READY":
        return this.handleCancelReady(client);
      case "MOVE":
        return this.handleMove(client, message);
      case "REPORT":
        return this.handleReport(client, message);
      case "EXHAUSTED":
        return this.handleExhausted(client, message);
      case 'SKIP_TURN':
        return this.handleSkipTurnMessage(client, message);
      case "SCORE_CONFIRM":
        return this.handleScoreConfirmationMessage(client, message);
      default:
        return {
          success: false,
          actions: [{
            action: 'reply',
            payload: { type: 'BAD_REQ', message: 'not supported message type' },
          }],
        };
    }
  }
}

export class WebSocketConnectionManager {
  private clientPool: Map<string, ActiveWebSocket[]> = new Map();

  addClient({ roomId, client }: { roomId: string, client: ActiveWebSocket }) {
    const connections = this.clientPool.get(roomId);
    if (connections === undefined) {
      this.clientPool.set(roomId, [client]);
      return;
    }
    connections.push(client);
  }

  removeClient({ roomId, userId }: { roomId: string, userId: string }) {
    const connections = this.clientPool.get(roomId);
    if (!connections || connections.length === 0) return;
    connections.splice(connections.findIndex((e) => e.userId === userId), 1);
  }

  getClientsByRoomId(roomId: string) {
    return this.clientPool.get(roomId);
  }
}

export class WebSocketMessageBroker {
  constructor(
    redis: RedisClientType,
    responseDispatcher: WebSocketResponseDispatcher,
  ) {
    this.publisher = redis;
    if (!this.publisher.isReady) this.publisher.connect();
    this.subscriber = redis.duplicate();
    this.subscriber.connect();
    this.responseDispatcher = responseDispatcher;
  }

  private subscriber: RedisClientType;
  private publisher: RedisClientType;
  private responseDispatcher: WebSocketResponseDispatcher;

  // [CHECK] message's type
  publishMessage({ message, roomId }: { roomId: string, message: OutboundWebSocketMessage }) {
    this.publisher.publish('message', JSON.stringify({ payload: message, roomId }));
  }

  subscribeMessage() {
    this.subscriber.subscribe('message', (rawMessage: string) => {
      const message = parseJson<WebSocketBrokerMessage>(rawMessage);
      if (typeof message === 'string') return;
      const { roomId, payload } = message;
      this.responseDispatcher.dispatch({ roomId, payload });
    });
  }
}

export class WebSocketResponseDispatcher {
  constructor(
    connectionManager: WebSocketConnectionManager,
  ) {
    this.connectionManager = connectionManager;
  }

  private connectionManager: WebSocketConnectionManager;

  dispatch({
    roomId, payload,
  }: WebSocketBrokerMessage) {
    const clients = this.connectionManager.getClientsByRoomId(roomId);
    if (clients === undefined) {
      return;
    }
    clients.forEach(client => {
      client.send(JSON.stringify(payload));
    });
  }
}

export class WebSocketConnectionOrchestrator {
  constructor(
    messageHandler: WebSocketMessageHandler,
    messageBroker: WebSocketMessageBroker,
    connectionManager: WebSocketConnectionManager,
  ) {
    this.messageHandler = messageHandler;
    this.messageBroker = messageBroker;
    this.connectionManager = connectionManager;
  }

  private messageHandler: WebSocketMessageHandler;
  private messageBroker: WebSocketMessageBroker;
  private connectionManager: WebSocketConnectionManager;

  async handleClientConnect(client: ActiveWebSocket, { id, username }: { id: PlayerId, username: string }) {
    // [TODO] update parameter type
    this.connectionManager.addClient({ client, roomId: client.roomId });
    const connectedMessage: OutboundConnectedMessage = {
      type: 'CONNECTED',
      id,
      playerIdx: client.playerIdx,
      username,
    };
    this.messageBroker.publishMessage({ roomId: client.roomId, message: connectedMessage });
  }

  async handleClientLeave(client: ActiveWebSocket) {
    this.connectionManager.removeClient({ roomId: client.roomId, userId: client.userId });
    const leaveMessage: OutboundLeaveMessage = {
      type: 'LEAVE',
      playerIdx: client.playerIdx,
    };
    this.messageBroker.publishMessage({ roomId: client.roomId, message: leaveMessage });
  }

  async handleClientMessage(client: ActiveWebSocket, rawMessage: string) {
    try {
      const message = parseJson<InboundWebSocketMessage>(rawMessage);
      if (typeof message === 'string') {
        client.send(JSON.stringify({ type: 'BAD_REQ', message: 'unknown message type' } as OutboundBadReqMessage));
        return;
      }
      // const traceId = uuidv7();
      // [TODO] log
      const result = await this.messageHandler.processMessage(client, message);
      result.actions.forEach((messageAction) => {
        switch (messageAction.action) {
          case "broadcast":
            this.messageBroker.publishMessage({ message: messageAction.payload, roomId: client.roomId });
            break;
          case "reply":
            client.send(JSON.stringify(messageAction.payload));
            break;
          default:
            throw new Error(`unknown action detected: ${messageAction.action}`);
        }
      });
    } catch (e) {
      // [TODO] log
    }
  }
}
