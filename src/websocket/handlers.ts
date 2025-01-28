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

  private handleReady(client: ActiveWebSocket): MessageProcessResult {
    const readyMessage: OutboundReadyMessage = {
      type: 'READY',
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      payload: readyMessage,
    };
  }

  private handleCancelReady(client: ActiveWebSocket): MessageProcessResult {
    const cancelReadyMessage: OutboundCancelReadyMessage = {
      type: 'CANCEL_READY',
      playerIdx: client.playerIdx,
    };
    return {
      success: true,
      payload: cancelReadyMessage,
    };
  }

  private handleMove(client: ActiveWebSocket, {
    position,
    blockInfo,
    turn,
  }: InboundMoveMessage): MessageProcessResult {
    const moveMessage: OutboundMoveMessage = {
      type: 'MOVE',
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

  private handleStart(client: ActiveWebSocket): MessageProcessResult {
    if (client.playerIdx !== 0) {
      return {
        success: false,
        payload: { type: 'BAD_REQ', message: 'unauthorized' },
      };
    }
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
  ) {
    this.messageHandler = messageHandler;
    this.messageBroker = messageBroker;
    this.responseDispatcher = responseDispatcher;
  }

  private messageHandler: WebSocketMessageHandler;
  private messageBroker: WebSocketMessageBroker;
  private responseDispatcher: WebSocketResponseDispatcher;

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
      if (result.success) {
        this.messageBroker.publishMessage({ message: result.payload, roomId: client.roomId });
        this.responseDispatcher.dispatch({ roomId: client.roomId, payload: result.payload });
        return;
      }

      const errorMessage: OutboundErrorMessage = {
        type: 'ERROR',
      }
      client.send(JSON.stringify(errorMessage));
    } catch (e) {
      // [TODO] log
    }
  }
}
