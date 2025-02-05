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
    const roomCache = await this.redis.hGetAll(`room:${client.roomId}`);
    const player = client.playerIdx === 0 ? JSON.parse(roomCache.p0) :
      client.playerIdx === 1 ? JSON.parse(roomCache.p1) :
        client.playerIdx === 2 ? JSON.parse(roomCache.p2) : JSON.parse(roomCache.p3);
    player.ready = 1;
    await this.redis.hSet(`room:${client.roomId}`, `p${client.playerIdx}`, JSON.stringify(player));

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
    const roomCache = await this.redis.hGetAll(`room:${client.roomId}`);
    const player = client.playerIdx === 0 ? JSON.parse(roomCache.p0) :
      client.playerIdx === 1 ? JSON.parse(roomCache.p1) :
        client.playerIdx === 2 ? JSON.parse(roomCache.p2) : JSON.parse(roomCache.p3);
    player.ready = 0;

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
    if (turn - 1 !== parseInt(currentTurn as string)) {
      return {
        success: false,
        payload: { type: 'BAD_REQ', message: 'wrong turn' },
      };
    }
    const compressedMove = `${client.playerIdx}:${blockInfo.type}[${position[0]},${position[1]}]r${blockInfo.rotation}f${blockInfo.flip ? 0 : 1}`;
    await this.redis.hSet(`room:${client.roomId}`, 'lastMove', compressedMove);
    await this.redis.hSet(`room:${client.roomId}`, 'turn', turn);
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

    const roomCache = await this.redis.hGetAll(`room:${client.roomId}`);
    const isStarted = '1' === roomCache.started;
    if (isStarted) {
      return {
        success: false,
        payload: { type: 'BAD_REQ', message: 'game already started' },
      };
    }
    // [TODO] consider the case that number of user is lower than 4
    const isReadied = JSON.parse(roomCache.p1).ready === 1
      && JSON.parse(roomCache.p2).ready === 1
      && JSON.parse(roomCache.p3).ready === 1;
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

  // [TODO] log the websocket messages here or upper scope
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
    this.subscriber = redis.duplicate();
    this.responseDispatcher = responseDispatcher;
  }

  private subscriber: RedisClientType;
  private publisher: RedisClientType;
  private responseDispatcher: WebSocketResponseDispatcher;

  // [CHECK] message's type
  publishMessage({ message, roomId }: { roomId: string, message: OutboundWebSocketMessage }) {
    this.publisher.publish('message', JSON.stringify({ message, roomId }));
  }

  subscribeMessage() {
    this.subscriber.subscribe('message', (message) => {
      const { roomId, payload } = JSON.parse(message) as WebSocketBrokerMessage;
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
    responseDispatcher: WebSocketResponseDispatcher,
    connectionManager: WebSocketConnectionManager,
  ) {
    this.messageHandler = messageHandler;
    this.messageBroker = messageBroker;
    this.responseDispatcher = responseDispatcher;
    this.connectionManager = connectionManager;
  }

  private messageHandler: WebSocketMessageHandler;
  private messageBroker: WebSocketMessageBroker;
  private responseDispatcher: WebSocketResponseDispatcher;
  private connectionManager: WebSocketConnectionManager;

  async handleClientMessage(client: ActiveWebSocket, rawMessage: string) {
    try {
      const message = JSON.parse(rawMessage) as InboundWebSocketMessage;
      if (typeof message === 'string') {
        client.send(JSON.stringify({ type: 'BAD_REQ' } as OutboundBadReqMessage));
        return;
      }
      // const traceId = uuidv7();
      // [TODO] log
      const result = await this.messageHandler.processMessage(client, message);
      if (!result.success) {
        const errorMessage: OutboundErrorMessage = {
          type: 'ERROR',
        }
        client.send(JSON.stringify(errorMessage));
      }
      if (result.payload.type === 'LEAVE') {
        this.connectionManager.removeClient({ roomId: client.roomId, userId: client.userId });
      }
      this.messageBroker.publishMessage({ message: result.payload, roomId: client.roomId });
      this.responseDispatcher.dispatch({ roomId: client.roomId, payload: result.payload });
      return;
    } catch (e) {
      // [TODO] log
    }
  }
}
