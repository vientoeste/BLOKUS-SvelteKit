import type { RedisClientType } from "redis";
import type { InboundCancelReadyMessage, InboundConnectedMessage, InboundLeaveMessage, InboundMoveMessage, InboundReadyMessage, InboundReportMessage, InboundStartMessage, InboundWebSocketMessage, OutboundErrorMessage, WebSocket, WebSocketBrokerMessage } from "$types";
import { webSocketManager } from ".";

export class WebSocketMessageHandler {
  private handleUserConnected(client: WebSocket, { userId }: InboundConnectedMessage) {
    const { roomId } = client;
    if (!roomId) return;
    client.userId = userId;
    webSocketManager.addClient({ roomId, client });
  }

  private handleUserLeave(client: WebSocket, message: InboundLeaveMessage) {
    const { userId, roomId } = client;
    if (!roomId || !userId) return;
    webSocketManager.removeClient({ roomId, userId });
  }

  private handleReady(client: WebSocket, message: InboundReadyMessage) {
    // [TODO] save state to redis
    throw new Error("not implemented");
  }

  private handleCancelReady(client: WebSocket, message: InboundCancelReadyMessage) {
    // [TODO] save state to redis
    throw new Error("not implemented");
  }

  private handleMove(client: WebSocket, {
    playerIdx,
    position,
    blockInfo,
    turn,
    type,
  }: InboundMoveMessage) {
    // [TODO] save move to DB
    throw new Error("not implemented");
  }

  private handleStart(client: WebSocket, message: InboundStartMessage) {
    // [TODO] save state to redis/DB
    throw new Error("not implemented");
  }

  private handleReport(client: WebSocket, message: InboundReportMessage) {
    // [TODO] validate move here
    throw new Error("not implemented");
  }

  // [TODO] log the websocket messages here or upper scope
  handleMessage(client: WebSocket, rawMessage: string) {
    const message = JSON.parse(rawMessage) as InboundWebSocketMessage;
    switch (message.type) {
      case 'START':
        this.handleStart(client, message);
        break;
      case "CONNECTED":
        this.handleUserConnected(client, message);
        break;
      case "LEAVE":
        this.handleUserLeave(client, message);
        break;
      case "READY":
        this.handleReady(client, message);
        break;
      case "CANCEL_READY":
        this.handleCancelReady(client, message);
        break;
      case "MOVE":
        this.handleMove(client, message);
        break;
      case "REPORT":
        this.handleReport(client, message);
        break;
      default:
        client.send(JSON.stringify({
          type: "ERROR",
          cause: 'unknown message type'
        } as OutboundErrorMessage));
        break;
    }
  }
}

export class WebSocketConnectionManager {
  private clientPool: Map<string, WebSocket[]> = new Map();

  addClient({ roomId, client }: { roomId: string, client: WebSocket }) {
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
  publishMessage({ message, roomId }: { roomId: string, message: string }) {
    this.publisher.publish(roomId, JSON.stringify({ message, roomId }));
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
