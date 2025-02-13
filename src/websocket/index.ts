import { WebSocketServer as WebSocketServer_, type RawData } from "ws";
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import type { RedisClientType } from "redis";
import type { ActiveWebSocket, PendingWebSocket, PlayerIdx } from "$types";
import { WebSocketConnectionManager, WebSocketConnectionOrchestrator, WebSocketMessageBroker, WebSocketMessageHandler, WebSocketResponseDispatcher } from "./handlers.js";
import { validateSessionToken } from "$lib/auth.js";
import { CustomError } from "$lib/error.js";
import { getRoomCache } from "$lib/database/room.js";

interface WebSocketServer extends Omit<WebSocketServer_, 'clients'> {
  clients: Set<PendingWebSocket>;
}

export let wss: WebSocketServer;
export let webSocketMessageBroker: WebSocketMessageBroker;
export let responseDispatcher: WebSocketResponseDispatcher;
export let connectionOrchestrator: WebSocketConnectionOrchestrator;
export let messageHandler: WebSocketMessageHandler;
export const webSocketManager: WebSocketConnectionManager = new WebSocketConnectionManager();

export const initWebSocketServer = (server: HttpServer | HttpsServer, redis: RedisClientType) => {
  if (!wss) {
    // [TODO] this server options are the defaults by official docs
    wss = new WebSocketServer_({
      server,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      },
    });
  }

  messageHandler = new WebSocketMessageHandler(redis);
  responseDispatcher = new WebSocketResponseDispatcher(webSocketManager);
  webSocketMessageBroker = new WebSocketMessageBroker(redis, responseDispatcher);
  connectionOrchestrator = new WebSocketConnectionOrchestrator(messageHandler, webSocketMessageBroker, webSocketManager);

  wss.on('listening', () => {
    // since clients' messages should be handled at each process in multi-processing environment
    // decided to use redis pub/sub to handle the message received at other process 
    // [CHECK] match redis pub/sub's event name, message, ...
    webSocketMessageBroker.subscribeMessage();
  });

  wss.on('connection', async (socket: PendingWebSocket, request) => {
    if (!request.url) throw new Error('request url is empty')
    const url = new URL(`${process.env.ORIGIN}${request.url}`);

    const roomId = url.pathname.replace('/rooms/', '');
    if (!roomId) {
      socket.close(1, `unexpected roomId: ${roomId}`);
      throw new Error('unexpected client\'s url');
    }
    socket.roomId = roomId;

    const sessionToken = request.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];
    if (!sessionToken) throw new CustomError('token not found: please try again', 401);

    const user = await validateSessionToken(sessionToken);
    socket.userId = user.userId;

    const roomCache = await getRoomCache(roomId);
    const playerIdx = roomCache.p0.id === user.id ? 0 :
      roomCache.p1?.id === user.id ? 1 :
        roomCache.p2?.id === user.id ? 2 :
          roomCache.p3?.id === user.id ? 3 : -1;
    if (playerIdx === -1) throw new CustomError('not allowed', 403);
    socket.playerIdx = playerIdx as PlayerIdx;

    const activeSocket = socket as ActiveWebSocket;
    connectionOrchestrator.handleClientConnect(activeSocket, { id: user.id, username: user.username });

    socket.on('error', (e: Error) => {
      console.error(e);
    });

    socket.on('close', () => {
      connectionOrchestrator.handleClientLeave(activeSocket);
    });

    socket.on('message', (rawMessage: RawData) => {
      try {
        const message = rawMessage.toString();
        connectionOrchestrator.handleClientMessage(activeSocket, message);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('close', () => {
      webSocketManager.removeClient({ roomId: activeSocket.roomId, userId: activeSocket.userId });
    });
  });
};
