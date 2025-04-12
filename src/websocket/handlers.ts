import type { RedisClientType } from "redis";
import type {
  InboundConnectedMessage,
  InboundMoveMessage,
  InboundReportMessage,
  InboundWebSocketMessage,
  OutboundBadReqMessage,
  OutboundErrorMessage,
  OutboundWebSocketMessage,
  ActiveWebSocket,
  WebSocketBrokerMessage,
  OutboundConnectedMessage,
  OutboundLeaveMessage,
  OutboundReadyMessage,
  OutboundCancelReadyMessage,
  OutboundMoveMessage,
  OutboundStartMessage,
  MoveDTO,
  PlayerId,
  InboundExhaustedMessage,
  OutboundExhaustedMessage,
  OutboundSkipTurnMessage,
  InboundSkipTurnMessage,
} from "$types";
import { extractPlayerCountFromCache, isRightTurn, parseJson } from "$lib/utils";
import { getRoomCache, markPlayerAsExhausted, updatePlayerReadyState } from "$lib/database/room";
import { insertExhaustedMove, insertRegularMove, insertTimeoutMove } from "$lib/database/move";
import { uuidv7 } from "uuidv7";
import { updateStartedState } from "$lib/room";

interface MessageProcessResult {
  success: boolean;
  shouldBroadcast: boolean;
  payload: OutboundWebSocketMessage;
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
        shouldBroadcast: false,
        payload: message,
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
      shouldBroadcast: true,
      payload: connectedMessage,
    };
  }

  private handleUserLeave(client: ActiveWebSocket): MessageProcessResult {
    const leaveMessage: OutboundLeaveMessage = {
      type: 'LEAVE',
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      shouldBroadcast: true,
      payload: leaveMessage,
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
      shouldBroadcast: true,
      payload: readyMessage,
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
      shouldBroadcast: true,
      payload: cancelReadyMessage,
    };
  }

  private async handleMove(client: ActiveWebSocket, message: InboundMoveMessage): Promise<MessageProcessResult> {
    const { turn, slotIdx } = message;
    const roomCache = await getRoomCache(client.roomId);
    if (!isRightTurn({
      turn,
      activePlayerCount: extractPlayerCountFromCache(roomCache),
      playerIdx: client.playerIdx,
    }) || turn !== roomCache.turn) {
      const badReqMessage: OutboundBadReqMessage = {
        type: 'BAD_REQ',
        message: 'wrong turn',
      };
      return {
        success: true,
        shouldBroadcast: false,
        payload: badReqMessage,
      };
    }
    const { gameId } = roomCache;
    if (!gameId) {
      const errMessage: OutboundErrorMessage = {
        type: 'ERROR',
      }
      return {
        success: false,
        shouldBroadcast: false,
        payload: errMessage,
      }
    }

    await this.redis.hSet(`room:${client.roomId}`, 'turn', turn + 1);
    const moveId = uuidv7();

    const { blockInfo, position } = message as MoveDTO;
    await insertRegularMove(moveId, {
      blockInfo,
      gameId,
      playerIdx: client.playerIdx,
      position,
      slotIdx,
      turn,
      createdAt: new Date(),
    });
    const compressedMove = `${client.playerIdx}:${blockInfo.type}[${position[0]},${position[1]}]r${blockInfo.rotation}f${blockInfo.flip ? 0 : 1}`;
    await this.redis.hSet(`room:${client.roomId}`, 'lastMove', compressedMove);
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
      shouldBroadcast: true,
      payload: moveMessage,
    };
  }

  private async handleSkipTurnMessage(client: ActiveWebSocket, message: InboundSkipTurnMessage) {
    const { exhausted, slotIdx, timeout, turn } = message;
    const roomCache = await getRoomCache(client.roomId);
    if (!isRightTurn({
      turn,
      activePlayerCount: extractPlayerCountFromCache(roomCache),
      playerIdx: client.playerIdx,
    }) || turn !== roomCache.turn) {
      const badReqMessage: OutboundBadReqMessage = {
        type: 'BAD_REQ',
        message: 'wrong turn',
      };
      return {
        success: true,
        shouldBroadcast: false,
        payload: badReqMessage,
      };
    }
    const { gameId } = roomCache;
    if (!gameId) {
      const errMessage: OutboundErrorMessage = {
        type: 'ERROR',
      }
      return {
        success: false,
        shouldBroadcast: false,
        payload: errMessage,
      }
    }

    await this.redis.hSet(`room:${client.roomId}`, 'turn', turn + 1);
    const moveId = uuidv7();
    if (timeout) {
      await insertTimeoutMove(moveId, {
        timeout: true,
        exhausted: false,
        turn,
        playerIdx: client.playerIdx,
        gameId,
        slotIdx,
        createdAt: new Date(),
      });
      return {
        success: true,
        shouldBroadcast: true,
        payload: {
          type: 'SKIP_TURN',
          timeout: true,
          exhausted: false,
          playerIdx: client.playerIdx,
          turn: message.turn,
          slotIdx: message.slotIdx
        } as OutboundSkipTurnMessage,
      };
    }
    /**
     * @description this line infers if (exhausted) { ...
     * but removed conditional statement because type guess causes undefined-return
     */
    await insertExhaustedMove(moveId, {
      timeout: false,
      exhausted: true,
      turn,
      playerIdx: client.playerIdx,
      gameId,
      slotIdx,
      createdAt: new Date(),
    });
    return {
      success: true,
      shouldBroadcast: true,
      payload: {
        type: 'SKIP_TURN',
        timeout: false,
        exhausted: true,
        playerIdx: client.playerIdx,
        turn: message.turn,
        slotIdx: message.slotIdx
      } as OutboundSkipTurnMessage,
    };
  }

  private async handleStart(client: ActiveWebSocket): Promise<MessageProcessResult> {
    if (client.playerIdx !== 0) {
      return {
        success: true,
        shouldBroadcast: false,
        payload: { type: 'BAD_REQ', message: 'unauthorized' },
      };
    }

    const roomCache = await getRoomCache(client.roomId);
    if (roomCache.started) {
      return {
        success: true,
        shouldBroadcast: false,
        payload: { type: 'BAD_REQ', message: 'game already started' },
      };
    }
    // [TODO] consider the case that number of user is lower than 4
    const isReadied = roomCache.p0.ready
      && (roomCache.p1 === undefined || roomCache.p1?.ready)
      && (roomCache.p2 === undefined || roomCache.p2?.ready)
      && (roomCache.p3 === undefined || roomCache.p3?.ready);
    if (!isReadied) {
      return {
        success: true,
        shouldBroadcast: false,
        payload: { type: 'BAD_REQ', message: 'not readied' },
      };
    }

    updateStartedState({ roomId: client.roomId, isStarted: true });
    const gameId = uuidv7();
    await this.redis.hSet(`room:${client.roomId}`, 'gameId', gameId);
    await this.redis.hSet(`room:${client.roomId}`, 'started', '1');
    await this.redis.hSet(`room:${client.roomId}`, 'turn', 0);
    const startMessage: OutboundStartMessage = {
      type: 'START',
      gameId,
    };
    return {
      success: true,
      shouldBroadcast: true,
      payload: startMessage,
    };
  }

  private handleReport(client: ActiveWebSocket, message: InboundReportMessage): MessageProcessResult {
    // [TODO] validate move here
    throw new Error("not implemented");
  }

  private async handleExhausted(client: ActiveWebSocket, message: InboundExhaustedMessage): Promise<MessageProcessResult> {
    await markPlayerAsExhausted({ roomId: client.roomId, slotIdx: message.slotIdx });
    const exhaustedMessage: OutboundExhaustedMessage = {
      type: 'EXHAUSTED',
      slotIdx: message.slotIdx
    };
    return {
      success: true,
      shouldBroadcast: true,
      payload: exhaustedMessage,
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
      default:
        return {
          success: false,
          shouldBroadcast: false,
          payload: { type: 'BAD_REQ', message: 'not supported message type' },
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
    this.subscriber.subscribe('message', (rawMessage) => {
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
      if (!result.shouldBroadcast) {
        client.send(JSON.stringify(result.payload));
        return;
      }
      this.messageBroker.publishMessage({ message: result.payload, roomId: client.roomId });
      return;
    } catch (e) {
      // [TODO] log
    }
  }
}
