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
} from "$types";
import { parseJson } from "$lib/utils";
import { getRoomCache } from "$lib/database/room";

interface MessageProcessResult {
  success: boolean;
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
        success: false,
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
      payload: leaveMessage,
    };
  }

  private async handleReady(client: ActiveWebSocket): Promise<MessageProcessResult> {
    const roomCache = await getRoomCache(client.roomId);
    const player = client.playerIdx === 0 ? (roomCache.p0) :
      client.playerIdx === 1 ? (roomCache.p1) :
        client.playerIdx === 2 ? (roomCache.p2) : (roomCache.p3);
    await this.redis.hSet(`room:${client.roomId}`, `p${client.playerIdx}`, JSON.stringify({
      ...player, ready: 1,
    }));

    const readyMessage: OutboundReadyMessage = {
      type: 'READY',
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      payload: readyMessage,
    };
  }

  private async handleCancelReady(client: ActiveWebSocket): Promise<MessageProcessResult> {
    const roomCache = await getRoomCache(client.roomId);
    const player = client.playerIdx === 0 ? roomCache.p0 :
      client.playerIdx === 1 ? roomCache.p1 :
        client.playerIdx === 2 ? roomCache.p2 : roomCache.p3;
    await this.redis.hSet(`room:${client.roomId}`, `p${client.playerIdx}`, JSON.stringify({
      ...player, ready: 0,
    }));

    const cancelReadyMessage: OutboundCancelReadyMessage = {
      type: 'CANCEL_READY',
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      payload: cancelReadyMessage,
    };
  }

  private async handleMove(client: ActiveWebSocket, message: InboundMoveMessage): Promise<MessageProcessResult> {
    const { timeout } = message;
    if (timeout) {
      return {
        success: true,
        payload: {
          type: 'MOVE',
          timeout: true,
          playerIdx: client.playerIdx,
          turn: message.turn,
        } as OutboundMoveMessage,
      };
    }

    const { blockInfo, playerIdx, position, turn } = message as MoveDTO;
    // [TODO] checksum - lastMove
    const currentTurn = await this.redis.hGet(`room:${client.roomId}`, 'turn');
    if (turn !== parseInt(currentTurn as string)) {
      return {
        success: false,
        payload: { type: 'BAD_REQ', message: 'wrong turn' },
      };
    }
    const compressedMove = `${client.playerIdx}:${blockInfo.type}[${position[0]},${position[1]}]r${blockInfo.rotation}f${blockInfo.flip ? 0 : 1}`;
    await this.redis.hSet(`room:${client.roomId}`, 'lastMove', compressedMove);
    await this.redis.hSet(`room:${client.roomId}`, 'turn', turn + 1);
    // [TODO] write move to db

    const moveMessage: OutboundMoveMessage = {
      type: 'MOVE',
      timeout: false,
      blockInfo,
      playerIdx: client.playerIdx,
      position,
      turn,
    };
    return {
      success: true,
      payload: moveMessage,
    };
  }

  private async handleStart(client: ActiveWebSocket): Promise<MessageProcessResult> {
    if (client.playerIdx !== 0) {
      return {
        success: false,
        payload: { type: 'BAD_REQ', message: 'unauthorized' },
      };
    }

    const roomCache = await getRoomCache(client.roomId);
    if (roomCache.started) {
      return {
        success: false,
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
        success: false,
        payload: { type: 'BAD_REQ', message: 'not readied' },
      };
    }

    await this.redis.hSet(`room:${client.roomId}`, 'started', '1');
    const startMessage: OutboundStartMessage = {
      type: 'START',
    };
    return {
      success: true,
      payload: startMessage,
    };
  }

  private handleReport(client: ActiveWebSocket, message: InboundReportMessage): MessageProcessResult {
    // [TODO] validate move here
    throw new Error("not implemented");
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
      default:
        return {
          success: false,
          payload: { type: 'ERROR', }
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
      if (!result.success) {
        client.send(JSON.stringify(result.payload));
        return;
      }
      if (result.payload.type === 'LEAVE') {
        this.connectionManager.removeClient({ roomId: client.roomId, userId: client.userId });
      }
      this.messageBroker.publishMessage({ message: result.payload, roomId: client.roomId });
      return;
    } catch (e) {
      // [TODO] log
    }
  }
}
